import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, Info, AlertTriangle, AlertOctagon, Search, RefreshCw, Globe, Printer, Filter, XCircle } from 'lucide-react';
import { SecurityLog } from '../types';

interface AdminSecurityLogsProps {
  token: string;
}

export default function AdminSecurityLogs({ token }: AdminSecurityLogsProps) {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const uniqueUsers = Array.from(new Set(logs.map(l => l.adminUser).filter(Boolean)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ip && log.ip.includes(searchTerm));

    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesUser = userFilter === 'all' || log.adminUser === userFilter;

    let matchesDate = true;
    if (dateRangeFilter !== 'all') {
      const logDate = new Date(log.timestamp).getTime();
      const now = new Date().getTime();
      if (dateRangeFilter === 'today') {
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        matchesDate = logDate >= startOfToday;
      } else if (dateRangeFilter === '7days') {
        matchesDate = logDate >= now - (7 * 24 * 60 * 60 * 1000);
      } else if (dateRangeFilter === '30days') {
        matchesDate = logDate >= now - (30 * 24 * 60 * 60 * 1000);
      }
    }

    return matchesSearch && matchesSeverity && matchesUser && matchesDate;
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setSeverityFilter('all');
    setDateRangeFilter('all');
    setUserFilter('all');
  };

  const exportLogsPDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      alert('Please allow popups to open and print the Security Audit PDF.');
      return;
    }

    const now = new Date();
    const criticalCount = filteredLogs.filter(l => l.severity === 'critical').length;
    const warningCount = filteredLogs.filter(l => l.severity === 'warning').length;
    const infoCount = filteredLogs.filter(l => l.severity === 'info').length;

    const logRowsHtml = filteredLogs.map((log) => {
      let sevBg = '#eff6ff';
      let sevColor = '#1d4ed8';
      if (log.severity === 'warning') {
        sevBg = '#fef3c7';
        sevColor = '#b45309';
      } else if (log.severity === 'critical') {
        sevBg = '#fee2e2';
        sevColor = '#b91c1c';
      }

      return `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 10px;">${log.id}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${new Date(log.timestamp).toLocaleString()}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${log.adminUser}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 10px;">${log.ip || 'N/A'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; text-transform: uppercase;">${log.action}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">
            <span style="padding: 2px 6px; background: ${sevBg}; color: ${sevColor}; border-radius: 4px; font-weight: bold; font-size: 9px; text-transform: uppercase;">${log.severity}</span>
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${log.details}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Security Audit Logs Compliance Report - ES Digital</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; }
            .header { border-bottom: 3px solid #312e81; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 20px; font-weight: 900; color: #312e81; }
            .subtitle { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .confidential-tag { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; display: inline-block; margin-bottom: 15px; text-transform: uppercase; }
            .kpi-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .kpi-label { font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; }
            .kpi-val { font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
            th { background: #0f172a; color: white; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
            @media print {
              .no-print { display: none; }
              body { margin: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; text-align: right;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #312e81; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
          </div>
          
          <div class="header">
            <div>
              <div class="subtitle">ES Digital Computer Services — Security & Access Compliance</div>
              <div class="title">Administrative Security Audit Log Report</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <strong>Generated:</strong> ${now.toLocaleString()}<br>
              <strong>Ref ID:</strong> AUDIT-PDF-${now.getTime().toString().slice(-6)}
            </div>
          </div>

          <div class="confidential-tag">
            CONFIDENTIAL • SYSTEM AUDIT REVIEW FOR ADMINISTRATIVE COMPLIANCE
          </div>

          <div class="kpi-container">
            <div class="kpi-card">
              <div class="kpi-label">Total Logs Exported</div>
              <div class="kpi-val">${filteredLogs.length}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Critical Security Events</div>
              <div class="kpi-val" style="color: #dc2626;">${criticalCount}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Warning Alerts</div>
              <div class="kpi-val" style="color: #d97706;">${warningCount}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Informational Actions</div>
              <div class="kpi-val" style="color: #2563eb;">${infoCount}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Admin User</th>
                <th>IP Address</th>
                <th>Action</th>
                <th>Severity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${logRowsHtml || '<tr><td colspan="7" style="padding:15px; text-align:center; color:#94a3b8;">No security logs available for export.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <div>ES Digital Computer Services • Security & Compliance Audit Log Archive</div>
            <div>Auditor / IT Security Officer Signature: _______________________</div>
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
  };

  const getSeverityIcon = (severity: SecurityLog['severity']) => {
    switch (severity) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'critical': return <AlertOctagon className="w-4 h-4 text-red-500" />;
    }
  };

  const getSeverityClass = (severity: SecurityLog['severity']) => {
    switch (severity) {
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'critical': return 'bg-red-50 text-red-700 border-red-100 font-bold';
    }
  };

  const isFilterActive = searchTerm !== '' || severityFilter !== 'all' || dateRangeFilter !== 'all' || userFilter !== 'all';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Security & Administrative Audit Logs
          </h2>
          <p className="text-sm text-slate-500">Audit trail of all sensitive database and system actions for compliance review.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportLogsPDF}
            disabled={loading || filteredLogs.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Export Security Access Logs into a PDF report for compliance review"
          >
            <Printer className="w-4 h-4 text-indigo-200" />
            <span>Export Security PDF</span>
          </button>

          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Audit Trail
          </button>
        </div>
      </div>

      {/* Advanced Filter Interface */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Detailed Filter & Audit Controls</span>
          </div>
          {isFilterActive && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Term */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search action, detail, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Severity: All Levels</option>
              <option value="info">Info Only</option>
              <option value="warning">Warning Only</option>
              <option value="critical">Critical Only</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Time Period: All History</option>
              <option value="today">Today's Logs</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Admin Operator: All</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Stats */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
          <div>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> security events
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <Info className="w-3.5 h-3.5" /> Info: {filteredLogs.filter(l => l.severity === 'info').length}
            </span>
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" /> Warning: {filteredLogs.filter(l => l.severity === 'warning').length}
            </span>
            <span className="flex items-center gap-1 text-red-600 font-bold">
              <AlertOctagon className="w-3.5 h-3.5" /> Critical: {filteredLogs.filter(l => l.severity === 'critical').length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-4">
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-slate-200 animate-spin mx-auto" />
              <p className="text-slate-400 font-medium italic">Fetching encrypted logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-2xl space-y-2">
              <Shield className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-500 font-bold text-sm">No security events match your filter criteria.</p>
              {isFilterActive && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-indigo-600 underline font-bold cursor-pointer"
                >
                  Clear filters to view all audit entries
                </button>
              )}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-xl border ${getSeverityClass(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.action}</h4>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{log.severity}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <User className="w-3 h-3" /> {log.adminUser}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <Globe className="w-3 h-3" /> {log.ip || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-center md:items-end gap-2 text-[10px] text-slate-300 font-mono">
                    ID: {log.id.split('_').pop()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
