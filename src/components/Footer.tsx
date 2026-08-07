import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Laptop, Clock, CheckCircle2, Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react';
import { ActiveTab } from '../types';
import { useLanguage } from '../LanguageContext';
import { layoutTheme } from '../theme';

const TikTokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.891 2.891 2.896 2.896 0 0 1-2.892-2.891 2.896 2.896 0 0 1 2.892-2.891c.23 0 .452.029.664.08V9.387a6.31 6.31 0 0 0-.664-.035 6.336 6.336 0 0 0-6.336 6.336 6.336 6.336 0 0 0 6.336 6.336 6.336 6.336 0 0 0 6.336-6.336V8.67a8.21 8.21 0 0 0 4.771 1.517V6.742a4.78 4.78 0 0 1-1.001-.056z"/>
  </svg>
);

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [ethiopianTime, setEthiopianTime] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // PWA Install Logic
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  // Update real-time clock for Ethiopia (EAT is UTC+3)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Calculate UTC time + 3 hours for EAT
      const eatOffset = 3 * 60 * 60 * 1000;
      const eatTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + eatOffset);
      
      const timeString = eatTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setEthiopianTime(timeString);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer id="app-footer" className="bg-sky-50 text-slate-600 border-t border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-9 h-9 bg-[#0EA5E9] rounded-lg flex items-center justify-center text-white">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="font-display text-lg font-bold text-slate-900 tracking-tight">
                IresoJ Digital <span className="text-[#0EA5E9]">CSC</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('footerAbout')}
            </p>
            {/* Live Time Box */}
            <div className="flex items-center space-x-2 text-xs font-mono bg-white/80 text-sky-600 py-2 px-3 rounded-lg border border-sky-100 w-fit shadow-sm">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Kore Town Time (EAT):</span>
              <span className="font-bold text-slate-900">{ethiopianTime || "Loading..."}</span>
            </div>
          </div>

          {/* Column 2: Physical Location & Contact */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-900 text-sm uppercase tracking-wider">
              {t('locationTitle')}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-2.5 text-slate-500">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Kore Town, Kore Woreda,<br />
                  West Arsi Zone, Oromia Region,<br />
                  Ethiopia
                </span>
              </li>
              <li className="flex items-center space-x-2.5 text-slate-500">
                <Phone className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                <a href="tel:+251995852194" className="hover:text-sky-600 transition-colors">
                  +251 995 852 194
                </a>
              </li>
              <li className="flex items-center space-x-2.5 text-slate-500">
                <Mail className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                <div className="flex flex-col">
                  <a href="mailto:jemalfan030@gmail.com" className="hover:text-sky-600 transition-colors break-all">
                    jemalfan030@gmail.com
                  </a>
                  <a href="mailto:iresojemal44@gmail.com" className="hover:text-sky-600 transition-colors text-[11px] text-slate-400 break-all">
                    iresojemal44@gmail.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-900 text-sm uppercase tracking-wider">
              {t('quickNavTitle')}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <button onClick={() => setActiveTab('home')} className="text-left text-slate-500 hover:text-[#0EA5E9] transition-colors py-1 font-bold">Home</button>
              <button onClick={() => setActiveTab('digital-store')} className="text-left text-slate-500 hover:text-[#0EA5E9] transition-colors py-1 font-bold">Shop (Store)</button>
              <button onClick={() => setActiveTab('community')} className="text-left text-slate-500 hover:text-[#0EA5E9] transition-colors py-1 font-bold">Club (Community)</button>
              <button onClick={() => setActiveTab('durepay')} className="text-left text-slate-500 hover:text-[#0EA5E9] transition-colors py-1 font-bold">Earn (Affiliate & Ref)</button>
              <button onClick={() => setActiveTab('services')} className="text-left text-slate-500 hover:text-[#0EA5E9] transition-colors py-1">{t('services')}</button>
              <button onClick={() => setActiveTab('contact')} className="text-left text-slate-500 hover:text-[#0EA5E9] transition-colors py-1">{t('contact')}</button>
              <button onClick={() => setActiveTab('login')} className="text-left text-slate-500 hover:text-[#0EA5E9] transition-colors py-1">Sign In / Register</button>
            </div>
          </div>

          {/* Column 4: Community & Social */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-900 text-sm uppercase tracking-wider">
              Community & Social
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Join our growing community on social media for the latest tech tips, product launches, and exclusive offers.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <a 
                href="https://facebook.com/jemal.fano.haji" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 p-2 rounded-lg bg-white border border-sky-100 text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-all group shadow-sm"
              >
                <div className="w-8 h-8 rounded-md bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                  <Facebook className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Facebook</span>
              </a>

              <a 
                href="https://t.me/jemal9056" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 p-2 rounded-lg bg-white border border-sky-100 text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-all group shadow-sm"
              >
                <div className="w-8 h-8 rounded-md bg-[#229ED9]/10 flex items-center justify-center text-[#229ED9] group-hover:bg-[#229ED9] group-hover:text-white transition-colors">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Telegram Channel</span>
              </a>

              <a 
                href="https://wa.me/251903971666" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 p-2 rounded-lg bg-white border border-sky-100 text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-all group shadow-sm"
              >
                <div className="w-8 h-8 rounded-md bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">WhatsApp Business</span>
              </a>
            </div>
          </div>

          {/* Column 5: Newsletter Box */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-900 text-sm uppercase tracking-wider">
              {t('newsletterTitle')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('newsletterDesc')}
            </p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('subscribeThanks')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder={t("yourEmail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-slate-900 text-sm px-3.5 py-2.5 rounded-lg border border-sky-100 focus:outline-none focus:border-[#0EA5E9] w-full shadow-sm"
                />
                <button
                  type="submit"
                  className="bg-[#0EA5E9] hover:bg-sky-600 text-white p-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        <div className="border-t border-sky-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400">
          <div className="text-center md:text-left space-y-2">
            <p>© {new Date().getFullYear()} IresoJ Digital CSC Computer Services. All Rights Reserved.</p>
            <p className="flex items-center justify-center md:justify-start gap-3">
              <a href="/deployment-guide.txt" download="deployment-guide.txt" className="text-sky-600 hover:text-sky-700 underline">Download Deployment Guide</a>
              <span className="text-slate-200">|</span>
              {showInstallBtn && (
                <>
                  <button 
                    onClick={handleInstallClick}
                    className="text-amber-600 hover:text-amber-700 font-bold underline flex items-center gap-1"
                  >
                    Install IresoJ Digital App
                  </button>
                  <span className="text-slate-200">|</span>
                </>
              )}
              <span className="text-slate-400 font-medium">{t('footerLocTag')}</span>
              <span className="text-slate-200">•</span>
              <span className="text-slate-400 font-medium">{t('footerPayTag')}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">Ethiopia's Leading Digital CSC</span>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] text-slate-400 font-bold">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
