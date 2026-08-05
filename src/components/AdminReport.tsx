import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Mail,
  RefreshCw,
  Database,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Transaction, Booking } from '../types';
import { formatETB } from '../utils';

interface AdminReportProps {
  transactions: Transaction[];
  bookings?: Booking[];
}

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminReport({ transactions = [], bookings = [] }: AdminReportProps) {
  const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string>('Every Sunday @ 00:00 UTC (Auto-Scheduled)');

  const triggerDatabaseEmailBackup = async () => {
    setBackupLoading(true);
    setBackupMessage(null);
    try {
      const adminToken = localStorage.getItem('admin_token') || 'ADMIN_SECRET_KEY';
      const res = await fetch('/api/admin/backup-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isAutomated: false })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackupMessage(`✅ Success! Database backup snapshot (${data.backupSizeKb}) emailed to ${data.recipientEmail}`);
        setLastBackupTime(new Date().toLocaleString());
      } else {
        setBackupMessage(`❌ ${data.error || 'Failed to dispatch backup email.'}`);
      }
    } catch (err) {
      setBackupMessage('❌ Network connection error triggering email backup.');
    } finally {
      setBackupLoading(false);
    }
  };
  
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escapeCell = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [
      headers.map(escapeCell).join(','),
      ...rows.map(row => row.map(escapeCell).join(','))
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportTransactionsCSV = () => {
    const headers = [
      'Transaction ID',
      'Reference Number',
      'Payment Gateway',
      'Customer Name',
      'Customer Phone',
      'Amount (ETB)',
      'Purpose / Item',
      'Date & Time',
      'Audit Status',
      'Notes'
    ];

    const rows = (transactions || []).map(tx => [
      tx.id || '',
      tx.referenceNumber || '',
      tx.paymentGateway || '',
      tx.customerName || 'Anonymous',
      tx.customerPhone || 'N/A',
      tx.amount || 0,
      tx.purpose || '',
      tx.date ? new Date(tx.date).toLocaleString() : '',
      tx.status || 'pending',
      tx.notes || ''
    ]);

    downloadCSV(`transactions_history_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const exportBookingsCSV = () => {
    const headers = [
      'Booking ID',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Service ID',
      'Service Title',
      'Scheduled Date',
      'Scheduled Time',
      'Service Status',
      'Payment Status',
      'Submission Date',
      'Notes'
    ];

    const rows = (bookings || []).map(b => [
      b.id || '',
      b.customerName || '',
      b.customerPhone || '',
      b.customerEmail || 'N/A',
      b.serviceId || '',
      b.serviceTitle || '',
      b.bookingDate || '',
      b.bookingTime || '',
      b.status || 'pending',
      b.paymentStatus || 'unpaid',
      b.date ? new Date(b.date).toLocaleString() : '',
      b.notes || ''
    ]);

    downloadCSV(`service_bookings_history_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const exportCombinedAuditCSV = () => {
    const headers = [
      'Record Type',
      'ID / Reference',
      'Description / Purpose / Service',
      'Customer Name',
      'Customer Contact',
      'Amount (ETB)',
      'Audit / Fulfillment Status',
      'Payment Status / Channel',
      'Date'
    ];

    const txRows = (transactions || []).map(tx => [
      'Transaction',
      tx.referenceNumber || tx.id,
      tx.purpose || 'Payment',
      tx.customerName || 'Anonymous',
      tx.customerPhone || 'N/A',
      tx.amount || 0,
      tx.status || 'pending',
      tx.paymentGateway || 'N/A',
      tx.date ? new Date(tx.date).toLocaleString() : ''
    ]);

    const bookingRows = (bookings || []).map(b => [
      'Service Booking',
      b.id,
      b.serviceTitle || 'Service',
      b.customerName || 'Anonymous',
      `${b.customerPhone || ''} ${b.customerEmail || ''}`.trim() || 'N/A',
      0,
      b.status || 'pending',
      b.paymentStatus || 'unpaid',
      b.date ? new Date(b.date).toLocaleString() : ''
    ]);

    const combined = [...txRows, ...bookingRows].sort((a, b) => {
      const dateA = new Date(a[8] as string).getTime() || 0;
      const dateB = new Date(b[8] as string).getTime() || 0;
      return dateB - dateA;
    });

    downloadCSV(`offline_accounting_full_audit_${new Date().toISOString().split('T')[0]}.csv`, headers, combined);
  };

  const exportMonthlyInsightsPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=1100');
    if (!printWindow) {
      alert('Please allow popups to open the Monthly Insights PDF document.');
      return;
    }

    const monthlyTrends = reportData.monthlyRevenueData || [];
    const totalPeriodRev = reportData.totalRevenue || 0;
    const peakMonth = reportData.peakMonthLabel || 'N/A';
    const maxRev = reportData.maxMonthlyRevenue || 0;
    const totalOrders = reportData.totalOrders || 0;
    const approvedOrders = reportData.approvedOrders || 0;
    const approvalRate = totalOrders > 0 ? Math.round((approvedOrders / totalOrders) * 100) : 100;
    const avgOrderValue = approvedOrders > 0 ? Math.round(totalPeriodRev / approvedOrders) : 0;

    const trendRowsHtml = monthlyTrends.map((m: any, idx: number) => {
      const prevRev = idx > 0 ? (monthlyTrends[idx - 1].revenue || 0) : m.revenue;
      const growthPct = prevRev > 0 ? Math.round(((m.revenue - prevRev) / prevRev) * 100) : 0;
      const growthLabel = idx === 0 ? 'Baseline' : `${growthPct >= 0 ? '+' : ''}${growthPct}%`;
      const growthColor = growthPct >= 0 ? '#10b981' : '#ef4444';

      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${m.month}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 800; color: #0284c7;">${formatETB(m.revenue)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${m.count} sales</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: ${growthColor};">${growthLabel}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;"><span style="padding: 2px 8px; background: ${m.revenue === maxRev ? '#dcfce7' : '#f1f5f9'}; color: ${m.revenue === maxRev ? '#15803d' : '#475569'}; border-radius: 6px; font-size: 10px; font-weight: 700;">${m.revenue === maxRev ? '★ Peak Performance' : 'Active'}</span></td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IresoJ Digital CSC - Monthly Insights & Analytics Executive Summary</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 35px; line-height: 1.5; background: #ffffff; }
            .header { border-bottom: 4px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #0284c7; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 30px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
            .kpi-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
            .kpi-val { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 4px; }
            .kpi-sub { font-size: 10px; color: #10b981; font-weight: 700; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
            th { background: #0f172a; color: white; text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; }
            .section-title { font-size: 15px; font-weight: 800; margin: 25px 0 12px 0; border-left: 4px solid #0284c7; padding-left: 10px; color: #0f172a; }
            .insights-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; font-size: 12px; color: #0369a1; margin-bottom: 25px; line-height: 1.6; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
            @media print { .no-print { display: none; } body { margin: 15px; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">🖨️ Print / Download Executive PDF Report</button>
          </div>
          
          <div class="header">
            <div>
              <div class="subtitle">IresoJ Digital CSC Computer Services • Executive Intelligence</div>
              <div class="title">Monthly Revenue Growth & KPI Insights</div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">Location: Kore Town Center, West Arsi, Ethiopia</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <strong>Generated On:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}<br>
              <strong>Audit ID:</strong> INSIGHTS-PDF-${Date.now().toString().slice(-6)}
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Gross Revenue</div>
              <div class="kpi-val" style="color: #0284c7;">${formatETB(totalPeriodRev)}</div>
              <div class="kpi-sub">✓ Verified Audit Receipts</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Peak Month Revenue</div>
              <div class="kpi-val">${formatETB(maxRev)}</div>
              <div class="kpi-sub" style="color: #0284c7;">Month: ${peakMonth}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Audit Approval Rate</div>
              <div class="kpi-val" style="color: #10b981;">${approvalRate}%</div>
              <div class="kpi-sub">${approvedOrders} of ${totalOrders} Approved</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Average Order Value</div>
              <div class="kpi-val">${formatETB(avgOrderValue)}</div>
              <div class="kpi-sub">Per Approved Transaction</div>
            </div>
          </div>

          <div class="insights-box">
            <strong>📊 Monthly Revenue Growth Insights & Strategic Summary:</strong><br>
            • Peak revenue velocity was reached during <strong>${peakMonth}</strong> with gross receipts of <strong>${formatETB(maxRev)}</strong>.<br>
            • The financial audit system registered <strong>${approvedOrders} approved transactions</strong> out of <strong>${totalOrders} total logs</strong>, achieving a high compliance approval rate of <strong>${approvalRate}%</strong>.<br>
            • Recommendation: Maintain inventory levels for top-selling hardware parts and expand training enrollments during off-peak windows.
          </div>

          <div class="section-title">Monthly Revenue Growth & Trend Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Calendar Month</th>
                <th>Revenue (ETB)</th>
                <th>Transactions Count</th>
                <th>Growth vs Prev Month</th>
                <th>Performance Status</th>
              </tr>
            </thead>
            <tbody>
              ${trendRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>IresoJ Digital CSC Computer Services • Kore Town, Oromia, Ethiopia • Manager: Jemal Ireso</span>
            <span>Page 1 of 1 • Confidential Compliance Document</span>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportFullDatabaseJSON = () => {
    try {
      const safeParseStorage = (key: string) => {
        try {
          return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
          return [];
        }
      };

      const fullDatabaseState = {
        meta: {
          organization: 'IresoJ Digital CSC Computer Services',
          location: 'Kore Town Center, West Arsi, Ethiopia',
          manager: 'Jemal Ireso',
          databaseProjectID: 'ai-studio-esdigitalcompute-07ac3921-f36f-42e6-8cb0-60744c958ec6',
          exportedAt: new Date().toISOString(),
          version: '2.5.0-ENTERPRISE-AUDIT'
        },
        collections: {
          transactions: transactions || [],
          bookings: bookings || [],
          customers: safeParseStorage('es_customers'),
          announcements: safeParseStorage('es_announcements'),
          securityLogs: safeParseStorage('es_security_logs'),
          productsInventory: safeParseStorage('es_products'),
          courseEnrollments: safeParseStorage('es_course_enrollments'),
          feedback: safeParseStorage('es_feedback')
        }
      };

      const jsonStr = JSON.stringify(fullDatabaseState, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `es_digital_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate database JSON export. Check browser console.');
    }
  };

  const exportMonthlyReport = (type: 'csv' | 'pdf') => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthName = now.toLocaleString('default', { month: 'long' });

    const monthlyTx = (transactions || []).filter(tx => {
      if (!tx.date) return false;
      const d = new Date(tx.date);
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const monthlyBookings = (bookings || []).filter(b => {
      if (!b.date) return false;
      const d = new Date(b.date);
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const monthlyApprovedTx = monthlyTx.filter(t => t.status === 'approved');
    const monthlyTotalRevenue = monthlyApprovedTx.reduce((sum, t) => sum + t.amount, 0);

    if (type === 'csv') {
      const headers = [
        'Record Type',
        'Reference / ID',
        'Customer Name',
        'Contact Phone',
        'Purpose / Service Title',
        'Amount (ETB)',
        'Payment Gateway / Channel',
        'Status',
        'Date & Time'
      ];

      const rows: (string | number)[][] = [
        [
          `MONTHLY REPORT: ${monthName} ${currentYear}`,
          'TOTAL APPROVED REVENUE:',
          `${monthlyTotalRevenue} ETB`,
          `Approved Sales Count: ${monthlyApprovedTx.length}`,
          `Total Transactions: ${monthlyTx.length}`,
          `Total Bookings: ${monthlyBookings.length}`,
          '',
          '',
          new Date().toLocaleString()
        ],
        ['--- MONTHLY TRANSACTIONS ---', '', '', '', '', '', '', '', '']
      ];

      monthlyTx.forEach(tx => {
        rows.push([
          'Transaction',
          tx.referenceNumber || tx.id || '',
          tx.customerName || 'Anonymous',
          tx.customerPhone || 'N/A',
          tx.purpose || '',
          tx.amount || 0,
          tx.paymentGateway || '',
          tx.status || 'pending',
          tx.date ? new Date(tx.date).toLocaleString() : ''
        ]);
      });

      rows.push(['--- MONTHLY SERVICE BOOKINGS ---', '', '', '', '', '', '', '', '']);

      monthlyBookings.forEach(b => {
        rows.push([
          'Service Booking',
          b.id || '',
          b.customerName || '',
          b.customerPhone || 'N/A',
          b.serviceTitle || '',
          0,
          b.paymentStatus || 'unpaid',
          b.status || 'pending',
          b.date ? new Date(b.date).toLocaleString() : ''
        ]);
      });

      downloadCSV(`Monthly_Financial_Report_${monthName}_${currentYear}.csv`, headers, rows);
    } else {
      const printWindow = window.open('', '_blank', 'width=950,height=1000');
      if (!printWindow) {
        alert('Please allow popups to open and print the Monthly PDF report.');
        return;
      }

      const txRowsHtml = monthlyTx.map(tx => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${tx.referenceNumber || tx.id}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${tx.customerName || 'Anonymous'} (${tx.customerPhone || 'N/A'})</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${tx.purpose || 'Payment'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0284c7;">${formatETB(tx.amount)}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase;">${tx.paymentGateway || 'N/A'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;"><span style="padding: 2px 6px; background: #f1f5f9; border-radius: 4px; font-weight: bold; font-size: 10px;">${tx.status || 'pending'}</span></td>
        </tr>
      `).join('');

      const bookingRowsHtml = monthlyBookings.map(b => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${b.id}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${b.customerName || 'Anonymous'} (${b.customerPhone || 'N/A'})</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${b.serviceTitle || 'N/A'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${b.bookingDate || ''} ${b.bookingTime || ''}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;"><span style="padding: 2px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: bold; font-size: 10px;">${b.status || 'pending'}</span></td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${b.paymentStatus || 'unpaid'}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>IresoJ Digital CSC - ${monthName} ${currentYear} Monthly Report</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; }
              .header { border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
              .title { font-size: 22px; font-weight: 900; color: #0284c7; }
              .subtitle { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
              .kpi-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
              .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
              .kpi-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
              .kpi-val { font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
              th { background: #0f172a; color: white; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
              .section-title { font-size: 14px; font-weight: 800; margin: 20px 0 10px 0; border-left: 4px solid #0284c7; padding-left: 8px; }
              .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
              @media print {
                .no-print { display: none; }
                body { margin: 10px; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 15px; text-align: right;">
              <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
            </div>
            <div class="header">
              <div>
                <div class="subtitle">IresoJ Digital CSC Computer Services — Official Monthly Archive</div>
                <div class="title">Monthly Financial & Service Report (${monthName} ${currentYear})</div>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b;">
                Generated: ${now.toLocaleString()}<br>
                Ref: MONTHLY-ARCHIVE-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}
              </div>
            </div>

            <div class="kpi-container">
              <div class="kpi-card">
                <div class="kpi-label">Approved Monthly Revenue</div>
                <div class="kpi-val" style="color: #10b981;">${formatETB(monthlyTotalRevenue)}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Monthly Sales Count</div>
                <div class="kpi-val">${monthlyApprovedTx.length} / ${monthlyTx.length}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Monthly Service Bookings</div>
                <div class="kpi-val">${monthlyBookings.length}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Avg Order Value</div>
                <div class="kpi-val">${formatETB(monthlyApprovedTx.length > 0 ? monthlyTotalRevenue / monthlyApprovedTx.length : 0)}</div>
              </div>
            </div>

            <div class="section-title">Transactions Ledger (${monthName} ${currentYear})</div>
            <table>
              <thead>
                <tr>
                  <th>Reference #</th>
                  <th>Customer</th>
                  <th>Purpose / Item</th>
                  <th>Amount</th>
                  <th>Channel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${txRowsHtml || '<tr><td colspan="6" style="padding:15px; text-align:center; color:#94a3b8;">No transactions found for this month.</td></tr>'}
              </tbody>
            </table>

            <div class="section-title">Service Bookings Ledger (${monthName} ${currentYear})</div>
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer Name</th>
                  <th>Service Title</th>
                  <th>Scheduled Date & Time</th>
                  <th>Fulfillment</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                ${bookingRowsHtml || '<tr><td colspan="6" style="padding:15px; text-align:center; color:#94a3b8;">No service bookings found for this month.</td></tr>'}
              </tbody>
            </table>

            <div class="footer">
              <div>IresoJ Digital CSC Computer Services • Official Physical Archive Copy</div>
              <div>Authorized Signature: _______________________</div>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const exportPDFReport = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      alert('Please allow popups to open and print/export the PDF report.');
      return;
    }

    const currentDate = new Date().toLocaleString();
    const totalRev = reportData.totalApprovedRevenue;

    const txRowsHtml = (transactions || []).map(tx => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${tx.referenceNumber || tx.id}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${tx.customerName || 'Anonymous'} (${tx.customerPhone || 'N/A'})</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${tx.purpose || 'Payment'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0284c7;">${formatETB(tx.amount)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase;">${tx.paymentGateway || 'N/A'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;"><span style="padding: 2px 6px; background: #f1f5f9; border-radius: 4px; font-weight: bold; font-size: 10px;">${tx.status || 'pending'}</span></td>
      </tr>
    `).join('');

    const bookingRowsHtml = (bookings || []).map(b => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${b.id}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${b.customerName || 'Anonymous'} (${b.customerPhone || 'N/A'})</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${b.serviceTitle || 'N/A'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${b.bookingDate || ''} ${b.bookingTime || ''}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;"><span style="padding: 2px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: bold; font-size: 10px;">${b.status || 'pending'}</span></td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${b.paymentStatus || 'unpaid'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IresoJ Digital CSC - Executive Sales & Booking Audit Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
            .logo { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
            .logo span { color: #0284c7; }
            .meta { font-size: 11px; color: #475569; text-align: right; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
            .card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; }
            .card-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
            .card-value { font-size: 18px; font-weight: 900; color: #0f172a; }
            h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0284c7; margin-top: 25px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
            th { background: #0f172a; color: #ffffff; text-align: left; padding: 8px 10px; font-weight: 700; text-transform: uppercase; font-size: 10px; }
            .footer-sign { margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; }
            .sign-box { width: 220px; border-top: 2px solid #64748b; text-align: center; padding-top: 6px; font-weight: bold; color: #334155; }
            @media print {
              body { margin: 15px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #0ea5e9; color: white; padding: 12px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div>
              <strong style="font-size: 14px; display: block;">📄 Print & Physical Record Export Ready</strong>
              <span style="font-size: 11px; opacity: 0.9;">Click the button below to print or save directly as a PDF file.</span>
            </div>
            <button onclick="window.print()" style="background: #ffffff; color: #0284c7; border: none; padding: 10px 20px; font-weight: 800; font-size: 12px; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              🖨️ Print / Save as PDF
            </button>
          </div>

          <div class="header">
            <div>
              <div class="logo">IresoJ <span>DIGITAL</span> COMPUTER & MEDIA SERVICES</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">
                Kore Town Center • Addis Ababa, Ethiopia • Hotline: +251 995 852 194 / +251 911 223 344
              </div>
              <div style="font-size: 10px; color: #0284c7; font-weight: 700; margin-top: 2px;">
                Official Business Management & Financial Audit Document
              </div>
            </div>
            <div class="meta">
              <div><strong>Audit Report:</strong> Financial & Service Ledger</div>
              <div><strong>Generated Date:</strong> ${currentDate}</div>
              <div><strong>Authorized Administrator:</strong> Jemal Fano</div>
              <div><strong>Email:</strong> jemalfan030@gmail.com</div>
            </div>
          </div>

          <div class="summary-grid">
            <div class="card">
              <div class="card-title">Total Approved Revenue</div>
              <div class="card-value">${formatETB(totalRev)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Transaction Receipts</div>
              <div class="card-value">${transactions.length} Records</div>
            </div>
            <div class="card">
              <div class="card-title">Approved Orders</div>
              <div class="card-value">${reportData.approvedOrders} Confirmed</div>
            </div>
            <div class="card">
              <div class="card-title">Service Bookings</div>
              <div class="card-value">${bookings.length} Requests</div>
            </div>
          </div>

          <h2>Sales & Payment Receipts Ledger (${transactions.length} Entries)</h2>
          <table>
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Customer Name</th>
                <th>Purpose / Description</th>
                <th>Amount (ETB)</th>
                <th>Gateway</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              ${txRowsHtml || '<tr><td colspan="6" style="text-align:center; padding: 15px; color: #94a3b8;">No transaction receipts logged</td></tr>'}
            </tbody>
          </table>

          <h2>Service Bookings & Repair Ledger (${bookings.length} Entries)</h2>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer Name</th>
                <th>Service Requested</th>
                <th>Scheduled Date & Time</th>
                <th>Service Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookingRowsHtml || '<tr><td colspan="6" style="text-align:center; padding: 15px; color: #94a3b8;">No service bookings logged</td></tr>'}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-box">
              Prepared By: Admin Jemal Fano<br/>
              IresoJ Digital CSC Computer Services Manager
            </div>
            <div class="sign-box">
              Official Physical Stamp & Verification<br/>
              Date: ________________________
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const reportData = useMemo(() => {
    const approvedTx = transactions.filter(tx => tx.status === 'approved');
    
    // Daily Revenue Breakdown (Last 10 days for Bar Chart with Peak Highlighting)
    const dailyMap: Record<string, { dateStr: string; name: string; revenue: number; txCount: number }> = {};
    const daysCount = 10;
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const name = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailyMap[dateStr] = { dateStr, name, revenue: 0, txCount: 0 };
    }

    approvedTx.forEach(tx => {
      if (!tx.date) return;
      const dateStr = tx.date.split('T')[0];
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].revenue += tx.amount;
        dailyMap[dateStr].txCount += 1;
      }
    });

    const dailyRevenueList = Object.values(dailyMap);
    let maxDailyRevenue = 0;
    let peakDayName = 'N/A';
    dailyRevenueList.forEach(d => {
      if (d.revenue >= maxDailyRevenue && d.revenue > 0) {
        maxDailyRevenue = d.revenue;
        peakDayName = d.name;
      }
    });

    const dailyRevenueData = dailyRevenueList.map(item => ({
      ...item,
      isPeak: maxDailyRevenue > 0 && item.revenue === maxDailyRevenue,
      isHighVolume: maxDailyRevenue > 0 && item.revenue >= maxDailyRevenue * 0.7 && item.revenue < maxDailyRevenue
    }));

    // Monthly Revenue Growth Trend (Recharts Line Chart)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, { month: string; revenue: number; txCount: number }> = {};
    
    // Generate 6 months timeline
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = { month: monthLabel, revenue: 0, txCount: 0 };
    }

    approvedTx.forEach(tx => {
      if (!tx.date) return;
      const d = new Date(tx.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[key]) {
          monthlyMap[key].revenue += tx.amount;
          monthlyMap[key].txCount += 1;
        } else {
          const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          monthlyMap[key] = { month: monthLabel, revenue: tx.amount, txCount: 1 };
        }
      }
    });

    const monthlyRevenueData = Object.entries(monthlyMap)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([_, val]) => val);

    let maxMonthlyRevenue = 0;
    let peakMonthLabel = 'N/A';
    monthlyRevenueData.forEach(m => {
      if (m.revenue >= maxMonthlyRevenue) {
        maxMonthlyRevenue = m.revenue;
        peakMonthLabel = m.month;
      }
    });

    // Gateway distribution
    const gatewayStats: Record<string, number> = {};
    approvedTx.forEach(tx => {
      gatewayStats[tx.paymentGateway] = (gatewayStats[tx.paymentGateway] || 0) + tx.amount;
    });

    const gatewayData = Object.entries(gatewayStats).map(([name, value]) => ({
      name,
      value
    }));

    // Order status breakdown
    const statusStats: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    transactions.forEach(tx => {
      statusStats[tx.status] = (statusStats[tx.status] || 0) + 1;
    });

    const statusData = Object.entries(statusStats).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Summary stats
    const totalApprovedRevenue = approvedTx.reduce((sum, tx) => sum + tx.amount, 0);
    const avgOrderValue = approvedTx.length > 0 ? totalApprovedRevenue / approvedTx.length : 0;

    return {
      dailyRevenueData,
      maxDailyRevenue,
      peakDayName,
      monthlyRevenueData,
      maxMonthlyRevenue,
      peakMonthLabel,
      gatewayData,
      statusData,
      totalApprovedRevenue,
      avgOrderValue,
      totalOrders: transactions.length,
      approvedOrders: approvedTx.length,
      pendingOrders: statusStats.pending
    };
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CSV Export & Offline Accounting Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-widest">
            <Printer className="w-4 h-4" />
            <span>Offline Accounting, PDF & CSV Data Exports</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">Financial & Booking Records Export Center</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Export sales transactions and service booking ledgers directly to CSV spreadsheets or print official PDF documents for physical record-keeping and tax filing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => exportMonthlyReport('csv')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            title="Download current month's transactions & bookings CSV document"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download Monthly Report (CSV)</span>
          </button>

          <button
            onClick={() => exportMonthlyReport('pdf')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-500/20 cursor-pointer"
            title="Generate & print current month's physical PDF document with header & signature block"
          >
            <Printer className="w-4 h-4 text-sky-300" />
            <span>Print Monthly PDF</span>
          </button>

          <button
            onClick={exportPDFReport}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            title="Generate & print full physical PDF document with company header and signature block"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Full PDF Report</span>
          </button>

          <button
            onClick={exportTransactionsCSV}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-sky-500/20 cursor-pointer"
            title="Download CSV file of all transaction receipts"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Sales CSV ({transactions.length})</span>
          </button>

          <button
            onClick={exportBookingsCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            title="Download CSV file of all service bookings"
          >
            <FileText className="w-4 h-4" />
            <span>Bookings CSV ({bookings.length})</span>
          </button>

          <button
            onClick={exportCombinedAuditCSV}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer"
            title="Download unified accounting CSV ledger"
          >
            <Download className="w-4 h-4" />
            <span>Full Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Automated Weekly Database Backup & Email Dispatcher Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white border border-sky-800/50 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider">
              <Database className="w-4 h-4 text-sky-400" />
              <span>Automated Weekly Database Vault & Email Backup</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" />
              <span>Admin Automated Backup to: <strong className="text-sky-300 font-mono">jemalfan030@gmail.com</strong></span>
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Configured automated background cron backup for IresoJ Digital CSC Computer Services database (Users, Orders, Transactions, Bookings & Digital Assets). Automatically compiled and emailed every week to administrator address.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Auto Schedule Toggle */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700">
              <Calendar className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Weekly Auto-Schedule</p>
                <p className="text-xs font-black text-sky-300">{isAutoBackupEnabled ? 'ACTIVE (Sundays)' : 'PAUSED'}</p>
              </div>
              <button
                onClick={() => setIsAutoBackupEnabled(!isAutoBackupEnabled)}
                className={`ml-2 w-10 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  isAutoBackupEnabled ? 'bg-sky-500 justify-end' : 'bg-slate-600 justify-start'
                }`}
                title="Toggle Weekly Automated Email Backup"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Manual Trigger Button */}
            <button
              onClick={exportFullDatabaseJSON}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
              title="Download full database collections as a single JSON file"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>Export Database JSON</span>
            </button>

            <button
              onClick={triggerDatabaseEmailBackup}
              disabled={backupLoading}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${backupLoading ? 'animate-spin' : ''}`} />
              <span>{backupLoading ? 'Compiling Backup...' : 'Send Backup Email Now'}</span>
            </button>
          </div>
        </div>

        {/* Status / Output Alert */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Last Backup Dispatched: <strong className="text-slate-200">{lastBackupTime}</strong></span>
          </div>
          {backupMessage && (
            <div className={`px-3 py-1.5 rounded-xl font-sans text-xs font-bold ${
              backupMessage.startsWith('✅') ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50' : 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
            }`}>
              {backupMessage}
            </div>
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{formatETB(reportData.totalApprovedRevenue)}</h3>
          <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">
            Confirmed via CBE & telebirr
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Transaction</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{formatETB(reportData.avgOrderValue)}</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Per approved receipt</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Audit</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{reportData.pendingOrders}</h3>
          <p className="text-[10px] text-amber-600 font-bold mt-1">Needs verification</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Integrity</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {reportData.totalOrders > 0 ? Math.round((reportData.approvedOrders / reportData.totalOrders) * 100) : 100}%
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Approval conversion rate</p>
        </div>
      </div>

      {/* Monthly Revenue Growth Trend - Line Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Recharts Analytics Engine
            </div>
            <h3 className="text-xl font-black text-slate-900 font-display">
              Monthly Revenue Growth Trends
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing monthly revenue trajectory computed in real-time from approved transaction records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Peak Month</span>
                <strong className="text-emerald-600 font-bold">{reportData.peakMonthLabel}</strong>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Peak Monthly Revenue</span>
                <strong className="text-slate-900 font-bold">{formatETB(reportData.maxMonthlyRevenue)}</strong>
              </div>
            </div>

            <button
              onClick={() => exportMonthlyInsightsPDF()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
              title="Download Monthly Revenue Growth Insights PDF Report"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Download Monthly Insights</span>
            </button>

            <button
              onClick={() => exportMonthlyReport('csv')}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Download Monthly Report CSV"
            >
              <Download className="w-4 h-4" />
              <span>Download Monthly Report</span>
            </button>
          </div>
        </div>

        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData.monthlyRevenueData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff'
                }}
                formatter={(value: number) => [formatETB(value), 'Monthly Revenue']}
                labelStyle={{ fontWeight: '800', color: '#0f172a', marginBottom: '4px', fontSize: '13px' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue (ETB)"
                stroke="#10B981" 
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 8, fill: '#059669', strokeWidth: 3, stroke: '#D1FAE5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Revenue Bar Chart with Peak Highlighting */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-1 border border-amber-200/60">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily Sales Peak Analytics</span>
              </div>
              <h4 className="font-display font-bold text-slate-900 text-lg">
                Daily Revenue Bar Chart
              </h4>
              <p className="text-xs text-slate-500">
                Daily revenue metrics with automatic sales peak highlight detection
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Peak Day: {reportData.peakDayName} ({formatETB(reportData.maxDailyRevenue)})</span>
              </div>
            </div>
          </div>

          {/* Color Legend Tags */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500"></span>
              <span>Sales Peak (Highest)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
              <span>High Volume (&gt;70%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-sky-500"></span>
              <span>Standard Daily Revenue</span>
            </span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.dailyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                  dy={8}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                  tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '10px 14px',
                    backgroundColor: '#ffffff'
                  }}
                  formatter={(value: number, _name: string, item: any) => [
                    `${formatETB(value)} ${item.payload.isPeak ? '🔥 (PEAK SALES)' : ''}`, 
                    'Daily Revenue'
                  ]}
                  labelStyle={{ fontWeight: '800', color: '#0f172a', marginBottom: '2px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {reportData.dailyRevenueData.map((entry, index) => (
                    <Cell 
                      key={`daily-bar-${index}`} 
                      fill={entry.isPeak ? '#F59E0B' : entry.isHighVolume ? '#10B981' : '#0EA5E9'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gateway Performance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-display font-bold text-slate-900">Payment Channel Volume</h4>
              <p className="text-xs text-slate-500">Distribution by gateway provider</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.gatewayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportData.gatewayData.map((entry, index) => (
                      <Cell key={`cell-\u0024{index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatETB(value), 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {reportData.gatewayData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-700 capitalize">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">{formatETB(item.value)}</span>
                </div>
              ))}
              {reportData.gatewayData.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center">No approved data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Efficiency */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-md">
            <h4 className="text-xl font-display font-bold">Operational Insight</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your business is seeing a processing efficiency of 
              <span className="text-sky-400 font-bold mx-1">
                {reportData.totalOrders > 0 ? Math.round((reportData.approvedOrders / reportData.totalOrders) * 100) : 100}%
              </span> 
              on submitted receipts. telebirr continues to be the preferred choice for 
              {reportData.gatewayData.find(g => g.name === 'telebirr') ? ' digital payments' : ' your customers'}.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                    User
                  </div>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">+ {reportData.totalOrders} total inquiries this month</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
              <span className="text-lg font-black">{reportData.approvedOrders}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Approved</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Clock className="w-6 h-6 text-amber-400 mb-2" />
              <span className="text-lg font-black">{reportData.pendingOrders}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pending</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
