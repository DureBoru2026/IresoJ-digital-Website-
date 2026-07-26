import React, { useState, useMemo } from 'react';
import { 
  Percent, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Layers, 
  CheckCircle2, 
  Download, 
  Search, 
  Filter, 
  ExternalLink, 
  Users, 
  Building2, 
  ArrowUpRight,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Transaction } from '../types';
import { formatETB } from '../utils';

interface AdminCommissionProps {
  transactions: Transaction[];
}

interface SourceWorkPartner {
  id: string;
  title: string;
  category: string;
  creatorName: string;
  salesVolume: number;
  commissionRate: number; // 2%
  commissionEarned: number;
  transactionCount: number;
  payoutStatus: 'Paid' | 'Pending Payout';
}

export default function AdminCommission({ transactions = [] }: AdminCommissionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('approved');

  // Filter approved transactions
  const filteredTx = useMemo(() => {
    return transactions.filter(tx => {
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchesSearch = tx.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [transactions, statusFilter, searchTerm]);

  // Aggregate Commission Analytics grouped by "Source Works"
  const partnerAnalytics = useMemo(() => {
    // Standard Source Works Partner Catalog
    const map: Record<string, SourceWorkPartner> = {
      'login_auth': {
        id: 'sw_1',
        title: 'Full-Stack React & Express Website Login Architecture',
        category: 'Website Login Prep',
        creatorName: 'ES Digital Tech Team',
        salesVolume: 0,
        commissionRate: 0.02,
        commissionEarned: 0,
        transactionCount: 0,
        payoutStatus: 'Pending Payout'
      },
      'educational_book': {
        id: 'sw_2',
        title: 'Web Development & Modern Agriculture Tech Guide (Book)',
        category: 'Educational Book',
        creatorName: 'Dure Boru Academy',
        salesVolume: 0,
        commissionRate: 0.02,
        commissionEarned: 0,
        transactionCount: 0,
        payoutStatus: 'Paid'
      },
      'design_template': {
        id: 'sw_3',
        title: 'High-Converting UI/UX Design System Template',
        category: 'Design Template',
        creatorName: 'Kore Tech Creator',
        salesVolume: 0,
        commissionRate: 0.02,
        commissionEarned: 0,
        transactionCount: 0,
        payoutStatus: 'Pending Payout'
      },
      'project_structure': {
        id: 'sw_4',
        title: 'Production E-Commerce & Service Booking Project Structure',
        category: 'Project Structure',
        creatorName: 'Alex Dev',
        salesVolume: 0,
        commissionRate: 0.02,
        commissionEarned: 0,
        transactionCount: 0,
        payoutStatus: 'Paid'
      },
      'general_digital': {
        id: 'sw_5',
        title: 'General Digital Assets & Media Marketplace',
        category: 'Digital Store',
        creatorName: 'Community Partner',
        salesVolume: 0,
        commissionRate: 0.02,
        commissionEarned: 0,
        transactionCount: 0,
        payoutStatus: 'Pending Payout'
      }
    };

    // Calculate actual volume & commission from live transaction ledger
    transactions.filter(tx => tx.status === 'approved').forEach(tx => {
      const lowerPurpose = tx.purpose.toLowerCase();
      let key = 'general_digital';

      if (lowerPurpose.includes('login') || lowerPurpose.includes('auth')) {
        key = 'login_auth';
      } else if (lowerPurpose.includes('book') || lowerPurpose.includes('guide') || lowerPurpose.includes('training')) {
        key = 'educational_book';
      } else if (lowerPurpose.includes('template') || lowerPurpose.includes('design') || lowerPurpose.includes('print')) {
        key = 'design_template';
      } else if (lowerPurpose.includes('structure') || lowerPurpose.includes('code') || lowerPurpose.includes('service') || lowerPurpose.includes('maintenance')) {
        key = 'project_structure';
      }

      map[key].salesVolume += tx.amount;
      map[key].transactionCount += 1;
      map[key].commissionEarned += tx.amount * 0.02;
    });

    return Object.values(map);
  }, [transactions]);

  // Overall totals
  const totalSalesVolume = useMemo(() => {
    return transactions.filter(tx => tx.status === 'approved').reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const total2PercentCommission = useMemo(() => {
    return totalSalesVolume * 0.02;
  }, [totalSalesVolume]);

  const exportCommissionCSV = () => {
    const headers = ['Partner Project', 'Category', 'Creator Name', 'Sales Volume (ETB)', 'Commission Rate', '2% Commission (ETB)', 'Total Tx Count', 'Payout Status'];
    const rows = partnerAnalytics.map(p => [
      p.title,
      p.category,
      p.creatorName,
      p.salesVolume,
      '2%',
      p.commissionEarned.toFixed(2),
      p.transactionCount,
      p.payoutStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Commission_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-300 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
              <Percent className="w-3.5 h-3.5" />
              Source Works Partner Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-950">
              Commission Analytics (2% Partner Program)
            </h2>
            <p className="text-xs text-slate-900 font-medium max-w-2xl mt-1">
              Real-time calculation of 2% partner referral commission for all published source products, design templates, educational books, and project structures.
            </p>
          </div>

          <button
            onClick={exportCommissionCSV}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Sales Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{formatETB(totalSalesVolume)}</h3>
          <p className="text-[11px] text-slate-500">Gross approved transactions</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-900 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total 2% Commission Pool</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-black text-amber-300">{formatETB(total2PercentCommission)}</h3>
          <p className="text-[11px] text-slate-400">Allocated to source work partners</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Active Partner Projects</span>
            <Layers className="w-4 h-4 text-sky-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{partnerAnalytics.length}</h3>
          <p className="text-[11px] text-slate-500">Source works earning commission</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Settled Transactions</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {transactions.filter(t => t.status === 'approved').length}
          </h3>
          <p className="text-[11px] text-slate-500">Approved customer purchases</p>
        </div>
      </div>

      {/* Partner Projects Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 font-display">Source Works Partner Breakdown</h3>
            <p className="text-xs text-slate-500">Commission earnings per individual project template and educational resource</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search partner work..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 w-full sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="p-3.5 pl-4 rounded-l-xl">Source Project Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Creator Name</th>
                <th className="p-3.5">Total Sales Volume</th>
                <th className="p-3.5">Rate</th>
                <th className="p-3.5 text-amber-600">2% Commission Earned</th>
                <th className="p-3.5">Tx Count</th>
                <th className="p-3.5 pr-4 rounded-r-xl">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {partnerAnalytics.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-4 font-black text-slate-900 max-w-xs truncate">
                    {partner.title}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">
                      {partner.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-700">{partner.creatorName}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">
                    {formatETB(partner.salesVolume)}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-600">2%</td>
                  <td className="p-3.5 font-mono font-black text-amber-700 bg-amber-50/50">
                    {formatETB(partner.commissionEarned)}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">{partner.transactionCount}</td>
                  <td className="p-3.5 pr-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      partner.payoutStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {partner.payoutStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Transaction Ledger with 2% Commission Calculation */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 font-display">Settled Transactions 2% Commission Audit</h3>
            <p className="text-xs text-slate-500">Per-transaction breakdown of customer payment and corresponding 2% partner commission</p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-xl text-slate-700">
            {filteredTx.length} Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="p-3 pl-4">Ref Code</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Purpose / Item</th>
                <th className="p-3">Gateway</th>
                <th className="p-3">Gross Amount</th>
                <th className="p-3 text-amber-600">2% Partner Share</th>
                <th className="p-3 pr-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => {
                  const comm = tx.amount * 0.02;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 pl-4 font-mono font-bold text-sky-600">{tx.referenceNumber}</td>
                      <td className="p-3 font-bold text-slate-800">{tx.customerName}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{tx.purpose}</td>
                      <td className="p-3 font-mono text-slate-500">{tx.paymentGateway}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{formatETB(tx.amount)}</td>
                      <td className="p-3 font-mono font-black text-amber-700 bg-amber-50/50">
                        {formatETB(comm)}
                      </td>
                      <td className="p-3 pr-4 font-mono text-slate-400 text-[11px]">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
