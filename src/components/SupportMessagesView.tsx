import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CheckCheck, 
  Building, 
  Phone, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { SupportMessage } from '../types';
import { subscribeToSupportMessages, sendSupportMessage } from '../lib/supportService';

interface SupportMessagesViewProps {
  userId?: string;
  userName?: string;
  userPhone?: string;
}

export default function SupportMessagesView({
  userId = 'user_guest',
  userName = 'Valued Customer',
  userPhone = ''
}: SupportMessagesViewProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [customerName, setCustomerName] = useState(userName);
  const [customerPhone, setCustomerPhone] = useState(userPhone);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSupportMessages(userId, (fetchedMsgs) => {
      setMessages(fetchedMsgs);
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setIsSending(true);
    try {
      await sendSupportMessage({
        senderId: userId,
        senderName: customerName || 'Valued Customer',
        senderPhone: customerPhone,
        senderRole: 'user',
        message: newMessageText.trim()
      });
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send support message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-sky-500/30 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#0EA5E9]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-mono font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Support Chat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              My Messages & Support Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Direct communication line to IresoJ Digital CSC staff & Kore Town repair technicians.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono font-bold text-amber-300 shrink-0 relative z-10">
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Kore Town Counter Online</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
        
        {/* Contact Info Header Bar */}
        <div className="p-4 bg-stone-50 dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#0EA5E9]" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your Name"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
            />
            <Phone className="w-4 h-4 text-emerald-500 ml-2" />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone (e.g. 0911...)"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
            />
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Messages synced with Firestore</span>
          </div>
        </div>

        {/* Message Thread Box */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3"
              >
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No messages in your thread yet.</p>
                <p className="text-xs max-w-sm text-slate-400">
                  Type your message below to send an inquiry directly to our Kore Town staff. We respond within minutes!
                </p>
              </motion.div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.senderRole === 'user';
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, x: isUser ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className={`flex flex-col space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    
                    {/* Sender Label */}
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 px-1">
                      <span>{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.date}</span>
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-xs text-xs sm:text-sm font-sans leading-relaxed ${
                      isUser 
                        ? 'bg-[#0EA5E9] text-white rounded-tr-none' 
                        : 'bg-slate-900 text-white dark:bg-slate-800 dark:text-amber-300 border border-slate-700 rounded-tl-none'
                    }`}>
                      {msg.productTitle && (
                        <div className="mb-2 p-2 rounded-xl bg-white/10 border border-white/20 text-[11px] font-mono font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Regarding Product: {msg.productTitle}</span>
                        </div>
                      )}
                      <p>{msg.message}</p>

                      {/* Staff Reply Sub-Bubble if attached */}
                      {msg.reply && (
                        <div className="mt-3 pt-3 border-t border-white/20 text-xs font-sans space-y-1 bg-white/10 p-2.5 rounded-xl">
                          <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-black text-amber-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Staff Response:</span>
                          </div>
                          <p className="text-white font-medium">{msg.reply}</p>
                        </div>
                      )}
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono px-1">
                      {msg.status === 'replied' ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" />
                          Replied by Staff
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          Awaiting Response
                        </span>
                      )}
                    </div>

                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-950 border-t border-stone-200 dark:border-slate-800 flex items-center gap-3">
          <input
            type="text"
            required
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Type your message or inquiry here..."
            className="flex-1 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
          />
          <button
            type="submit"
            disabled={isSending || !newMessageText.trim()}
            className="bg-[#0EA5E9] hover:bg-sky-600 disabled:opacity-50 text-white font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
