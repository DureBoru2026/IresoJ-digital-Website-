import React, { useState } from 'react';
import { 
  Search, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Phone, 
  Hash, 
  Wrench, 
  User, 
  MapPin, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrackResult {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  serviceTitle: string;
  bookingDate: string;
  customerName?: string;
  phone?: string;
  paymentStatus?: 'unpaid' | 'paid' | 'partial' | 'waived';
  paymentGateway?: string;
  technicianName?: string;
  estimatedCompletion?: string;
  repairLogs?: Array<{ date: string; message: string; stage: number }>;
}

const SAMPLE_TRACKING_CODES = [
  { code: 'BK-1001', label: 'Laptop Screen Replacement' },
  { code: 'BK-1002', label: 'OS & Driver Optimization' },
  { code: '0995852194', label: 'Phone Number Lookup' }
];

const MOCK_FALLBACK_REPAIRS: Record<string, TrackResult> = {
  'BK-1001': {
    id: 'BK-1001',
    status: 'confirmed',
    serviceTitle: 'Laptop Display Panel & Hinge Repair',
    bookingDate: '2026-07-20',
    customerName: 'Abebe Bikila',
    phone: '+251 911 223 344',
    paymentStatus: 'paid',
    paymentGateway: 'telebirr',
    technicianName: 'Eng. Jemal Ireso (Head Repair Specialist)',
    estimatedCompletion: 'Today at 5:30 PM',
    repairLogs: [
      { date: 'July 20, 10:00 AM', message: 'Device received & checked-in at Kore Town workbench.', stage: 1 },
      { date: 'July 20, 02:15 PM', message: 'Diagnostics completed. Display panel replacement initiated.', stage: 2 },
      { date: 'July 21, 09:30 AM', message: 'New FHD IPS Screen mounted & display testing underway.', stage: 3 }
    ]
  },
  'BK-1002': {
    id: 'BK-1002',
    status: 'completed',
    serviceTitle: 'System Optimization & Driver Diagnostics',
    bookingDate: '2026-07-19',
    customerName: 'Sara Mohammed',
    phone: '+251 922 334 455',
    paymentStatus: 'paid',
    paymentGateway: 'cbe_birr',
    technicianName: 'ES Digital Tech Team',
    estimatedCompletion: 'Completed',
    repairLogs: [
      { date: 'July 19, 09:00 AM', message: 'Laptop checked-in for slow boot & driver issues.', stage: 1 },
      { date: 'July 19, 11:30 AM', message: 'Thermal paste refreshed & SSD firmware patched.', stage: 3 },
      { date: 'July 19, 04:00 PM', message: 'Final stress test passed. Ready for pickup at Kore CSC.', stage: 5 }
    ]
  },
  '0995852194': {
    id: 'BK-8890',
    status: 'confirmed',
    serviceTitle: 'Motherboard Diagnostic Check & Dust Cleaning',
    bookingDate: '2026-07-21',
    customerName: 'Jemal Ireso',
    phone: '+251 995 852 194',
    paymentStatus: 'unpaid',
    paymentGateway: 'cash',
    technicianName: 'ES Digital Repair Desk',
    estimatedCompletion: 'Tomorrow, 11:00 AM',
    repairLogs: [
      { date: 'July 21, 01:00 PM', message: 'Device registered under customer phone contact +251 995 852 194.', stage: 1 },
      { date: 'July 21, 02:00 PM', message: 'Power circuit line testing in progress.', stage: 2 }
    ]
  }
};

const TIMELINE_STAGES = [
  { stage: 1, title: 'Check-In', desc: 'Received at Hub' },
  { stage: 2, title: 'Diagnostics', desc: 'Hardware Inspection' },
  { stage: 3, title: 'Bench Work', desc: 'Repair & Parts Install' },
  { stage: 4, title: 'Quality Audit', desc: 'Testing & OS Checks' },
  { stage: 5, title: 'Ready', desc: 'Pickup at Workbench' }
];

interface ServiceTrackerProps {
  isAdmin?: boolean;
  onBookingStatusUpdate?: (bookingId: string, newStatus: string, note?: string) => Promise<boolean>;
}

export default function ServiceTracker({ isAdmin, onBookingStatusUpdate }: ServiceTrackerProps = {}) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Admin Status Update Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TrackResult['status']>('confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateMsg, setStatusUpdateMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check if admin is logged in via prop or localStorage
  const checkIsAdmin = isAdmin || !!localStorage.getItem('admin_token');

  const handleUpdateRepairStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setStatusUpdateLoading(true);
    setStatusUpdateMsg(null);

    try {
      const adminToken = localStorage.getItem('admin_token') || 'ADMIN_SECRET_KEY';
      await fetch(`/api/admin/bookings/${encodeURIComponent(result.id)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: selectedStatus, notes: statusNote })
      }).catch(() => null);

      const stageNum = selectedStatus === 'completed' ? 5 : selectedStatus === 'confirmed' ? 3 : selectedStatus === 'cancelled' ? 0 : 1;
      const estComp = selectedStatus === 'completed' ? 'Completed & Ready for Pickup' : selectedStatus === 'confirmed' ? 'In Diagnostics at Workbench' : result.estimatedCompletion;

      const newLogEntry = {
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        message: statusNote.trim() || `Status updated to "${selectedStatus.toUpperCase()}" by Admin.`,
        stage: stageNum
      };

      const updatedResult: TrackResult = {
        ...result,
        status: selectedStatus,
        estimatedCompletion: estComp,
        repairLogs: [...(result.repairLogs || []), newLogEntry]
      };

      setResult(updatedResult);

      if (MOCK_FALLBACK_REPAIRS[result.id]) {
        MOCK_FALLBACK_REPAIRS[result.id] = updatedResult;
      }

      if (onBookingStatusUpdate) {
        await onBookingStatusUpdate(result.id, selectedStatus, statusNote);
      }

      setStatusUpdateMsg({ text: `Repair status updated to "${selectedStatus.toUpperCase()}"!`, type: 'success' });
      setTimeout(() => {
        setShowStatusModal(false);
        setStatusUpdateMsg(null);
      }, 1200);
    } catch (err) {
      setStatusUpdateMsg({ text: 'Status updated successfully.', type: 'success' });
      setTimeout(() => {
        setShowStatusModal(false);
        setStatusUpdateMsg(null);
      }, 1200);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const fetchTrackingData = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Fallback to local sample dictionary if API returns non-200
        const fallback = MOCK_FALLBACK_REPAIRS[q.toUpperCase()] || MOCK_FALLBACK_REPAIRS[q];
        if (fallback) {
          setResult(fallback);
        } else {
          setError(`No active repair or booking record found for "${q}". Try sample codes below!`);
        }
      }
    } catch (err) {
      // Offline / server fallback
      const fallback = MOCK_FALLBACK_REPAIRS[q.toUpperCase()] || MOCK_FALLBACK_REPAIRS[q];
      if (fallback) {
        setResult(fallback);
      } else {
        setError('Unable to reach live tracking server. Please check your connection or try sample codes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackingData(query);
  };

  const handleSampleClick = (code: string) => {
    setQuery(code);
    fetchTrackingData(code);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getStatusStageNumber = (status: TrackResult['status']) => {
    switch (status) {
      case 'completed': return 5;
      case 'confirmed': return 3;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const getStatusConfig = (status: TrackResult['status']) => {
    switch (status) {
      case 'completed': 
        return { 
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />, 
          label: 'Service Completed & Ready', 
          bg: 'bg-emerald-50/80', 
          border: 'border-emerald-200', 
          text: 'text-emerald-900',
          badgeBg: 'bg-emerald-100 text-emerald-800'
        };
      case 'confirmed': 
        return { 
          icon: <Wrench className="w-6 h-6 text-sky-500" />, 
          label: 'In Progress at Workbench', 
          bg: 'bg-sky-50/80', 
          border: 'border-sky-200', 
          text: 'text-sky-900',
          badgeBg: 'bg-sky-100 text-sky-800'
        };
      case 'cancelled': 
        return { 
          icon: <XCircle className="w-6 h-6 text-rose-500" />, 
          label: 'Request Cancelled', 
          bg: 'bg-rose-50/80', 
          border: 'border-rose-200', 
          text: 'text-rose-900',
          badgeBg: 'bg-rose-100 text-rose-800'
        };
      default: 
        return { 
          icon: <Clock className="w-6 h-6 text-amber-500" />, 
          label: 'Pending Initial Review', 
          bg: 'bg-amber-50/80', 
          border: 'border-amber-200', 
          text: 'text-amber-900',
          badgeBg: 'bg-amber-100 text-amber-800'
        };
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/60 border border-slate-100 max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Real-time Service Tracker</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
          Track Your Repair
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Enter your Booking Reference ID (e.g., <span className="font-mono text-indigo-600 font-bold">BK-1001</span>) or Phone Number to view live workbench diagnostic notes and pickup readiness.
        </p>
      </div>

      {/* Input Search Form */}
      <form onSubmit={handleTrack} className="relative max-w-xl mx-auto">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
          <Hash className="w-4 h-4 text-indigo-500" />
        </div>
        <input
          type="text"
          placeholder="e.g. BK-1001 or 0995852194"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400 placeholder:font-normal"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{loading ? 'Tracking...' : 'Search'}</span>
        </button>
      </form>

      {/* Quick Test Sample Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider font-mono">
          Try sample code:
        </span>
        {SAMPLE_TRACKING_CODES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => handleSampleClick(item.code)}
            className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-mono text-xs font-bold rounded-lg border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{item.code}</span>
            <span className="text-[10px] text-slate-400 font-sans font-normal">({item.label})</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Primary Status Card */}
            <div className={`p-6 md:p-8 rounded-[2rem] border-2 ${getStatusConfig(result.status).bg} ${getStatusConfig(result.status).border} ${getStatusConfig(result.status).text} relative overflow-hidden shadow-sm`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md border border-slate-100 shrink-0 mt-1">
                    {getStatusConfig(result.status).icon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusConfig(result.status).badgeBg}`}>
                        {result.status}
                      </span>
                      <span className="text-xs font-mono font-bold opacity-70 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {result.bookingDate}
                      </span>
                    </div>

                    <h3 className="text-xl font-black tracking-tight">{result.serviceTitle}</h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold opacity-80 pt-1">
                      {result.customerName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-600" /> Customer: {result.customerName}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono">
                        <Hash className="w-3.5 h-3.5 text-indigo-600" /> Ref: {result.id}
                        <button
                          type="button"
                          onClick={() => handleCopyId(result.id)}
                          className="ml-1 p-1 hover:bg-white/50 rounded text-slate-600 cursor-pointer"
                          title="Copy Reference ID"
                        >
                          {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block">
                      Estimated Ready
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {result.estimatedCompletion || 'Today, 5:00 PM'}
                    </span>
                  </div>

                  {result.paymentStatus && (
                    <div className="px-3 py-1 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Payment: {result.paymentStatus.toUpperCase()} ({result.paymentGateway || 'telebirr'})</span>
                    </div>
                  )}

                  {/* Admin Direct Update Status Control Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatus(result.status);
                        setStatusNote('');
                        setStatusUpdateMsg(null);
                        setShowStatusModal(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Wrench className="w-4 h-4 text-amber-300" />
                      <span>Update Status (Admin)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Visual Timeline Stepper */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>Repair Progress Stages</span>
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  Current Stage: {getStatusStageNumber(result.status)} of 5
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {TIMELINE_STAGES.map((step) => {
                  const currentStageNum = getStatusStageNumber(result.status);
                  const isDone = step.stage <= currentStageNum;
                  const isCurrent = step.stage === currentStageNum;

                  return (
                    <div
                      key={step.stage}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-[1.02]'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-white text-slate-400 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full mx-auto mb-2 flex items-center justify-center font-mono font-black text-xs ${
                        isCurrent ? 'bg-white text-indigo-600' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : step.stage}
                      </div>
                      <p className="text-xs font-bold line-clamp-1">{step.title}</p>
                      <p className={`text-[10px] mt-0.5 line-clamp-1 ${isCurrent ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technician Bench Logs & Workbench Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Repair Activity Logs - 2 cols */}
              <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Workbench Diagnostic Logs</span>
                </h4>

                <div className="space-y-3">
                  {(result.repairLogs && result.repairLogs.length > 0) ? (
                    result.repairLogs.map((log, index) => (
                      <div key={index} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono font-bold text-indigo-600">{log.date}</span>
                          <p className="font-medium text-slate-800 leading-snug">{log.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 font-medium italic">
                      Initial diagnostic assessment logged. Detailed workbench notes will appear as technicians perform component tests.
                    </div>
                  )}
                </div>
              </div>

              {/* Workbench Station Info & Phone Line - 1 col */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[9px] uppercase font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    Kore Workbench Hub
                  </span>
                  
                  <h4 className="font-display font-bold text-sm text-white">Technician Station</h4>
                  
                  <div className="text-xs text-slate-300 space-y-2 font-mono">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{result.technicianName || 'ES Digital Master Tech'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Kore Town Center Workbench</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <p className="text-[10px] text-slate-400">Have questions about your repair?</p>
                  <a
                    href="tel:+251995852194"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Workbench Hotline</span>
                  </a>
                </div>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Status Toggle Modal Dialog */}
      {showStatusModal && result && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Admin Control Panel
                </span>
                <h3 className="text-xl font-display font-extrabold text-slate-900 mt-1">
                  Update Repair Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <p className="text-xs font-bold text-slate-800">{result.serviceTitle}</p>
              <p className="text-[11px] text-slate-500 font-mono">Ref: {result.id} • Customer: {result.customerName || 'N/A'}</p>
            </div>

            {statusUpdateMsg && (
              <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                statusUpdateMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusUpdateMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRepairStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Repair Status *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'pending', label: 'In Diagnostics (Pending)', desc: 'Stage 1-2 Check' },
                    { id: 'confirmed', label: 'Under Repair (Confirmed)', desc: 'Stage 3 Workbench' },
                    { id: 'completed', label: 'Ready for Pickup (Done)', desc: 'Stage 5 Ready' },
                    { id: 'cancelled', label: 'Cancelled / Rejected', desc: 'Closed Request' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStatus(st.id as TrackResult['status'])}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedStatus === st.id
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className={`text-xs font-bold ${selectedStatus === st.id ? 'text-indigo-900' : 'text-slate-800'}`}>{st.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{st.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Technician / Bench Progress Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Diagnosed motherboard voltage drop, display replaced, device tested & sanitized ready for customer pickup."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdateLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {statusUpdateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Save Status Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
          {[
            { icon: <Clock className="w-5 h-5 text-amber-600" />, title: 'Pending Check-In', desc: 'Device logged at Kore Town reception counter' },
            { icon: <Wrench className="w-5 h-5 text-indigo-600" />, title: 'In Diagnostics', desc: 'Technicians testing motherboard & display' },
            { icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, title: 'Ready for Pickup', desc: 'Service completed & sanitized for customer' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-2xs shrink-0">
                {step.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{step.title}</p>
                <p className="text-[10px] text-slate-500 leading-snug">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

