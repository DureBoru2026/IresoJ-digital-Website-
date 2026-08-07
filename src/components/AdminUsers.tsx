import React, { useState } from 'react';
import { 
  Search, 
  UserCheck, 
  PhoneCall, 
  Award, 
  Users, 
  DollarSign, 
  RefreshCw, 
  Eye, 
  X, 
  Wrench, 
  ShoppingCart, 
  MessageCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Printer, 
  Star,
  FileText,
  Download
} from 'lucide-react';
import { CustomerRecord, Booking, Transaction, Feedback } from '../types';
import { formatETB } from '../utils';

interface AdminUsersProps {
  customers: CustomerRecord[];
  bookings?: Booking[];
  transactions?: Transaction[];
  feedback?: Feedback[];
  onRefresh: () => void;
}

export default function AdminUsers({ 
  customers, 
  bookings = [], 
  transactions = [], 
  feedback = [], 
  onRefresh 
}: AdminUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCustomerModal, setActiveCustomerModal] = useState<CustomerRecord | null>(null);
  const [modalTab, setModalTab] = useState<'all' | 'timeline' | 'bookings' | 'purchases' | 'feedback'>('all');

  const filteredCustomers = customers.filter(c => {
    if (!c) return false;
    const name = c.name || '';
    const contact = c.contact || '';
    const source = c.source || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
           source.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Helper matcher to link customer records to bookings, transactions, and feedback
  const isMatchForCustomer = (name?: string, contact?: string, email?: string, cust?: CustomerRecord | null) => {
    if (!cust) return false;
    const cName = (cust.name || '').toLowerCase().trim();
    const cContact = (cust.contact || '').toLowerCase().trim();

    const tName = (name || '').toLowerCase().trim();
    const tContact = (contact || '').toLowerCase().trim();
    const tEmail = (email || '').toLowerCase().trim();

    if (tName && cName && (tName.includes(cName) || cName.includes(tName))) return true;
    if (tContact && cContact && (tContact.includes(cContact) || cContact.includes(tContact))) return true;
    if (tEmail && cContact && (tEmail.includes(cContact) || cContact.includes(tEmail))) return true;

    return false;
  };

  // Get customer specific activity datasets for the modal
  const customerBookings = activeCustomerModal 
    ? bookings.filter(b => isMatchForCustomer(b.customerName, b.customerPhone, b.customerEmail, activeCustomerModal))
    : [];

  const customerTransactions = activeCustomerModal 
    ? transactions.filter(t => isMatchForCustomer(t.customerName, t.customerPhone, undefined, activeCustomerModal))
    : [];

  const customerFeedback = activeCustomerModal 
    ? feedback.filter(f => isMatchForCustomer(f.name, f.phone, f.email, activeCustomerModal))
    : [];

  const printCustomerStatement = () => {
    if (!activeCustomerModal) return;
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert('Please allow popups to print customer activity statement.');
      return;
    }

    const bookingRowsHtml = customerBookings.map(b => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${b.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${b.serviceTitle}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${b.bookingDate} (${b.bookingTime})</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-weight: bold;">${b.status}</td>
      </tr>
    `).join('');

    const txRowsHtml = customerTransactions.map(t => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${t.referenceNumber || t.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${t.purpose}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0284c7;">${formatETB(t.amount)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${t.paymentGateway}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase;">${t.status}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Activity Statement - ${activeCustomerModal.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; color: #0f172a; margin: 30px; }
            .header { border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
            h1 { font-size: 22px; color: #0284c7; margin: 0; }
            .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            th { background: #0f172a; color: white; text-align: left; padding: 8px; text-transform: uppercase; }
            .section-title { font-size: 14px; font-weight: bold; margin: 20px 0 10px 0; border-left: 4px solid #0284c7; padding-left: 8px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 15px;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print Activity Record</button>
          </div>
          <div class="header">
            <h1>IresoJ Digital CSC — Customer Activity Audit Statement</h1>
            <div class="meta">
              <strong>Client Name:</strong> ${activeCustomerModal.name} | <strong>Contact:</strong> ${activeCustomerModal.contact}<br>
              <strong>Acquisition Origin:</strong> ${activeCustomerModal.source} | <strong>Lifetime Value:</strong> ${formatETB(activeCustomerModal.spentAmount)}<br>
              <strong>Statement Date:</strong> ${new Date().toLocaleString()}
            </div>
          </div>

          <div class="section-title">Repair Bookings History (${customerBookings.length})</div>
          <table>
            <thead><tr><th>Booking Ref</th><th>Service Title</th><th>Scheduled Time</th><th>Status</th></tr></thead>
            <tbody>${bookingRowsHtml || '<tr><td colSpan="4" style="padding:10px; color:#94a3b8;">No repair bookings logged.</td></tr>'}</tbody>
          </table>

          <div class="section-title">Purchases & Transactions (${customerTransactions.length})</div>
          <table>
            <thead><tr><th>Tx Reference</th><th>Purpose / Item</th><th>Amount</th><th>Gateway</th><th>Status</th></tr></thead>
            <tbody>${txRowsHtml || '<tr><td colSpan="5" style="padding:10px; color:#94a3b8;">No payment transactions logged.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export Customer Book CRM data to CSV
  const exportCustomersCSV = () => {
    const headers = [
      'Customer Name',
      'Contact (Phone / Email)',
      'Acquisition Source',
      'Total Transactions / Orders',
      'Total Spent (ETB)',
      'VIP Status'
    ];

    const rows = filteredCustomers.map(c => [
      c.name || '',
      c.contact || '',
      c.source || '',
      c.transactionsCount || 0,
      c.spentAmount || 0,
      (c.spentAmount || 0) >= 2000 ? 'VIP Platinum' : 'Standard'
    ]);

    const escapeCell = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csvContent = [headers.map(escapeCell).join(','), ...rows.map(r => r.map(escapeCell).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `iresoj_customer_crm_book_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const totalLeads = customers.length;
  const highValueBuyers = customers.filter(c => c.spentAmount >= 2000).length;
  const totalClientSpend = customers.reduce((sum, c) => sum + c.spentAmount, 0);

  return (
    <div id="admin-users-subtab" className="space-y-6">
      
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">
            Customer Record Book (CRM)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse leads and registered clients captured via purchase checkout and contact form feedback inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCustomersCSV}
            disabled={filteredCustomers.length === 0}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV ({filteredCustomers.length})</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Book</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Card 1: Total Captured */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase">Captured Customers</span>
            <span className="block font-display font-black text-slate-900 text-2xl mt-0.5">
              {totalLeads}
            </span>
          </div>
        </div>

        {/* Card 2: Total Spent (ETB) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase">Reconciled Sales</span>
            <span className="block font-display font-black text-slate-900 text-2xl mt-0.5">
              {formatETB(totalClientSpend)}
            </span>
          </div>
        </div>

        {/* Card 3: Premium Tier */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase">High Value Clients</span>
            <span className="block font-display font-black text-slate-900 text-2xl mt-0.5">
              {highValueBuyers}
            </span>
          </div>
        </div>

      </div>

      {/* Filter and Search */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search customer records by name, phone, email, or client source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* CRM Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-55/60 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="p-4 pl-6">Client Name</th>
                <th className="p-4">Contact Number / Email</th>
                <th className="p-4">Acquisition Origin</th>
                <th className="p-4">Reference Filings</th>
                <th className="p-4 text-right">Lifetime Approved Billings</th>
                <th className="p-4 pr-6 text-center">Activity Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No matching client records found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => {
                  const isPremium = c.spentAmount >= 2000;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isPremium ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              {c.name}
                              {isPremium && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                                  Premium Client
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 font-mono text-xs text-slate-600">
                        {c.contact}
                      </td>

                      {/* Origin */}
                      <td className="p-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          c.source === 'Purchase'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {c.source}
                        </span>
                      </td>

                      {/* Count */}
                      <td className="p-4 font-mono text-xs">
                        {c.transactionsCount} entries
                      </td>

                      {/* Life value */}
                      <td className="p-4 font-mono font-bold text-slate-900 text-right">
                        {formatETB(c.spentAmount)}
                      </td>

                      {/* Action */}
                      <td className="p-4 pr-6 text-center">
                        <button
                          onClick={() => {
                            setActiveCustomerModal(c);
                            setModalTab('all');
                          }}
                          className="px-3 py-1.5 bg-sky-50 text-[#0284c7] hover:bg-sky-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-sky-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Activity</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Customer Activity Modal */}
      {activeCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-sky-500/20 border border-sky-400/30 rounded-2xl flex items-center justify-center text-sky-400 font-black text-lg">
                  {activeCustomerModal.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-white">{activeCustomerModal.name}</h3>
                    {activeCustomerModal.spentAmount >= 2000 && (
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        ★ High Value Client
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Contact: {activeCustomerModal.contact} • Source: {activeCustomerModal.source}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={printCustomerStatement}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Print Activity Statement</span>
                </button>
                <button
                  onClick={() => setActiveCustomerModal(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Quick KPIs */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 border-b border-slate-100 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Repair Bookings</span>
                <strong className="text-lg font-bold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                  <Wrench className="w-4 h-4 text-sky-500" />
                  {customerBookings.length} Logged
                </strong>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Purchases & Transactions</span>
                <strong className="text-lg font-bold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                  <ShoppingCart className="w-4 h-4 text-emerald-500" />
                  {customerTransactions.length} Orders ({formatETB(activeCustomerModal.spentAmount)})
                </strong>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Feedback Submissions</span>
                <strong className="text-lg font-bold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                  <MessageCircle className="w-4 h-4 text-indigo-500" />
                  {customerFeedback.length} Submitted
                </strong>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-3 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setModalTab('all')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  modalTab === 'all'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Snapshot
              </button>
              <button
                onClick={() => setModalTab('timeline')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'timeline'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Interaction Timeline</span>
              </button>
              <button
                onClick={() => setModalTab('bookings')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'bookings'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Repair Bookings</span>
                <span className="bg-sky-100 text-sky-700 px-1.5 py-0.2 text-[10px] rounded-full">
                  {customerBookings.length}
                </span>
              </button>
              <button
                onClick={() => setModalTab('purchases')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'purchases'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Purchases & Payments</span>
                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.2 text-[10px] rounded-full">
                  {customerTransactions.length}
                </span>
              </button>
              <button
                onClick={() => setModalTab('feedback')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'feedback'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Inquiries & Feedback</span>
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.2 text-[10px] rounded-full">
                  {customerFeedback.length}
                </span>
              </button>
            </div>

            {/* Modal Tab Contents */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

              {/* SECTION 0: Chronological Interaction Timeline */}
              {modalTab === 'timeline' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-500" />
                    <span>Chronological Interaction History</span>
                  </h4>
                  
                  <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {(() => {
                      const timeline = [
                        ...customerBookings.map(b => ({ ...b, type: 'booking' as const, sortDate: new Date(b.date || b.bookingDate) })),
                        ...customerTransactions.map(t => ({ ...t, type: 'transaction' as const, sortDate: new Date(t.date || 0) })),
                        ...customerFeedback.map(f => ({ ...f, type: 'feedback' as const, sortDate: new Date(f.date) }))
                      ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

                      if (timeline.length === 0) return <p className="text-center py-12 text-slate-400 text-xs italic">No interactions logged for this timeline.</p>;

                      return timeline.map((item, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-hover:bg-sky-500 group-hover:text-white text-slate-500 transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            {item.type === 'booking' ? <Wrench className="w-4 h-4" /> : item.type === 'transaction' ? <ShoppingCart className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-slate-900 text-sm">{item.type === 'booking' ? (item as Booking).serviceTitle : item.type === 'transaction' ? (item as Transaction).purpose : 'Feedback Inquiry'}</div>
                              <time className="font-mono text-[10px] text-sky-600 font-bold">{item.sortDate.toLocaleDateString()}</time>
                            </div>
                            <div className="text-slate-500 text-xs line-clamp-2">
                              {item.type === 'booking' ? `Status: ${(item as Booking).status.toUpperCase()} • Slot: ${(item as Booking).bookingTime}` : 
                               item.type === 'transaction' ? `Amount: ${formatETB((item as Transaction).amount)} • Status: ${(item as Transaction).status.toUpperCase()}` : 
                               (item as Feedback).message}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* SECTION 1: Repair Bookings */}
              {(modalTab === 'all' || modalTab === 'bookings') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-sky-500" />
                    <span>Service & Hardware Repair Bookings ({customerBookings.length})</span>
                  </h4>

                  {customerBookings.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No repair bookings on record for this client.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase">
                            <th className="p-2.5">Booking Ref</th>
                            <th className="p-2.5">Service Requested</th>
                            <th className="p-2.5">Scheduled Slot</th>
                            <th className="p-2.5">Repair Status</th>
                            <th className="p-2.5">Payment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {customerBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-mono text-slate-600 font-bold">{b.id}</td>
                              <td className="p-2.5 font-bold text-slate-800">{b.serviceTitle}</td>
                              <td className="p-2.5 font-mono text-slate-500">{b.bookingDate} at {b.bookingTime}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                  b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                  b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono uppercase text-[10px]">{b.paymentStatus || 'Unpaid'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: Transactions & Purchases */}
              {(modalTab === 'all' || modalTab === 'purchases') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-emerald-500" />
                    <span>Purchases & Payment Transactions ({customerTransactions.length})</span>
                  </h4>

                  {customerTransactions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No payment transactions on record for this client.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase">
                            <th className="p-2.5">Ref Number</th>
                            <th className="p-2.5">Purpose / Item</th>
                            <th className="p-2.5">Amount (ETB)</th>
                            <th className="p-2.5">Channel</th>
                            <th className="p-2.5">Audit Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {customerTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-mono text-slate-600 font-bold">{t.referenceNumber || t.id}</td>
                              <td className="p-2.5 font-bold text-slate-800">{t.purpose}</td>
                              <td className="p-2.5 font-mono font-bold text-sky-600">{formatETB(t.amount)}</td>
                              <td className="p-2.5 font-mono uppercase text-[10px] text-slate-500">{t.paymentGateway}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  t.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                  t.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: Customer Feedback Submissions */}
              {(modalTab === 'all' || modalTab === 'feedback') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-indigo-500" />
                    <span>Inquiries & Feedback Submissions ({customerFeedback.length})</span>
                  </h4>

                  {customerFeedback.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No feedback or contact inquiries submitted by this client.</p>
                  ) : (
                    <div className="space-y-3">
                      {customerFeedback.map((f) => (
                        <div key={f.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2 text-xs">
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span className="font-mono">{new Date(f.date).toLocaleString()}</span>
                            <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                              f.status === 'replied' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {f.status}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">{f.message}</p>
                          {f.replyMessage && (
                            <div className="bg-blue-50 border-l-2 border-blue-500 p-2 text-[11px] text-blue-900 rounded-r">
                              <strong>Admin Reply:</strong> {f.replyMessage}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
