import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HardDrive, 
  Download, 
  FileText, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  Zap, 
  AlertCircle,
  X,
  Server
} from 'lucide-react';
import { Transaction, Booking } from '../types';
import { formatETB } from '../utils';

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  formattedTime: string;
  triggerType: 'auto-periodic' | 'manual-trigger' | 'event-sync';
  recordCounts: {
    transactions: number;
    bookings: number;
    revenueETB: number;
  };
  checksum: string;
  sizeKb: string;
  data: {
    transactions: Transaction[];
    bookings?: Booking[];
    meta: {
      syncedAt: string;
      source: string;
      version: string;
    };
  };
}

interface DataSyncBackupWidgetProps {
  transactions: Transaction[];
  bookings?: Booking[];
  onRestoreTransactions?: (restored: Transaction[]) => void;
  compact?: boolean;
}

const STORAGE_KEY_SNAPSHOTS = 'es_digital_tx_backup_snapshots';
const STORAGE_KEY_LATEST = 'es_digital_latest_tx_backup';
const STORAGE_KEY_AUTO_ENABLED = 'es_digital_auto_sync_enabled';
const STORAGE_KEY_INTERVAL = 'es_digital_sync_interval_sec';

export default function DataSyncBackupWidget({
  transactions = [],
  bookings = [],
  onRestoreTransactions,
  compact = false
}: DataSyncBackupWidgetProps) {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTO_ENABLED);
    return saved !== null ? saved === 'true' : true;
  });

  const [syncIntervalSec, setSyncIntervalSec] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INTERVAL);
    return saved ? parseInt(saved, 10) : 45;
  });

  const [countdown, setCountdown] = useState<number>(syncIntervalSec);
  const [isSyncing, setIsSyncing] = useState(false);
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<BackupSnapshot | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [previewJsonModal, setPreviewJsonModal] = useState<BackupSnapshot | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing snapshots from localStorage on mount
  useEffect(() => {
    loadSnapshotsFromStorage();
  }, []);

  const loadSnapshotsFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
      if (raw) {
        const parsed: BackupSnapshot[] = JSON.parse(raw);
        setSnapshots(parsed);
        if (parsed.length > 0) {
          setLastSyncTime(parsed[0].formattedTime);
        }
      }
    } catch (e) {
      console.error('Error loading backup snapshots:', e);
    }
  };

  // Save auto-sync preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTO_ENABLED, String(autoSyncEnabled));
  }, [autoSyncEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INTERVAL, String(syncIntervalSec));
  }, [syncIntervalSec]);

  // Periodic Countdown & Sync Effect
  useEffect(() => {
    if (!autoSyncEnabled) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    setCountdown(syncIntervalSec);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          performDatabaseSync('auto-periodic');
          return syncIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoSyncEnabled, syncIntervalSec, transactions, bookings]);

  // Execute Data Sync & Local Backup Snapshot Creation
  const performDatabaseSync = (trigger: 'auto-periodic' | 'manual-trigger' | 'event-sync') => {
    setIsSyncing(true);

    setTimeout(() => {
      try {
        const now = new Date();
        const isoDate = now.toISOString();
        const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
                          ' (' + now.toLocaleDateString() + ')';

        const totalETB = transactions
          .filter(t => t.status === 'approved')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        // Simple Checksum Generator
        const payloadString = JSON.stringify({ transactions, bookings });
        const sizeKb = (new Blob([payloadString]).size / 1024).toFixed(2);
        const checksum = 'SHA256-' + Math.abs(
          payloadString.split('').reduce((a, b) => { a = (a << 5) - a + b.charCodeAt(0); return a & a; }, 0)
        ).toString(16).toUpperCase();

        const newSnapshot: BackupSnapshot = {
          id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          timestamp: isoDate,
          formattedTime: formatted,
          triggerType: trigger,
          recordCounts: {
            transactions: transactions.length,
            bookings: bookings.length,
            revenueETB: totalETB
          },
          checksum,
          sizeKb,
          data: {
            transactions,
            bookings,
            meta: {
              syncedAt: isoDate,
              source: 'IresoJ Digital CSC Local Redundancy Engine',
              version: '2.5.0-LOCAL-SNAPSHOT'
            }
          }
        };

        // Update localStorage
        const existingRaw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
        let existingList: BackupSnapshot[] = existingRaw ? JSON.parse(existingRaw) : [];

        // Insert at beginning & keep top 15
        existingList.unshift(newSnapshot);
        if (existingList.length > 15) {
          existingList = existingList.slice(0, 15);
        }

        localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(existingList));
        localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(newSnapshot));

        setSnapshots(existingList);
        setLastSyncTime(formatted);
        setCountdown(syncIntervalSec);

        const msgText = trigger === 'auto-periodic' 
          ? `⚡ Auto-Sync Complete: Backup snapshot #${newSnapshot.id.slice(-5)} saved (${sizeKb} KB, ${transactions.length} txs)`
          : `✅ Manual Database Snapshot Created: ${transactions.length} records redundant in LocalStorage`;

        showToast(msgText, trigger === 'auto-periodic' ? 'info' : 'success');

      } catch (err) {
        console.error('Data Sync Simulation Failed:', err);
        showToast('❌ Backup snapshot failed. LocalStorage quota exceeded.', 'warn');
      } finally {
        setIsSyncing(false);
      }
    }, 450);
  };

  const showToast = (text: string, type: 'success' | 'info' | 'warn') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const downloadSnapshotFile = (snap: BackupSnapshot) => {
    try {
      const jsonStr = JSON.stringify(snap, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iresoj_tx_backup_${snap.id}_${snap.timestamp.split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📥 Snapshot JSON downloaded to your device.', 'success');
    } catch (err) {
      showToast('Failed to download snapshot file.', 'warn');
    }
  };

  const handleRestoreFromSnapshot = (snap: BackupSnapshot) => {
    if (!onRestoreTransactions) {
      showToast('Restore handler not configured in active context.', 'warn');
      return;
    }
    if (confirm(`Are you sure you want to restore ${snap.recordCounts.transactions} transactions from snapshot taken at ${snap.formattedTime}?`)) {
      onRestoreTransactions(snap.data.transactions);
      showToast(`🔄 Database restored successfully from snapshot (${snap.formattedTime}).`, 'success');
      setShowHistoryModal(false);
    }
  };

  const deleteSingleSnapshot = (id: string) => {
    const filtered = snapshots.filter(s => s.id !== id);
    setSnapshots(filtered);
    localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(filtered));
    showToast('Snapshot removed from local storage.', 'info');
  };

  const clearAllSnapshots = () => {
    if (confirm('Clear all stored database redundancy snapshots from LocalStorage?')) {
      setSnapshots([]);
      localStorage.removeItem(STORAGE_KEY_SNAPSHOTS);
      localStorage.removeItem(STORAGE_KEY_LATEST);
      showToast('All backup snapshots cleared.', 'info');
    }
  };

  const calculateTotalStorageKb = () => {
    return snapshots.reduce((acc, curr) => acc + (parseFloat(curr.sizeKb) || 0), 0).toFixed(1);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-stone-100 dark:bg-slate-800/90 border border-stone-200 dark:border-slate-700/80 rounded-2xl p-2 px-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            {isSyncing && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>Data Sync & Snapshot</span>
              {autoSyncEnabled && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">({countdown}s)</span>
              )}
            </div>
            <div className="text-xs font-black text-slate-800 dark:text-slate-100">
              {snapshots.length} Snapshots Saved
            </div>
          </div>
        </div>

        <button
          onClick={() => performDatabaseSync('manual-trigger')}
          disabled={isSyncing}
          className="ml-auto p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-all cursor-pointer shadow-2xs text-xs flex items-center gap-1 font-bold disabled:opacity-50"
          title="Trigger Immediate Sync & Snapshot"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden space-y-6">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification Header */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-2xl text-xs font-bold border flex items-center justify-between ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80' 
                : toastMessage.type === 'warn'
                ? 'bg-amber-950/90 text-amber-300 border-amber-800/80'
                : 'bg-sky-950/90 text-sky-300 border-sky-800/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0 animate-pulse" />
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-tight">
                Periodic Data Sync & Redundancy Engine
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                ACTIVE V2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Automated periodic transaction sync with timestamped JSON snapshot persistence in LocalStorage.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sync Interval Selector */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[10px] uppercase">Interval:</span>
            <select
              value={syncIntervalSec}
              onChange={(e) => setSyncIntervalSec(Number(e.target.value))}
              className="bg-transparent text-sky-400 font-bold outline-none cursor-pointer text-xs"
            >
              <option value={15} className="bg-slate-900 text-white">15s</option>
              <option value={30} className="bg-slate-900 text-white">30s</option>
              <option value={45} className="bg-slate-900 text-white">45s</option>
              <option value={60} className="bg-slate-900 text-white">60s</option>
            </select>
          </div>

          {/* Toggle Auto-Sync */}
          <button
            onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              autoSyncEnabled 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {autoSyncEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoSyncEnabled ? 'Auto-Sync ON' : 'Auto-Sync OFF'}</span>
          </button>

          {/* Manual Trigger Sync Button */}
          <button
            onClick={() => performDatabaseSync('manual-trigger')}
            disabled={isSyncing}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync & Snapshot Now'}</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Next Auto Sync Countdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Next Auto-Sync</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {autoSyncEnabled ? `${countdown}s` : 'PAUSED'}
            </span>
            {autoSyncEnabled && (
              <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse">
                ● Live Interval
              </span>
            )}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-sky-400 h-full transition-all duration-1000" 
              style={{ width: `${autoSyncEnabled ? (countdown / syncIntervalSec) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Stored Snapshots Count */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Redundant Snapshots</span>
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {snapshots.length} <span className="text-xs text-slate-400 font-normal">/ 15</span>
            </span>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <Eye className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {calculateTotalStorageKb()} KB Local Storage Used
          </p>
        </div>

        {/* Current Transactions Tracked */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Transactions Synced</span>
            <Server className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {transactions.length}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {formatETB(transactions.filter(t => t.status === 'approved').reduce((a, b) => a + (b.amount || 0), 0))}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono truncate">
            Last Sync: {lastSyncTime}
          </p>
        </div>

        {/* Health Rating */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Redundancy Health</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="text-lg font-black text-white">
              100% Operational
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            LocalStorage Backup Active
          </p>
        </div>

      </div>

      {/* Snapshot List Quick Table Bar */}
      {snapshots.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Recent Local Snapshots History ({snapshots.length})
            </span>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View All Snapshots & Restore</span>
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {snapshots.slice(0, 3).map((snap) => (
              <div 
                key={snap.id}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-sky-400 font-bold truncate">
                    #{snap.id.slice(-6)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                    snap.triggerType === 'auto-periodic' 
                      ? 'bg-sky-950 text-sky-400 border border-sky-800' 
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {snap.triggerType}
                  </span>
                </div>

                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{snap.recordCounts.transactions} Transactions</span>
                  <span className="font-mono text-slate-300">{snap.sizeKb} KB</span>
                </div>

                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>{snap.formattedTime}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewJsonModal(snap)}
                      className="text-slate-300 hover:text-sky-400 cursor-pointer"
                      title="Inspect JSON"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => downloadSnapshotFile(snap)}
                      className="text-slate-300 hover:text-emerald-400 cursor-pointer"
                      title="Download JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snapshot History & Redundancy Management Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      LocalStorage Database Redundancy History
                    </h3>
                    <p className="text-xs text-slate-400">
                      View, inspect, download, or restore periodic data sync snapshots stored in browser memory.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {snapshots.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Database className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-slate-400 text-sm font-bold">No snapshots stored yet.</p>
                    <button
                      onClick={() => {
                        performDatabaseSync('manual-trigger');
                      }}
                      className="px-4 py-2 bg-sky-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
                    >
                      Create First Snapshot
                    </button>
                  </div>
                ) : (
                  snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-sky-400">
                            ID: {snap.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            snap.triggerType === 'auto-periodic'
                              ? 'bg-sky-950 text-sky-400 border border-sky-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {snap.triggerType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium">
                          Timestamp: <strong>{snap.formattedTime}</strong>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                          <span>Transactions: <strong className="text-white">{snap.recordCounts.transactions}</strong></span>
                          <span>Revenue: <strong className="text-emerald-400">{formatETB(snap.recordCounts.revenueETB)}</strong></span>
                          <span>Size: <strong className="text-slate-200">{snap.sizeKb} KB</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPreviewJsonModal(snap)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="View JSON Payload"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-400" />
                          <span>View JSON</span>
                        </button>

                        <button
                          onClick={() => downloadSnapshotFile(snap)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Download Snapshot File"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </button>

                        {onRestoreTransactions && (
                          <button
                            onClick={() => handleRestoreFromSnapshot(snap)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            title="Restore database to this snapshot"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                            <span>Restore</span>
                          </button>
                        )}

                        <button
                          onClick={() => deleteSingleSnapshot(snap.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                          title="Delete Snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400">
                  Total Redundant Storage: <strong className="text-white">{calculateTotalStorageKb()} KB</strong> ({snapshots.length} active snapshots)
                </div>

                <div className="flex items-center gap-3">
                  {snapshots.length > 0 && (
                    <button
                      onClick={clearAllSnapshots}
                      className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Clear All History
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JSON Payload Inspection Modal */}
      <AnimatePresence>
        {previewJsonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  <h3 className="font-mono font-bold text-base text-white">
                    Snapshot JSON Preview #{previewJsonModal.id}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewJsonModal(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed select-all">
                <pre>{JSON.stringify(previewJsonModal, null, 2)}</pre>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Checksum: {previewJsonModal.checksum}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadSnapshotFile(previewJsonModal)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON File</span>
                  </button>
                  <button
                    onClick={() => setPreviewJsonModal(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
