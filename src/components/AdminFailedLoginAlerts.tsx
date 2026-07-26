import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertOctagon, 
  ShieldCheck, 
  Clock, 
  User, 
  Globe, 
  Zap, 
  RefreshCw, 
  X, 
  Check, 
  Lock, 
  Unlock, 
  AlertTriangle,
  Play
} from 'lucide-react';

export interface FailedLoginAttempt {
  id: string;
  timestamp: string;
  attemptedUser: string;
  ip: string;
  location: string;
  reason: string;
  severity: 'warning' | 'critical';
  blocked: boolean;
}

const INITIAL_FAILED_ATTEMPTS: FailedLoginAttempt[] = [
  {
    id: 'fl-101',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    attemptedUser: 'admin',
    ip: '197.156.78.22',
    location: 'Addis Ababa, ET',
    reason: 'Invalid Password (Attempt #4)',
    severity: 'critical',
    blocked: true
  },
  {
    id: 'fl-102',
    timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
    attemptedUser: 'root',
    ip: '197.156.78.22',
    location: 'Addis Ababa, ET',
    reason: 'Non-existent Account',
    severity: 'critical',
    blocked: true
  },
  {
    id: 'fl-103',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    attemptedUser: 'jemal_fano',
    ip: '196.188.12.90',
    location: 'Hawassa, ET',
    reason: 'Password Mismatch',
    severity: 'warning',
    blocked: false
  }
];

export default function AdminFailedLoginAlerts() {
  const [attempts, setAttempts] = useState<FailedLoginAttempt[]>(INITIAL_FAILED_ATTEMPTS);
  const [blockedIps, setBlockedIps] = useState<string[]>(['197.156.78.22']);
  const [simulationActive, setSimulationActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalFailedLastHour = attempts.length;
  const criticalThreatsCount = attempts.filter(a => a.severity === 'critical').length;
  const threatLevel = criticalThreatsCount >= 2 ? 'HIGH_RISK' : totalFailedLastHour >= 1 ? 'MODERATE' : 'NORMAL';

  // Toggle IP Block
  const toggleBlockIp = (ip: string) => {
    if (blockedIps.includes(ip)) {
      setBlockedIps(prev => prev.filter(i => i !== ip));
      setToastMessage(`IP ${ip} has been unblocked.`);
    } else {
      setBlockedIps(prev => [...prev, ip]);
      setAttempts(prev => prev.map(a => a.ip === ip ? { ...a, blocked: true } : a));
      setToastMessage(`Security Defense Active: IP ${ip} permanently blocked from auth server.`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Dismiss an attempt
  const dismissAttempt = (id: string) => {
    setAttempts(prev => prev.filter(a => a.id !== id));
  };

  // Simulate Brute Force Attempt
  const simulateBruteForce = () => {
    setSimulationActive(true);
    const fakeUsers = ['administrator', 'system_admin', 'store_manager', 'test_user'];
    const fakeIps = ['102.218.45.12', '196.191.22.88', '197.156.99.104'];

    const newAttempt: FailedLoginAttempt = {
      id: 'fl-' + Math.floor(100 + Math.random() * 900),
      timestamp: new Date().toISOString(),
      attemptedUser: fakeUsers[Math.floor(Math.random() * fakeUsers.length)],
      ip: fakeIps[Math.floor(Math.random() * fakeIps.length)],
      location: 'Oromia Region, ET',
      reason: 'Rapid Auth Burst Detected (#3 attempts in 10s)',
      severity: 'critical',
      blocked: false
    };

    setTimeout(() => {
      setAttempts(prev => [newAttempt, ...prev]);
      setSimulationActive(false);
      setToastMessage(`Simulated Threat Triggered: Failed Login Alert generated for IP ${newAttempt.ip}`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 600);
  };

  return (
    <div id="failed-login-alerts-widget" className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Security Level Gauge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              threatLevel === 'HIGH_RISK' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              threatLevel === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-white flex items-center gap-2">
                Failed Login & Brute-Force Defense Monitor
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                  threatLevel === 'HIGH_RISK' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                  threatLevel === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {threatLevel === 'HIGH_RISK' ? 'Critical Alert' : threatLevel === 'MODERATE' ? 'Moderate Risk' : 'Protected'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Monitors unauthorized auth attempts and locks down brute-force vectors in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={simulateBruteForce}
            disabled={simulationActive}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Simulate a failed login burst for testing"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Brute-Force Alert</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Failed Attempts (1h)</div>
          <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-2">
            <span>{totalFailedLastHour}</span>
            <span className="text-[11px] font-normal text-slate-400">burst events</span>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Blocked IP Addresses</div>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-baseline gap-2">
            <span>{blockedIps.length}</span>
            <span className="text-[11px] font-normal text-slate-400">blacklisted</span>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Shield Protection Status</div>
          <div className="text-sm font-black text-emerald-400 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Rate Limit Enabled (Max 5/min)</span>
          </div>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Real-time Failed Login Log ({attempts.length})</span>
          <span className="text-[10px] font-mono text-slate-500">Auto-refreshing</span>
        </div>

        {attempts.length === 0 ? (
          <div className="p-8 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700/80 text-center text-slate-400 font-mono text-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            No active failed login alerts detected. Auth channel is quiet.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {attempts.map(attempt => {
              const isIpBlocked = blockedIps.includes(attempt.ip);
              return (
                <div 
                  key={attempt.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    attempt.severity === 'critical'
                      ? 'bg-red-950/20 border-red-900/40 text-slate-200'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        attempt.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {attempt.severity}
                      </span>
                      <span className="text-xs font-bold text-white font-mono">
                        Target User: "{attempt.attemptedUser}"
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3 font-mono">
                      <span className="flex items-center gap-1 text-sky-400">
                        <Globe className="w-3.5 h-3.5" />
                        {attempt.ip} ({attempt.location})
                      </span>
                      <span className="text-slate-400">
                        Reason: {attempt.reason}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleBlockIp(attempt.ip)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isIpBlocked 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                      }`}
                    >
                      {isIpBlocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>IP Blocked</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-red-400" />
                          <span>Block IP</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => dismissAttempt(attempt.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                      title="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
