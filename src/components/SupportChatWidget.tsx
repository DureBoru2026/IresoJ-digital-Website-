import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  CheckCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportMessage } from '../types';
import { subscribeToSupportMessages, sendSupportMessage } from '../lib/supportService';

interface SupportChatWidgetProps {
  userId?: string;
  userName?: string;
  userPhone?: string;
}

export default function SupportChatWidget({
  userId = 'guest_' + Math.random().toString(36).substring(2, 7),
  userName = 'Guest User',
  userPhone = ''
}: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSupportMessages(userId, (fetchedMsgs) => {
      setMessages(fetchedMsgs);
      if (!isOpen) {
        // Count messages that might be unread (simplified)
        const unread = fetchedMsgs.filter(m => m.senderRole === 'staff' && m.status === 'replied').length;
        setUnreadCount(unread);
      }
    });
    return () => unsubscribe();
  }, [userId, isOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);
    try {
      await sendSupportMessage({
        senderId: userId,
        senderName: userName,
        senderPhone: userPhone,
        senderRole: 'user',
        message: inputText.trim()
      });
      setInputText('');
    } catch (err) {
      console.error('Failed to send support message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] md:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '64px' : '500px',
              width: isMinimized ? '280px' : '360px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4 transition-all duration-300"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">IresoJ Support</h3>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Kore Town Staff Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">How can we help you?</p>
                      <p className="text-[10px] text-slate-500 max-w-[200px]">
                        Ask about computer repairs, digital products, or Ethiopia airtime services.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isUser = msg.senderRole === 'user';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                            isUser 
                              ? 'bg-[#0EA5E9] text-white rounded-tr-none shadow-sm shadow-sky-100' 
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'
                          }`}>
                            <p>{msg.message}</p>
                          </div>
                          {msg.reply && (
                            <div className="mt-2 ml-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl rounded-tl-none text-xs space-y-1">
                              <div className="flex items-center gap-1 font-bold text-emerald-600 text-[10px] uppercase">
                                <ShieldCheck className="w-3 h-3" />
                                Staff Response:
                              </div>
                              <p className="text-slate-800 dark:text-emerald-200">{msg.reply}</p>
                            </div>
                          )}
                          <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                            {msg.date.split(',')[1] || msg.date}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0EA5E9] dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputText.trim()}
                    className="w-10 h-10 bg-[#0EA5E9] text-white rounded-xl flex items-center justify-center hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100 disabled:opacity-50"
                  >
                    {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative ${
          isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-[#0EA5E9] text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        
        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
