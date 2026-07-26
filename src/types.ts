export interface ProductService {
  id: string;
  title: string;
  category: 'maintenance' | 'print_publish' | 'training' | 'sales';
  type: 'physical' | 'digital' | 'service';
  description: string;
  price: number; // in ETB (Ethiopian Birr)
  imageUrl: string;
  stock: number | null; // null for services/digital, number for physical
  specifications?: string; // e.g. details for physical items
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
  replyMessage?: string;
  rating?: number;
  isPublic?: boolean;
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  paymentGateway: 'telebirr' | 'CBE Birr';
  customerName: string;
  customerPhone?: string;
  amount: number;
  purpose: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceTitle: string;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'paid' | 'partial' | 'waived';
  date: string;
}

export interface CustomerRecord {
  name: string;
  contact: string;
  source: string;
  transactionsCount: number;
  spentAmount: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    username: string;
    email: string;
    role: string;
  } | null;
}

export interface DigitalAsset {
  id: string;
  title: string;
  type: 'video' | 'image' | 'template' | 'pdf' | 'ppt' | 'word';
  priceType: 'free' | 'sale';
  price: number; // 0 if free
  fileUrl: string;
  description: string;
  date: string;
  downloadCount: number;
}

export interface SecurityLog {
  id: string;
  adminUser: string;
  action: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  ip?: string;
}

export interface Broadcast {
  id: string;
  subject: string;
  message: string;
  timestamp: string;
  recipientCount: number;
}

export interface SmsBroadcast {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  recipientCount: number;
  recipientsList?: string[];
}

export interface PayrollRecord {
  id: string;
  staffName: string;
  role: string;
  phone?: string;
  baseSalary: number; // in ETB
  bonus: number; // in ETB
  taxDeduction: number; // in ETB
  netPay: number; // in ETB (baseSalary + bonus - taxDeduction)
  month: string; // e.g. "July 2026"
  paymentStatus: 'paid' | 'pending' | 'processing';
  paymentDate: string;
  paymentMethod: 'telebirr' | 'CBE Birr' | 'Bank Transfer' | 'Cash';
  notes?: string;
}

export type ActiveTab = 'home' | 'about' | 'services' | 'news' | 'contact' | 'login' | 'admin' | 'digital-store' | 'agriculture' | 'academy' | 'marketplace' | 'wishlist' | 'community' | 'durepay';
export type AdminSubTab = 'dashboard' | 'products' | 'payments' | 'bookings' | 'history' | 'users' | 'share' | 'reports' | 'assets' | 'logs' | 'commission' | 'payroll';
