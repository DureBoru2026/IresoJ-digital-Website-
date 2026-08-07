import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Star, User } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';

interface LeaderboardUser {
  id: string;
  username: string;
  loyaltyPoints: number;
  avatar?: string;
  role: string;
}

export default function LoyaltyLeaderboard() {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for the top 5 users by loyalty points
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('loyaltyPoints', 'desc'), limit(5));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: LeaderboardUser[] = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as LeaderboardUser);
      });
      
      // If no users found in DB, we'll show a "Waiting for Champions" state
      // but usually the DB will have at least the current user or some initial data
      setTopUsers(users);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm animate-pulse flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
        <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 dark:text-white text-lg tracking-tight">Loyalty Leaderboard</h3>
            <p className="text-xs text-slate-500 font-medium">Top 5 Community Champions of Kore Town</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-sky-50 dark:bg-sky-950 border border-sky-100 dark:border-sky-900 rounded-full">
          <Star className="w-3 h-3 text-sky-500 fill-sky-500" />
          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Earn points via activity</span>
        </div>
      </div>

      {topUsers.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700">
            <Medal className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-400">Waiting for our first champions...</p>
          <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Start booking services or purchasing products to earn your place on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topUsers.map((user, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                index === 0 
                  ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40' 
                  : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/20 dark:border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 ${
                    index === 0 ? 'border-amber-400 shadow-sm shadow-amber-200' : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                    index === 0 ? 'bg-amber-400 text-white border-amber-100' : 
                    index === 1 ? 'bg-slate-300 text-slate-700 border-slate-100' :
                    index === 2 ? 'bg-orange-300 text-orange-900 border-orange-100' :
                    'bg-white text-slate-500 border-slate-200'
                  }`}>
                    {index === 0 ? <Crown className="w-3 h-3" /> : index + 1}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {user.username}
                    {index === 0 && <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">King</span>}
                  </h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black opacity-60">
                    {user.role === 'admin' ? 'IresoJ Staff' : 'Club Member'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                  {user.loyaltyPoints.toLocaleString()}
                  <Star className={`w-3.5 h-3.5 ${index === 0 ? 'text-amber-500 fill-amber-500' : 'text-sky-500'}`} />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Points</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100/50 dark:border-sky-900/30 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400 rounded-lg flex items-center justify-center shrink-0">
          <Star className="w-4 h-4" />
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          <strong>How it works:</strong> Earn 1 point for every 10 ETB spent on products or services. Points can be redeemed for computer maintenance discounts and exclusive training workshops.
        </p>
      </div>
    </div>
  );
}
