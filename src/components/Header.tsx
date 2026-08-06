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
  Sprout, 
  GraduationCap, 
  ShoppingBag, 
  Heart, 
  Users, 
  Wallet, 
  Info,
  Facebook,
  Send,
  Youtube,
  Music2,
  Sun,
  Moon,
  BookOpen,
  ShoppingCart
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
    { id: 'home', label: t('home'), icon: Home },
    { id: 'about', label: t('aboutUs'), icon: Info },
    { id: 'services', label: t('services'), icon: Laptop },
    { id: 'digital-store', label: t('digitalStore'), icon: ShoppingBag },
    { id: 'news', label: t('news'), icon: Globe },
    { id: 'contact', label: t('contact'), icon: Users },
  ] as const;

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header id="app-header" className={`sticky top-0 z-40 ${layoutTheme.bgClass} border-b shadow-md transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand Section */}
          <div 
            id="brand-logo" 
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            onClick={() => navigateTo('home')}
          >
            <div className="w-11 h-11 bg-[#0EA5E9] rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all duration-300">
              <Laptop className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-display text-xl font-black tracking-tight text-[#0EA5E9] flex items-center gap-1.5 transition-colors">
                <Search className="w-4.5 h-4.5 text-white shrink-0 animate-pulse" />
                IresoJ Digital <span className="text-white">CSC</span>
              </span>
              <span className="block text-[10px] font-mono text-cyan-200 uppercase tracking-widest font-black transition-colors">
                IresoJ Digital CSC Computer Services
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
                      ? 'bg-white/10 text-[#0EA5E9] shadow-xs border border-white/5' 
                      : 'text-slate-100 hover:text-[#0EA5E9] hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#0EA5E9] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth Buttons, Theme Toggle & Language Bar */}
          <div className="hidden md:flex items-center space-x-3 bg-white/10 border border-white/10 rounded-2xl p-1.5 px-3">
            
            {/* Global Theme Toggle Button */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-1.5 rounded-xl text-slate-100 hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span className="text-[10px] text-amber-300 font-mono hidden lg:inline">LIGHT</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-200" />
                    <span className="text-[10px] text-slate-200 font-mono hidden lg:inline">DARK</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-1 pr-2 border-r border-white/10">
              <Globe className="w-3.5 h-3.5 text-slate-300 mr-1" />
              <button 
                onClick={() => setLang('om')} 
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'om' ? 'bg-[#0EA5E9] text-slate-900' : 'text-slate-100 hover:text-[#0EA5E9] hover:bg-white/10'}`}
                title="Afaan Oromoo"
              >
                OM
              </button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-[#0EA5E9] text-slate-900' : 'text-slate-100 hover:text-[#0EA5E9] hover:bg-white/10'}`}
                title="English"
              >
                EN
              </button>
              <button 
                onClick={() => setLang('am')} 
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'am' ? 'bg-[#0EA5E9] text-slate-900' : 'text-slate-100 hover:text-[#0EA5E9] hover:bg-white/10'}`}
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
                  ? 'bg-[#0EA5E9] text-slate-900 border-transparent shadow-md'
                  : 'bg-white/10 border-white/20 text-slate-100 hover:bg-white/20'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {(cartItemCount ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* PDF User Manual Button */}
            {onOpenManual && (
              <button
                onClick={onOpenManual}
                title="Download Application User Manual PDF"
                className="px-2.5 py-1.5 bg-[#0EA5E9] hover:bg-sky-400 active:scale-95 text-slate-900 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-900" />
                <span className="hidden lg:inline">PDF Manual</span>
              </button>
            )}

            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  id="header-admin-btn"
                  onClick={() => navigateTo('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                    activeTab === 'admin'
                      ? 'bg-[#0EA5E9] text-slate-900 border-transparent'
                      : 'border-white/20 text-slate-100 hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('admin')}</span>
                </button>
                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  title="Logout Admin"
                  className="p-1.5 text-slate-200 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => navigateTo('login')}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-black text-slate-100 hover:text-[#0EA5E9] hover:bg-white/10 rounded-xl transition-all group"
              >
                <span>{t('staffSignIn')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle & Theme Button */}
          <div className="md:hidden flex items-center gap-2">
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                className="p-2 rounded-xl text-slate-200 hover:bg-white/10 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-200" />}
              </button>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-200 hover:text-[#0EA5E9] hover:bg-white/10 focus:outline-none transition-colors"
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
                  <button
                    onClick={() => navigateTo('admin')}
                    className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-200"
                  >
                    {t('adminDashboard')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigateTo('login')}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors"
                    >
                      {t('login')}
                    </button>
                    <button
                      onClick={() => navigateTo('login')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-200"
                    >
                      {t('createAccount')}
                    </button>
                  </>
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

