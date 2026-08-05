import React, { useState, useMemo } from 'react';
import { Mail, MessageCircle, Calendar, Send, Trash2, ShieldCheck, Check, AlertCircle, RefreshCw, Archive, Star, Eye, EyeOff, Smartphone, PhoneCall, Sparkles, Users, X, AlertTriangle, Copy } from 'lucide-react';
import { Announcement, Feedback, CustomerRecord, Transaction, Booking, SmsBroadcast } from '../types';

interface AdminShareProps {
  announcements: Announcement[];
  feedback: Feedback[];
  customers?: CustomerRecord[];
  transactions?: Transaction[];
  bookings?: Booking[];
  onAddAnnouncement: (announcement: { title: string; content: string; author: string }) => Promise<boolean>;
  onDeleteAnnouncement: (id: string) => Promise<boolean>;
  onUpdateFeedbackStatus: (id: string, status: 'read' | 'replied', replyMessage?: string) => Promise<boolean>;
  onUpdateFeedbackPublic: (id: string, isPublic: boolean) => Promise<boolean>;
  onDeleteFeedback: (id: string) => Promise<boolean>;
  onSendBroadcast: (subject: string, message: string) => Promise<{ success: boolean; count: number }>;
  onGetBroadcasts: () => Promise<any[]>;
  onSendSmsBroadcast?: (senderId: string, message: string) => Promise<{ success: boolean; count: number; recipients?: string[] }>;
  onGetSmsBroadcasts?: () => Promise<any[]>;
}

export default function AdminShare({
  announcements,
  feedback,
  customers = [],
  transactions = [],
  bookings = [],
  onAddAnnouncement,
  onDeleteAnnouncement,
  onUpdateFeedbackStatus,
  onUpdateFeedbackPublic,
  onDeleteFeedback,
  onSendBroadcast,
  onGetBroadcasts,
  onSendSmsBroadcast,
  onGetSmsBroadcasts
}: AdminShareProps) {
  
  // Extract unique customer phone numbers from CRM
  const crmPhoneNumbers = useMemo(() => {
    const phones = new Set<string>();

    (transactions || []).forEach(t => {
      if (t && t.customerPhone && t.customerPhone.trim()) {
        phones.add(t.customerPhone.trim());
      }
    });

    (bookings || []).forEach(b => {
      if (b && b.customerPhone && b.customerPhone.trim()) {
        phones.add(b.customerPhone.trim());
      }
    });

    (feedback || []).forEach(f => {
      if (f && f.phone && f.phone.trim()) {
        phones.add(f.phone.trim());
      }
    });

    (customers || []).forEach(c => {
      if (c && c.contact && /^[+\d\s\-()]{7,}$/.test(c.contact.trim())) {
        phones.add(c.contact.trim());
      }
    });

    return Array.from(phones);
  }, [transactions, bookings, feedback, customers]);

  // Bulk SMS Promotional Broadcast States
  const [smsSenderId, setSmsSenderId] = useState('IresoJ_DIGITAL');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsBroadcasts, setSmsBroadcasts] = useState<SmsBroadcast[]>([]);
  const [smsStatus, setSmsStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [smsLoading, setSmsLoading] = useState(false);
  const [showRecipientList, setShowRecipientList] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    type: 'sms' | 'email';
    title: string;
    recipientCount: number;
    senderOrSubject: string;
    messagePreview: string;
  } | null>(null);

  const [deleteAnnId, setDeleteAnnId] = useState<string | null>(null);
  const [deleteFbId, setDeleteFbId] = useState<string | null>(null);

  // Newsletter Broadcast States
  const [broadcasts, setBroadcasts] = React.useState<any[]>([]);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  React.useEffect(() => {
    loadBroadcastHistory();
    loadSmsHistory();
  }, []);

  const loadBroadcastHistory = async () => {
    try {
      const data = await onGetBroadcasts();
      setBroadcasts(data);
    } catch (err) {
      console.error('Failed to load broadcast history');
    }
  };

  const loadSmsHistory = async () => {
    if (onGetSmsBroadcasts) {
      try {
        const data = await onGetSmsBroadcasts();
        setSmsBroadcasts(data);
      } catch (err) {
        console.error('Failed to load SMS broadcast history');
      }
    }
  };

  const handleSmsSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsMessage.trim()) return;

    if (crmPhoneNumbers.length === 0) {
      setSmsStatus({ text: 'No customer phone numbers found in CRM to dispatch SMS.', type: 'error' });
      return;
    }

    setConfirmModal({
      type: 'sms',
      title: 'Confirm Bulk SMS Broadcast',
      recipientCount: crmPhoneNumbers.length,
      senderOrSubject: smsSenderId || 'IresoJ_DIGITAL',
      messagePreview: smsMessage
    });
  };

  const executeSmsSend = async () => {
    setSmsLoading(true);
    setSmsStatus(null);

    try {
      if (onSendSmsBroadcast) {
        const result = await onSendSmsBroadcast(smsSenderId || 'IresoJ_DIGITAL', smsMessage);
        if (result.success) {
          setSmsStatus({
            text: `SMS Promotional Campaign Dispatched! Message sent to ${result.count} customer phone numbers.`,
            type: 'success'
          });
          setSmsMessage('');
          loadSmsHistory();
        } else {
          setSmsStatus({ text: 'SMS Broadcast failed. Please verify gateway settings.', type: 'error' });
        }
      } else {
        setSmsStatus({ text: 'SMS service handler not initialized.', type: 'error' });
      }
    } catch (err) {
      setSmsStatus({ text: 'SMS Broadcast failed due to a network error.', type: 'error' });
    } finally {
      setSmsLoading(false);
    }
  };

  const handleEmailSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) return;

    setConfirmModal({
      type: 'email',
      title: 'Confirm Newsletter Email Broadcast',
      recipientCount: feedback.length + customers.length + transactions.length || 1,
      senderOrSubject: broadcastSubject,
      messagePreview: broadcastMessage
    });
  };

  const executeEmailSend = async () => {
    setBroadcastLoading(true);
    setBroadcastStatus(null);

    try {
      const result = await onSendBroadcast(broadcastSubject, broadcastMessage);
      if (result.success) {
        setBroadcastStatus({ 
          text: `Broadcast successful! Message sent to ${result.count} customers.`, 
          type: 'success' 
        });
        setBroadcastSubject('');
        setBroadcastMessage('');
        loadBroadcastHistory();
      } else {
        setBroadcastStatus({ text: 'Broadcast failed. Check server logs.', type: 'error' });
      }
    } catch (err) {
      setBroadcastStatus({ text: 'Broadcast failed due to a network error.', type: 'error' });
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const actionType = confirmModal.type;
    setConfirmModal(null);

    if (actionType === 'sms') {
      await executeSmsSend();
    } else {
      await executeEmailSend();
    }
  };

  // Announcement States
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAuthor, setAnnAuthor] = useState('Jemal Ireso (Manager)');
  const [annMessage, setAnnMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [annLoading, setAnnLoading] = useState(false);
  const [lastPublishedShare, setLastPublishedShare] = useState<{ title: string; content: string } | null>(null);
  const [copiedShareText, setCopiedShareText] = useState(false);

  const getSocialShareLinks = (title: string, content: string) => {
    const origin = window.location.origin || 'https://esdigital-computer.app';
    const advertText = `📢 [IresoJ Digital Tech & Social Media Broadcast]\n\n*${title}*\n\n${content}\n\n🌐 Social Media Promotion & Tech News Broadcast Center (YouTube, TikTok, Facebook, Telegram)\n• Digital Marketing Campaigns & Brand Promotions\n• Tech News Articles & Media Content Creation\n• Graphic Layouts, Image & Video Production\n• Short IT & Digital Literacy Courses\n\nVisit & track your service online: ${origin}`;
    
    return {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(advertText)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(origin)}&text=${encodeURIComponent(`📢 ${title}\n\n${content}\n\nVisit app: ${origin}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(origin)}&quote=${encodeURIComponent(advertText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`📢 ${title} - IresoJ Digital CSC\n${origin}`)}`,
      rawText: advertText
    };
  };

  // Feedback States
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnMessage(null);
    setAnnLoading(true);

    if (!annTitle.trim() || !annContent.trim()) {
      setAnnMessage({ text: 'Please fill in the announcement title and body.', type: 'error' });
      setAnnLoading(false);
      return;
    }

    try {
      const success = await onAddAnnouncement({
        title: annTitle,
        content: annContent,
        author: annAuthor || 'Admin'
      });

      if (success) {
        setLastPublishedShare({ title: annTitle, content: annContent });
        setAnnMessage({ text: 'Announcement published successfully! Use direct share buttons below to advertise on social media.', type: 'success' });
        setAnnTitle('');
        setAnnContent('');
      } else {
        setAnnMessage({ text: 'Publishing failed.', type: 'error' });
      }
    } catch (err) {
      setAnnMessage({ text: 'Network connection issue.', type: 'error' });
    } finally {
      setAnnLoading(false);
    }
  };

  const handleDeleteAnn = (id: string) => {
    setDeleteAnnId(id);
  };

  const handleExecuteDeleteAnn = async () => {
    if (!deleteAnnId) return;
    const id = deleteAnnId;
    setDeleteAnnId(null);
    try {
      const success = await onDeleteAnnouncement(id);
      if (success) {
        setAnnMessage({ text: 'Announcement deleted.', type: 'success' });
        setTimeout(() => setAnnMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyMessage.trim()) return;
    setReplyLoading(true);
    setFeedbackMessage(null);

    try {
      const success = await onUpdateFeedbackStatus(id, 'replied', replyMessage);
      if (success) {
        setFeedbackMessage({ text: 'Reply logged and message marked as Replied.', type: 'success' });
        setReplyMessage('');
        setActiveFeedbackId(null);
        setTimeout(() => setFeedbackMessage(null), 3000);
      } else {
        setFeedbackMessage({ text: 'Failed to update feedback.', type: 'error' });
      }
    } catch (err) {
      setFeedbackMessage({ text: 'Network failure during reply.', type: 'error' });
    } finally {
      setReplyLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await onUpdateFeedbackStatus(id, 'read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublic = async (id: string, currentStatus: boolean) => {
    try {
      const success = await onUpdateFeedbackPublic(id, !currentStatus);
      if (success) {
        setFeedbackMessage({ 
          text: !currentStatus ? 'Feedback is now visible on home page.' : 'Feedback is now hidden from public.', 
          type: 'success' 
        });
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFeedback = (id: string) => {
    setDeleteFbId(id);
  };

  const handleExecuteDeleteFeedback = async () => {
    if (!deleteFbId) return;
    const id = deleteFbId;
    setDeleteFbId(null);
    try {
      const success = await onDeleteFeedback(id);
      if (success) {
        setFeedbackMessage({ text: 'Inquiry deleted.', type: 'success' });
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="admin-share-subtab" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Left Column: Announcement Publisher */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            <Archive className="w-5 h-5 text-blue-600" />
            <span>Publish Announcements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast business updates, training enrollments, or new electronic stock arrivals straight to the Public News page.
          </p>
        </div>

        {annMessage && (
          <div className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
            annMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {annMessage.type === 'success' ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{annMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePublishAnnouncement} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Special Holiday Discounts on Genuine Leather Wallets!"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Author Name / Role</label>
              <input
                type="text"
                placeholder="Jemal Ireso (Manager)"
                value={annAuthor}
                onChange={(e) => setAnnAuthor(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={annLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/10 disabled:opacity-50 h-[38px]"
              >
                <Send className="w-4 h-4" />
                <span>{annLoading ? 'Publishing...' : 'Publish to News Board'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Detailed Content *</label>
            <textarea
              required
              rows={5}
              placeholder="Write the full announcement text here..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>

        {/* Direct Social Media Sharing & Advertisement Banner for Recently Published Announcement */}
        {lastPublishedShare && (
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-950 p-5 rounded-2xl border border-indigo-500/30 text-white space-y-3 shadow-xl animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Direct Social Share & Business Advert
              </span>
              <button
                type="button"
                onClick={() => setLastPublishedShare(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Dismiss
              </button>
            </div>

            <p className="text-xs font-bold text-slate-200 line-clamp-1">"{lastPublishedShare.title}"</p>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={getSocialShareLinks(lastPublishedShare.title, lastPublishedShare.content).telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#229ED9] hover:bg-[#1d88bb] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Share on Telegram</span>
              </a>
              <a
                href={getSocialShareLinks(lastPublishedShare.title, lastPublishedShare.content).whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Share on WhatsApp</span>
              </a>
              <a
                href={getSocialShareLinks(lastPublishedShare.title, lastPublishedShare.content).facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#1464cc] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Facebook</span>
              </a>
              <a
                href={getSocialShareLinks(lastPublishedShare.title, lastPublishedShare.content).twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>X (Twitter)</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getSocialShareLinks(lastPublishedShare.title, lastPublishedShare.content).rawText);
                  setCopiedShareText(true);
                  setTimeout(() => setCopiedShareText(false), 2000);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedShareText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedShareText ? 'Copied Advert Text!' : 'Copy Promo Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Existing Announcements List */}
        <div className="space-y-3.5">
          <h3 className="font-display font-bold text-sm text-slate-800">
            Active Broadcast History ({announcements.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {announcements.filter(ann => ann && ann.title).map((ann) => {
              const shareLinks = getSocialShareLinks(ann.title, ann.content);
              return (
                <div key={ann.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 hover:border-slate-200 transition-colors shadow-sm">
                  <div className="flex justify-between items-start space-x-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{ann.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ann.content}</p>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-2">
                        <span>By {ann.author}</span>
                        <span>•</span>
                        <span>{new Date(ann.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAnn(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 transition-colors"
                      title="Remove Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Direct Quick Share Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px] mr-1">Direct Share & Advert:</span>
                    <a
                      href={shareLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-sky-50 text-[#229ED9] hover:bg-sky-100 rounded-lg border border-sky-100 transition-colors"
                    >
                      Telegram
                    </a>
                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-50 text-[#25D366] hover:bg-emerald-100 rounded-lg border border-emerald-100 transition-colors"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-blue-50 text-[#1877F2] hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
                    >
                      Facebook
                    </a>
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      X (Twitter)
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column: Inquiry Feedback Inbox */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Customer Inbox & Feedback</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review inquiries submitted via the Contact form. Follow up with clients directly via phone, email, or record custom logs.
          </p>
        </div>

        {feedbackMessage && (
          <div className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
            feedbackMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {feedbackMessage.type === 'success' ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Feedback List Panel */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {feedback.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-250 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs">
              No incoming customer feedback reports found.
            </div>
          ) : (
            feedback.filter(f => f && f.name).map((f) => {
              const isUnread = f.status === 'unread';
              const isReplied = f.status === 'replied';

              return (
                <div 
                  key={f.id} 
                  className={`rounded-2xl border p-4.5 transition-all space-y-3 ${
                    isUnread 
                      ? 'bg-blue-50/20 border-blue-150 shadow-sm' 
                      : 'bg-white border-slate-100'
                  }`}
                  onClick={() => {
                    if (isUnread) handleMarkAsRead(f.id);
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                        {isUnread && (
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide animate-pulse">
                            New
                          </span>
                        )}
                        {isReplied && (
                          <span className="bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-200 uppercase tracking-wide">
                            Replied
                          </span>
                        )}
                        {f.rating && (
                          <div className="flex items-center gap-0.5 ml-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-2.5 h-2.5 ${s <= f.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        )}
                        {f.isPublic && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wide flex items-center gap-1">
                            <Eye className="w-2 h-2" /> Public
                          </span>
                        )}
                      </div>
                      <span className="block text-[11px] text-slate-400 font-mono mt-0.5">
                        {f.email} {f.phone ? `• ${f.phone}` : ''} • {new Date(f.date).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublic(f.id, !!f.isPublic);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${f.isPublic ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                        title={f.isPublic ? "Hide from public" : "Make public"}
                      >
                        {f.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFeedback(f.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Message Body */}
                  <p className="text-slate-600 text-xs leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 font-mono">
                    "{f.message}"
                  </p>

                  {/* Reply Log */}
                  {f.replyMessage && (
                    <div className="bg-green-50/40 border border-green-150 rounded-xl p-3 text-xs text-green-900 font-mono">
                      <span className="font-bold block text-green-800 text-[10px] uppercase tracking-wider mb-1">
                        ✓ Action Logged / Reply Saved:
                      </span>
                      "{f.replyMessage}"
                    </div>
                  )}

                  {/* Toggle Reply Input */}
                  {!f.replyMessage && (
                    <div>
                      {activeFeedbackId === f.id ? (
                        <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                          <textarea
                            rows={2}
                            placeholder="Type response log or resolution (e.g. 'Called Abebe and scheduled MS training enrollment on Monday')..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setActiveFeedbackId(null);
                                setReplyMessage('');
                              }}
                              className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-[11px] font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSendReply(f.id)}
                              disabled={replyLoading || !replyMessage.trim()}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm disabled:opacity-50"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Log Resolution</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFeedbackId(f.id);
                            setReplyMessage('');
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Respond & Save Resolution Log</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Full Width: Bulk SMS Promotional Broadcast Tool */}
      <div className="lg:col-span-2 space-y-6 pt-8 border-t border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>Bulk SMS Promotional Broadcast Tool</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Send instant promotional updates, discount codes, and service reminders directly to customer mobile phones retrieved from CRM records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>CRM Phone Contacts: {crmPhoneNumbers.length}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowRecipientList(!showRecipientList)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              {showRecipientList ? 'Hide Contacts' : 'View Target Numbers'}
            </button>
          </div>
        </div>

        {/* Collapsible Recipient Numbers Preview */}
        {showRecipientList && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 animate-in fade-in duration-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detected CRM Phone Numbers ({crmPhoneNumbers.length})</span>
              <span className="text-[10px] text-slate-400 font-mono">Aggregated from bookings, sales & inquiries</span>
            </div>
            {crmPhoneNumbers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No customer phone numbers found in CRM records yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {crmPhoneNumbers.map((phone, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 shadow-2xs">
                    <PhoneCall className="w-3 h-3 text-emerald-500" />
                    <span>{phone}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {smsStatus && (
          <div className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            smsStatus.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {smsStatus.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{smsStatus.text}</span>
          </div>
        )}

        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden border border-emerald-900/50">
          <form onSubmit={handleSmsSubmitAttempt} className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Promotional Message Text</label>
                  <span className={`text-[10px] font-mono font-bold ${smsMessage.length > 160 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {smsMessage.length} / 160 chars ({Math.ceil(smsMessage.length / 160) || 1} SMS segment{Math.ceil(smsMessage.length / 160) > 1 ? 's' : ''})
                  </span>
                </div>

                <textarea
                  required
                  rows={5}
                  placeholder="Write your promotional SMS message here... Keep it concise, engaging, and clear for mobile screens!"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-sm font-mono resize-none"
                />

                {/* Quick Promotional Templates */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Quick SMS Promo Templates:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSmsMessage("IresoJ Digital Special Promo: Get 20% discount on all laptop maintenance & printing services this week! Visit us at IresoJ Digital Center or call 0911554433.")}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[11px] font-semibold transition-colors border border-slate-700 cursor-pointer"
                    >
                      🎁 20% Off Maintenance
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsMessage("New Stock Arrival at IresoJ Digital: High quality genuine leather wallets & tech accessories now in stock. Order online today!")}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[11px] font-semibold transition-colors border border-slate-700 cursor-pointer"
                    >
                      💼 New Goods In Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsMessage("Computer Training Open: Register for MS Office, Graphic Design & Web Development at IresoJ Digital CSC. Limited seats!")}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[11px] font-semibold transition-colors border border-slate-700 cursor-pointer"
                    >
                      🎓 Training Enrollment
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">SMS Sender ID Header</label>
                  <input
                    type="text"
                    required
                    placeholder="IresoJ_DIGITAL"
                    value={smsSenderId}
                    onChange={(e) => setSmsSenderId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-400 italic">Displayed on target mobile handsets as SMS Sender</p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Target Audience:</span>
                    <span className="text-emerald-400 font-mono">{crmPhoneNumbers.length} Mobile Numbers</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>SMS Gateway:</span>
                    <span className="text-sky-400 font-mono">Ethio Telecom SMS Portal</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={smsLoading || !smsMessage.trim() || crmPhoneNumbers.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 disabled:opacity-50 disabled:hover:bg-emerald-600 cursor-pointer"
                >
                  {smsLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Bulk SMS...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Bulk SMS ({crmPhoneNumbers.length} Numbers)</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* SMS Broadcast Archives */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">SMS Campaign Dispatch History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smsBroadcasts.length === 0 ? (
              <div className="col-span-full py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-bold italic">No previous SMS broadcasts found.</p>
              </div>
            ) : (
              smsBroadcasts.map((sb) => (
                <div key={sb.id} className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sender: {sb.senderId}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{new Date(sb.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      {sb.recipientCount} Recipients
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-mono leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{sb.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Full Width: Newsletter Broadcast */}
      <div className="lg:col-span-2 space-y-6 pt-8 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              <span>Newsletter Broadcast Center</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Directly engage your community. Send a mass email to all registered customers in your database.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            Official Broadcast Tool
          </div>
        </div>

        {broadcastStatus && (
          <div className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            broadcastStatus.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {broadcastStatus.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{broadcastStatus.text}</span>
          </div>
        )}

        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-100/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-10 -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700" />
          
          <form onSubmit={handleEmailSubmitAttempt} className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Email Subject Line</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Exclusive Update: New Professional Templates Now Available!"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Message Body (Rich Text Support via Plain Text)</label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Write your professional newsletter message here... Use clear language to drive engagement."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono resize-none"
                  />
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col justify-end space-y-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                      <RefreshCw className={`w-5 h-5 ${broadcastLoading ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Broadcast Status</p>
                      <p className="text-xs font-bold text-white">{broadcastLoading ? 'Processing Queue' : 'Ready to Send'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      * Emails will be sent to every verified customer in your database. Ensure your content is compliant with local communication guidelines.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={broadcastLoading || !broadcastSubject.trim() || !broadcastMessage.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/40 disabled:opacity-50 disabled:hover:bg-indigo-600"
                >
                  {broadcastLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Dispatching Emails...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Newsletter Broadcast
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Broadcast History Archives */}
      <div className="lg:col-span-2 space-y-4 pt-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Broadcast Dispatch Archives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {broadcasts.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 font-bold italic">No previous broadcasts found.</p>
            </div>
          ) : (
            broadcasts.map((bc) => (
              <div key={bc.id} className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Broadcast ID: {bc.id.split('_').pop()}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(bc.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    {bc.recipientCount} Recipients
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{bc.subject}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">"{bc.message}"</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Modal Dialog for Bulk SMS and Email Broadcast Actions */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                  confirmModal.type === 'sms' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-indigo-600 shadow-indigo-500/30'
                }`}>
                  {confirmModal.type === 'sms' ? <Smartphone className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {confirmModal.type === 'sms' ? 'Promotional SMS Campaign' : 'Newsletter Email Dispatch'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campaign Specifications */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {confirmModal.type === 'sms' ? 'Sender Header' : 'Email Subject'}:
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {confirmModal.senderOrSubject}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Target Recipients:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  confirmModal.type === 'sms' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                }`}>
                  {confirmModal.recipientCount} Customer Contacts
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Message Preview</span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 line-clamp-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 italic">
                  "{confirmModal.messagePreview}"
                </p>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Bulk Action Warning:</strong> This operation will send messages to <strong>{confirmModal.recipientCount} recipients</strong> immediately. Once dispatched, this action cannot be recalled.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  confirmModal.type === 'sms'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Send {confirmModal.type === 'sms' ? 'SMS Broadcast' : 'Newsletter Email'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {deleteAnnId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Accidental Deletion Shield</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Delete this announcement? It will disappear from the public news feed permanently and cannot be undone. Please confirm to proceed.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteAnnId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteAnn}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-md shadow-red-200 transition-all cursor-pointer"
              >
                Yes, Delete Permanent
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteFbId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Accidental Deletion Shield</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete this customer feedback record from the inbox permanently? This action cannot be undone. Please confirm to proceed.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteFbId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteFeedback}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-md shadow-red-200 transition-all cursor-pointer"
              >
                Yes, Delete Permanent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
