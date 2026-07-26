import React, { useMemo } from 'react';
import { 
  Activity, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Clock, 
  ArrowUpRight, 
  CheckCircle, 
  AlertCircle,
  Package,
  ArrowRight,
  TrendingUp,
  BarChart as BarChartIcon,
  PackagePlus,
  Megaphone,
  CalendarPlus,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Booking, Transaction, Feedback } from '../types';
import { formatETB } from '../utils';
import RecentActivityFeed from './RecentActivityFeed';
import AdminFailedLoginAlerts from './AdminFailedLoginAlerts';

interface AdminDashboardProps {
  bookings: Booking[];
  transactions: Transaction[];
  feedback: Feedback[];
  onSetTab: (tab: any) => void;
}

const CHART_COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard({ bookings, transactions, feedback, onSetTab }: AdminDashboardProps) {
  
  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const todayBookings = bookings.filter(b => b.date === today);
    const todayTransactions = transactions.filter(tx => tx.date.split('T')[0] === today && tx.status === 'approved');
    const todayFeedback = feedback.filter(f => f.date.split('T')[0] === today);

    const totalRevenueToday = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Prepare Daily Trend Data (Last 7 Days)
    const dailyTrend: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => dailyTrend[date] = 0);
    
    transactions.filter(tx => tx.status === 'approved').forEach(tx => {
      const date = tx.date.split('T')[0];
      if (dailyTrend[date] !== undefined) {
        dailyTrend[date] += tx.amount;
      }
    });

    const trendData = last7Days.map(date => ({
      name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      revenue: dailyTrend[date]
    }));

    // Gateway Summary Data
    const gatewayStats: Record<string, number> = {};
    transactions.filter(tx => tx.status === 'approved' && tx.date.split('T')[0] === today).forEach(tx => {
      gatewayStats[tx.paymentGateway] = (gatewayStats[tx.paymentGateway] || 0) + tx.amount;
    });

    const gatewayData = Object.entries(gatewayStats).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount: value
    }));

    return {
      todayBookingsCount: todayBookings.length,
      todayRevenue: totalRevenueToday,
      todayFeedbackCount: todayFeedback.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      pendingTransactions: transactions.filter(tx => tx.status === 'pending').length,
      unreadFeedback: feedback.filter(f => f.status === 'unread').length,
      trendData,
      gatewayData
    };
  }, [bookings, transactions, feedback, today]);

  const recentActivity = useMemo(() => {
    const activities: any[] = [];

    bookings.forEach(b => {
      activities.push({
        id: `booking-${b.id}`,
        type: 'booking',
        title: 'New Service Booking',
        description: `${b.customerName} booked ${b.serviceTitle}`,
        time: b.date,
        status: b.status,
        icon: <Calendar className="w-4 h-4 text-sky-500" />
      });
    });

    transactions.forEach(tx => {
      activities.push({
        id: `tx-${tx.id}`,
        type: 'transaction',
        title: 'Payment Received',
        description: `${tx.customerName} submitted ${formatETB(tx.amount)} via ${tx.paymentGateway}`,
        time: tx.date,
        status: tx.status,
        icon: <DollarSign className="w-4 h-4 text-emerald-500" />
      });
    });

    feedback.forEach(f => {
      activities.push({
        id: `fb-${f.id}`,
        type: 'feedback',
        title: 'New Customer Feedback',
        description: `${f.name}: "${f.message.substring(0, 50)}${f.message.length > 50 ? '...' : ''}"`,
        time: f.date,
        status: f.status,
        icon: <MessageSquare className="w-4 h-4 text-amber-500" />
      });
    });

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  }, [bookings, transactions, feedback]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Daily Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-display">Command Center</h2>
          <p className="text-sm text-slate-500">Real-time business intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-display text-white flex items-center gap-2">
                Quick Actions
                <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full uppercase">
                  1-Click Workflow
                </span>
              </h3>
              <p className="text-xs text-slate-400">Fast shortcuts for high-frequency store management tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">ES Digital Staff Authenticated</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onSetTab('products')}
            className="flex items-center gap-3.5 p-4 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 rounded-2xl transition-all cursor-pointer group text-left shadow-xs"
          >
            <div className="p-3 bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 rounded-xl transition-colors">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-sky-300 transition-colors block">
                Add New Product
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Digital store & hardware inventory
              </span>
            </div>
          </button>

          <button
            onClick={() => onSetTab('share')}
            className="flex items-center gap-3.5 p-4 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-2xl transition-all cursor-pointer group text-left shadow-xs"
          >
            <div className="p-3 bg-amber-500/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 rounded-xl transition-colors">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors block">
                Create Announcement
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Broadcast message to customer inbox
              </span>
            </div>
          </button>

          <button
            onClick={() => onSetTab('bookings')}
            className="flex items-center gap-3.5 p-4 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer group text-left shadow-xs"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-slate-950 rounded-xl transition-colors">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors block">
                Register Booking
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Log repair or IT service ticket
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Real-time Failed Login & Brute-Force Defense Monitor Widget */}
      <AdminFailedLoginAlerts />

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Settled Revenue Today</p>
            <h3 className="text-3xl font-black">{formatETB(stats.todayRevenue)}</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 w-fit px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              <span>Verified Settlements</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Bookings</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{stats.todayBookingsCount}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Requests requiring attention</p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{stats.pendingBookings} UNCONFIRMED</span>
            <button onClick={() => onSetTab('bookings')} className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-1">
              VIEW DESK <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Voice</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{stats.todayFeedbackCount}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Messages in queue</p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{stats.unreadFeedback} UNREAD</span>
            <button onClick={() => onSetTab('share')} className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-1">
              INBOX <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Charts & Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Trend Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="font-display font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-500" />
                  Revenue Velocity
                </h4>
                <p className="text-xs text-slate-500">7-day performance trend</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Daily</p>
                <p className="text-sm font-bold text-slate-900">
                  {formatETB(stats.trendData.reduce((s, d) => s + d.revenue, 0) / 7)}
                </p>
              </div>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="dashboardTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                  />
                  <YAxis 
                    hide 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [formatETB(val), 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0EA5E9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#dashboardTrend)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <RecentActivityFeed
            bookings={bookings}
            transactions={transactions}
            feedback={feedback}
            onSetTab={onSetTab}
            maxItems={5}
          />
        </div>

        {/* Sidebar: Daily Sales Summary & System Status */}
        <div className="space-y-6">
          
          {/* Daily Sales Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChartIcon className="w-4 h-4 text-emerald-500" />
              Daily Sales Mix
            </h4>
            
            <div className="h-[180px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.gatewayData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {stats.gatewayData.map((entry, index) => (
                      <Cell key={`cell-\u0024{index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {stats.gatewayData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-900">{formatETB(item.amount)}</span>
                </div>
              ))}
              {stats.gatewayData.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center italic">Awaiting first sale of the day</p>
              )}
            </div>
          </div>

          {/* Quick Controls */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Command Shortcuts</h5>
            <div className="space-y-2">
              <button 
                onClick={() => onSetTab('payments')}
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold">Verify Ledger</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-white" />
              </button>

              <button 
                onClick={() => onSetTab('reports')}
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold">Deep Analytics</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-white" />
              </button>

              <button 
                onClick={() => onSetTab('commission')}
                className="w-full flex items-center justify-between p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-2xl transition-colors group border border-amber-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                    <BarChartIcon className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-amber-300">2% Commission Engine</span>
                </div>
                <ArrowRight className="w-3 h-3 text-amber-500 group-hover:text-amber-300" />
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500">SYSTEM STABLE</span>
              </div>
              <AlertCircle className="w-3 h-3 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
