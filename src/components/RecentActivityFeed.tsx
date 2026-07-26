import React, { useMemo, useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  Clock3, 
  AlertCircle,
  Inbox,
  Info,
  User,
  ExternalLink,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Booking, Transaction, Feedback } from '../types';
import { formatETB } from '../utils';

interface RecentActivityFeedProps {
  bookings: Booking[];
  transactions: Transaction[];
  feedback: Feedback[];
  onSetTab?: (tab: string) => void;
  maxItems?: number;
}

export interface ActivityEvent {
  id: string;
  type: 'booking' | 'payment' | 'feedback';
  title: string;
  subtitle: string;
  details: string;
  time: string;
  status: string;
  customerName: string;
  rawDate: Date;
  targetTab: 'bookings' | 'payments' | 'share';
}

export default function RecentActivityFeed({
  bookings = [],
  transactions = [],
  feedback = [],
  onSetTab,
  maxItems = 5
}: RecentActivityFeedProps) {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const topEvents = useMemo(() => {
    const events: ActivityEvent[] = [];

    // Map bookings
    bookings.forEach(b => {
      const d = new Date(b.date);
      events.push({
        id: `booking-${b.id}`,
        type: 'booking',
        title: 'New Service Booking',
        subtitle: `${b.serviceTitle || 'Service Request'} (${b.bookingDate || 'Scheduled'})`,
        details: `Service: ${b.serviceTitle || 'N/A'} • Scheduled Date: ${b.bookingDate || 'Pending'} • Ref ID: ${b.id}`,
        time: b.date,
        status: b.status || 'pending',
        customerName: b.customerName || 'Anonymous Customer',
        rawDate: isNaN(d.getTime()) ? new Date() : d,
        targetTab: 'bookings'
      });
    });

    // Map transactions / payments
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      events.push({
        id: `tx-${tx.id}`,
        type: 'payment',
        title: 'Payment Received',
        subtitle: `${formatETB(tx.amount)} via ${(tx.paymentGateway || 'gateway').toUpperCase()} • Ref: ${tx.referenceNumber || tx.id.slice(0, 8)}`,
        details: `Amount: ${formatETB(tx.amount)} • Gateway: ${(tx.paymentGateway || 'telebirr').toUpperCase()} • Ref Code: ${tx.referenceNumber || tx.id}`,
        time: tx.date,
        status: tx.status || 'pending',
        customerName: tx.customerName || 'Customer',
        rawDate: isNaN(d.getTime()) ? new Date() : d,
        targetTab: 'payments'
      });
    });

    // Map feedback
    feedback.forEach(f => {
      const d = new Date(f.date);
      const excerpt = f.message ? (f.message.length > 55 ? f.message.substring(0, 55) + '...' : f.message) : 'Feedback message';
      events.push({
        id: `fb-${f.id}`,
        type: 'feedback',
        title: 'Customer Feedback',
        subtitle: `"${excerpt}"`,
        details: `Rating: ${f.rating || 5}/5 Stars • Full Message: "${f.message || 'No comment provided'}"`,
        time: f.date,
        status: f.status || 'unread',
        customerName: f.name || 'Anonymous',
        rawDate: isNaN(d.getTime()) ? new Date() : d,
        targetTab: 'share'
      });
    });

    // Sort descending by rawDate and slice to last 5 system events
    return events
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
      .slice(0, maxItems);
  }, [bookings, transactions, feedback, maxItems]);

  const formatRelativeTime = (dateStr: string, rawDate: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - rawDate.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return rawDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatFullTimestamp = (rawDate: Date) => {
    if (isNaN(rawDate.getTime())) return 'N/A';
    return rawDate.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventBadge = (type: ActivityEvent['type'], status: string) => {
    switch (type) {
      case 'booking':
        if (status === 'confirmed' || status === 'completed') {
          return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" /> };
        }
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: <Clock3 className="w-3 h-3 text-sky-600" /> };
      case 'payment':
        if (status === 'approved') {
          return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" /> };
        }
        if (status === 'rejected') {
          return { bg: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle className="w-3 h-3 text-red-600" /> };
        }
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock3 className="w-3 h-3 text-amber-600" /> };
      case 'feedback':
        if (status === 'read' || status === 'replied') {
          return { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: <CheckCircle2 className="w-3 h-3 text-slate-500" /> };
        }
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: <Clock3 className="w-3 h-3 text-purple-600" /> };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: null };
    }
  };

  const getTypeIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-sky-600" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'feedback':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
    }
  };

  const getTypeBg = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'booking':
        return 'bg-sky-50 border-sky-100';
      case 'payment':
        return 'bg-emerald-50 border-emerald-100';
      case 'feedback':
        return 'bg-amber-50 border-amber-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10">
            <Activity className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              Recent Activity Feed
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-500">Hover over any event for detailed timestamps & logs</p>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200">
          Top {topEvents.length} Events
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {topEvents.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-bold">No system events logged yet.</p>
          </div>
        ) : (
          topEvents.map((event) => {
            const badge = getEventBadge(event.type, event.status);
            const isHovered = activeTooltipId === event.id;

            return (
              <div
                key={event.id}
                onMouseEnter={() => setActiveTooltipId(event.id)}
                onMouseLeave={() => setActiveTooltipId(null)}
                onClick={() => onSetTab && onSetTab(event.targetTab)}
                className="group relative p-3.5 bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-slate-300 rounded-2xl transition-all duration-200 hover:shadow-md cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Icon Avatar */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${getTypeBg(event.type)}`}>
                    {getTypeIcon(event.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                        {event.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        • {event.customerName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                      {event.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Side: Badge & Relative Time */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${badge.bg}`}>
                      {badge.icon}
                      <span>{event.status}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1 mt-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {formatRelativeTime(event.time, event.rawDate)}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-sky-500 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Rich Hover Tooltip Popover */}
                <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 sm:w-96 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 z-50 pointer-events-none transition-all duration-200 transform origin-bottom ${
                  isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
                }`}>
                  <div className="flex items-start justify-between pb-2 mb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-800 rounded-lg text-sky-400">
                        {getTypeIcon(event.type)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">{event.title}</h5>
                        <p className="text-[10px] text-sky-400 uppercase font-mono tracking-wider font-bold">
                          {event.type.toUpperCase()} EVENT LOG
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${badge.bg}`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-mono text-[10px] font-bold text-slate-200">
                        Timestamp: {formatFullTimestamp(event.rawDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-medium text-slate-200">
                        Customer: <strong className="text-white">{event.customerName}</strong>
                      </span>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-slate-800/80">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-850 p-2 rounded-xl border border-slate-800 w-full">
                        {event.details}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-sky-400">
                      <ExternalLink className="w-3 h-3" />
                      <span>Click to manage in {event.targetTab}</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">ID: {event.id}</span>
                  </div>

                  {/* Tooltip Tail Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900" />
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

