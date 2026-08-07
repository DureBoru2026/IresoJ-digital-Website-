import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Laptop, 
  ShieldCheck, 
  LogOut, 
  ArrowRight, 
  Globe, 
  Search, 
  Home, 
  ShoppingBag, 
  Users, 
  DollarSign,
  Phone,
  Info,
  Facebook,
  Send,
  Youtube,
  Music2,
  Sun,
  Moon,
  BookOpen,
  ShoppingCart,
  User,
  UserPlus,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, AuthState } from '../types';
import { useLanguage } from '../LanguageContext';
import { layoutTheme } from '../theme';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  authState: AuthState;
  handleLogout: () => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  onOpenManual?: () => void;
  cartItemCount?: number;
}

export default function Header({ activeTab, setActiveTab, authState, handleLogout, theme = 'light', toggleTheme, onOpenManual, cartItemCount = 0 }: HeaderProps) {
  const { t, lang, setLang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: t('aboutUs'), icon: Info },
    { id: 'services', label: 'Services & Products', icon: Laptop },
    { id: 'digital-store', label: 'Digital Store', icon: ShoppingBag },
    { id: 'messages', label: 'My Messages', icon: MessageSquare },
    ...(authState.isAuthenticated ? [{ id: 'profile', label: 'My Profile', icon: User }] : []),
    { id: 'news', label: 'Announcements', icon: Globe },
    { id: 'contact', label: 'Contact Us', icon: Phone },
  ] as const;

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-[#FAF8F5] dark:bg-slate-900 border-b border-stone-200/70 dark:border-slate-800 shadow-xs transition-all duration-300">
      
      {/* Thick Black Navigation Ticker Header Banner */}
      <div id="top-nav-ticker" className="bg-slate-950 text-amber-300 border-b border-amber-500/40 py-2 px-4 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3 sm:space-x-6 min-w-max text-center overflow-x-auto">
          <span className="flex items-center gap-1.5 text-white font-black">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            Content Rewards
          </span>
          <span className="text-amber-500 font-black">•</span>
          <span className="text-amber-300 font-black">Instant Payouts</span>
          <span className="text-amber-500 font-black">•</span>
          <span className="text-white font-black">Book Sales</span>
          <span className="text-amber-500 font-black">•</span>
          <span className="text-amber-300 font-black">Digital Products</span>
          <span className="text-amber-500 font-black">•</span>
          <span className="text-emerald-400 font-black">Services & Telebirr</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand Section with IJ + Market Icon */}
          <div 
            id="brand-logo" 
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            onClick={() => navigateTo('home')}
          >
            {/* Logo IJ with Market Icon Badge */}
            <div className="relative w-11 h-11 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-md border-2 border-amber-300 group-hover:scale-105 transition-all duration-300 shrink-0">
              <span className="font-mono text-lg font-black tracking-tighter">IJ</span>
              <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-amber-400 text-amber-400 p-0.5 rounded-md shadow-xs">
                <ShoppingBag className="w-3 h-3 stroke-[2.5]" />
              </div>
            </div>

            <div>
              <span className="font-display text-lg sm:text-xl font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1.5 transition-colors drop-shadow-xs">
                IRESO-J DIGITAL-WEBSITE
              </span>
              <span className="block text-[9.5px] font-mono text-slate-600 dark:text-slate-300 uppercase tracking-widest font-black transition-colors">
                Customer Services & IT Solution Center (CSC)
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as ActiveTab)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive 
                      ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs' 
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-stone-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-amber-500 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth Buttons, Theme Toggle & Language Bar */}
          <div className="hidden md:flex items-center space-x-2.5 bg-stone-100 dark:bg-slate-800/90 border border-stone-200 dark:border-slate-700/80 rounded-2xl p-1.5 px-3 shadow-xs">
            
            {/* Global Theme Toggle Button */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span className="text-[10px] text-amber-300 font-mono hidden lg:inline">LIGHT</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" />
                    <span className="text-[10px] text-slate-700 font-mono hidden lg:inline">DARK</span>
                  </>
                )}
              </button>
            )}

            {/* Dedicated Language Switcher Component */}
            <div className="flex items-center gap-1 bg-stone-200/80 dark:bg-slate-900/90 p-1 rounded-xl border border-stone-300/80 dark:border-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 ml-1 mr-0.5 shrink-0" />
              <button 
                onClick={() => setLang('om')} 
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'om' 
                    ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-xs' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-stone-300/60 dark:hover:bg-slate-800'
                }`}
                title="Afaan Oromoo"
              >
                <span>OM</span>
                <span className="hidden xl:inline text-[9px] font-medium opacity-90">(Oromoo)</span>
              </button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'en' 
                    ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-xs' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-stone-300/60 dark:hover:bg-slate-800'
                }`}
                title="English"
              >
                <span>EN</span>
                <span className="hidden xl:inline text-[9px] font-medium opacity-90">(English)</span>
              </button>
              <button 
                onClick={() => setLang('am')} 
                className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                  lang === 'am' 
                    ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-xs' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-stone-300/60 dark:hover:bg-slate-800'
                }`}
                title="Amharic"
              >
                AM
              </button>
            </div>

            {/* Airtime & Voucher Cart Button */}
            <button
              onClick={() => navigateTo('cart')}
              className={`relative px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cart'
                  ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 border-transparent shadow-md'
                  : 'bg-stone-200/80 dark:bg-slate-800 border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-stone-300 dark:hover:bg-slate-700'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {(cartItemCount ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* PDF User Manual Button */}
            {onOpenManual && (
              <button
                onClick={onOpenManual}
                title="Download Application User Manual PDF"
                className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 text-white dark:text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">PDF Manual</span>
              </button>
            )}

            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {authState.user?.role === 'admin' ? (
                  <button
                    id="header-admin-btn"
                    onClick={() => navigateTo('admin')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 border-transparent shadow-md'
                        : 'border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-stone-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
                    <span>Dashboard</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 bg-stone-200/80 dark:bg-slate-800 px-3 py-1 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 border border-stone-300 dark:border-slate-700">
                    <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="max-w-[100px] truncate">{authState.user?.username || authState.user?.email}</span>
                  </div>
                )}
                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-stone-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => navigateTo('login')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-sky-400 dark:hover:bg-sky-300 active:scale-95 text-white dark:text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle, Language & Theme Buttons */}
          <div className="md:hidden flex items-center gap-2">
            {/* Quick Mobile Language Switcher */}
            <div className="flex items-center bg-stone-200 dark:bg-slate-800 rounded-xl p-0.5 border border-stone-300 dark:border-slate-700 text-[10px] font-black">
              <button
                onClick={() => setLang('om')}
                className={`px-2 py-1 rounded-lg transition-all ${lang === 'om' ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                OM
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                EN
              </button>
            </div>

            {toggleTheme && (
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-800 dark:text-slate-100 hover:text-sky-600 hover:bg-stone-200 dark:hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Strictly Matching Screenshot 1) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu-drawer"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto"
          >
            {/* Drawer Top Header */}
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-sm uppercase tracking-widest text-slate-900 font-mono">
                  MENU
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Search Box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="SEARCH..."
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Drawer Nav Items List */}
              <div className="space-y-1 pt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id as ActiveTab)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-black'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Language Switcher Row */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'om' ? 'Afaan Oromoo' : lang === 'am' ? 'Amharic' : 'English'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setLang('om')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black ${lang === 'om' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    OM
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang('am')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black ${lang === 'am' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    AM
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {authState.isAuthenticated ? (
                  <div className="space-y-2">
                    {authState.user?.role === 'admin' && (
                      <button
                        onClick={() => navigateTo('admin')}
                        className="w-full py-3 bg-[#0EA5E9] text-slate-900 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-sky-200"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold text-xs uppercase tracking-wider"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      onClick={() => navigateTo('login')}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors text-center cursor-pointer"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => navigateTo('login')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-colors shadow-md text-center cursor-pointer"
                    >
                      CREATE ACCOUNT
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Social Connect Bottom Section */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-center">
                CONNECT WITH US
              </span>
              <div className="flex items-center justify-center gap-3">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://t.me" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-500 transition-colors">
                  <Send className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-rose-600 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors">
                  <Music2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

