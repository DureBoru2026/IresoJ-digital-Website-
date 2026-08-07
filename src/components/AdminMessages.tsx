import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  CheckCheck, 
  Clock, 
  User, 
  Phone, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { SupportMessage } from '../types';
import { subscribeToSupportMessages, replyToSupportMessage } from '../lib/supportService';

export default function AdminMessages() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToSupportMessages('admin', (msgs) => {
      setMessages(msgs);
      if (msgs.length > 0 && !selectedMessage) {
        setSelectedMessage(msgs[msgs.length - 1]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyInput.trim()) return;

    setSubmitting(true);
    try {
      await replyToSupportMessage(selectedMessage.id, replyInput.trim());
      setReplyInput('');
      setSelectedMessage(prev => prev ? { ...prev, reply: replyInput.trim(), status: 'replied' } : null);
    } catch (err) {
      console.error('Failed to reply to message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return m.status !== 'replied';
    if (filter === 'replied') return m.status === 'replied';
    return true;
  }).filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.message.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q) || (m.senderPhone && m.senderPhone.includes(q));
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-mono font-bold mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Staff Support Desk</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Support Chat & Messages
          </h2>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat..."
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
            />
          </div>
          <select
            value={filter}
            onChange={(e: any) => setFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
          >
            <option value="all">All Messages</option>
            <option value="unread">Pending Reply</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-xl overflow-hidden h-[600px]">
        
        {/* Left Side: Message List */}
        <div className="lg:col-span-5 border-r border-stone-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
          <div className="p-3 bg-stone-100 dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
            Messages ({filteredMessages.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No support messages match your filter.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 cursor-pointer transition-colors space-y-1.5 ${
                      isSelected 
                        ? 'bg-sky-50 dark:bg-slate-800/80 border-l-4 border-[#0EA5E9]' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <strong className="font-bold text-slate-900 dark:text-white">{msg.senderName}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{msg.date}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      {msg.senderPhone && (
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          {msg.senderPhone}
                        </span>
                      )}
                      {msg.status === 'replied' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          Replied
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Thread & Reply Form */}
        <div className="lg:col-span-7 flex flex-col h-full">
          {selectedMessage ? (
            <>
              {/* Message Details Top Bar */}
              <div className="p-4 bg-stone-50 dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <strong className="font-bold text-slate-900 dark:text-white text-sm block">{selectedMessage.senderName}</strong>
                  <span className="text-slate-500 text-[11px]">Phone: {selectedMessage.senderPhone || 'Not provided'} • Date: {selectedMessage.date}</span>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${selectedMessage.status === 'replied' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {selectedMessage.status}
                </div>
              </div>

              {/* Message Content Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Customer Inquiry:</span>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.reply && (
                  <div className="bg-sky-50 dark:bg-slate-950 p-4 rounded-2xl space-y-2 border border-sky-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-[#0EA5E9] uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Current Staff Reply:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-amber-300 leading-relaxed font-medium">
                      {selectedMessage.reply}
                    </p>
                  </div>
                )}
              </div>

              {/* Staff Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 bg-stone-50 dark:bg-slate-950 border-t border-stone-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  required
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type staff reply to customer..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={submitting || !replyInput.trim()}
                  className="bg-[#0EA5E9] hover:bg-sky-600 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold">Select a message from the left to view & respond.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
