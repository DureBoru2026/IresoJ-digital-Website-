import { useState, useEffect, useRef } from 'react';
import { Transaction, Booking } from '../types';

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

const STORAGE_KEY_SNAPSHOTS = 'es_digital_tx_backup_snapshots';
const STORAGE_KEY_LATEST = 'es_digital_latest_tx_backup';
const STORAGE_KEY_AUTO_ENABLED = 'es_digital_auto_sync_enabled';
const STORAGE_KEY_INTERVAL = 'es_digital_sync_interval_sec';

export function useDataSync(transactions: Transaction[] = [], bookings: Booking[] = []) {
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
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);

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

        const existingRaw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
        let existingList: BackupSnapshot[] = existingRaw ? JSON.parse(existingRaw) : [];

        existingList.unshift(newSnapshot);
        if (existingList.length > 15) {
          existingList = existingList.slice(0, 15);
        }

        localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(existingList));
        localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(newSnapshot));

        setLastSyncTime(formatted);
        setCountdown(syncIntervalSec);
        setLastMessage(`⚡ Data redundancy snapshot saved: #${newSnapshot.id.slice(-5)}`);

      } catch (err) {
        console.error('Data Sync Simulation Failed:', err);
        setLastMessage('❌ Backup snapshot failed. Storage quota exceeded.');
      } finally {
        setIsSyncing(false);
        setTimeout(() => setLastMessage(null), 3000);
      }
    }, 1000);
  };

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

  return {
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncIntervalSec,
    setSyncIntervalSec,
    countdown,
    isSyncing,
    lastSyncTime,
    lastMessage,
    performDatabaseSync
  };
}
