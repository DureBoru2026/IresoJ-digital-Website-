import React, { useState, useEffect } from 'react';
import { BellRing, Calendar, X, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking } from '../types';

interface BookingReminderProps {
  bookings: Booking[];
}

export default function BookingReminder({ bookings }: BookingReminderProps) {
  const [activeReminders, setActiveReminders] = useState<Booking[]>([]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      // Look ahead 1 hour
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      const notifiedIdsRaw = localStorage.getItem('es_digital_notified_bookings');
      const notifiedIds: string[] = notifiedIdsRaw ? JSON.parse(notifiedIdsRaw) : [];

      const upcoming = bookings.filter(booking => {
        // Only remind for confirmed or pending bookings that aren't cancelled/completed
        if (booking.status === 'cancelled' || booking.status === 'completed') return false;
        if (notifiedIds.includes(booking.id)) return false;

        try {
          // bookingDate: YYYY-MM-DD, bookingTime: HH:mm (usually 24h from <input type="time">)
          const [year, month, day] = booking.bookingDate.split('-').map(Number);
          
          // Handle both HH:mm and HH:mm AM/PM if somehow mixed
          let hours = 0;
          let minutes = 0;
          
          if (booking.bookingTime.includes('AM') || booking.bookingTime.includes('PM')) {
            const [timePart, modifier] = booking.bookingTime.split(' ');
            [hours, minutes] = timePart.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
          } else {
            [hours, minutes] = booking.bookingTime.split(':').map(Number);
          }
          
          const bookingDateObj = new Date(year, month - 1, day, hours, minutes);

          // If booking is within 1 hour AND hasn't passed (give 15 min grace for "just started")
          const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
          return bookingDateObj > fifteenMinAgo && bookingDateObj <= oneHourFromNow;
        } catch (e) {
          return false;
        }
      });

      if (upcoming.length > 0) {
        setActiveReminders(prev => {
          const newOnes = upcoming.filter(u => !prev.find(p => p.id === u.id));
          return [...prev, ...newOnes];
        });
      }
    };

    // Check every 30 seconds for higher responsiveness
    const interval = setInterval(checkReminders, 30000);
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [bookings]);

  const dismissReminder = (id: string) => {
    setActiveReminders(prev => prev.filter(r => r.id !== id));
    
    const notifiedIdsRaw = localStorage.getItem('es_digital_notified_bookings');
    const notifiedIds: string[] = notifiedIdsRaw ? JSON.parse(notifiedIdsRaw) : [];
    
    if (!notifiedIds.includes(id)) {
      notifiedIds.push(id);
      localStorage.setItem('es_digital_notified_bookings', JSON.stringify(notifiedIds));
    }
  };

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-[60] flex flex-col gap-3 max-w-sm w-full sm:w-80 pointer-events-none">
      <AnimatePresence>
        {activeReminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <BellRing className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <button 
                  onClick={() => dismissReminder(reminder.id)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  Appointment Reminder
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your appointment for <span className="font-bold text-indigo-600 dark:text-indigo-400">"{reminder.serviceTitle}"</span> is scheduled to start soon.
                </p>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/50">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{reminder.bookingDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/50">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{reminder.bookingTime}</span>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-indigo-50/30 dark:bg-indigo-900/10 border-t border-indigo-50 dark:border-indigo-900/20 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[9px] text-indigo-600/70 dark:text-indigo-400/70 font-bold uppercase tracking-wider">
                <Info className="w-3 h-3" />
                <span>1 Hour Notification</span>
              </div>
              <button 
                onClick={() => dismissReminder(reminder.id)}
                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-tight cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
