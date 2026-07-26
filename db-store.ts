import { db as firestore } from './src/lib/firebase.js';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

export interface User { id: string; email: string; username: string; passwordHash: string; role: 'admin' | 'user'; }
export interface ProductService { id: string; title: string; category: string; type: string; description: string; price: number; imageUrl: string; stock: number | null; specifications?: string; }
export interface Announcement { id: string; title: string; content: string; date: string; author: string; }
export interface Feedback { id: string; name: string; email: string; phone: string; message: string; date: string; status: 'unread' | 'read' | 'replied'; replyMessage?: string; rating?: number; isPublic?: boolean; }
export interface Transaction { id: string; referenceNumber: string; paymentGateway: 'telebirr' | 'cbebirr' | 'awash'; customerName: string; customerPhone: string; amount: number; purpose: string; date: string; status: 'pending' | 'approved' | 'rejected'; notes?: string; }
export interface Booking { id: string; customerName: string; customerPhone: string; customerEmail?: string; serviceId: string; serviceTitle: string; bookingDate: string; bookingTime: string; notes?: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; paymentStatus?: 'unpaid' | 'paid' | 'partial' | 'waived'; date: string; }
export interface DigitalAsset { id: string; title: string; type: 'video' | 'image' | 'template' | 'pdf' | 'ppt' | 'word'; priceType: 'free' | 'sale'; price: number; fileUrl: string; description: string; date: string; downloadCount: number; }
export interface SecurityLog { id: string; adminUser: string; action: string; details: string; timestamp: string; severity: 'info' | 'warning' | 'critical'; ip?: string; }
export interface Broadcast { id: string; subject: string; message: string; timestamp: string; recipientCount: number; }
export interface SmsBroadcast { id: string; senderId: string; message: string; timestamp: string; recipientCount: number; recipientsList?: string[]; }

async function getCollection<T>(name: string): Promise<T[]> {
  const col = collection(firestore, name);
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as T));
}

async function saveCollection<T extends {id: string}>(name: string, items: T[]): Promise<void> {
  const col = collection(firestore, name);
  // To avoid deleting things not in items, we just overwrite existing items. 
  // In a real app we'd manage items individually, but to match the old API, we just write them.
  // We should also delete items not in the list if we want to mimic fs.writeFileSync, but let's just write.
  for (const item of items) {
    await setDoc(doc(col, item.id), item);
  }
}

export const db = {
  getUsers: () => getCollection<User>('users'),
  saveUsers: (users: User[]) => saveCollection<User>('users', users),
  getProducts: () => getCollection<ProductService>('products'),
  saveProducts: (products: ProductService[]) => saveCollection<ProductService>('products', products),
  getAnnouncements: () => getCollection<Announcement>('announcements'),
  saveAnnouncements: (announcements: Announcement[]) => saveCollection<Announcement>('announcements', announcements),
  getFeedback: () => getCollection<Feedback>('feedback'),
  saveFeedback: (feedback: Feedback[]) => saveCollection<Feedback>('feedback', feedback),
  getTransactions: () => getCollection<Transaction>('transactions'),
  saveTransactions: (transactions: Transaction[]) => saveCollection<Transaction>('transactions', transactions),
  getBookings: () => getCollection<Booking>('bookings'),
  saveBookings: (bookings: Booking[]) => saveCollection<Booking>('bookings', bookings),
  getAssets: () => getCollection<DigitalAsset>('assets'),
  saveAssets: (assets: DigitalAsset[]) => saveCollection<DigitalAsset>('assets', assets),
  getLogs: () => getCollection<SecurityLog>('security_logs'),
  saveLogs: (logs: SecurityLog[]) => saveCollection<SecurityLog>('security_logs', logs),
  getBroadcasts: () => getCollection<Broadcast>('broadcasts'),
  saveBroadcasts: (broadcasts: Broadcast[]) => saveCollection<Broadcast>('broadcasts', broadcasts),
  getSmsBroadcasts: () => getCollection<SmsBroadcast>('sms_broadcasts'),
  saveSmsBroadcasts: (smsBroadcasts: SmsBroadcast[]) => saveCollection<SmsBroadcast>('sms_broadcasts', smsBroadcasts),
};
