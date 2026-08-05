import React, { useState } from 'react';
import { 
  Search, Calendar, Clock, Phone, Mail, FileText, CheckCircle2, XCircle, 
  Clock3, Trash2, Edit3, Save, RefreshCw, Eye, Sparkles, Printer, Send, 
  DollarSign, Check, ChevronRight, AlertCircle, Bookmark, ClipboardList, Info, FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Booking } from '../types';

interface AdminBookingsProps {
  bookings: Booking[];
  onRefresh: () => void;
  onUpdateStatus: (
    id: string, 
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled', 
    notes?: string, 
    paymentStatus?: 'unpaid' | 'paid' | 'partial' | 'waived'
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function AdminBookings({ bookings, onRefresh, onUpdateStatus, onDelete }: AdminBookingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'paid' | 'partial' | 'waived'>('all');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Email Notification modal states
  const [activeEmailBooking, setActiveEmailBooking] = useState<Booking | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailLang, setEmailLang] = useState<'en' | 'om'>('en');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Print Receipt states
  const [activeReceiptBooking, setActiveReceiptBooking] = useState<Booking | null>(null);
  const [receiptPrice, setReceiptPrice] = useState<number>(350); // Default service fee ETB
  const [receiptTaxRate, setReceiptTaxRate] = useState<number>(15); // Default VAT 15%
  const [receiptDiscount, setReceiptDiscount] = useState<number>(0);

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.customerEmail && b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || (b.paymentStatus || 'unpaid') === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Statistics calculation
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const handleStatusChange = async (
    id: string, 
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    existingNotes?: string,
    existingPayment?: 'unpaid' | 'paid' | 'partial' | 'waived'
  ) => {
    setSubmittingId(id);
    try {
      await onUpdateStatus(id, status, existingNotes, existingPayment);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handlePaymentStatusChange = async (
    id: string, 
    paymentStatus: 'unpaid' | 'paid' | 'partial' | 'waived',
    existingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    existingNotes?: string
  ) => {
    setSubmittingId(id);
    try {
      await onUpdateStatus(id, existingStatus, existingNotes, paymentStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setSubmittingId(id);
    try {
      const b = bookings.find(item => item.id === id);
      const currentStatus = b ? b.status : 'pending';
      const currentPayment = b ? (b.paymentStatus || 'unpaid') : 'unpaid';
      const success = await onUpdateStatus(id, currentStatus, editNotes, currentPayment);
      if (success) {
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const startEditNotes = (id: string, notes: string) => {
    setEditingId(id);
    setEditNotes(notes || '');
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setSubmittingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  // Get Enhanced visual status badges
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
            <Clock3 className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Pending</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-300 shadow-sm">
            <Calendar className="w-3 h-3 text-blue-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-sm">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  // Get payment status badges
  const getPaymentBadge = (status: Booking['paymentStatus']) => {
    const s = status || 'unpaid';
    switch (s) {
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-300 shadow-sm font-mono">
            <DollarSign className="w-3 h-3 text-red-600" />
            <span>Unpaid</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm font-mono">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Paid</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-300 shadow-sm font-mono">
            <DollarSign className="w-3 h-3 text-purple-600" />
            <span>Partial</span>
          </span>
        );
      case 'waived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-300 shadow-sm font-mono">
            <Info className="w-3 h-3 text-slate-600" />
            <span>Waived</span>
          </span>
        );
    }
  };

  // Pre-fill email templates
  const openEmailModal = (booking: Booking) => {
    setActiveEmailBooking(booking);
    setEmailSentSuccess(false);
    setIsSendingEmail(false);
    generateEmailContent(booking, 'en');
  };

  const generateEmailContent = (booking: Booking, lang: 'en' | 'om') => {
    setEmailLang(lang);
    const dateStr = new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const paymentStr = booking.paymentStatus || 'unpaid';
    const capPayment = paymentStr.toUpperCase();
    const capStatus = booking.status.toUpperCase();

    if (lang === 'en') {
      setEmailSubject(`IresoJ Digital CSC - Appointment ${booking.status === 'pending' ? 'Received' : booking.status}`);
      setEmailBody(
`Hello ${booking.customerName},

Thank you for selecting IresoJ Digital CSC Computer Services.

Here is the update regarding your appointment:
--------------------------------------------------
Service Booked : ${booking.serviceTitle}
Scheduled Date : ${dateStr}
Scheduled Time : ${booking.bookingTime}
Current Status : ${capStatus}
Payment Status : ${capPayment}
--------------------------------------------------

${booking.status === 'pending' ? 'Our technical representatives in Kore Town are currently reviewing your diagnostics request and will contact you shortly.' : ''}
${booking.status === 'confirmed' ? 'Your booking slot has been officially confirmed! Please arrive at our facility 5 minutes before your scheduled time.' : ''}
${booking.status === 'completed' ? 'Your service task has been fully resolved and archived! Thank you for choosing IresoJ Digital CSC. We appreciate your partnership.' : ''}
${booking.status === 'cancelled' ? 'Your booking request has been cancelled. If you believe this was an error, please reply or call us directly.' : ''}

If you have any questions or would like to submit documents, please reply directly to this email or call us at +251 911 234 567.

Best Regards,
Jemal Ireso (General Manager)
IresoJ Digital CSC Kore Town, West Arsi, Ethiopia`
      );
    } else {
      // Oromo language
      setEmailSubject(`IresoJ Digital CSC - Beeksisa Qubannoo Tajaajilaa (${booking.status === 'pending' ? 'Hofcolame' : booking.status})`);
      setEmailBody(
`Kabajamoo ${booking.customerName},

IresoJ Digital CSC Computer Services filachuun keessaniif baay'ee galatoomaa.

Oduu haaraa beellama keessan ilaalchisee:
--------------------------------------------------
Tajaajila Filatame: ${booking.serviceTitle}
Guyyaa Beellamaa : ${booking.bookingDate}
Sa'aatii Beellamaa: ${booking.bookingTime}
Haala Beellamaa  : ${capStatus === 'PENDING' ? 'Eeggamaa Jira' : capStatus === 'CONFIRMED' ? 'Mirkanaa\'eera' : capStatus === 'COMPLETED' ? 'Xumurameera' : 'Haqameera'}
Haala Kaffaltii  : ${capPayment === 'UNPAID' ? 'Hin Kaffalamne' : capPayment === 'PAID' ? 'Kaffalameera' : capPayment === 'PARTIAL' ? 'Gartokkeen Kaffalame' : 'Dhiifameera'}
--------------------------------------------------

Beellama keessan ilaalchisee odeeffannoo dabalataa argachuuf ykn bilbilaan quunnamuuf lakkoofsa keenya +251 911 234 567 irratti nuuf bilbilaa.

Galaatoomaa,
Jemal Ireso (Hoggonaa Giddugalaa)
IresoJ Digital CSC Kore Town, West Arsi, Ethiopia`
      );
    }
  };

  const handleSendEmailSimulated = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSentSuccess(true);
      setTimeout(() => {
        setActiveEmailBooking(null);
      }, 2000);
    }, 1800); // Simulated delay
  };

  const openPrintModal = (booking: Booking) => {
    setActiveReceiptBooking(booking);
    // Find estimated price based on service if possible, or use a default
    const basePrices: Record<string, number> = {
      'laptop_repair': 450,
      'mobile_repair': 250,
      'graphic_id': 150,
      'flyer_design': 300,
      'basic_office': 1500,
      'full_dev': 4500,
      'logo_brand': 800,
      'photocopy_print': 50
    };
    const key = booking.serviceId || 'default';
    setReceiptPrice(basePrices[key] || 350);
    setReceiptTaxRate(15);
    setReceiptDiscount(0);
  };

  const triggerSystemPrint = () => {
    const printContent = document.getElementById('printable-invoice-content');
    if (!printContent) return;

    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (!winPrint) return;

    winPrint.document.write(`
      <html>
        <head>
          <title>Receipt_${activeReceiptBooking?.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; color: #111827; line-height: 1.5; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .my-4 { margin-top: 16px; margin-bottom: 16px; }
            .border-t { border-top: 1px dashed #111827; }
            .border-b { border-bottom: 1px dashed #111827; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .flex-row { display: flex; justify-content: space-between; }
            .receipt-header { border-bottom: 3px double #111827; padding-bottom: 10px; margin-bottom: 15px; }
            .seal-stamp { border: 2px solid #0EA5E9; color: #0EA5E9; padding: 5px 15px; display: inline-block; transform: rotate(-5deg); font-weight: bold; font-size: 14px; margin-top: 20px; text-transform: uppercase; border-radius: 4px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    winPrint.document.close();
    winPrint.focus();
  };

  const handleDownloadPDF = (booking: Booking) => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'normal');
      
      // Top header band (Royal blue / sky blue motif)
      doc.setFillColor(14, 165, 233); // #0EA5E9
      doc.rect(0, 0, 210, 40, 'F');

      // Title in white
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('Helvetica', 'bold');
      doc.text('IresoJ DIGITAL CSC', 20, 24);

      // Subtitle
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.text('Computing Service Center & Graphic Hub - West Arsi, Ethiopia', 20, 31);

      // Document type indicator on the header band (right-aligned)
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.text('OFFICIAL RECORD', 150, 24);

      // Main body title
      doc.setTextColor(17, 24, 39); // #111827
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('CLIENT SERVICE BOOKING SUMMARY', 20, 55);

      // Horizontal separator line
      doc.setDrawColor(229, 231, 235); // gray-200
      doc.setLineWidth(0.5);
      doc.line(20, 60, 190, 60);

      // Left Column: Booking Record Metadata
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128); // gray-500
      doc.setFont('Helvetica', 'bold');
      doc.text('BOOKING DETAILS', 20, 70);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text('Record Reference:', 20, 78);
      doc.setFont('Helvetica', 'normal');
      doc.text(booking.id, 55, 78);

      doc.setFont('Helvetica', 'bold');
      doc.text('Requested Service:', 20, 85);
      doc.setFont('Helvetica', 'normal');
      doc.text(booking.serviceTitle, 55, 85);

      doc.setFont('Helvetica', 'bold');
      doc.text('Scheduled Date:', 20, 92);
      doc.setFont('Helvetica', 'normal');
      doc.text(booking.bookingDate, 55, 92);

      doc.setFont('Helvetica', 'bold');
      doc.text('Scheduled Time:', 20, 99);
      doc.setFont('Helvetica', 'normal');
      doc.text(booking.bookingTime, 55, 99);

      // Right Column: Client Contact Information
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('CLIENT PROFILE', 115, 70);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text('Client Name:', 115, 78);
      doc.setFont('Helvetica', 'normal');
      doc.text(booking.customerName, 142, 78);

      doc.setFont('Helvetica', 'bold');
      doc.text('Contact Phone:', 115, 85);
      doc.setFont('Helvetica', 'normal');
      doc.text(booking.customerPhone, 142, 85);

      doc.setFont('Helvetica', 'bold');
      doc.text('Email Address:', 115, 92);
      doc.setFont('Helvetica', 'normal');
      doc.text(booking.customerEmail || 'No Email Registered', 142, 92);

      // Divider
      doc.line(20, 108, 190, 108);

      // Administrative and Payment state cards
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('WORKFLOW & LEDGER STATE', 20, 118);

      // State Boxes (Gray Background blocks)
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(20, 123, 80, 22, 'F');
      doc.setTextColor(71, 85, 105); // slate-600
      doc.setFontSize(8);
      doc.text('APPOINTMENT STATUS', 25, 131);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(14, 165, 233); // #0EA5E9
      doc.text(booking.status.toUpperCase(), 25, 139);

      doc.setFillColor(248, 250, 252);
      doc.rect(110, 123, 80, 22, 'F');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('PAYMENT STANDING', 115, 131);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      
      const payStatus = (booking.paymentStatus || 'unpaid').toUpperCase();
      if (payStatus === 'PAID') {
        doc.setTextColor(16, 185, 129); // emerald-500
      } else if (payStatus === 'UNPAID') {
        doc.setTextColor(239, 68, 68); // rose-500
      } else {
        doc.setTextColor(245, 158, 11); // amber-500
      }
      doc.text(payStatus, 115, 139);

      // Divider
      doc.setDrawColor(229, 231, 235);
      doc.line(20, 153, 190, 153);

      // Remarks / Diagnostic Notes Section
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text('CLIENT SPECIFICATIONS & INTERNAL RESOLUTION REMARKS', 20, 163);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59); // slate-800
      
      const notesContent = booking.notes || 'No administrative notations or diagnostic findings registered for this customer booking.';
      const notesSplit = doc.splitTextToSize(notesContent, 170);
      doc.text(notesSplit, 20, 172);

      // Bottom Section Line
      const finalY = Math.min(240, 172 + (notesSplit.length * 5.5) + 15);
      doc.line(20, finalY, 190, finalY);

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Official Document exported via IresoJ Digital CSC administrative console.`, 20, finalY + 8);
      doc.text(`Generation Timestamp: ${new Date().toLocaleString()} (Local Time)`, 20, finalY + 13);
      doc.text(`Kore Town Road, West Arsi, Oromia, Ethiopia.`, 20, finalY + 18);

      // Stamp and Authorized Representative placeholder
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.text('IresoJ Digital Registrar Stamp', 135, finalY + 8);
      doc.setDrawColor(203, 213, 225);
      doc.line(130, finalY + 24, 185, finalY + 24);
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Authorized Representative', 138, finalY + 28);

      // Save PDF
      doc.save(`IresoJ_Digital_Summary_${booking.customerName.replace(/\s+/g, '_')}_${booking.id}.pdf`);
    } catch (err) {
      console.error('PDF compiling failure:', err);
      alert('Failed to compile PDF summary report.');
    }
  };

  // Math helper
  const discountAmount = (receiptPrice * receiptDiscount) / 100;
  const taxableAmount = receiptPrice - discountAmount;
  const taxAmount = (taxableAmount * receiptTaxRate) / 100;
  const totalAmount = taxableAmount + taxAmount;

  return (
    <div id="admin-bookings-subtab" className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0EA5E9]" />
            <span>Service Bookings & Diagnostics Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage incoming repair requests, scheduled printing/publishing consults, and technical course training enrollments.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Bookings</span>
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Total Desk</span>
          <span className="block font-display font-black text-slate-900 text-xl mt-1">{totalCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm border-l-4 border-l-amber-500 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono uppercase text-amber-700">Pending Check</span>
          <span className="block font-display font-black text-amber-700 text-xl mt-1">{pendingCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm border-l-4 border-l-blue-500 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono uppercase text-blue-700">Confirmed Slots</span>
          <span className="block font-display font-black text-blue-700 text-xl mt-1">{confirmedCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono uppercase text-emerald-700">Completed</span>
          <span className="block font-display font-black text-emerald-700 text-xl mt-1">{completedCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm border-l-4 border-l-rose-500 col-span-2 lg:col-span-1 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono uppercase text-rose-700">Cancelled</span>
          <span className="block font-display font-black text-rose-700 text-xl mt-1">{cancelledCount}</span>
        </div>
      </div>

      {/* Search & Advanced Filters */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Filter bookings by client name, mobile phone number, email, or specific service catalog title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Double Row filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <span className="font-mono text-slate-400 text-[10px] uppercase font-bold">Booking State:</span>
            <div className="flex bg-white rounded-lg border p-0.5 gap-1 shadow-inner">
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all capitalize cursor-pointer ${
                    statusFilter === st 
                      ? 'bg-[#0EA5E9] text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Payment filter */}
          <div className="flex items-center space-x-2">
            <span className="font-mono text-slate-400 text-[10px] uppercase font-bold">Payment Ledger:</span>
            <div className="flex bg-white rounded-lg border p-0.5 gap-1 shadow-inner">
              {(['all', 'unpaid', 'paid', 'partial', 'waived'] as const).map((py) => (
                <button
                  key={py}
                  onClick={() => setPaymentFilter(py)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all capitalize cursor-pointer ${
                    paymentFilter === py 
                      ? 'bg-[#0EA5E9] text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {py}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Card Deck */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-mono text-xs border border-dashed">
            No booking reservations found matching the selected search parameters or status filters.
          </div>
        ) : (
          filteredBookings.map((b) => {
            const isEditingNotes = editingId === b.id;
            const isLoading = submittingId === b.id;
            const paymentStatusVal = b.paymentStatus || 'unpaid';

            // Distinct card border and background classes based on status for ultimate visual administrative clarity
            const getCardStyle = (status: Booking['status']) => {
              switch (status) {
                case 'pending':
                  return 'border-l-4 border-l-amber-500 bg-amber-50/10 hover:bg-amber-50/20';
                case 'confirmed':
                  return 'border-l-4 border-l-sky-500 bg-sky-50/10 hover:bg-sky-50/20';
                case 'completed':
                  return 'border-l-4 border-l-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20';
                case 'cancelled':
                  return 'border-l-4 border-l-rose-500 bg-rose-50/10 hover:bg-rose-50/20';
              }
            };

            return (
              <div 
                key={b.id} 
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col lg:flex-row lg:items-start justify-between gap-6 ${getCardStyle(b.status)}`}
              >
                {/* Left Side: General Info */}
                <div className="space-y-3.5 flex-1 min-w-0">
                  {/* Service Title, Status Badges & Booking Ref */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-black text-slate-900 text-base tracking-tight">{b.serviceTitle}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getStatusBadge(b.status)}
                      {getPaymentBadge(b.paymentStatus)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">ID: {b.id}</span>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50/40 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center font-bold font-sans">
                        {b.customerName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 truncate">{b.customerName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.customerPhone}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.customerEmail || 'No email provided'}</span>
                    </div>
                  </div>

                  {/* Schedule dates & times */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-700 bg-white border px-3 py-1.5 rounded-lg shadow-sm">
                      <Calendar className="w-3.5 h-3.5 text-[#0EA5E9]" />
                      <strong>Date:</strong> <span>{b.bookingDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 bg-white border px-3 py-1.5 rounded-lg shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-[#0EA5E9]" />
                      <strong>Time:</strong> <span>{b.bookingTime}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono self-center">Created: {new Date(b.date || Date.now()).toLocaleDateString()}</span>
                  </div>

                  {/* User-submitted custom notes */}
                  {b.notes && (
                    <div className="bg-sky-50/40 p-3 rounded-xl border border-sky-100/50 text-xs text-slate-600 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <strong className="block text-slate-700 font-sans">Client Submissions:</strong>
                        <p className="mt-0.5 italic leading-relaxed">"{b.notes}"</p>
                      </div>
                    </div>
                  )}

                  {/* Internal Admin Resolution comments */}
                  <div className="pt-2.5 border-t border-slate-100">
                    {isEditingNotes ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Internal Admin Notes</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add diagnostic findings, repair completion notes, or pickup notes..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                          />
                          <button 
                            onClick={() => handleSaveNotes(b.id)}
                            disabled={isLoading}
                            className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center group">
                        <div className="text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Internal Notation: </span>
                          <span className="text-slate-700 font-medium font-mono">
                            {b.notes || 'No administrative annotations recorded.'}
                          </span>
                        </div>
                        <button 
                          onClick={() => startEditNotes(b.id, b.notes || '')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Edit notation"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Interactive Administrative Controls */}
                <div className="flex flex-col gap-3 lg:w-44 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-5 border-slate-150">
                  
                  {/* Change Appointment Status */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wide">Appointment State:</label>
                    <div className="flex gap-1">
                      <select
                        value={b.status}
                        disabled={isLoading}
                        onChange={(e) => handleStatusChange(b.id, e.target.value as any, b.notes, paymentStatusVal)}
                        className="w-full text-xs bg-white border border-slate-200 hover:border-slate-300 rounded-lg py-1 px-1.5 text-slate-800 font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Change Payment Status */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wide">Payment Status:</label>
                    <select
                      value={paymentStatusVal}
                      disabled={isLoading}
                      onChange={(e) => handlePaymentStatusChange(b.id, e.target.value as any, b.status, b.notes)}
                      className="w-full text-xs bg-white border border-slate-200 hover:border-slate-300 rounded-lg py-1 px-1.5 text-slate-800 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="unpaid">Unpaid (default)</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="waived">Waived</option>
                    </select>
                  </div>

                  {/* Quick Shortcut Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {/* Print Payment/Status Invoice */}
                    <button
                      onClick={() => openPrintModal(b)}
                      className="p-2 border border-slate-200 hover:border-[#0EA5E9] hover:bg-sky-50/50 rounded-lg text-slate-600 hover:text-[#0EA5E9] transition-all flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                      title="Print Invoice / Payment status"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>

                    {/* Send Email Notification */}
                    <button
                      onClick={() => openEmailModal(b)}
                      className="p-2 border border-slate-200 hover:border-[#0EA5E9] hover:bg-sky-50/50 rounded-lg text-slate-600 hover:text-[#0EA5E9] transition-all flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                      title="Email Client Notification"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                  </div>

                  {/* PDF Download Shortcut */}
                  <button
                    onClick={() => handleDownloadPDF(b)}
                    className="w-full mt-1.5 p-2 border border-slate-200 hover:border-[#0EA5E9] hover:bg-sky-50/50 rounded-lg text-slate-600 hover:text-[#0EA5E9] transition-all flex items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer"
                    title="Download Booking PDF Summary"
                  >
                    <FileDown className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    <span>Download PDF</span>
                  </button>

                  {/* Delete Button */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-[9px] font-mono text-slate-400 font-bold">ADMIN ACTIONS</span>
                    <button
                      onClick={() => setDeleteConfirmId(b.id)}
                      disabled={isLoading}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete booking completely"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- EMAIL NOTIFICATION DESK MODAL --- */}
      <AnimatePresence>
        {activeEmailBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#0EA5E9] p-5 text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-sky-100 animate-pulse" />
                  <div>
                    <h3 className="font-display font-black text-sm uppercase tracking-wider">Email Notification Desk</h3>
                    <p className="text-[10px] text-sky-100">Simulate official SMTP communication to customer inbox</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveEmailBooking(null)}
                  className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Template Controls */}
              <div className="bg-slate-50 border-b p-3.5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-bold">CHOOSE LANGUAGE TEMPLATE:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => generateEmailContent(activeEmailBooking, 'en')}
                    className={`px-3 py-1 rounded font-bold ${emailLang === 'en' ? 'bg-[#0EA5E9] text-white' : 'bg-white border text-slate-600'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => generateEmailContent(activeEmailBooking, 'om')}
                    className={`px-3 py-1 rounded font-bold ${emailLang === 'om' ? 'bg-[#0EA5E9] text-white' : 'bg-white border text-slate-600'}`}
                  >
                    Afaan Oromoo
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">To (Client Email Address)</label>
                  <input 
                    type="text" 
                    disabled 
                    value={`${activeEmailBooking.customerName} <${activeEmailBooking.customerEmail || 'no-email-configured@esdigital.com'}>`}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 font-sans font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Email Body Content</label>
                  <textarea 
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full text-[11px] font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
                  />
                </div>

                {emailSentSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Communication success! Dispatch logs saved to client file.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-50 p-4 border-t flex justify-end gap-2.5">
                <button 
                  onClick={() => setActiveEmailBooking(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
                >
                  Close Desk
                </button>
                <button 
                  onClick={handleSendEmailSimulated}
                  disabled={isSendingEmail || emailSentSuccess}
                  className="bg-[#0EA5E9] hover:bg-sky-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>SMTP Handshake...</span>
                    </>
                  ) : emailSentSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Email Transmitted</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit Email Alert</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- RECEIPT GENERATOR & PRINTER MODAL --- */}
      <AnimatePresence>
        {activeReceiptBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row h-[550px] md:h-[500px]"
            >
              {/* Left Side: Invoice/Pricing Adjuster */}
              <div className="bg-slate-50 p-5 md:w-64 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wide">Receipt Pricing</h3>
                    <p className="text-[10px] text-slate-500">Configure ledger pricing adjustments before committing</p>
                  </div>

                  {/* Pricing Input */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Service Base Fee (ETB)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs font-bold">ETB</span>
                      <input 
                        type="number"
                        min={0}
                        value={receiptPrice}
                        onChange={(e) => setReceiptPrice(Number(e.target.value))}
                        className="w-full text-xs pl-10 pr-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Discount percentage */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Discount (%)</label>
                    <input 
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={receiptDiscount}
                      onChange={(e) => setReceiptDiscount(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 font-bold">
                      <span>{receiptDiscount}% off</span>
                      <span>- ETB {discountAmount.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* VAT rate */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">VAT/Tax Rate (%)</label>
                    <select 
                      value={receiptTaxRate}
                      onChange={(e) => setReceiptTaxRate(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="0">0% Excluded</option>
                      <option value="5">5% Service Tax</option>
                      <option value="15">15% Standard VAT</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 leading-relaxed font-mono">
                  <div className="flex items-center gap-1.5 text-[#0EA5E9] font-bold mb-1">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Quick Note:</span>
                  </div>
                  Adjust pricing parameters to match parts cost, technician hourly rate, or discount policies in Kore Town.
                </div>
              </div>

              {/* Right Side: Receipt Terminal Preview */}
              <div className="flex-1 p-5 flex flex-col justify-between bg-zinc-900 text-slate-200 relative">
                
                {/* Scrollable Receipt Area */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <div 
                    id="printable-invoice-content"
                    className="bg-white text-zinc-900 font-mono text-[11px] p-5 rounded-2xl shadow-inner leading-relaxed text-left border border-zinc-200 max-w-sm mx-auto"
                  >
                    {/* Invoice header */}
                    <div className="text-center receipt-header">
                      <h4 className="font-bold text-base tracking-tight text-slate-900 m-0">IresoJ DIGITAL CSC</h4>
                      <p className="text-[9px] text-slate-500 m-0 leading-tight">Computing Service Center & Graphic Hub</p>
                      <p className="text-[8px] text-slate-500 m-0">Kore Town Main Road, West Arsi, Ethiopia</p>
                      <p className="text-[8px] text-slate-500 m-0">Tel: +251 995 852 194 / Email: support@iresojdigital.com</p>
                    </div>

                    <div className="my-4">
                      <strong>INVOICE NO:</strong> IJ-{activeReceiptBooking.id.toUpperCase()}<br />
                      <strong>DATE      :</strong> {new Date().toLocaleDateString()}<br />
                      <strong>CLIENT    :</strong> {activeReceiptBooking.customerName}<br />
                      <strong>PHONE     :</strong> {activeReceiptBooking.customerPhone}<br />
                    </div>

                    <div className="border-t border-b py-2 my-2 font-bold">
                      <div className="flex-row">
                        <span>DESCRIPTION</span>
                        <span>AMOUNT</span>
                      </div>
                    </div>

                    {/* Booked Service item line */}
                    <div className="space-y-1 my-2">
                      <div className="flex-row">
                        <span>1x {activeReceiptBooking.serviceTitle}</span>
                        <span>ETB {receiptPrice.toFixed(2)}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block">Scheduled: {activeReceiptBooking.bookingDate} @ {activeReceiptBooking.bookingTime}</span>
                    </div>

                    <div className="border-t pt-2 mt-4 space-y-1">
                      <div className="flex-row">
                        <span>Subtotal:</span>
                        <span>ETB {receiptPrice.toFixed(2)}</span>
                      </div>
                      {receiptDiscount > 0 && (
                        <div className="flex-row text-red-600">
                          <span>Discount ({receiptDiscount}%):</span>
                          <span>-ETB {discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex-row">
                        <span>VAT ({receiptTaxRate}%):</span>
                        <span>ETB {taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex-row font-bold text-slate-900 border-t pt-1.5 mt-1.5 text-xs">
                        <span>TOTAL AMOUNT:</span>
                        <span>ETB {totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Booking state and Payment status */}
                    <div className="border-t pt-2.5 mt-4 text-center">
                      <p className="m-0 text-[10px] uppercase">
                        <strong>APPOINTMENT STATE:</strong> {activeReceiptBooking.status}<br />
                        <strong>PAYMENT STATUS   :</strong> <span className="font-black text-slate-900">{activeReceiptBooking.paymentStatus || 'UNPAID'}</span>
                      </p>
                      
                      {/* Interactive corporate seal stamp */}
                      <div className="text-center">
                        <span className="seal-stamp">
                          IresoJ DIGITAL CSC<br />
                          {activeReceiptBooking.paymentStatus === 'paid' ? '★ PAID IN FULL ★' : '★ VERIFIED LEDGER ★'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print Control panel */}
                <div className="pt-4 border-t border-zinc-800 flex justify-end gap-2 shrink-0">
                  <button
                    onClick={() => setActiveReceiptBooking(null)}
                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 rounded-xl transition-colors"
                  >
                    Close Printer
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(activeReceiptBooking)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-sky-400" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={triggerSystemPrint}
                    className="bg-[#0EA5E9] hover:bg-sky-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Trigger System Print</span>
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Accidental Deletion Shield</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete this booking reservation permanently? This action cannot be undone. Please confirm to proceed.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
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
