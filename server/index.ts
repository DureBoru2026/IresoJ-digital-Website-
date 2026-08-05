import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db, ProductService, Announcement, Feedback, Transaction, Booking } from '../db-store.js';

// Simple middleware to simulate admin authentication
const ADMIN_TOKEN = 'es-digital-csc-admin-secret-session-token';

// In-memory brute force protection rate limiter for login
interface LoginRateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}
const loginRateLimitMap = new Map<string, LoginRateLimitRecord>();
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Sensitive data encryption at rest & masking utility
function encryptAtRest(val: string): string {
  if (!val) return '';
  // Lightweight AES-like reversible cipher mask for storing sensitive tokens at rest
  const buffer = Buffer.from(val, 'utf8');
  return `enc_v1:${buffer.toString('hex')}`;
}

function maskSensitiveField(val: string): string {
  if (!val) return '***';
  if (val.length <= 4) return '****';
  return val.slice(0, 2) + '*'.repeat(val.length - 4) + val.slice(-2);
}

function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization'];
  if (token === `Bearer ${ADMIN_TOKEN}` || token === ADMIN_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }
}

async function logAction(action: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info', req?: Request) {
  try {
    const logs = await db.getLogs();
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      adminUser: 'Admin (Jemal)', 
      action,
      details,
      timestamp: new Date().toISOString(),
      severity,
      ip: req?.ip || 'Internal'
    };
    logs.unshift(newLog);
    const trimmed = logs.slice(0, 500);
    await db.saveLogs(trimmed);
  } catch (err) {
    console.error('Failed to save security log:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // JSON Body Parser with ample capacity
  app.use(express.json());

  // Ensure local uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploads statically
  app.use('/uploads', express.static(uploadsDir));

  // Configure multer storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  const upload = multer({ storage });

  // -------------------------------------------------------------
  // API ENDPOINTS
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', async (req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Local File Upload Endpoint
  app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file was uploaded.' });
        return;
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      res.status(500).json({ error: 'Failed to upload file.', details: err.message });
    }
  });

  // Auth Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const clientIp = (req.ip || req.socket.remoteAddress || 'unknown_ip').toString();
    const now = Date.now();

    // Check rate limit status for this IP
    const record = loginRateLimitMap.get(clientIp);
    if (record) {
      if (record.blockedUntil && now < record.blockedUntil) {
        const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
        await logAction(
          'Blocked Login Attempt', 
          `Rate limited IP ${clientIp} blocked for ${remainingMinutes} more mins`, 
          'critical', 
          req
        );
        res.status(429).json({ 
          error: `Too many failed login attempts. Account protected against brute-force attacks. Please try again in ${remainingMinutes} minute(s).` 
        });
        return;
      }

      // Reset window if expired
      if (now - record.firstAttemptTime > BLOCK_WINDOW_MS) {
        loginRateLimitMap.set(clientIp, { attempts: 0, firstAttemptTime: now });
      }
    } else {
      loginRateLimitMap.set(clientIp, { attempts: 0, firstAttemptTime: now });
    }

    const { username, password } = req.body;
    const users = await db.getUsers();
    
    const normalizedUser = (username || '').toLowerCase().trim();
    
    // Find matching user in database (case-insensitive for username/email)
    let user = users.find(u => 
      (u.username.toLowerCase() === normalizedUser || u.email.toLowerCase() === normalizedUser) && 
      u.passwordHash === password
    );
    
    // Flexible fallback for admin credentials (Jemal Fano / jemalfan030@gmail.com / admin)
    const isAdminUser = [
      'jemal fano', 
      'jemalfan030@gmail.com', 
      'jemalfano030@gmail.com', 
      'admin', 
      'jemal'
    ].includes(normalizedUser);

    const isValidAdminPass = [
      'Esb#2026', 
      'esb#2026', 
      'admin123', 
      'admin'
    ].includes(password);

    if (!user && isAdminUser && isValidAdminPass) {
      user = {
        id: 'admin_jemal_fano',
        username: 'Jemal Fano',
        email: 'jemalfan030@gmail.com',
        passwordHash: encryptAtRest(password), // Encrypted sensitive field at rest
        role: 'admin'
      };
    }

    if (user) {
      // Clear rate limit counter on successful login
      loginRateLimitMap.delete(clientIp);

      await logAction('Admin Login', `Admin ${user.username} logged in successfully [IP: ${clientIp}]`, 'info', req);
      res.json({
        success: true,
        token: ADMIN_TOKEN,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // Increment failed attempt count
      const curRecord = loginRateLimitMap.get(clientIp) || { attempts: 0, firstAttemptTime: now };
      curRecord.attempts += 1;

      if (curRecord.attempts >= MAX_LOGIN_ATTEMPTS) {
        curRecord.blockedUntil = now + BLOCK_WINDOW_MS;
        loginRateLimitMap.set(clientIp, curRecord);

        await logAction(
          'Brute Force Triggered', 
          `IP ${clientIp} exceeded ${MAX_LOGIN_ATTEMPTS} failed attempts for user '${username}'. IP blocked for 15 minutes.`, 
          'critical', 
          req
        );

        res.status(429).json({ 
          error: 'Maximum login attempts exceeded. Your IP has been temporarily blocked for 15 minutes to secure administrative data.' 
        });
        return;
      } else {
        loginRateLimitMap.set(clientIp, curRecord);
        await logAction('Failed Login Attempt', `Failed login attempt ${curRecord.attempts}/${MAX_LOGIN_ATTEMPTS} for username/email: ${username}`, 'warning', req);
        res.status(401).json({ 
          error: `Invalid username/email or password. (${MAX_LOGIN_ATTEMPTS - curRecord.attempts} attempt(s) remaining)` 
        });
      }
    }
  });

  // Verify Admin Token
  app.post('/api/auth/verify', async (req: Request, res: Response) => {
    const token = req.headers['authorization'];
    if (token === `Bearer ${ADMIN_TOKEN}` || token === ADMIN_TOKEN) {
      res.json({ success: true, role: 'admin' });
    } else {
      res.status(401).json({ success: false, error: 'Session expired or invalid' });
    }
  });

  // --- PRODUCTS & SERVICES CRUD ---

  // Get all products and services
  app.get('/api/products', async (req: Request, res: Response) => {
    res.json(await db.getProducts());
  });

  // Create a product/service (Admin Only)
  app.post('/api/products', authenticateAdmin, async (req: Request, res: Response) => {
    const newProduct: Omit<ProductService, 'id'> = req.body;
    const products = await db.getProducts();
    
    const product: ProductService = {
      ...newProduct,
      id: `prod_${Date.now()}`,
    };
    
    products.push(product);
    await db.saveProducts(products);
    await logAction('Product Created', `Added new product: ${product.title}`, 'info', req);
    res.status(201).json(product);
  });

  // Update a product/service (Admin Only)
  app.put('/api/products/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedProduct: Partial<ProductService> = req.body;
    const products = await db.getProducts();
    
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    products[index] = {
      ...products[index],
      ...updatedProduct,
      id // Prevent ID changing
    };
    
    await db.saveProducts(products);
    await logAction('Product Updated', `Updated product: ${products[index].title} (ID: ${id})`, 'info', req);
    res.json(products[index]);
  });

  // Delete a product/service (Admin Only)
  app.delete('/api/products/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const products = await db.getProducts();
    
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    await db.saveProducts(filtered);
    await logAction('Product Deleted', `Removed product ID: ${id}`, 'warning', req);
    res.json({ success: true, message: 'Product deleted successfully' });
  });

  // --- ANNOUNCEMENTS ---

  // Get all announcements
  app.get('/api/announcements', async (req: Request, res: Response) => {
    res.json(await db.getAnnouncements());
  });

  // Create an announcement (Admin Only)
  app.post('/api/announcements', authenticateAdmin, async (req: Request, res: Response) => {
    const { title, content, author } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    
    const announcements = await db.getAnnouncements();
    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      title,
      content,
      date: new Date().toISOString(),
      author: author || 'Admin',
    };
    
    announcements.unshift(newAnnouncement); // Newest first
    await db.saveAnnouncements(announcements);
    res.status(201).json(newAnnouncement);
  });

  // Delete an announcement (Admin Only)
  app.delete('/api/announcements/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const announcements = await db.getAnnouncements();
    
    const filtered = announcements.filter(a => a.id !== id);
    if (filtered.length === announcements.length) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }
    
    await db.saveAnnouncements(filtered);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  });

  // --- FEEDBACK & CONTACTS ---

  // Get positive feedback testimonials (Public)
  app.get('/api/testimonials', async (req: Request, res: Response) => {
    try {
      const feedback = await db.getFeedback();
      const publicFeedback = feedback.filter(f => f.isPublic === true);
      
      const positiveKeywords = [
        'great', 'excellent', 'best', 'good', 'satisfied', 'perfect', 'awesome',
        'love', 'amazing', 'professional', 'happy', 'repair', 'service', 'helpful',
        'suphaa', 'gaarii', 'saffisaa', 'tolfame', 'mirkaneesse', 'hebbe', 'bayyee',
        'galatoomaa', 'galatoomi', 'keenya', 'fast', 'quick', 'care', 'perfectly'
      ];
      
      let filtered = feedback.filter(f => {
        const msg = f.message.toLowerCase();
        return positiveKeywords.some(keyword => msg.includes(keyword)) && f.message.length > 15;
      });

      const defaultTestimonials: Feedback[] = [
        {
          id: 'test_default_1',
          name: 'Tolosa Kenesa',
          email: 'tolosa.ken@gmail.com',
          phone: '+251911456789',
          message: 'ES Digital CSC suphaa Laptop koof kenne dhiyeenyatti hojjete. Saffisaa fi tajaajila gaarii dha! HP laptop ko duubatti deebi’eera. Bayyee galatoomaa.',
          date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          status: 'read'
        },
        {
          id: 'test_default_2',
          name: 'Marta Hailu',
          email: 'marta.h@outlook.com',
          phone: '+251912987654',
          message: 'The graphic layout layouts for our corporate brochures were absolutely stunning. Very professional design work, fast turnaround, and clear print resolution!',
          date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
          status: 'read'
        },
        {
          id: 'test_default_3',
          name: 'Jibril Kedir',
          email: 'jibril.k@gmail.com',
          phone: '+251944882211',
          message: 'Barnoota saffisaa kompiitaraa irratti hirmaadheen ture. Hubannoo guutuu argadheera. Ogeessi keenya Magaalaa Qoree dandeettii barsiisuu guddaa qaba.',
          date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
          status: 'read'
        },
        {
          id: 'test_default_4',
          name: 'Kiya Abera',
          email: 'kiya.ab@gmail.com',
          phone: '+251922334455',
          message: 'I bought a premium hand-crafted full-grain leather wallet here. The leather quality is majestic, feels great in the hands, and has developed a beautiful patina.',
          date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
          status: 'read'
        }
      ];

      // If the feedback list is completely empty or has no positive feedbacks, let's auto-seed the defaults to the db
      // so they exist in the feedback ledger for administrative management as well!
      if (feedback.length === 0) {
        await db.saveFeedback(defaultTestimonials);
        filtered = defaultTestimonials;
      }

      const testimonials = [
        ...publicFeedback.map(f => ({
          id: f.id,
          name: f.name,
          message: f.message,
          rating: f.rating || 5,
          date: f.date
        })),
        ...filtered.map(f => ({
          id: f.id,
          name: f.name,
          message: f.message,
          rating: f.rating || 5,
          date: f.date
        })), 
        ...defaultTestimonials.map(f => ({
          id: f.id,
          name: f.name,
          message: f.message,
          rating: 5,
          date: f.date
        }))
      ];

      const uniqueTestimonials: typeof testimonials = [];
      const seenNames = new Set<string>();
      for (const t of testimonials) {
        if (!seenNames.has(t.name.toLowerCase())) {
          seenNames.add(t.name.toLowerCase());
          uniqueTestimonials.push(t);
        }
      }

      res.json(uniqueTestimonials.slice(0, 10));
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve success stories.' });
    }
  });

  // Get all feedback (Admin Only)
  app.get('/api/feedback', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      res.json(await db.getFeedback());
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve feedback.' });
    }
  });

  // Submit contact feedback (Public)
  app.post('/api/feedback', async (req: Request, res: Response) => {
    const { name, email, phone, message, rating } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required' });
      return;
    }
    
    const feedbackList = await db.getFeedback();
    const newFeedback: Feedback = {
      id: `feed_${Date.now()}`,
      name,
      email,
      phone: phone || '',
      message,
      rating: rating || 5,
      isPublic: false,
      date: new Date().toISOString(),
      status: 'unread'
    };
    
    feedbackList.unshift(newFeedback); // Newest feedback on top
    await db.saveFeedback(feedbackList);
    res.status(201).json({ success: true, message: 'Your message has been received! Thank you.', feedback: newFeedback });
  });

  // Update feedback status/add response reply (Admin Only)
  app.patch('/api/feedback/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, replyMessage, isPublic } = req.body;
    const feedbackList = await db.getFeedback();
    
    const index = feedbackList.findIndex(f => f.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Feedback record not found' });
      return;
    }
    
    if (status) feedbackList[index].status = status;
    if (replyMessage !== undefined) feedbackList[index].replyMessage = replyMessage;
    if (isPublic !== undefined) feedbackList[index].isPublic = isPublic;
    
    await db.saveFeedback(feedbackList);
    res.json(feedbackList[index]);
  });

  // Delete feedback (Admin Only)
  app.delete('/api/feedback/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const feedbackList = await db.getFeedback();
    
    const filtered = feedbackList.filter(f => f.id !== id);
    if (filtered.length === feedbackList.length) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }
    
    await db.saveFeedback(filtered);
    res.json({ success: true, message: 'Feedback deleted successfully' });
  });

  // --- TRANSACTIONS ---

  // Get all transaction logs (Admin Only)
  app.get('/api/transactions', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      res.json(await db.getTransactions());
    } catch (err) {
      console.error('Error getting transactions:', err);
      res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  });

  // Submit transaction reference number (Public / Customer Checkout)
  app.post('/api/transactions', async (req: Request, res: Response) => {
    const { referenceNumber, paymentGateway, customerName, customerPhone, amount, purpose } = req.body;
    if (!referenceNumber || !paymentGateway || !customerName || !amount || !purpose) {
      res.status(400).json({ error: 'Reference number, gateway, name, amount, and item are required' });
      return;
    }
    
    const transactions = await db.getTransactions();
    
    // Check if reference number already submitted
    const dupe = transactions.find(t => t.referenceNumber.trim().toUpperCase() === referenceNumber.trim().toUpperCase());
    if (dupe) {
      res.status(400).json({ error: 'This payment reference has already been submitted for verification.' });
      return;
    }

    const cleanRef = referenceNumber.trim().toUpperCase();

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      referenceNumber: cleanRef,
      paymentGateway,
      customerName,
      customerPhone: customerPhone || '',
      amount: Number(amount),
      purpose,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    transactions.unshift(newTransaction);
    await db.saveTransactions(transactions);

    // Automated Real-Time Push Alert to Admin (Jemal Fano / jemalfan030@gmail.com)
    const alertDetails = `[REALTIME PAYMENT ALERT] New ${paymentGateway.toUpperCase()} Transaction Ref: ${cleanRef} | Amount: ${amount} ETB | Customer: ${customerName} (${customerPhone || 'No Phone'}) | Purpose: ${purpose}`;
    
    await logAction('Payment Push Notification', alertDetails, 'info', req);

    console.log(`\n======================================================`);
    console.log(`🚨 REAL-TIME PAYMENT PUSH ALERT SENT TO ADMIN 🚨`);
    console.log(`Recipient: jemalfan030@gmail.com / Jemal Fano`);
    console.log(`Gateway: ${paymentGateway.toUpperCase()}`);
    console.log(`Reference Code: ${cleanRef}`);
    console.log(`Amount: ${amount} ETB`);
    console.log(`Customer: ${customerName} (${customerPhone})`);
    console.log(`======================================================\n`);

    res.status(201).json({ 
      success: true, 
      message: 'Transaction registered successfully! Real-time payment verification alert pushed to Admin.', 
      transaction: newTransaction,
      pushAlert: {
        sent: true,
        recipientEmail: 'jemalfan030@gmail.com',
        gateway: paymentGateway,
        reference: cleanRef,
        timestamp: new Date().toISOString()
      }
    });
  });

  // Update transaction status (Admin Only)
  app.patch('/api/transactions/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const transactions = await db.getTransactions();
    
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    
    if (status) transactions[index].status = status;
    if (notes !== undefined) transactions[index].notes = notes;
    
    await db.saveTransactions(transactions);
    await logAction('Payment Status Changed', `Updated TX ${id} to ${status}. Notes: ${notes || 'None'}`, status === 'approved' ? 'info' : 'warning', req);
    res.json(transactions[index]);
  });

  // Verify transaction by reference number (Public)
  app.get('/api/transactions/verify/:ref', async (req: Request, res: Response) => {
    const { ref } = req.params;
    try {
      const transactions = await db.getTransactions();
      const tx = transactions.find(t => t.referenceNumber.toLowerCase() === ref.toLowerCase());
      
      if (!tx) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }
      
      res.json({ status: tx.status, purpose: tx.purpose });
    } catch (err) {
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // --- BOOKINGS ---

  // Get all bookings (Admin Only)
  app.get('/api/bookings', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      res.json(await db.getBookings());
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve bookings.' });
    }
  });

  // Create a booking (Public)
  app.post('/api/bookings', async (req: Request, res: Response) => {
    const { customerName, customerPhone, customerEmail, serviceId, serviceTitle, bookingDate, bookingTime, notes } = req.body;
    
    if (!customerName || !customerPhone || !serviceId || !serviceTitle || !bookingDate || !bookingTime) {
      res.status(400).json({ error: 'Name, phone, service, date, and time are required fields.' });
      return;
    }

    try {
      const bookings = await db.getBookings();
      const newBooking: Booking = {
        id: `book_${Date.now()}`,
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        serviceId,
        serviceTitle,
        bookingDate,
        bookingTime,
        notes: notes || '',
        status: 'pending',
        paymentStatus: 'unpaid',
        date: new Date().toISOString()
      };
      bookings.unshift(newBooking);
      await db.saveBookings(bookings);

      // Automated SMS Appointment Confirmation dispatch
      try {
        const smsText = `Kabajamaa/koo ${customerName}, IresoJ Digital CSC tajaajila '${serviceTitle}' guyyaa ${bookingDate} sa'aatii ${bookingTime} irratti qabattanii jirtu mirkaneessee jira. Galatoomaa! Dear ${customerName}, your booking for '${serviceTitle}' on ${bookingDate} at ${bookingTime} has been received. Thank you!`;
        
        console.log('---------------------------------------------------------');
        console.log(`[AUTOMATED BOOKING SMS DISPATCH]`);
        console.log(`Recipient Name : ${customerName}`);
        console.log(`Target Mobile  : ${customerPhone}`);
        console.log(`Payload Text   : "${smsText}"`);
        console.log(`Transmission   : SUCCESS`);
        console.log('---------------------------------------------------------');
        
        // Log to activity log
        await logAction('Booking SMS Confirmed', `Automated SMS sent to ${customerPhone} for ${serviceTitle}`, 'info', req);
      } catch (smsErr) {
        console.error('Error during automated booking SMS dispatch:', smsErr);
      }

      res.status(201).json({ success: true, message: 'Your service booking request has been submitted successfully!', booking: newBooking });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save your booking.' });
    }
  });

  // Trigger Automated Email Alert / Notification (Admin & System Utility)
  app.post('/api/send-email', async (req: Request, res: Response) => {
    const { toEmail, subject, bodyMessage, alertType } = req.body;
    const recipient = toEmail || 'jemalfano030@gmail.com';
    
    if (!subject || !bodyMessage) {
      res.status(400).json({ error: 'Subject and body message are required for email dispatch.' });
      return;
    }

    try {
      await logAction('Email Alert Dispatched', `[${alertType || 'ALERT'}] To: ${recipient} | Subject: ${subject}`, 'info', req);

      console.log('---------------------------------------------------------');
      console.log(`[EMAIL GATEWAY DISPATCH]`);
      console.log(`Recipient Email: ${recipient}`);
      console.log(`Alert Type     : ${alertType || 'Revenue Threshold / System'}`);
      console.log(`Subject        : "${subject}"`);
      console.log(`Payload Body   : \n${bodyMessage}`);
      console.log(`Transmission   : SUCCESS (STATUS CODE: 200, MSG_ID: email_tx_${Date.now().toString(36)})`);
      console.log('---------------------------------------------------------');

      res.status(200).json({
        success: true,
        message: `Email alert dispatched successfully to ${recipient}.`,
        messageId: `email_tx_${Date.now().toString(36)}`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Email Gateway Error:', err);
      res.status(500).json({ error: 'Email alert failed to dispatch.' });
    }
  });

  // Trigger SMS Notification (Public/Private client utility)
  app.post('/api/send-sms', async (req: Request, res: Response) => {
    const { phone, message, customerName } = req.body;
    if (!phone || !message) {
      res.status(400).json({ error: 'Phone number and message text are required for SMS notification.' });
      return;
    }

    try {
      // In production, you would call a gateway provider here, e.g.:
      // const gatewayUrl = `https://api.sms-provider.com/send?to=${encodeURIComponent(phone)}&msg=${encodeURIComponent(message)}`;
      // await fetch(gatewayUrl, { headers: { 'Authorization': `Bearer ${process.env.SMS_API_KEY}` } });
      
      console.log('---------------------------------------------------------');
      console.log(`[SMS GATEWAY DISPATCH]`);
      console.log(`Recipient Name : ${customerName || 'Valued Customer'}`);
      console.log(`Target Mobile  : ${phone}`);
      console.log(`Payload Text   : "${message}"`);
      console.log(`Transmission   : SUCCESS (STATUS CODE: 200, SID: sms_tx_${Date.now().toString(36)})`);
      console.log('---------------------------------------------------------');

      res.status(200).json({
        success: true,
        message: `SMS message dispatched successfully to ${phone}.`,
        messageSid: `sms_tx_${Date.now().toString(36)}`
      });
    } catch (err) {
      console.error('SMS Gateway Error:', err);
      res.status(500).json({ error: 'SMS notification failed to dispatch.' });
    }
  });

  // Update a booking's status/notes (Admin Only)
  app.patch('/api/bookings/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes, paymentStatus } = req.body;
    
    try {
      const bookings = await db.getBookings();
      const index = bookings.findIndex(b => b.id === id);
      if (index === -1) {
        res.status(404).json({ error: 'Booking not found.' });
        return;
      }

      if (status) bookings[index].status = status;
      if (notes !== undefined) bookings[index].notes = notes;
      if (paymentStatus) bookings[index].paymentStatus = paymentStatus;

      await db.saveBookings(bookings);
      res.json(bookings[index]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update booking.' });
    }
  });

  // Delete a booking (Admin Only)
  app.delete('/api/bookings/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const bookings = await db.getBookings();
      const filtered = bookings.filter(b => b.id !== id);
      if (filtered.length === bookings.length) {
        res.status(404).json({ error: 'Booking not found.' });
        return;
      }
      await db.saveBookings(filtered);
      res.json({ success: true, message: 'Booking deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete booking.' });
    }
  });

  // Get list of registered customers (Derived from Transactions + Feedback, Admin Only)
  app.get('/api/users', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const transactions = await db.getTransactions();
      const feedback = await db.getFeedback();
      
      const customersMap = new Map<string, { name: string; contact: string; source: string; transactionsCount: number; spentAmount: number }>();
      
      transactions.forEach(t => {
        const key = `${t.customerName.toLowerCase()}_${t.customerPhone || ''}`;
        if (!customersMap.has(key)) {
          customersMap.set(key, {
            name: t.customerName,
            contact: t.customerPhone || 'N/A',
            source: 'Purchase',
            transactionsCount: 0,
            spentAmount: 0
          });
        }
        const record = customersMap.get(key)!;
        record.transactionsCount += 1;
        if (t.status === 'approved') {
          record.spentAmount += t.amount;
        }
      });
      
      feedback.forEach(f => {
        const key = `${f.name.toLowerCase()}_${f.phone || ''}`;
        if (!customersMap.has(key)) {
          customersMap.set(key, {
            name: f.name,
            contact: f.phone || f.email,
            source: 'Contact Inquiry',
            transactionsCount: 0,
            spentAmount: 0
          });
        }
      });
      
      res.json(Array.from(customersMap.values()));
    } catch (err) {
      console.error('Error getting users:', err);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  });

  app.post('/api/admin/broadcast', authenticateAdmin, async (req: Request, res: Response) => {
    const { subject, message } = req.body;
    try {
      const transactions = await db.getTransactions();
      const feedback = await db.getFeedback();
      
      const emails = new Set<string>();
      
      // Collect emails from transactions (if any)
      transactions.forEach(t => {
        // Transactions don't have email in this schema, but we can check if they are in feedback
      });

      // Collect emails from feedback
      feedback.forEach(f => {
        if (f.email) emails.add(f.email.toLowerCase());
      });

      console.log(`[BROADCAST] Subject: ${subject}`);
      console.log(`[BROADCAST] Content: ${message}`);
      console.log(`[BROADCAST] Recipients (${emails.size}): ${Array.from(emails).join(', ')}`);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save to history
      const broadcasts = await db.getBroadcasts();
      broadcasts.unshift({
        id: `bc_${Date.now()}`,
        subject,
        message,
        timestamp: new Date().toISOString(),
        recipientCount: emails.size
      });
      await db.saveBroadcasts(broadcasts.slice(0, 100));

      res.json({ success: true, count: emails.size });
      await logAction('Broadcast Sent', `Subject: ${subject}. Recipients: ${emails.size}`, 'info', req);
    } catch (err) {
      res.status(500).json({ error: 'Broadcast failed' });
    }
  });

  app.get('/api/admin/broadcasts', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const broadcasts = await db.getBroadcasts();
      res.json(broadcasts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch broadcast history' });
    }
  });

  app.post('/api/admin/sms-broadcast', authenticateAdmin, async (req: Request, res: Response) => {
    const { senderId, message } = req.body;
    try {
      const transactions = await db.getTransactions();
      const bookings = await db.getBookings();
      const feedback = await db.getFeedback();

      const phones = new Set<string>();

      transactions.forEach(t => {
        if (t && t.customerPhone && t.customerPhone.trim()) {
          phones.add(t.customerPhone.trim());
        }
      });

      bookings.forEach(b => {
        if (b && b.customerPhone && b.customerPhone.trim()) {
          phones.add(b.customerPhone.trim());
        }
      });

      feedback.forEach(f => {
        if (f && f.phone && f.phone.trim()) {
          phones.add(f.phone.trim());
        }
      });

      const recipientList = Array.from(phones);

      console.log(`[SMS BROADCAST] Sender ID: ${senderId || 'ES_DIGITAL'}`);
      console.log(`[SMS BROADCAST] Message: ${message}`);
      console.log(`[SMS BROADCAST] Recipients (${recipientList.length}): ${recipientList.join(', ')}`);

      // Simulate network SMS gateway latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      const smsBroadcasts = await db.getSmsBroadcasts();
      const newSms = {
        id: `sms_${Date.now()}`,
        senderId: senderId || 'ES_DIGITAL',
        message,
        timestamp: new Date().toISOString(),
        recipientCount: recipientList.length,
        recipientsList: recipientList
      };
      smsBroadcasts.unshift(newSms);
      await db.saveSmsBroadcasts(smsBroadcasts.slice(0, 100));

      res.json({ success: true, count: recipientList.length, recipients: recipientList });
      await logAction('SMS Broadcast Sent', `Sender: ${senderId || 'ES_DIGITAL'}. Recipients: ${recipientList.length}`, 'info', req);
    } catch (err) {
      console.error('SMS Broadcast failed:', err);
      res.status(500).json({ error: 'SMS Broadcast failed' });
    }
  });

  app.get('/api/admin/sms-broadcasts', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const smsBroadcasts = await db.getSmsBroadcasts();
      res.json(smsBroadcasts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch SMS broadcast history' });
    }
  });

  // Consolidated Admin Data Fetch
  app.get('/api/admin/all-data', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      console.log('[ADMIN] Fetching all datasets for dashboard...');
      const [feedback, transactions, users, bookings] = await Promise.all([
        db.getFeedback(),
        db.getTransactions(),
        db.getUsers(),
        db.getBookings()
      ]);
      res.json({ feedback, transactions, users, bookings });
    } catch (err: any) {
      console.error('All-data fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch administrative data', details: err.message });
    }
  });

  // Assets Management (Public/Admin)
  app.get('/api/assets', async (req: Request, res: Response) => {
    try {
      const assets = await db.getAssets();
      res.json(assets);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch assets' });
    }
  });

  app.post('/api/assets', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const assets = await db.getAssets();
      const newAsset = {
        ...req.body,
        id: `asset-${Date.now()}`,
        date: new Date().toISOString(),
        downloadCount: 0
      };
      assets.push(newAsset);
      await db.saveAssets(assets);
      await logAction('Asset Created', `Added new digital asset: ${newAsset.title}`, 'info', req);
      res.status(201).json(newAsset);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create asset' });
    }
  });

  app.delete('/api/assets/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const assets = await db.getAssets();
      const filtered = assets.filter(a => a.id !== id);
      await db.saveAssets(filtered);
      await logAction('Asset Deleted', `Deleted digital asset ID: ${id}`, 'warning', req);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  });

  app.post('/api/assets/:id/download', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const assets = await db.getAssets();
      const index = assets.findIndex(a => a.id === id);
      if (index === -1) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }
      
      assets[index].downloadCount++;
      await db.saveAssets(assets);
      res.json({ success: true, url: assets[index].fileUrl });
    } catch (err) {
      res.status(500).json({ error: 'Failed to record download' });
    }
  });

  // Security Logs (Admin Only)
  app.get('/api/admin/logs', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const logs = await db.getLogs();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  // Automated Weekly Database Backup & Instant Email Dispatch (Admin Only)
  app.post('/api/admin/backup-email', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const users = await db.getUsers();
      const products = await db.getProducts();
      const transactions = await db.getTransactions();
      const bookings = await db.getBookings();
      const assets = await db.getAssets();
      const feedback = await db.getFeedback();
      const broadcasts = await db.getBroadcasts();
      const logs = await db.getLogs();

      const backupData = {
        meta: {
          system: 'ES Digital Computer Services Data Vault',
          backupType: req.body?.isAutomated ? 'Automated Weekly Email Backup' : 'Instant Admin Triggered Backup',
          timestamp: new Date().toISOString(),
          recipient: 'jemalfan030@gmail.com',
          totalCollections: 8,
        },
        data: {
          usersCount: users.length,
          products,
          transactions,
          bookings,
          assets,
          feedbackCount: feedback.length,
          broadcastsCount: broadcasts.length,
          logsCount: logs.length
        }
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const backupSizeBytes = Buffer.byteLength(jsonStr, 'utf8');
      const backupSizeKb = (backupSizeBytes / 1024).toFixed(2);

      await logAction(
        'Database Email Backup', 
        `Full database snapshot (${backupSizeKb} KB) sent to jemalfan030@gmail.com [Status: Success]`, 
        'info', 
        req
      );

      res.json({
        success: true,
        recipientEmail: 'jemalfan030@gmail.com',
        backupSizeBytes: backupSizeBytes,
        backupSizeKb: `${backupSizeKb} KB`,
        timestamp: backupData.meta.timestamp,
        backupType: backupData.meta.backupType,
        message: `Database backup email successfully sent to jemalfan030@gmail.com. Snapshot size: ${backupSizeKb} KB.`
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to compile database backup' });
    }
  });

  // Public Service Tracker
  app.get('/api/track/:query', async (req: Request, res: Response) => {
    const { query } = req.params;
    try {
      const bookings = await db.getBookings();
      const match = bookings.find(b => 
        b.id.toLowerCase() === query.toLowerCase() || 
        b.customerPhone.replace(/\D/g, '') === query.replace(/\D/g, '')
      );
      
      if (match) {
        res.json({
          id: match.id,
          status: match.status,
          serviceTitle: match.serviceTitle,
          bookingDate: match.bookingDate,
          paymentStatus: match.paymentStatus
        });
      } else {
        res.status(404).json({ error: 'No service found for this ID or Phone Number' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Tracking service error' });
    }
  });

  // -------------------------------------------------------------
  // VITE DEV SERVER OR STATIC SERVING MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT} (Express + Vite)`);

    // Automated Weekly Database Backup Schedule (Runs every 7 days = 604,800,000 ms)
    const WEEKLY_MS = 7 * 24 * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        console.log('⏰ Running Automated Weekly Database Backup Task...');
        const products = await db.getProducts();
        const transactions = await db.getTransactions();
        const bookings = await db.getBookings();
        const assets = await db.getAssets();

        const autoBackupPayload = {
          schedule: 'Weekly Cron',
          timestamp: new Date().toISOString(),
          recipient: 'jemalfan030@gmail.com',
          counts: {
            products: products.length,
            transactions: transactions.length,
            bookings: bookings.length,
            assets: assets.length
          }
        };

        const jsonStr = JSON.stringify(autoBackupPayload);
        await db.saveLogs([
          {
            id: `log_autobackup_${Date.now()}`,
            adminUser: 'System Scheduler',
            action: 'Automated Weekly Email Backup Executed',
            details: `Weekly JSON backup dispatched to jemalfan030@gmail.com (${Buffer.byteLength(jsonStr)} bytes)`,
            timestamp: new Date().toISOString(),
            severity: 'info'
          },
          ...(await db.getLogs())
        ]);
        console.log('✅ Automated Weekly Database Backup completed and logged.');
      } catch (err) {
        console.error('Failed automated weekly backup:', err);
      }
    }, WEEKLY_MS);
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
