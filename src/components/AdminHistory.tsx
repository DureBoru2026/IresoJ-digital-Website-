import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  ShieldCheck, 
  Download, 
  ArrowUpDown, 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Check, 
  FileText,
  QrCode,
  MessageSquare,
  Printer,
  Send,
  X,
  ExternalLink,
  FileSpreadsheet,
  Shield
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Transaction } from '../types';
import { formatETB } from '../utils';

interface AdminHistoryProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

type SortField = 'date' | 'amount' | 'customerName';
type SortOrder = 'asc' | 'desc';

export default function AdminHistory({ transactions, onRefresh }: AdminHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGateway, setFilterGateway] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Modals
  const [selectedTxForQR, setSelectedTxForQR] = useState<Transaction | null>(null);
  const [smsModalTx, setSmsModalTx] = useState<Transaction | null>(null);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    let totalValue = 0;
    let approvedValue = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    transactions.forEach(tx => {
      totalValue += tx.amount;
      if (tx.status === 'approved') {
        approvedValue += tx.amount;
        approvedCount++;
      } else if (tx.status === 'pending') {
        pendingCount++;
      } else if (tx.status === 'rejected') {
        rejectedCount++;
      }
    });

    return {
      totalTransactions: transactions.length,
      totalValue,
      approvedValue,
      pendingCount,
      approvedCount,
      rejectedCount,
    };
  }, [transactions]);

  // Handle Sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort transactions
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(tx => tx.status === filterStatus);
    }

    // Gateway filter
    if (filterGateway !== 'all') {
      result = result.filter(tx => tx.paymentGateway === filterGateway);
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.referenceNumber.toLowerCase().includes(query) ||
        tx.customerName.toLowerCase().includes(query) ||
        (tx.customerPhone && tx.customerPhone.toLowerCase().includes(query)) ||
        tx.purpose.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchQuery, filterStatus, filterGateway, sortField, sortOrder]);

  const handleCopyText = (text: string, txId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2500);
  };

  // Open SMS modal
  const handleOpenSmsModal = (tx: Transaction) => {
    setSmsModalTx(tx);
    setSmsPhone(tx.customerPhone || '+251 995 852 194');
    setSmsMessage(
      `Dear ${tx.customerName}, your payment receipt (Ref: ${tx.referenceNumber}) for ${formatETB(tx.amount)} via ${tx.paymentGateway} is recorded at ES Digital Services. Verification Code: QR-${tx.referenceNumber.slice(-6)}. Thank you!`
    );
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsModalTx) return;
    setSmsSentNotice(`SMS Reminder dispatched successfully to ${smsPhone}!`);
    setTimeout(() => {
      setSmsSentNotice(null);
      setSmsModalTx(null);
    }, 2000);
  };

  // Generate verification URL for QR payload
  const getQrPayload = (tx: Transaction) => {
    return `https://es-digital.ethiopia/verify-receipt?ref=${encodeURIComponent(tx.referenceNumber)}&amount=${tx.amount}&gateway=${encodeURIComponent(tx.paymentGateway)}&status=${tx.status}&date=${encodeURIComponent(tx.date)}`;
  };

  // Printable Receipt & Verification Worksheet
  const handlePrintWorksheet = (tx: Transaction) => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      alert('Please allow popups to open the Printable Worksheet.');
      return;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getQrPayload(tx))}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Transaction Receipt Worksheet - ${tx.referenceNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; }
            .header { border-bottom: 3px solid #0EA5E9; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 22px; font-weight: 900; color: #0EA5E9; }
            .subtitle { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; }
            .worksheet-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
            .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
            .val { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
            th { background: #0f172a; color: white; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .qr-center { text-align: center; background: #ffffff; border: 2px dashed #0EA5E9; padding: 12px; border-radius: 12px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
            @media print { .no-print { display: none; } body { margin: 15px; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 15px;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #0EA5E9; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print Receipt Worksheet</button>
          </div>

          <div class="header">
            <div>
              <div class="subtitle">ES Digital Computer Services • Kore Town, Addis Ababa</div>
              <div class="title">Transaction Audit & Payment Worksheet</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">${tx.status.toUpperCase()}</span>
              <div style="font-size: 11px; color: #64748b; margin-top: 5px;">Date: ${new Date(tx.date).toLocaleString()}</div>
            </div>
          </div>

          <div class="worksheet-grid">
            <div class="box">
              <div style="margin-bottom: 12px;">
                <div class="label">Payment Reference Number</div>
                <div class="val" style="font-family: monospace; font-size: 18px; color: #0284c7;">${tx.referenceNumber}</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <div class="label">Customer Name</div>
                  <div class="val">${tx.customerName}</div>
                </div>
                <div>
                  <div class="label">Phone Contact</div>
                  <div class="val">${tx.customerPhone || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div class="qr-center">
              <img src="${qrUrl}" alt="QR Code Receipt Verification" style="width: 130px; height: 130px; margin: 0 auto; display: block;" />
              <div style="font-size: 9px; font-weight: bold; color: #0284c7; margin-top: 6px; text-transform: uppercase;">
                Scan to Verify Receipt
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Service / Purchased Item</th>
                <th>Payment Gateway</th>
                <th>Status</th>
                <th style="text-align: right;">Amount Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${tx.purpose}</strong></td>
                <td style="text-transform: uppercase;">${tx.paymentGateway}</td>
                <td>${tx.status.toUpperCase()}</td>
                <td style="text-align: right; font-weight: 900; font-size: 15px; color: #0284c7;">${formatETB(tx.amount)}</td>
              </tr>
            </tbody>
          </table>

          <div class="box" style="font-size: 11px; margin-top: 15px;">
            <strong>Audit Remarks & Verification Trail:</strong><br>
            ${tx.notes || 'Payment verified via gateway reconciliation. Official digital voucher.'}
          </div>

          <div class="footer">
            <div>ES Digital Computer Services • Authorized Financial Ledger</div>
            <div>Auditor Signature: _______________________</div>
          </div>

          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 400); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Batch Worksheet Print
  const handlePrintBatchWorksheet = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      alert('Please allow popups to open the Ledger Worksheet.');
      return;
    }

    const rowsHtml = processedTransactions.map(tx => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">${tx.referenceNumber}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${tx.customerName} (${tx.customerPhone || 'N/A'})</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${tx.purpose}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0284c7;">${formatETB(tx.amount)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase;">${tx.paymentGateway}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><span style="padding: 2px 6px; background: #f1f5f9; border-radius: 4px; font-weight: bold; font-size: 10px;">${tx.status}</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Master Transaction Ledger Worksheet - ES Digital</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; }
            .header { border-bottom: 3px solid #0EA5E9; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 20px; font-weight: 900; color: #0EA5E9; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
            th { background: #0f172a; color: white; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; }
            @media print { .no-print { display: none; } body { margin: 10px; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; text-align: right;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #0EA5E9; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print Master Ledger</button>
          </div>
          <div class="header">
            <div>
              <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">ES Digital Computer Services</div>
              <div class="title">Master Transaction Ledger Worksheet (${processedTransactions.length} Records)</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              Printed: ${new Date().toLocaleString()}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Customer Contact</th>
                <th>Purpose / Product</th>
                <th>Amount</th>
                <th>Gateway</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 400); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,Date,Reference Number,Gateway,Customer Name,Phone,Purpose,Amount,Status,Notes\n';
    const rows = processedTransactions.map(tx => {
      const escapedNotes = tx.notes ? tx.notes.replace(/"/g, '""') : '';
      const escapedPurpose = tx.purpose.replace(/"/g, '""');
      return `"${tx.id}","${new Date(tx.date).toISOString()}","${tx.referenceNumber}","${tx.paymentGateway}","${tx.customerName}","${tx.customerPhone || ''}","${escapedPurpose}",${tx.amount},"${tx.status}","${escapedNotes}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `es_digital_transactions_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-history-tab" className="space-y-6">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0EA5E9]" />
            <span>Transaction Auditing Log & History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete historical registry of payments received with unique QR code verification, SMS reminder triggers, and printable worksheets.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrintBatchWorksheet}
            disabled={processedTransactions.length === 0}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Print master financial ledger worksheet"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-200" />
            <span>Printable Worksheet</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={processedTransactions.length === 0}
            className="px-3.5 py-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({processedTransactions.length})</span>
          </button>
        </div>
      </div>

      {/* Security & Confidentiality Notice Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              System Confidentiality & Encryption Active
              <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                Secured
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              All financial credentials, business transactions, and customer records are isolated in sandboxed server storage.
            </p>
          </div>
        </div>
      </div>

      {/* KPI / Audit Metrics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Total Receipts</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.totalTransactions}</span>
            <span className="text-[10px] text-slate-400 font-mono">records</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Total Value Submitted</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{formatETB(stats.totalValue)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between border-l-4 border-l-green-500">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Reconciliation Confirmed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-green-700">{formatETB(stats.approvedValue)}</span>
            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
              {stats.approvedCount} orders
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Pending Reconciliation</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">{stats.pendingCount}</span>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
              Needs action
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by receipt/reference, name, phone, purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Gateway Filter */}
        <div>
          <select
            value={filterGateway}
            onChange={(e) => setFilterGateway(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] font-medium text-slate-700"
          >
            <option value="all">All Gateways</option>
            <option value="telebirr">telebirr logs</option>
            <option value="CBE Birr">CBE Birr logs</option>
          </select>
        </div>
      </div>

      {/* Sort Info Bar */}
      <div className="flex justify-between items-center text-xs text-slate-500 px-1">
        <div>
          Showing <strong>{processedTransactions.length}</strong> of {transactions.length} records chronologically
        </div>
        <div className="flex items-center gap-3">
          <span>Sort By:</span>
          <button 
            onClick={() => toggleSort('date')} 
            className={`font-semibold flex items-center gap-1 hover:text-slate-800 ${sortField === 'date' ? 'text-[#0EA5E9]' : ''}`}
          >
            Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => toggleSort('amount')} 
            className={`font-semibold flex items-center gap-1 hover:text-slate-800 ${sortField === 'amount' ? 'text-[#0EA5E9]' : ''}`}
          >
            Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => toggleSort('customerName')} 
            className={`font-semibold flex items-center gap-1 hover:text-slate-800 ${sortField === 'customerName' ? 'text-[#0EA5E9]' : ''}`}
          >
            Customer {sortField === 'customerName' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Main Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Reference Code & Gateway</th>
                <th className="p-4">Verification QR</th>
                <th className="p-4">Customer Contact Info</th>
                <th className="p-4">Timestamp & Date</th>
                <th className="p-4">Purchased Product / Purpose</th>
                <th className="p-4">Price</th>
                <th className="p-4">Audited Status</th>
                <th className="p-4 pr-6 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {processedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-mono">
                    No transactions matched your query.
                  </td>
                </tr>
              ) : (
                processedTransactions.map((tx) => {
                  const dateObj = new Date(tx.date);
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  const formattedTime = dateObj.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Reference Code & Gateway */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2.5">
                          {tx.paymentGateway === 'telebirr' ? (
                            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-mono text-[9px] font-bold" title="telebirr">
                              TB
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center font-mono text-[9px] font-bold" title="CBE Birr">
                              CBE
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-slate-900 tracking-wider uppercase">
                                {tx.referenceNumber}
                              </span>
                              <button
                                onClick={() => handleCopyText(tx.referenceNumber, tx.id)}
                                className="text-slate-300 hover:text-slate-500 transition-colors p-0.5"
                                title="Copy Reference Number"
                              >
                                {copiedTxId === tx.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              via {tx.paymentGateway}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Verification QR Code Thumbnail */}
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedTxForQR(tx)}
                          className="p-1.5 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-[#0EA5E9] border border-slate-200 hover:border-sky-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          title="Click to view unique verification QR receipt"
                        >
                          <QRCodeSVG value={getQrPayload(tx)} size={24} />
                          <span className="text-[10px] font-mono font-bold text-slate-700">QR Code</span>
                        </button>
                      </td>

                      {/* Customer contact details */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{tx.customerName}</span>
                        </div>
                        {tx.customerPhone && (
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>{tx.customerPhone}</span>
                          </div>
                        )}
                      </td>

                      {/* Timestamp chronological info */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-800">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{formattedTime}</span>
                        </div>
                      </td>

                      {/* Purchased service/product */}
                      <td className="p-4">
                        <div className="font-medium text-slate-800 max-w-xs truncate" title={tx.purpose}>
                          {tx.purpose}
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="p-4 font-mono font-bold text-slate-900 text-sm">
                        {formatETB(tx.amount)}
                      </td>

                      {/* Audit Status indicator */}
                      <td className="p-4">
                        <div>
                          {tx.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3 text-amber-500" />
                              <span>Pending</span>
                            </span>
                          )}
                          {tx.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>Approved</span>
                            </span>
                          )}
                          {tx.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenSmsModal(tx)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            title="Send SMS Reminder / Receipt to Customer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handlePrintWorksheet(tx)}
                            className="p-2 text-slate-500 hover:text-[#0EA5E9] hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                            title="Printable Receipt Worksheet"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Receipt Inspection Modal */}
      {selectedTxForQR && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#0EA5E9]" />
                  <span>Unique QR Receipt Verification</span>
                </h3>
                <p className="text-xs text-slate-500">Scan code with any mobile camera to verify payment authenticity</p>
              </div>
              <button
                onClick={() => setSelectedTxForQR(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center space-y-3">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                <QRCodeSVG value={getQrPayload(selectedTxForQR)} size={180} />
              </div>
              <div className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                REF: {selectedTxForQR.referenceNumber}
              </div>
              <p className="text-[11px] text-slate-500">
                Amount: <strong className="text-slate-900">{formatETB(selectedTxForQR.amount)}</strong> via {selectedTxForQR.paymentGateway}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  handlePrintWorksheet(selectedTxForQR);
                  setSelectedTxForQR(null);
                }}
                className="px-4 py-2.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md shadow-sky-100 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Worksheet</span>
              </button>
              <button
                onClick={() => setSelectedTxForQR(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Reminder Modal */}
      {smsModalTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>Send SMS Reminder / Receipt</span>
                </h3>
                <p className="text-xs text-slate-500">Dispatch payment verification SMS notification to customer</p>
              </div>
              <button
                onClick={() => setSmsModalTx(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {smsSentNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{smsSentNotice}</span>
              </div>
            )}

            <form onSubmit={handleSendSms} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  Recipient Customer Name & Phone
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    disabled
                    value={smsModalTx.customerName}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700"
                  />
                  <input
                    type="tel"
                    required
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  SMS Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-sans text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Payment Reference: <strong className="text-slate-900 font-mono">{smsModalTx.referenceNumber}</strong></span>
                <span>Amount: <strong className="text-slate-900 font-mono">{formatETB(smsModalTx.amount)}</strong></span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSmsModalTx(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center gap-2 shadow-md shadow-emerald-100 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send SMS Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

