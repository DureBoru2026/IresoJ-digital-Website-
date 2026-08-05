import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, Phone, Mail, MapPin, ArrowRight, ShieldCheck, 
  MessageSquare, MessageCircle, BookOpen, AlertCircle, Sparkles, CheckCircle2,
  ListFilter, DollarSign, Calendar, Heart, Shield, HelpCircle, Eye, LogIn,
  Send, Search, ChevronDown, RotateCcw, X, ZoomIn, Download, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';

import { 
  ProductService, Announcement, Feedback, Transaction, 
  CustomerRecord, AuthState, ActiveTab, AdminSubTab, Booking, DigitalAsset
} from './types';

// Modular Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import PaymentModal from './components/PaymentModal';
import BookServiceModal from './components/BookServiceModal';
import AdminProducts from './components/AdminProducts';
import AdminPayments from './components/AdminPayments';
import AdminBookings from './components/AdminBookings';
import AdminUsers from './components/AdminUsers';
import AdminShare from './components/AdminShare';
import AdminHistory from './components/AdminHistory';
import AdminReport from './components/AdminReport';
import AdminDashboard from './components/AdminDashboard';
import AdminAssets from './components/AdminAssets';
import AdminSecurityLogs from './components/AdminSecurityLogs';
import AdminCommission from './components/AdminCommission';
import AdminPayroll from './components/AdminPayroll';
import ServiceTracker from './components/ServiceTracker';
import FloatingContact from './components/FloatingContact';
import UpdateNotifier from './components/UpdateNotifier';
import DigitalStore from './components/DigitalStore';
import RecentlyViewed from './components/RecentlyViewed';
import MobileAirtimePurchase from './components/MobileAirtimePurchase';
import SuccessStoriesCarousel from './components/SuccessStoriesCarousel';
import FAQ from './components/FAQ';
import HomeDashboardShowcase from './components/HomeDashboardShowcase';
import ServiceCostEstimator from './components/ServiceCostEstimator';
import UserManualModal from './components/UserManualModal';

const sampleWorks = [
  { id: 1, url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=800', title: 'Corporate ID Card' },
  { id: 2, url: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&q=80&w=800', title: 'Magazine Layout' },
  { id: 3, url: 'https://images.unsplash.com/photo-1586717799263-ce20eb81bdce?auto=format&fit=crop&q=80&w=800', title: 'Business Booklet' },
  { id: 4, url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800', title: 'Event Poster' }
];

  export default function App() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('dashboard');
  const [showUserManual, setShowUserManual] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  
  // Auth State
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  // Data States
  const [products, setProducts] = useState<ProductService[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Sound Notification Ref
  const prevCountsRef = useRef({ bookings: 0, feedback: 0, transactions: 0 });
  const isFirstLoadRef = useRef(true);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play blocked:', e));
    } catch (err) {
      console.error('Audio error:', err);
    }
  };

  // Admin Data Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authState.isAuthenticated && authState.token) {
      interval = setInterval(() => {
        loadAdminData(authState.token!);
      }, 30000); // Poll every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authState.isAuthenticated, authState.token]);

  // DIGITAL ASSETS
  const loadAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error('Failed to load assets', err);
    }
  };

  const handleAddAsset = async (asset: Omit<DigitalAsset, 'id' | 'date' | 'downloadCount'>) => {
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(asset)
      });
      if (res.ok) {
        await loadAssets();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        }
      });
      if (res.ok) {
        await loadAssets();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleDownloadAsset = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/${id}/download`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        window.open(data.url, '_blank');
        await loadAssets();
      }
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleInitiateAssetPurchase = (asset: DigitalAsset) => {
    const virtualProduct: ProductService = {
      id: asset.id,
      title: `Digital: ${asset.title}`,
      description: asset.description,
      price: asset.price,
      imageUrl: '',
      category: 'sales',
      type: 'digital',
      stock: null
    };
    setSelectedProduct(virtualProduct);
  };

  // UI Flow States
  const [selectedProduct, setSelectedProduct] = useState<ProductService | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<{url: string, title: string} | null>(null);
  const [lastViewedId, setLastViewedId] = useState<string>('');

  const handleProductSelection = (product: ProductService) => {
    setSelectedProduct(product);
    setLastViewedId(product.id);
    
    // Update session storage
    const stored = sessionStorage.getItem('recently_viewed');
    let items: ProductService[] = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists to move to top
    items = items.filter(i => i.id !== product.id);
    
    // Add to top
    items.unshift(product);
    
    // Keep only 5
    if (items.length > 5) {
      items = items.slice(0, 5);
    }
    
    sessionStorage.setItem('recently_viewed', JSON.stringify(items));
  };

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactRating, setContactRating] = useState(5);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  // -------------------------------------------------------------
  // LIFE-CYCLE / DATA FETCHING
  // -------------------------------------------------------------

  // Check for saved login session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('es_digital_admin_token');
    const savedUser = localStorage.getItem('es_digital_admin_user');
    
    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Validate saved token with server
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAuthState({
            isAuthenticated: true,
            token: savedToken,
            user: parsedUser
          });
        } else {
          handleLogout();
        }
      })
      .catch(() => {
        // Fallback offline verification if server is spinning up
        setAuthState({
          isAuthenticated: true,
          token: savedToken,
          user: parsedUser
        });
      });
    }

    loadPublicData();
    loadAssets();
  }, []);

  // Whenever isAuthenticated changes, load admin data if true
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      loadAdminData(authState.token);
    }
  }, [authState.isAuthenticated]);

  const loadPublicData = async () => {
    try {
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      setProducts(prodData);

      const annRes = await fetch('/api/announcements');
      const annData = await annRes.json();
      setAnnouncements(annData);
    } catch (err) {
      console.error('Error fetching public datasets:', err);
    }
  };

  const loadAdminData = async (token: string) => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const response = await fetch('/api/admin/all-data', { headers });
      if (response.ok) {
        const data = await response.json();
        
        const finalFeedback = Array.isArray(data.feedback) ? data.feedback : [];
        const finalTransactions = Array.isArray(data.transactions) ? data.transactions : [];
        const finalBookings = Array.isArray(data.bookings) ? data.bookings : [];

        setFeedback(finalFeedback);
        setTransactions(finalTransactions);
        setBookings(finalBookings);

        // Correctly derive customers from transactions and feedback
        const customersMap = new Map<string, any>();
        
        finalTransactions.forEach(t => {
          if (!t) return;
          const key = `${(t.customerName || 'unknown').toLowerCase()}_${t.customerPhone || ''}`;
          if (!customersMap.has(key)) {
            customersMap.set(key, {
              name: t.customerName || 'Unknown Customer',
              contact: t.customerPhone || 'N/A',
              source: 'Purchase',
              transactionsCount: 0,
              spentAmount: 0
            });
          }
          const record = customersMap.get(key);
          record.transactionsCount += 1;
          if (t.status === 'approved') {
            record.spentAmount += (t.amount || 0);
          }
        });
        
        finalFeedback.forEach(f => {
          if (!f) return;
          const key = `${(f.name || 'anonymous').toLowerCase()}_${f.phone || ''}`;
          if (!customersMap.has(key)) {
            customersMap.set(key, {
              name: f.name || 'Anonymous',
              contact: f.phone || f.email || 'N/A',
              source: 'Contact Inquiry',
              transactionsCount: 0,
              spentAmount: 0
            });
          }
        });
        
        setCustomers(Array.from(customersMap.values()));

        // Sound notification logic
        if (!isFirstLoadRef.current) {
          const hasNewBooking = finalBookings.length > prevCountsRef.current.bookings;
          const hasNewFeedback = finalFeedback.length > prevCountsRef.current.feedback;
          const hasNewTx = finalTransactions.length > prevCountsRef.current.transactions;

          if (hasNewBooking || hasNewFeedback || hasNewTx) {
            playNotificationSound();
          }
        }

        // Update refs
        prevCountsRef.current = {
          bookings: finalBookings.length,
          feedback: finalFeedback.length,
          transactions: finalTransactions.length
        };
        isFirstLoadRef.current = false;
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else if (response.status === 401) {
        console.warn('Admin session expired or invalid');
        setAuthState({ isAuthenticated: false, token: null, user: null });
        localStorage.removeItem('es_digital_admin_token');
        localStorage.removeItem('es_digital_admin_user');
      }
    } catch (err) {
      console.error('Error fetching administrative datasets:', err);
    }
  };

  // -------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Please specify both staff username and security password.');
      setLoading(false);
      return;
    }

    // Direct check for hardcoded administrator credentials requested by Jemal Fano
    const trimmedUser = loginUsername.trim();
    if ((trimmedUser === 'Jemal Fano' || trimmedUser === 'jemalfan030@gmail.com') && loginPassword === 'Esb#2026') {
      const hardcodedUser = {
        id: 'admin_hardcoded',
        username: 'Jemal Fano',
        email: 'jemalfan030@gmail.com',
        role: 'admin' as const
      };
      const token = 'es-digital-csc-admin-secret-session-token';

      localStorage.setItem('es_digital_admin_token', token);
      localStorage.setItem('es_digital_admin_user', JSON.stringify(hardcodedUser));

      setAuthState({
        isAuthenticated: true,
        token: token,
        user: hardcodedUser
      });

      // Navigate to dashboard
      setActiveTab('admin');
      setLoginUsername('');
      setLoginPassword('');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('es_digital_admin_token', data.token);
        localStorage.setItem('es_digital_admin_user', JSON.stringify(data.user));

        setAuthState({
          isAuthenticated: true,
          token: data.token,
          user: data.user
        });

        // Navigate to dashboard
        setActiveTab('admin');
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Invalid credentials. Access Denied.');
      }
    } catch (err) {
      setLoginError('Error connecting to backend authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('es_digital_admin_token');
    localStorage.removeItem('es_digital_admin_user');
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null
    });
    setActiveTab('home');
  };

  // -------------------------------------------------------------
  // PUBLIC CONTACT FORM SUBMISSION
  // -------------------------------------------------------------
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess('');
    setContactError('');
    setLoading(true);

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError('Please complete all mandatory fields (Name, Email, and Message).');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          message: contactMessage,
          rating: contactRating,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setContactSuccess('Your feedback message has been received! We will follow up shortly.');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactMessage('');
        setContactRating(5);
        
        // Reload admin data if logged in
        if (authState.isAuthenticated && authState.token) {
          loadAdminData(authState.token);
        }
      } else {
        setContactError(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setContactError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER CHECKOUT GATEWAY TRANSACTION REPORTER
  // -------------------------------------------------------------
  const handleTransactionReferenceSubmit = async (txData: {
    referenceNumber: string;
    paymentGateway: 'telebirr' | 'CBE Birr';
    customerName: string;
    customerPhone: string;
    amount: number;
    purpose: string;
  }) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        // If admin is active, sync backend data
        if (authState.isAuthenticated && authState.token) {
          loadAdminData(authState.token);
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Database pipeline offline.' };
    }
  };

  // -------------------------------------------------------------
  // ADMIN DATABASE WRAPPERS
  // -------------------------------------------------------------

  // BOOKINGS HANDLERS
  const handleSubmitBooking = async (bookingData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    serviceTitle: string;
    bookingDate: string;
    bookingTime: string;
    notes?: string;
  }) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (authState.isAuthenticated && authState.token) {
          loadAdminData(authState.token);
        }

        // Trigger SMS notification trigger
        try {
          const smsText = `Hello ${bookingData.customerName}, your booking for "${bookingData.serviceTitle}" on ${bookingData.bookingDate} @ ${bookingData.bookingTime} has been successfully received. We will contact you soon! IresoJ Digital CSC Kore.`;
          
          await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: bookingData.customerPhone,
              message: smsText,
              customerName: bookingData.customerName
            })
          });
        } catch (smsErr) {
          console.error('Non-blocking SMS trigger error:', smsErr);
        }

        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Database pipeline offline.' };
    }
  };

  const handleUpdateBookingStatus = async (
    id: string, 
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled', 
    notes?: string,
    paymentStatus?: 'unpaid' | 'paid' | 'partial' | 'waived'
  ) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ status, notes, paymentStatus })
      });
      if (res.ok) {
        if (authState.token) loadAdminData(authState.token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        }
      });
      if (res.ok) {
        if (authState.token) loadAdminData(authState.token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // PRODUCTS CRUD
  const handleAddProduct = async (payload: Omit<ProductService, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await loadPublicData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleUpdateProduct = async (id: string, payload: Partial<ProductService>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await loadPublicData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        }
      });
      if (res.ok) {
        await loadPublicData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // ANNOUNCEMENTS
  const handleAddAnnouncement = async (payload: { title: string; content: string; author: string }) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await loadPublicData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        }
      });
      if (res.ok) {
        await loadPublicData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // FEEDBACKS / INQUIRIES
  const handleUpdateFeedbackStatus = async (id: string, status: 'read' | 'replied', replyMessage?: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ status, replyMessage })
      });
      if (res.ok) {
        await loadAdminData(authState.token!);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleUpdateFeedbackPublic = async (id: string, isPublic: boolean) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ isPublic })
      });
      if (res.ok) {
        await loadAdminData(authState.token!);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        }
      });
      if (res.ok) {
        await loadAdminData(authState.token!);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // DIGITAL ASSETS
  // (Moved up)

  // TRANSACTIONS / PAYMENTS RECONCILIATION
  const handleUpdateTransactionStatus = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        await loadAdminData(authState.token!);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleSendBroadcast = async (subject: string, message: string) => {
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ subject, message })
      });
      if (res.ok) {
        return await res.json();
      }
      return { success: false, count: 0 };
    } catch (err) {
      return { success: false, count: 0 };
    }
  };

  const handleGetBroadcasts = async () => {
    try {
      const res = await fetch('/api/admin/broadcasts', {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (res.ok) return await res.json();
      return [];
    } catch (err) {
      return [];
    }
  };

  const handleSendSmsBroadcast = async (senderId: string, message: string) => {
    try {
      const res = await fetch('/api/admin/sms-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ senderId, message })
      });
      if (res.ok) {
        return await res.json();
      }
      return { success: false, count: 0 };
    } catch (err) {
      return { success: false, count: 0 };
    }
  };

  const handleGetSmsBroadcasts = async () => {
    try {
      const res = await fetch('/api/admin/sms-broadcasts', {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (res.ok) return await res.json();
      return [];
    } catch (err) {
      return [];
    }
  };

  // -------------------------------------------------------------
  // VIEW RENDERERS (State switcher)
  // -------------------------------------------------------------

  const filteredProducts = products.filter(p => {
    if (!p || !p.title) return false;
    const matchesSearch = !searchQuery.trim() || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === 'asc') return (a.price || 0) - (b.price || 0);
    if (sortOrder === 'desc') return (b.price || 0) - (a.price || 0);
    return 0;
  });

  const renderActiveView = () => {
    switch (activeTab) {
      
      // 1. HOME VIEW
      case 'home':
        return (
          <div id="home-view" className="space-y-16 animate-in fade-in duration-300">
            
            {/* Service Tracking Hub */}
            <div className="pt-4">
              <ServiceTracker 
                isAdmin={authState.isAuthenticated} 
                onBookingStatusUpdate={handleUpdateBookingStatus} 
              />
            </div>

            {/* Hero Banner Panel */}
            <section id="hero-banner" className="relative bg-gradient-to-br from-white to-sky-50 text-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-sky-100/80 py-16 px-6 sm:px-12 md:px-16 border border-slate-200">
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 bg-sky-100 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider font-mono">{t('heroLocation')}</span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-[#1E293B] leading-[1.05] tracking-tight">
                  {t('heroTitleLine1')}<br/>
                  <span className="text-[#0EA5E9]">{t('heroTitleLine2')}</span>
                </h1>
                <p className="text-slate-950 font-bold text-sm sm:text-base leading-relaxed max-w-xl">
                  {t('heroSubtitle')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-[#0EA5E9] hover:bg-sky-600 text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-sky-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('bookService')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className="bg-white border-2 border-slate-200 text-slate-700 px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <span>{t('exploreProducts')}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Welcome & Interactive Animated Dashboard Showcase */}
            <HomeDashboardShowcase />

            {/* Quick Categories Overview Panel */}
            <section id="categories-grid" className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0EA5E9]">
                  {t('fourPillarsTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-950 font-bold max-w-md mx-auto">
                  {t('fourPillarsSub')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: t('compMaintenance'),
                    desc: t('compMaintenanceDesc'),
                    icon: Laptop,
                    color: 'text-[#0EA5E9] bg-sky-50 border-sky-100',
                  },
                  {
                    title: t('printPublishLayouts'),
                    desc: t('printPublishDesc'),
                    icon: BookOpen,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                  },
                  {
                    title: t('shortBasicTraining'),
                    desc: t('shortTrainingDesc'),
                    icon: HelpCircle,
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
                  },
                  {
                    title: t('storeSalesSection'),
                    desc: t('storeSalesDesc'),
                    icon: Sparkles,
                    color: 'text-amber-600 bg-amber-50 border-amber-100',
                  },
                ].map((cat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-200/80 transition-all duration-300">
                    <div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${cat.color}`}>
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-extrabold text-[#0EA5E9] text-sm leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-slate-950 font-bold text-xs mt-2.5 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('services')}
                      className="text-xs text-[#0EA5E9] font-bold hover:text-sky-600 flex items-center gap-1.5 mt-5 hover:translate-x-0.5 transition-transform text-left"
                    >
                      <span>{t('exploreProducts')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Showcase Featured Catalog Items Section (First 3) */}
            <section id="featured-products" className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0EA5E9]">
                    {t('featuredOffers')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-950 font-bold mt-1">
                    {t('featuredOffersSub')}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('services')}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shadow-sm shrink-0"
                >
                  {t('viewCatalog')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.filter(p => p && p.title).slice(0, 3).map((prod) => (
                  <ProductCard 
                    key={prod.id} 
                    product={prod} 
                    onSelect={(p) => handleProductSelection(p)} 
                  />
                ))}
              </div>
            </section>

            {/* Customer Success Stories Carousel */}
            <SuccessStoriesCarousel 
              lang={lang} 
              onNavigateToContact={() => setActiveTab('contact')} 
            />

            {/* Frequently Asked Questions */}
            <FAQ />

            {/* Local Trust banner */}
            <section id="location-trust" className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 sm:p-10 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 max-w-lg text-left">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  {t('heroLocation')}
                </span>
                <h3 className="font-display font-extrabold text-[#0EA5E9] text-xl sm:text-2xl">
                  {t('visitUsTitle')}
                </h3>
                <p className="text-slate-950 font-bold text-xs sm:text-sm leading-relaxed">
                  {t('visitUsDesc')}
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500 shrink-0" /> Kore Woreda, Kore Town</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#0EA5E9] shrink-0" /> +251 995 852 194</span>
                </div>
              </div>
              
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-md flex items-center space-x-3 max-w-xs w-full shrink-0">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="font-display font-bold text-slate-900 text-sm block">{t('instantReceipts')}</span>
                  <span className="text-xs text-slate-950 font-bold leading-normal block">{t('instantReceiptsDesc')}</span>
                </div>
              </div>
            </section>

          </div>
        );

      // 2. ABOUT US VIEW
      case 'about':
        return (
          <div id="about-view" className="space-y-12 animate-in fade-in duration-300">
            
            {/* Background Intro */}
            <section className="max-w-3xl mx-auto space-y-6 text-center py-6">
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
                About IresoJ Digital CSC Computer Services
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Established with the goal of bringing high-fidelity computer repairs, administrative digital design publishing, and fundamental technical literacy training closer to the West Arsi community, IresoJ Digital CSC stands as Kore Town’s leading computer service station.
              </p>
            </section>

            {/* Core Values / Location Info Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-slate-900 text-base">
                  Our Mission & Vision
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our primary mission is to digitalize the local commerce environment in Kore Woreda. By enabling frictionless electronic payments with telebirr and CBE Birr, and delivering top-tier mechanical repair services for laptops, smartphones, and printers, we support the digital transformation of students, professionals, and shop owners.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We maintain strict standard quality reviews on every hardware component replacement we install, ensuring high performance and longevity.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">
                    Physical Presence (Oromia Region)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    Our computerized center is strategically situated in Kore Town. We operate a walk-in workbench where local customers can interact directly with our technicians, inspect active inventory, or attend IT literacy workshops.
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4 space-y-2.5 text-xs text-slate-700 font-mono">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>Official Location Data</span>
                  </div>
                  <div>• Region: <strong>Oromia Region</strong></div>
                  <div>• Zone: <strong>West Arsi Zone</strong></div>
                  <div>• Woreda: <strong>Kore Woreda</strong></div>
                  <div>• Town: <strong>Kore Town</strong></div>
                </div>
              </div>
            </section>

            {/* Educational Care Guide Blog (Leather accessories focus) */}
            <section id="leather-care-blog" className="max-w-3xl mx-auto bg-amber-50/20 rounded-3xl border border-amber-900/10 p-6 sm:p-10 space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Educational Care Guide</span>
                </span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900">
                  Caring for Premium Full-Grain Genuine Leather
                </h2>
                <p className="text-slate-500 text-xs">
                  Educating our patrons on the preservation of locally hand-crafted leather goods sold at IresoJ Digital CSC.
                </p>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed space-y-4">
                <p>
                  At IresoJ Digital CSC, we believe in combining digital precision with raw organic craftsmanship. Alongside computer components, we sell high-quality, full-grain genuine Ethiopian leather wallets and laptop sleeves. Because full-grain leather is made from the topmost premium layer of the hide, it keeps all the natural strength, grains, and tactile textures.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 font-mono">
                  <div className="bg-white p-3 rounded-xl border border-amber-900/5">
                    <strong className="text-amber-800 block text-[10px] uppercase tracking-wide mb-1">
                      1. The Art of Patina
                    </strong>
                    Genuine full-grain leather absorbs oils from your hands and exposure to sunlight, developing a rich, darkened, personal sheen known as a "patina". This is a signature of genuine quality, not a defect!
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-900/5">
                    <strong className="text-amber-800 block text-[10px] uppercase tracking-wide mb-1">
                      2. Cleaning & Moisture
                    </strong>
                    Never soak leather or clean with harsh domestic dish soaps! If your laptop sleeve or wallet gets damp, dry it naturally at room temperature. Keep it away from intense stove heat or direct sunlight.
                  </div>
                </div>

                <p>
                  To keep your premium leather assets looking majestic alongside your high-performance laptop, apply a light, organic leather conditioner wax every 3 to 6 months. Rub a tiny amount onto the skin in a circular motion, wait 10 minutes, and wipe clean. This prevents microscopic cracks and keeps the leather water-resistant for years to come.
                </p>
              </div>
            </section>

          </div>
        );

      // 3. ANNOUNCEMENTS VIEW
      case 'digital-store':
        return (
          <DigitalStore 
            assets={assets}
            onDownload={handleDownloadAsset}
            onInitiatePurchase={handleInitiateAssetPurchase}
          />
        );

      case 'news':
        return (
          <div id="news-view" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl font-extrabold text-slate-900">
                News & Official Announcements
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Stay updated with corporate logs, stock replenishment notifications, and special academic IT course schedules from IresoJ Digital CSC management.
              </p>
            </div>

            {/* List of announcements */}
            <div className="space-y-6">
              {announcements.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 font-mono text-xs">
                  No announcements published yet. Check back soon!
                </div>
              ) : (
                announcements.filter(ann => ann && ann.title).map((ann) => (
                  <article key={ann.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:border-slate-200 hover:shadow-md transition-all duration-300 space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <h2 className="font-display font-bold text-slate-900 text-lg leading-snug">
                        {ann.title}
                      </h2>
                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 shrink-0">
                        <Calendar className="w-4 h-4 text-[#0EA5E9]" />
                        <span>{new Date(ann.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono">
                      {ann.content}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
                      <span>Publisher: <strong>{ann.author}</strong></span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Share:</span>
                        <a
                          href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(`📢 [IresoJ Digital CSC] ${ann.title}\n\n${ann.content}\n\nVisit: ${window.location.origin}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-sky-50 text-[#229ED9] hover:bg-sky-100 rounded text-[10px] font-bold transition-colors"
                        >
                          Telegram
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`📢 [IresoJ Digital CSC] *${ann.title}*\n\n${ann.content}\n\nVisit: ${window.location.origin}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-emerald-50 text-[#25D366] hover:bg-emerald-100 rounded text-[10px] font-bold transition-colors"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-blue-50 text-[#1877F2] hover:bg-blue-100 rounded text-[10px] font-bold transition-colors"
                        >
                          Facebook
                        </a>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

          </div>
        );

      // 4. DETAILED SERVICES VIEW
      case 'services': {
        const maintenanceProducts = filteredProducts.filter(p => p.category === 'maintenance');
        const printProducts = filteredProducts.filter(p => p.category === 'print_publish');
        const trainingProducts = filteredProducts.filter(p => p.category === 'training');
        const salesProducts = filteredProducts.filter(p => p.category === 'sales');
        
        const noResults = filteredProducts.length === 0;

        return (
          <div id="services-view" className="space-y-12 animate-in fade-in duration-300">
            
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl font-extrabold text-slate-900">
                Customer Services & Catalog Catalogues
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Filter and browse through our 4 core service sectors. Select any computer maintenance contract, training module, or premium accessory to order.
              </p>
            </div>

            {/* Promo Booking Card Banner */}
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-sky-500 to-[#0EA5E9] text-white rounded-3xl p-6 shadow-xl shadow-sky-100 flex flex-col md:flex-row justify-between items-center gap-6 border border-sky-400">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Online Scheduling Active
                </span>
                <h2 className="font-display font-black text-lg sm:text-xl tracking-tight">
                  Need a custom diagnostics check or bespoke layout?
                </h2>
                <p className="text-sky-50 text-xs max-w-lg leading-relaxed font-medium">
                  Skip the line! Schedule an appointment with IresoJ Digital CSC experts in Kore Town. Select your date, describe the issue, and secure your slot today.
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-white hover:bg-slate-100 text-[#0EA5E9] px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                {t('bookService')}
              </button>
            </div>

            {/* Interactive Service Cost Estimator & Booking Calendar Widget */}
            <div className="max-w-5xl mx-auto">
              <ServiceCostEstimator onBookingSubmitted={(newBooking) => setBookings(prev => [newBooking, ...prev])} />
            </div>

            {/* Category Pills & Search/Sort */}
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 hide-scrollbar gap-2">
                {[
                  { id: 'all', label: t('allServices') },
                  { id: 'maintenance', label: t('maintenance') },
                  { id: 'print_publish', label: t('printPublish') },
                  { id: 'training', label: t('training') },
                  { id: 'sales', label: t('sales') }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#0EA5E9] text-white shadow-md shadow-sky-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0EA5E9] hover:text-[#0EA5E9]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent shadow-sm transition-all text-slate-700 font-medium"
                  />
                </div>
                <div className="w-full sm:w-48 shrink-0 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ListFilter className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'none' | 'asc' | 'desc')}
                    className="appearance-none w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent shadow-sm transition-all text-slate-700 font-medium cursor-pointer"
                  >
                    <option value="none">{t('sortBy')}</option>
                    <option value="asc">{t('priceLowHigh')}</option>
                    <option value="desc">{t('priceHighLow')}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                     <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
                {(searchQuery || sortOrder !== 'none' || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSortOrder('none');
                      setSelectedCategory('all');
                    }}
                    className="w-full sm:w-auto shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {noResults ? (
              <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                <p className="text-slate-500 font-medium">No matching products or services found for "{searchQuery}".</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSortOrder('none');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 text-[#0EA5E9] font-bold text-sm hover:underline"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-10">
                  
                  {/* Category 1: Computer & Electronics Maintenance */}
                  {maintenanceProducts.length > 0 && (
                    <div id="cat-maintenance" className="space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
                          <span>1. Computer & Electronics Maintenance</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Precision hardware diagnoses, driver updates, dust cleaning, motherboard diagnostics, and screen restoration.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {maintenanceProducts.map((prod) => (
                          <ProductCard key={prod.id} product={prod} onSelect={(p) => handleProductSelection(p)} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Category 2: Print & Publish */}
                {printProducts.length > 0 && (
                  <div id="cat-print" className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <span>2. Print & Publish layouts</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Corporate booklet layouts, ID card design formatting, color photocopying, and custom layouts by our designers.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {printProducts.map((prod) => (
                        <ProductCard key={prod.id} product={prod} onSelect={(p) => handleProductSelection(p)} />
                      ))}
                    </div>
                    
                    {/* Sample Works Grid */}
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        {t('sampleWorks')}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sampleWorks.map((work) => (
                          <div 
                            key={work.id} 
                            onClick={() => setSelectedGalleryImage(work)}
                            className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 border border-slate-200"
                          >
                            <img 
                              src={work.url} 
                              alt={work.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300 flex items-center justify-center">
                              <ZoomIn className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <span className="text-white text-xs font-bold block truncate">{work.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Category 3: Short Basic IT Training */}
                {trainingProducts.length > 0 && (
                  <div id="cat-training" className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                        <span>3. Short Basic Training courses</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Short-term, fully practical workshops. Learn Windows systems, Microsoft Office Suite, and internet safety.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {trainingProducts.map((prod) => (
                        <ProductCard key={prod.id} product={prod} onSelect={(p) => handleProductSelection(p)} />
                      ))}
                    </div>
                  </div>
                )}

                
                {/* Mobile Airtime Purchase Widget */}
                {selectedCategory === 'all' || selectedCategory === 'sales' ? (
                  <div className="mb-10">
                    <MobileAirtimePurchase onSubmitTransaction={handleTransactionReferenceSubmit} />
                  </div>
                ) : null}
\n                {/* Category 4: Sales Section (Hardware, Digital, Premium Leather) */}
                {salesProducts.length > 0 && (
                  <div id="cat-sales" className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                        <span>4. Sales Section (Salle)</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Curated physical hardware, activated mobile airtime vouchers, ATS-friendly digital resume codes, and signature handcrafted full-grain leather accessories.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {salesProducts.map((prod) => (
                        <ProductCard key={prod.id} product={prod} onSelect={(p) => handleProductSelection(p)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recently Viewed Sidebar */}
              <div className="w-full lg:w-72 shrink-0">
                <div className="sticky top-24 space-y-6">
                  <RecentlyViewed 
                    onSelect={(p) => handleProductSelection(p)} 
                    lastViewedId={lastViewedId} 
                  />
                  
                  {/* Help Card */}
                  <div className="bg-gradient-to-br from-[#0EA5E9] to-sky-600 rounded-3xl p-6 text-white shadow-lg shadow-sky-200/50">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm mb-2">Need a Custom Quote?</h4>
                    <p className="text-sky-50 text-[11px] leading-relaxed mb-4">
                      Can't find exactly what you need? We specialize in custom IT solutions and bulk printing services.
                    </p>
                    <button 
                      onClick={() => setActiveTab('contact')}
                      className="w-full py-2 bg-white text-[#0EA5E9] rounded-xl text-[11px] font-bold hover:bg-sky-50 transition-colors"
                    >
                      Contact Experts
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        );
      }

      // 5. CONTACT US VIEW (With feedback validation saving to db)
      case 'contact':
        return (
          <div id="contact-view" className="max-w-5xl mx-auto space-y-6 sm:space-y-12 animate-in fade-in duration-300">
            
            <div className="text-center space-y-1.5 sm:space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Contact Us & Leave Feedback
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Have questions about custom leather configurations or repair diagnostic timelines? Submit an inquiry directly to our dashboard!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-8">
              
              {/* Form panel - 3/5 cols */}
              <div className="md:col-span-3 bg-white border border-slate-100 rounded-2xl p-4 sm:p-8 shadow-sm space-y-3 sm:space-y-6 text-left">
                <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">
                  Feedback Submission Form
                </h3>

                {contactSuccess && (
                  <div className="bg-green-50 text-green-800 p-3 sm:p-4 rounded-xl border border-green-200 flex items-center space-x-2 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                    <span>{contactSuccess}</span>
                  </div>
                )}

                {contactError && (
                  <div className="bg-red-50 text-red-800 p-3 sm:p-4 rounded-xl border border-red-200 flex items-center space-x-2 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
                    <span>{contactError}</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jemal Ireso"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full text-xs px-3 sm:px-3.5 py-2 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +251 995 852 194"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full text-xs px-3 sm:px-3.5 py-2 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. iresojemal44@gmail.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full text-xs px-3 sm:px-3.5 py-2 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 sm:mb-2">
                      Experience Rating
                    </label>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setContactRating(star)}
                          className="focus:outline-none transition-transform active:scale-110"
                        >
                          <Star 
                            className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= contactRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                          />
                        </button>
                      ))}
                      <span className="ml-1.5 sm:ml-2 text-xs font-bold text-slate-400">
                        {contactRating} / 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                      Detailed Message Inquiry *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write your feedback, inquiry, or question for management..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full text-xs px-3 sm:px-3.5 py-2 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0EA5E9] hover:bg-sky-600 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-sky-100 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Submitting Form...' : 'Send Message To IresoJ Digital'}</span>
                  </button>

                </form>
              </div>

              {/* Map & Coordinates panel - 2/5 cols */}
              <div className="md:col-span-2 space-y-6 text-left">
                
                {/* WhatsApp Direct Messaging Card */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg shadow-emerald-900/10 border border-emerald-500 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-emerald-200" />
                    <div>
                      <h4 className="font-extrabold text-white text-sm font-display">Instant WhatsApp Inquiry</h4>
                      <p className="text-[11px] text-emerald-100">Direct chat with IresoJ Digital tech support team</p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-50 leading-relaxed font-medium">
                    Have a quick question about repair fees or digital publishing? Click below to start a pre-filled chat on WhatsApp.
                  </p>
                  <a
                    href="https://wa.me/251995852194?text=Hello%20IresoJ%20Digital%20CSC!%20I%20would%20like%20to%20inquire%20about%20your%20computer%20repair%20and%20digital%20printing%20services%20in%20Kore%20Town."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>Contact via WhatsApp (+251 995 852 194)</span>
                  </a>
                </div>

                {/* Physical details block */}
                <div className="bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-md">
                  <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">
                    Our Contact Info
                  </h3>
                  
                  <ul className="space-y-4 text-xs">
                    <li className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-display">Service Center Hub</strong>
                        <span>Kore Town, Kore Woreda, West Arsi Zone, Oromia Region, Ethiopia</span>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-[#0EA5E9] shrink-0" />
                      <div>
                        <strong className="text-white block font-display">Inquiry Phone Line</strong>
                        <span>+251 995 852 194</span>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-[#0EA5E9] shrink-0" />
                      <div>
                        <strong className="text-white block font-display">Support Email</strong>
                        <span className="break-all">iresojemal44@gmail.com</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Simulated Google Map Location card */}
                <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm space-y-3 font-mono text-[11px] text-slate-600">
                  <div className="h-32 bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-slate-200/50 opacity-40 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:16px_16px]" />
                    <MapPin className="w-7 h-7 text-red-600 animate-bounce relative z-10" />
                    <span className="font-bold text-slate-800 mt-1 relative z-10">IresoJ Digital CSC Location Map</span>
                    <span className="text-[10px] text-slate-400 relative z-10">Kore Town, Ethiopia</span>
                  </div>
                  <p className="leading-snug">
                    📍 <strong>Kore Town Coordinates</strong>: Walk in to our center situated opposite the local Kore central market.
                  </p>
                </div>

              </div>

            </div>

          </div>
        );

      // 6. STAFF LOGIN VIEW
      case 'login':
        return (
          <div id="login-view" className="max-w-md mx-auto py-12 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 shadow-md text-left space-y-6">
              
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-sky-50 text-[#0EA5E9] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <LogIn className="w-6 h-6" />
                </div>
                <h2 className="font-display font-extrabold text-slate-900 text-xl">
                  Staff Portal Sign In
                </h2>
                <p className="text-xs text-slate-500">
                  Access administrative dashboard, catalog editors, and payment verification tools.
                </p>
              </div>

              {loginError && (
                <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-200 text-xs font-semibold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Staff Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Security Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. admin123"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] bg-slate-50"
                  />
                  <div className="mt-2 text-[10px] text-slate-500 bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-100 font-mono space-y-0.5">
                    <p className="font-bold text-indigo-900">👑 Admin Sign-In Credentials:</p>
                    <p>• Username/Email: <strong className="text-indigo-700">Jemal Fano</strong> or <strong className="text-indigo-700">jemalfan030@gmail.com</strong></p>
                    <p>• Password: <strong className="text-indigo-700">Esb#2026</strong> (or <strong className="text-indigo-700">admin123</strong> / <strong className="text-indigo-700">admin</strong>)</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0EA5E9] hover:bg-sky-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-sky-100 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                </button>
              </form>

            </div>
          </div>
        );

      // 7. ADMIN PROTECTED DASHBOARD RENDERER
      case 'admin':
        if (!authState.isAuthenticated) {
          return (
            <div className="max-w-md mx-auto py-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="font-display font-bold text-slate-900 text-lg">Protected Administrative Area</h2>
              <p className="text-xs text-slate-500">
                You must login with staff credentials to manage transactions and edit databases.
              </p>
              <button
                onClick={() => setActiveTab('login')}
                className="px-4 py-2 bg-[#0EA5E9] text-white rounded-lg text-xs font-bold shadow hover:bg-sky-600 transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          );
        }

        return (
          <div id="admin-dashboard-view" className="space-y-8 text-left animate-in fade-in duration-300">
            
            {/* Dashboard Welcome Header */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[9px] uppercase font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold tracking-wider">
                  Staff Workspace
                </span>
                <h1 className="font-display font-extrabold text-2xl mt-1">
                  Welcome back, {authState.user?.username}!
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Logged in as: <strong>{authState.user?.email}</strong> (Role: Administrator)
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-3.5 py-1.5 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  View Public Site
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-red-600/10"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Sub-tab Navigation Panel */}
            <div className="flex flex-wrap border-b border-slate-100 gap-1.5">
              {[
                { id: 'dashboard', label: 'Command Center' },
                { id: 'products', label: 'Catalog CRUD' },
                { id: 'payments', label: 'Payment Ledger Verification' },
                { id: 'bookings', label: 'Service Bookings Desk' },
                { id: 'history', label: 'Transaction History' },
                { id: 'reports', label: 'Reports & Analytics' },
                { id: 'commission', label: 'Commission Analytics' },
                { id: 'users', label: 'Customer Book (CRM)' },
                { id: 'share', label: 'Communications & Inbox' },
                { id: 'payroll', label: 'Staff Payroll' },
                { id: 'assets', label: 'Digital Assets Store' },
                { id: 'logs', label: 'Security Audit Logs' },
              ].map((sub) => {
                const isActive = adminSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setAdminSubTab(sub.id as AdminSubTab)}
                    className={`px-4.5 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#0EA5E9] text-white shadow-lg shadow-sky-100'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* Render Sub-tabs dynamically */}
            <div className="pt-2 animate-in fade-in duration-200">
              {adminSubTab === 'dashboard' && (
                <AdminDashboard 
                  bookings={bookings}
                  transactions={transactions}
                  feedback={feedback}
                  products={products}
                  onSetTab={(tab) => setAdminSubTab(tab)}
                  onUpdateProduct={handleUpdateProduct}
                  onRefresh={() => loadAdminData(authState.token || '')}
                  lastUpdated={lastUpdatedTime}
                />
              )}
              {adminSubTab === 'products' && (
                <AdminProducts 
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}
              {adminSubTab === 'payments' && (
                <AdminPayments 
                  transactions={transactions}
                  onUpdateStatus={handleUpdateTransactionStatus}
                  onRefresh={() => loadAdminData(authState.token!)}
                />
              )}
              {adminSubTab === 'bookings' && (
                <AdminBookings 
                  bookings={bookings}
                  onUpdateStatus={handleUpdateBookingStatus}
                  onDelete={handleDeleteBooking}
                  onRefresh={() => loadAdminData(authState.token!)}
                />
              )}
              {adminSubTab === 'history' && (
                <AdminHistory 
                  transactions={transactions}
                  onRefresh={() => loadAdminData(authState.token!)}
                />
              )}
              {adminSubTab === 'reports' && (
                <AdminReport 
                  transactions={transactions}
                  bookings={bookings}
                />
              )}
              {adminSubTab === 'commission' && (
                <AdminCommission 
                  transactions={transactions}
                />
              )}
              {adminSubTab === 'users' && (
                <AdminUsers 
                  customers={customers}
                  bookings={bookings}
                  transactions={transactions}
                  feedback={feedback}
                  onRefresh={() => loadAdminData(authState.token!)}
                />
              )}
              {adminSubTab === 'share' && (
                <AdminShare 
                  announcements={announcements}
                  feedback={feedback}
                  customers={customers}
                  transactions={transactions}
                  bookings={bookings}
                  onAddAnnouncement={handleAddAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                  onUpdateFeedbackPublic={handleUpdateFeedbackPublic}
                  onDeleteFeedback={handleDeleteFeedback}
                  onSendBroadcast={handleSendBroadcast}
                  onGetBroadcasts={handleGetBroadcasts}
                  onSendSmsBroadcast={handleSendSmsBroadcast}
                  onGetSmsBroadcasts={handleGetSmsBroadcasts}
                />
              )}
              {adminSubTab === 'payroll' && (
                <AdminPayroll />
              )}
              {adminSubTab === 'assets' && (
                <AdminAssets 
                  assets={assets}
                  onAddAsset={handleAddAsset}
                  onDeleteAsset={handleDeleteAsset}
                />
              )}
              {adminSubTab === 'logs' && (
                <AdminSecurityLogs 
                  token={authState.token!}
                />
              )}
            </div>

          </div>
        );

      default:
        return <div>View not implemented</div>;
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50/30 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Navigation Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        authState={authState} 
        handleLogout={handleLogout} 
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenManual={() => setShowUserManual(true)}
      />

      {/* Main Body View Layout */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {renderActiveView()}
      </main>

      {/* Navigation Footer */}
      <Footer setActiveTab={setActiveTab} />
      <FloatingContact />
      <UpdateNotifier />

      {/* Complete Step-by-Step User Manual & PDF Export Modal */}
      <UserManualModal 
        isOpen={showUserManual}
        onClose={() => setShowUserManual(false)}
        adminEmail="jemalfano030@gmail.com"
      />

      {/* Global Interactive Payment Modal Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <PaymentModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onSubmitTransaction={handleTransactionReferenceSubmit} 
          />
        )}
      </AnimatePresence>

      {/* Service Appointment Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <BookServiceModal 
            onClose={() => setShowBookingModal(false)}
            products={products}
            lang={lang}
            onSubmitBooking={handleSubmitBooking}
          />
        )}
      </AnimatePresence>

      {/* Image Gallery Modal Overlay */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 sm:p-8"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute -top-12 right-0 sm:-right-12 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <img 
                src={selectedGalleryImage.url} 
                alt={selectedGalleryImage.title}
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 rounded-b-xl flex flex-col items-center gap-4">
                <p className="text-white font-display font-bold text-xl drop-shadow-md text-center">{selectedGalleryImage.title}</p>
                <a 
                  href={selectedGalleryImage.url} 
                  download 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 border border-white/20 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  {t('saveImage')}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
