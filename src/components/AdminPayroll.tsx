import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Calendar, FileText, Plus, Search, Filter, 
  Download, Printer, CheckCircle2, Clock, AlertCircle, Trash2, 
  Edit3, ShieldCheck, TrendingUp, Wallet, ArrowUpRight, Check, X
} from 'lucide-react';
import { PayrollRecord } from '../types';

const INITIAL_PAYROLL_DATA: PayrollRecord[] = [
  {
    id: 'PAY-2026-001',
    staffName: 'Jemal Ireso',
    role: 'Chief Systems Architect & IT Director',
    phone: '+251 995 852 194',
    baseSalary: 28500,
    bonus: 4000,
    taxDeduction: 4875,
    netPay: 27625,
    month: 'July 2026',
    paymentStatus: 'paid',
    paymentDate: '2026-07-25',
    paymentMethod: 'CBE Birr',
    notes: 'Includes performance bonus for Kore Town server deployment.'
  },
  {
    id: 'PAY-2026-002',
    staffName: 'Abel Tesfaye',
    role: 'Senior Hardware Diagnostics Specialist',
    phone: '+251 911 234 567',
    baseSalary: 18000,
    bonus: 2500,
    taxDeduction: 3075,
    netPay: 17425,
    month: 'July 2026',
    paymentStatus: 'paid',
    paymentDate: '2026-07-25',
    paymentMethod: 'telebirr',
    notes: 'On-time monthly salary disbursement.'
  },
  {
    id: 'PAY-2026-003',
    staffName: 'Meron Tadesse',
    role: 'Lead Graphic Designer & Publishing Spec.',
    phone: '+251 922 345 678',
    baseSalary: 16500,
    bonus: 1800,
    taxDeduction: 2745,
    netPay: 15555,
    month: 'July 2026',
    paymentStatus: 'paid',
    paymentDate: '2026-07-25',
    paymentMethod: 'CBE Birr',
    notes: 'Includes bonus for corporate brochure design projects.'
  },
  {
    id: 'PAY-2026-004',
    staffName: 'Samuel Bekele',
    role: 'Receptionist & Front-Desk Desk Officer',
    phone: '+251 933 456 789',
    baseSalary: 12000,
    bonus: 1000,
    taxDeduction: 1950,
    netPay: 11050,
    month: 'July 2026',
    paymentStatus: 'processing',
    paymentDate: '2026-07-26',
    paymentMethod: 'telebirr',
    notes: 'Approval pending at finance review desk.'
  },
  {
    id: 'PAY-2026-005',
    staffName: 'Hana Alemu',
    role: 'Short-Course IT Instructor & Mentor',
    phone: '+251 944 567 890',
    baseSalary: 15000,
    bonus: 2200,
    taxDeduction: 2580,
    netPay: 14620,
    month: 'July 2026',
    paymentStatus: 'pending',
    paymentDate: '2026-07-28',
    paymentMethod: 'Bank Transfer',
    notes: 'Scheduled for end of month disbursement.'
  }
];

export default function AdminPayroll() {
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('es_digital_payroll_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PAYROLL_DATA;
      }
    }
    return INITIAL_PAYROLL_DATA;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'paid' | 'pending' | 'processing'>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PayrollRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    staffName: '',
    role: 'Hardware Diagnostics Technician',
    phone: '',
    baseSalary: '',
    bonus: '0',
    taxDeduction: '',
    month: 'July 2026',
    paymentStatus: 'paid' as 'paid' | 'pending' | 'processing',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'telebirr' as 'telebirr' | 'CBE Birr' | 'Bank Transfer' | 'Cash',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('es_digital_payroll_v1', JSON.stringify(payrollList));
  }, [payrollList]);

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(amount);
  };

  // Helper for auto calculating income tax / pension (~15% default guidance)
  const handleCalculateTax = () => {
    const base = parseFloat(formData.baseSalary) || 0;
    const bon = parseFloat(formData.bonus) || 0;
    const gross = base + bon;
    // Standard approx Ethiopian progressive tax estimate for UI convenience (~15% avg)
    const estTax = Math.round(gross * 0.15);
    setFormData(prev => ({ ...prev, taxDeduction: estTax.toString() }));
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      staffName: '',
      role: 'Hardware Diagnostics Technician',
      phone: '',
      baseSalary: '15000',
      bonus: '0',
      taxDeduction: '2250',
      month: 'July 2026',
      paymentStatus: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'telebirr',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: PayrollRecord) => {
    setEditingItem(item);
    setFormData({
      staffName: item.staffName,
      role: item.role,
      phone: item.phone || '',
      baseSalary: item.baseSalary.toString(),
      bonus: item.bonus.toString(),
      taxDeduction: item.taxDeduction.toString(),
      month: item.month,
      paymentStatus: item.paymentStatus,
      paymentDate: item.paymentDate,
      paymentMethod: item.paymentMethod,
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const base = parseFloat(formData.baseSalary) || 0;
    const bon = parseFloat(formData.bonus) || 0;
    const tax = parseFloat(formData.taxDeduction) || 0;
    const net = Math.max(0, base + bon - tax);

    if (editingItem) {
      setPayrollList(prev => prev.map(p => {
        if (p.id === editingItem.id) {
          return {
            ...p,
            staffName: formData.staffName,
            role: formData.role,
            phone: formData.phone,
            baseSalary: base,
            bonus: bon,
            taxDeduction: tax,
            netPay: net,
            month: formData.month,
            paymentStatus: formData.paymentStatus,
            paymentDate: formData.paymentDate,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes
          };
        }
        return p;
      }));
    } else {
      const newId = `PAY-${new Date().getFullYear()}-${String(payrollList.length + 1).padStart(3, '0')}`;
      const newRecord: PayrollRecord = {
        id: newId,
        staffName: formData.staffName,
        role: formData.role,
        phone: formData.phone,
        baseSalary: base,
        bonus: bon,
        taxDeduction: tax,
        netPay: net,
        month: formData.month,
        paymentStatus: formData.paymentStatus,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };
      setPayrollList([newRecord, ...payrollList]);
    }

    setShowModal(false);
  };

  const handleDeleteRecord = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmId) return;
    setPayrollList(prev => prev.filter(p => p.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const handleToggleStatus = (id: string, currentStatus: PayrollRecord['paymentStatus']) => {
    const nextStatusMap: Record<PayrollRecord['paymentStatus'], PayrollRecord['paymentStatus']> = {
      pending: 'processing',
      processing: 'paid',
      paid: 'pending'
    };
    const next = nextStatusMap[currentStatus];
    setPayrollList(prev => prev.map(p => p.id === id ? { ...p, paymentStatus: next } : p));
  };

  // Filtered List
  const filteredList = payrollList.filter(item => {
    const matchesSearch = item.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === 'All' || item.month === selectedMonth;
    const matchesStatus = selectedStatus === 'All' || item.paymentStatus === selectedStatus;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  // KPI Calculations
  const totalNetPay = filteredList.reduce((acc, p) => acc + p.netPay, 0);
  const totalBaseSalary = filteredList.reduce((acc, p) => acc + p.baseSalary, 0);
  const totalBonuses = filteredList.reduce((acc, p) => acc + p.bonus, 0);
  const totalTaxes = filteredList.reduce((acc, p) => acc + p.taxDeduction, 0);
  const paidCount = filteredList.filter(p => p.paymentStatus === 'paid').length;

  // Print Payslip PDF for single staff
  const handlePrintPayslip = (record: PayrollRecord) => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      alert('Please allow popups to print official staff payslips.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Payslip - ${record.staffName} (${record.month})</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; }
            .header { border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 22px; font-weight: 900; color: #0284c7; }
            .subtitle { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
            .val { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
            th { background: #0f172a; color: white; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .net-row { font-size: 16px; font-weight: 900; background: #f0fdf4; color: #166534; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
            @media print { .no-print { display: none; } body { margin: 15px; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 15px;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print Official Payslip</button>
          </div>

          <div class="header">
            <div>
              <div class="subtitle">IresoJ Digital CSC Computer Services — Payroll Department</div>
              <div class="title">Staff Salary Advice & Payslip</div>
            </div>
            <div style="text-align: right; font-size: 11px;">
              <strong>Payslip Ref:</strong> ${record.id}<br>
              <strong>Pay Period:</strong> ${record.month}
            </div>
          </div>

          <div class="box">
            <div class="grid-2">
              <div>
                <div class="label">Employee Name</div>
                <div class="val">${record.staffName}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Phone: ${record.phone || 'N/A'}</div>
              </div>
              <div>
                <div class="label">Job Position / Role</div>
                <div class="val">${record.role}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Disbursement Channel: ${record.paymentMethod}</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Earnings & Deductions Item</th>
                <th style="text-align: right;">Amount (ETB)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Base Salary</td>
                <td style="text-align: right; font-weight: bold;">${formatETB(record.baseSalary)}</td>
              </tr>
              <tr>
                <td>Performance & Incentive Bonus</td>
                <td style="text-align: right; font-weight: bold; color: #16a34a;">+ ${formatETB(record.bonus)}</td>
              </tr>
              <tr>
                <td>Statutory Income Tax & Pension Withheld</td>
                <td style="text-align: right; font-weight: bold; color: #dc2626;">- ${formatETB(record.taxDeduction)}</td>
              </tr>
              <tr class="net-row">
                <td>TOTAL NET DISBURSED PAY</td>
                <td style="text-align: right;">${formatETB(record.netPay)}</td>
              </tr>
            </tbody>
          </table>

          <div class="box" style="font-size: 11px;">
            <strong>Payment Status:</strong> ${record.paymentStatus.toUpperCase()} (Date: ${record.paymentDate})<br>
            <strong>Note / Remarks:</strong> ${record.notes || 'Standard monthly staff salary processing.'}
          </div>

          <div class="footer">
            <div>IresoJ Digital CSC Computer Services • Confidential Payroll Copy</div>
            <div>Authorized Finance Manager Signature: _______________________</div>
          </div>

          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 400); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export Full Formatted Monthly Salary & Bonus PDF Report
  const handleDownloadFullPayrollPDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      alert('Please allow popups to open and print the monthly staff payroll PDF report.');
      return;
    }

    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const periodLabel = selectedMonth === 'All' ? 'All Recorded Periods' : selectedMonth;

    const rowsHtml = filteredList.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px; font-weight: 700;">${item.id}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #0f172a; display: block; font-size: 12px;">${item.staffName}</strong>
          <span style="color: #64748b; font-size: 10px;">${item.role}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #334155;">${item.month}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 700; color: #0284c7;">${formatETB(item.baseSalary)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 800; color: #10b981;">+${formatETB(item.bonus)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #ef4444;">-${formatETB(item.taxDeduction)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 900; color: #0f172a; font-size: 13px; background-color: #f8fafc;">${formatETB(item.netPay)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: ${item.paymentStatus === 'paid' ? '#dcfce7' : item.paymentStatus === 'processing' ? '#fef3c7' : '#fee2e2'}; color: ${item.paymentStatus === 'paid' ? '#15803d' : item.paymentStatus === 'processing' ? '#b45309' : '#b91c1c'};">
            ${item.paymentStatus}
          </span>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${item.paymentMethod}</div>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Staff Salary & Bonus Payroll Report - IresoJ Digital CSC</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; background: #ffffff; }
            .header { border-bottom: 4px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #0284c7; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
            .kpi-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800; }
            .kpi-val { font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
            th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            .notes-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 12px; font-size: 11px; color: #0369a1; margin-bottom: 25px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; align-items: center; }
            .sign-space { border-top: 2px solid #94a3b8; width: 220px; text-align: center; padding-top: 6px; font-weight: 700; color: #334155; }
            @media print { .no-print { display: none !important; } body { margin: 15px; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer; shadow: 0 4px 6px rgba(0,0,0,0.1);">🖨️ Print / Download Payroll PDF</button>
          </div>

          <div class="header">
            <div>
              <div class="subtitle">IresoJ Digital CSC Computer Services • Human Capital Management</div>
              <div class="title">Monthly Staff Salary & Bonus Payroll Audit Report</div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">Kore Town Center, West Arsi, Oromia, Ethiopia</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <strong>Report Generated:</strong> ${reportDate}<br>
              <strong>Selected Period:</strong> ${periodLabel}<br>
              <strong>Staff Records:</strong> ${filteredList.length} Employees
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Total Net Salary Disbursed</div>
              <div class="kpi-val" style="color: #0284c7;">${formatETB(totalNetPay)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Base Salaries</div>
              <div class="kpi-val">${formatETB(totalBaseSalary)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Performance Bonuses</div>
              <div class="kpi-val" style="color: #10b981;">${formatETB(totalBonuses)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Statutory Tax & Pension</div>
              <div class="kpi-val" style="color: #ef4444;">${formatETB(totalTaxes)}</div>
            </div>
          </div>

          <div class="notes-box">
            <strong>📋 Payroll Audit Summary Notes:</strong><br>
            This official document outlines the monthly salary payments, performance incentive bonuses, statutory tax withholdings, and net payable disbursements for IresoJ Digital CSC staff. Verified under local labor compliance guidelines.
          </div>

          <table>
            <thead>
              <tr>
                <th>Ref ID</th>
                <th>Staff Name & Position</th>
                <th>Period</th>
                <th>Base Salary</th>
                <th>Bonus Data</th>
                <th>Tax / Deduct.</th>
                <th>Net Payable</th>
                <th>Status & Method</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="8" style="padding: 15px; text-align: center; color: #94a3b8;">No staff payroll records match selected filter.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <div>
              <strong>IresoJ Digital CSC Computer Services</strong><br>
              Human Resources & Financial Accounting Desk • Kore Town<br>
              Confidential Payroll Audit Copy
            </div>
            <div class="sign-space">
              Authorized Finance Director Signature<br>
              <span style="font-size: 9px; font-weight: normal; color: #64748b;">Date: ________________________</span>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export Full CSV
  const handleExportCSV = () => {
    const headers = ['Payroll ID', 'Staff Name', 'Role', 'Contact Phone', 'Base Salary (ETB)', 'Bonus (ETB)', 'Tax Deduction (ETB)', 'Net Pay (ETB)', 'Period', 'Status', 'Payment Method', 'Payment Date', 'Notes'];
    const rows = filteredList.map(item => [
      item.id,
      item.staffName,
      item.role,
      item.phone || '',
      item.baseSalary,
      item.bonus,
      item.taxDeduction,
      item.netPay,
      item.month,
      item.paymentStatus,
      item.paymentMethod,
      item.paymentDate,
      item.notes || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IresoJ_Digital_Staff_Payroll_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 text-[#0EA5E9] px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5" />
            Human Capital Finance Desk
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-display">
            Staff Payroll & Salary Management
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Track monthly staff salaries, bonus incentives, statutory tax/pension withholdings, and disburse digital payslips.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadFullPayrollPDF}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-indigo-100 cursor-pointer active:scale-95"
            title="Download Formatted Monthly Salary & Bonus PDF Report"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
            title="Download CSV Audit Spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-sky-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Disburse / Add Salary</span>
          </button>
        </div>
      </div>

      {/* Primary Payroll KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Disbursed Net Pay</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatETB(totalNetPay)}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {paidCount} of {filteredList.length} team members paid
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Gross Base Salaries</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatETB(totalBaseSalary)}
          </div>
          <p className="text-[11px] text-slate-500">Contractual fixed compensation</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Bonus & Incentives</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-600">
            +{formatETB(totalBonuses)}
          </div>
          <p className="text-[11px] text-slate-500">Overtime & performance awards</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Tax & Pension Deductions</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-red-600">
            -{formatETB(totalTaxes)}
          </div>
          <p className="text-[11px] text-slate-500">Withheld for tax compliance</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff name, position, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#0EA5E9]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0EA5E9]"
            >
              <option value="All">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0EA5E9]"
            >
              <option value="All">All Months</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
              <option value="May 2026">May 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                <th className="p-4 pl-6">Ref ID / Period</th>
                <th className="p-4">Staff Member & Role</th>
                <th className="p-4">Base Salary</th>
                <th className="p-4">Bonus</th>
                <th className="p-4">Tax / Pension</th>
                <th className="p-4">Net Disbursed</th>
                <th className="p-4">Method & Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 font-medium">
                    No payroll records match your current filter query.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-900">
                      <div>{item.id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.month}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.staffName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{item.role}</div>
                      {item.phone && <div className="text-[10px] text-slate-400">{item.phone}</div>}
                    </td>

                    <td className="p-4 font-mono font-semibold text-slate-800">
                      {formatETB(item.baseSalary)}
                    </td>

                    <td className="p-4 font-mono font-semibold text-emerald-600">
                      +{formatETB(item.bonus)}
                    </td>

                    <td className="p-4 font-mono font-semibold text-red-500">
                      -{formatETB(item.taxDeduction)}
                    </td>

                    <td className="p-4 font-mono font-black text-slate-900 text-sm">
                      {formatETB(item.netPay)}
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{item.paymentMethod}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.paymentDate}</div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(item.id, item.paymentStatus)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                          item.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : item.paymentStatus === 'processing'
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status (Paid -> Pending -> Processing)"
                      >
                        {item.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {item.paymentStatus === 'processing' && <Clock className="w-3 h-3 text-amber-600" />}
                        {item.paymentStatus === 'pending' && <AlertCircle className="w-3 h-3 text-slate-500" />}
                        <span>{item.paymentStatus}</span>
                      </button>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePrintPayslip(item)}
                          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                          title="Print Staff Payslip PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          title="Edit Payroll Entry"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Payroll Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-display">
                  {editingItem ? 'Edit Staff Payroll Record' : 'Process Salary Disbursement'}
                </h3>
                <p className="text-xs text-slate-500">Record base salary, bonus incentives & statutory deductions</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  Staff Member Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jemal Ireso"
                  value={formData.staffName}
                  onChange={(e) => setFormData(prev => ({ ...prev, staffName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Role / Position *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Technician"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +251 995 852 194"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-1">
                    Base Salary (ETB) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="15000"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-1">
                    Bonus / Award
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.bonus}
                    onChange={(e) => setFormData(prev => ({ ...prev, bonus: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 uppercase text-[9px] tracking-wider">
                      Tax / Pension
                    </label>
                    <button
                      type="button"
                      onClick={handleCalculateTax}
                      className="text-[9px] text-[#0EA5E9] font-bold hover:underline"
                    >
                      ~15% Est
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="2250"
                    value={formData.taxDeduction}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxDeduction: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9] font-mono font-bold text-red-500"
                  />
                </div>
              </div>

              {/* Net Pay Preview Card */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Calculated Net Payable</span>
                  <p className="text-xs text-emerald-600">(Base + Bonus - Tax)</p>
                </div>
                <div className="text-xl font-black font-mono text-emerald-700">
                  {formatETB(Math.max(0, (parseFloat(formData.baseSalary) || 0) + (parseFloat(formData.bonus) || 0) - (parseFloat(formData.taxDeduction) || 0)))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Pay Period / Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
                  >
                    <option value="July 2026">July 2026</option>
                    <option value="August 2026">August 2026</option>
                    <option value="June 2026">June 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Disbursement Channel
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
                  >
                    <option value="telebirr">telebirr</option>
                    <option value="CBE Birr">CBE Birr</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Disbursement Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
                  >
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  Notes / Audit Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Overtime for emergency diagnostic work."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0EA5E9]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black rounded-xl shadow-md shadow-sky-100"
                >
                  {editingItem ? 'Update Record' : 'Disburse Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Are you sure you want to delete this staff payroll record? This action is permanent and cannot be undone. Please confirm to proceed.
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
