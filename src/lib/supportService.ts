import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDocsFromCache,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { SupportMessage } from '../types';

const COLLECTION_NAME = 'support_messages';

// Local storage fallback key
const LOCAL_STORAGE_KEY = 'iresoj_support_messages_v1';

const getInitialLocalMessages = (): SupportMessage[] => {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('LocalStorage error reading support messages:', e);
  }
  return [
    {
      id: 'msg_welcome_1',
      senderId: 'staff_system',
      senderName: 'IresoJ CSC Support Team',
      senderRole: 'staff',
      message: 'Welcome to IresoJ Digital Support! How can we assist you with computer repair, digital products, airtime, or printing services at Kore Town counter today?',
      date: new Date().toLocaleString(),
      status: 'read'
    }
  ];
};

const saveLocalMessages = (messages: SupportMessage[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn('LocalStorage error saving support messages:', e);
  }
};

/**
 * Subscribes to real-time support messages from Firestore with fallback to local state.
 */
export function subscribeToSupportMessages(
  userId: string,
  onUpdate: (messages: SupportMessage[]) => void
): () => void {
  let isFirestoreConnected = false;
  let localMsgs = getInitialLocalMessages();

  try {
    if (db) {
      const q = query(collection(db, COLLECTION_NAME));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          isFirestoreConnected = true;
          const remoteMsgs: SupportMessage[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              senderId: data.senderId || 'user',
              senderName: data.senderName || 'Anonymous',
              senderPhone: data.senderPhone || '',
              senderRole: data.senderRole || 'user',
              message: data.message || '',
              reply: data.reply || '',
              date: data.date || new Date().toLocaleString(),
              status: data.status || 'unread',
              productId: data.productId,
              productTitle: data.productTitle
            };
          });

          // Sort by date/timestamp
          const sorted = remoteMsgs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          saveLocalMessages(sorted);
          onUpdate(sorted);
        },
        (error) => {
          console.warn('Firestore onSnapshot error for support messages, using local fallback:', error);
          onUpdate(localMsgs);
        }
      );
      return unsubscribe;
    }
  } catch (err) {
    console.warn('Firestore error subscribing to support messages:', err);
  }

  // Fallback to local
  onUpdate(localMsgs);
  return () => {};
}

/**
 * Sends a support message
 */
export async function sendSupportMessage(msgData: {
  senderId: string;
  senderName: string;
  senderPhone?: string;
  senderRole?: 'user' | 'staff';
  message: string;
  productId?: string;
  productTitle?: string;
}): Promise<boolean> {
  const newMsg: SupportMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    senderId: msgData.senderId,
    senderName: msgData.senderName,
    senderPhone: msgData.senderPhone || '',
    senderRole: msgData.senderRole || 'user',
    message: msgData.message,
    date: new Date().toLocaleString(),
    status: 'unread',
    productId: msgData.productId,
    productTitle: msgData.productTitle
  };

  // Try Firestore
  try {
    if (db) {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...newMsg,
        createdAt: serverTimestamp()
      });
      return true;
    }
  } catch (err) {
    console.warn('Firestore addDoc error for support message, storing locally:', err);
  }

  // Save in local storage
  const current = getInitialLocalMessages();
  const updated = [...current, newMsg];
  saveLocalMessages(updated);
  return true;
}

/**
 * Staff reply to a message
 */
export async function replyToSupportMessage(messageId: string, replyText: string): Promise<boolean> {
  try {
    if (db) {
      const msgRef = doc(db, COLLECTION_NAME, messageId);
      await updateDoc(msgRef, {
        reply: replyText,
        status: 'replied'
      });
      return true;
    }
  } catch (err) {
    console.warn('Firestore updateDoc error replying to support message:', err);
  }

  // Local fallback
  const current = getInitialLocalMessages();
  const updated = current.map(m => m.id === messageId ? { ...m, reply: replyText, status: 'replied' as const } : m);
  saveLocalMessages(updated);
  return true;
}
