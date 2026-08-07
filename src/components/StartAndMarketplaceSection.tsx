import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  PlusCircle, 
  Laptop,
  Zap,
  Globe
} from 'lucide-react';
import { ActiveTab } from '../types';

interface StartAndMarketplaceSectionProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenBookingModal: () => void;
  isAuthenticated?: boolean;
}

export default function StartAndMarketplaceSection({
  onNavigateTab,
  onOpenBookingModal,
  isAuthenticated = false
}: StartAndMarketplaceSectionProps) {
  return (
    <section className="w-full space-y-6 animate-in fade-in duration-300">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>IresoJ Digital Hub — Kore Town, Ethiopia</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Get Started & Explore Products
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('digital-store')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-500/40"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
            <span>Go to Marketplace</span>
          </button>
        </div>
      </div>

      {/* Dual Featured Hub Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: START MY PAGE */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative group bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-sky-800/60 shadow-xl overflow-hidden flex flex-col justify-between space-y-6"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-500" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-sky-500/20 text-sky-300 rounded-2xl border border-sky-500/30">
                <Rocket className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-sky-500/20 border border-sky-400/30 text-sky-300 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
                Creator & Service Portal
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                Start My Page & Book Services
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Publish digital products, set up your creator profile, request custom software, or book computer maintenance & printing at Kore Town counter.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Computer Repairs & Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sell Digital Guides & E-books</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Telebirr & CBE Birr Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Printing & Scanning Services</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-sky-900/60 relative z-10">
            <button
              onClick={() => onNavigateTab(isAuthenticated ? 'services' : 'login')}
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAuthenticated ? 'Start / Manage My Page' : 'Start My Page (Sign In)'}</span>
            </button>
            <button
              onClick={onOpenBookingModal}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Laptop className="w-4 h-4 text-amber-400" />
              <span>Book Appointment</span>
            </button>
          </div>
        </motion.div>

        {/* CARD 2: BROWSE MARKETPLACE */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative group bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/80 text-white rounded-3xl p-6 sm:p-8 border border-amber-800/60 shadow-xl overflow-hidden flex flex-col justify-between space-y-6"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
                Digital & Tech Catalog
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                Browse Marketplace
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Explore tech hardware, computer accessories, software licenses, airtime top-ups, and downloadable Ethiopian digital resources with instant receipt generation.
              </p>
            </div>

            {/* Popular Categories Pill Grid */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 bg-slate-900/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-amber-400" />
                Laptops & PC Parts
              </span>
              <span className="px-3 py-1 bg-slate-900/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                Mobile Airtime
              </span>
              <span className="px-3 py-1 bg-slate-900/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Digital E-Books
              </span>
              <span className="px-3 py-1 bg-slate-900/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Software Downloads
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-amber-900/60 relative z-10">
            <button
              onClick={() => onNavigateTab('digital-store')}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Marketplace Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('services')}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Service Catalog</span>
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
