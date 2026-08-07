import React, { useState } from 'react';
import { Check, X, Search, Filter, MessageSquare, RefreshCw, Smartphone, CreditCard, ShieldCheck, Download, Clock3, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Transaction } from '../types';
import { formatETB } from '../utils';

interface AdminPaymentsProps {
  transactions: Transaction[];
  onUpdateStatus: (id: string, status: 'approved' | 'rejected', notes?: string) => Promise<boolean>;
  onRefresh: () => void;
}

export default function AdminPayments({ transactions, onUpdateStatus, onRefresh }: AdminPaymentsProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGateway, setFilterGateway] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [noteInputs, setNoteInputs] = useState<{ [id: string]: string }>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleSort = (field: 'date' | 'amount' | 'status') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setLoadingId(id);
    const notes = noteInputs[id] || '';
    try {
      const success = await onUpdateStatus(id, status, notes);
      if (success) {
        // Clear note input on success
        setNoteInputs(prev => ({ ...prev, [id]: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesGateway = filterGateway === 'all' || t.paymentGateway === filterGateway;
    const matchesSearch = 
      t.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesGateway && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      comparison = timeA - timeB;
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Date,Reference Number,Gateway,Customer Name,Phone,Purpose,Amount,Status,Notes\n';
    const rows = filteredTransactions.map(tx => {
      const escapedNotes = tx.notes ? tx.notes.replace(/"/g, '""') : '';
      const escapedPurpose = tx.purpose.replace(/"/g, '""');
      return `"${tx.id}","${new Date(tx.date).toISOString()}","${tx.referenceNumber}","${tx.paymentGateway}","${tx.customerName}","${tx.customerPhone || ''}","${escapedPurpose}",${tx.amount},"${tx.status}","${escapedNotes}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `es_digital_reconciliation_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-payments-subtab" className="space-y-6">
      
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">
            Payment Reconciliation (telebirr / CBE Birr)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review customer transaction reference numbers. Check with your mobile banking SMS notifications, then Approve/Reject to fulfill orders.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex-1 sm:flex-initial px-3.5 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filteredTransactions.length})</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by Ref No, Customer Name, or Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="approved">Approved / Confirmed</option>
            <option value="rejected">Rejected / Invalid</option>
          </select>
        </div>

        {/* Gateway Filter */}
        <div>
          <select
            value={filterGateway}
            onChange={(e) => setFilterGateway(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="all">All Payment Gateways</option>
            <option value="telebirr">telebirr logs</option>
            <option value="CBE Birr">CBE Birr logs</option>
          </select>
        </div>

      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th 
                  onClick={() => toggleSort('date')}
                  className="p-4 pl-6 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Receipt / Ref Code (Date)</span>
                    {sortBy === 'date' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#0EA5E9]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Purchased Purpose</th>
                <th 
                  onClick={() => toggleSort('amount')}
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Amount</span>
                    {sortBy === 'amount' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#0EA5E9]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('status')}
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Verification Status</span>
                    {sortBy === 'status' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#0EA5E9]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="p-4 pr-6 text-right">Actions / Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No transactions found matching the active filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPending = tx.status === 'pending';
                  const isApproved = tx.status === 'approved';
                  const isRejected = tx.status === 'rejected';

                  return (
                    <tr key={tx.id} className={`hover:bg-slate-50/50 transition-colors ${isPending ? 'bg-amber-50/15' : ''}`}>
                      
                      {/* Gateway / Ref */}
                      <td className="p-4 pl-6 shrink-0">
                        <div className="flex items-center space-x-2.5">
                          {tx.paymentGateway === 'telebirr' ? (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600" title="telebirr Gateway">
                              <Smartphone className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600" title="CBE Birr Gateway">
                              <CreditCard className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-mono font-bold text-slate-900 block tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded text-xs">
                              {tx.referenceNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              {new Date(tx.date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{tx.customerName}</span>
                        <span className="text-xs text-slate-500 font-mono">{tx.customerPhone || 'No Phone'}</span>
                      </td>

                      {/* Product Purpose */}
                      <td className="p-4">
                        <span className="font-semibold block max-w-xs truncate" title={tx.purpose}>
                          {tx.purpose}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="p-4 font-mono">
                        <span className="font-bold text-slate-900">{formatETB(tx.amount)}</span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm animate-pulse whitespace-nowrap">
                            <Clock3 className="w-3 h-3" />
                            <span>Pending Pay</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified & Paid</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm whitespace-nowrap">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}

                        {tx.notes && (
                          <div className="text-[10px] text-slate-400 italic max-w-[180px] mt-2 flex items-start gap-1 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                            <MessageSquare className="w-2.5 h-2.5 text-slate-300 shrink-0 mt-0.5" />
                            <span className="truncate" title={tx.notes}>{tx.notes}</span>
                          </div>
                        )}
                      </td>

                      {/* Action verification */}
                      <td className="p-4 pr-6 text-right">
                        {isPending ? (
                          <div className="flex flex-col items-end space-y-1.5">
                            {/* Input for admin note */}
                            <input
                              type="text"
                              placeholder="Add validation note (e.g. key code or pickup note)"
                              value={noteInputs[tx.id] || ''}
                              onChange={(e) => setNoteInputs(prev => ({ ...prev, [tx.id]: e.target.value }))}
                              className="text-[10px] px-2 py-1 border border-slate-200 rounded focus:outline-none w-48 focus:border-blue-500 bg-slate-50"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdate(tx.id, 'rejected')}
                                disabled={loadingId === tx.id}
                                className="px-2.5 py-1 border border-red-200 hover:bg-red-50 text-red-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleUpdate(tx.id, 'approved')}
                                disabled={loadingId === tx.id}
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">Closed</span>
                        )}
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
