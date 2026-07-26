import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Laptop, Clock, CheckCircle2, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { ActiveTab } from '../types';
import { useLanguage } from '../LanguageContext';

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
    <footer id="app-footer" className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-9 h-9 bg-[#0EA5E9] rounded-lg flex items-center justify-center text-white">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                ES Digital <span className="text-[#0EA5E9]">CSC</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footerAbout')}
            </p>
            {/* Live Time Box */}
            <div className="flex items-center space-x-2 text-xs font-mono bg-slate-800/60 text-sky-400 py-2 px-3 rounded-lg border border-slate-800 w-fit">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Kore Town Time (EAT):</span>
              <span className="font-bold text-white">{ethiopianTime || "Loading..."}</span>
            </div>
          </div>

          {/* Column 2: Physical Location & Contact */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              {t('locationTitle')}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-2.5 text-slate-400">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Kore Town, Kore Woreda,<br />
                  West Arsi Zone, Oromia Region,<br />
                  Ethiopia
                </span>
              </li>
              <li className="flex items-center space-x-2.5 text-slate-400">
                <Phone className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                <a href="tel:+251995852194" className="hover:text-white transition-colors">
                  +251 995 852 194
                </a>
              </li>
              <li className="flex items-center space-x-2.5 text-slate-400">
                <Mail className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                <div className="flex flex-col">
                  <a href="mailto:jemalfan030@gmail.com" className="hover:text-white transition-colors break-all">
                    jemalfan030@gmail.com
                  </a>
                  <a href="mailto:iresojemal44@gmail.com" className="hover:text-white transition-colors text-[11px] text-slate-500 break-all">
                    iresojemal44@gmail.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              {t('quickNavTitle')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <button onClick={() => setActiveTab('home')} className="text-left text-slate-400 hover:text-white transition-colors py-1">{t('home')}</button>
              <button onClick={() => setActiveTab('about')} className="text-left text-slate-400 hover:text-white transition-colors py-1">{t('aboutUs')}</button>
              <button onClick={() => setActiveTab('services')} className="text-left text-slate-400 hover:text-white transition-colors py-1">{t('services')}</button>
              <button onClick={() => setActiveTab('news')} className="text-left text-slate-400 hover:text-white transition-colors py-1">{t('news')}</button>
              <button onClick={() => setActiveTab('contact')} className="text-left text-slate-400 hover:text-white transition-colors py-1">{t('contact')}</button>
              <button onClick={() => setActiveTab('login')} className="text-left text-slate-400 hover:text-white transition-colors py-1">{t('staffLogin')}</button>
            </div>
          </div>

          {/* Column 4: Newsletter Box */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              {t('newsletterTitle')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('newsletterDesc')}
            </p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-xs text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
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
                  className="bg-slate-800 text-white text-sm px-3.5 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#0EA5E9] w-full"
                />
                <button
                  type="submit"
                  className="bg-[#0EA5E9] hover:bg-sky-600 text-white p-2.5 rounded-lg flex items-center justify-center transition-colors shadow-md shadow-sky-100/10"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div className="text-center md:text-left space-y-2">
            <p>© {new Date().getFullYear()} ES Digital Computer Service Center (ES Digital CSC). All Rights Reserved.</p>
            <p className="flex items-center justify-center md:justify-start gap-3">
              <a href="/deployment-guide.txt" download="deployment-guide.txt" className="text-sky-400 hover:text-sky-300 underline">Download Deployment Guide</a>
              <span className="text-slate-700">|</span>
              {showInstallBtn && (
                <>
                  <button 
                    onClick={handleInstallClick}
                    className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                  >
                    Install ES Digital App
                  </button>
                  <span className="text-slate-700">|</span>
                </>
              )}
              <span className="text-slate-400 font-medium">{t('footerLocTag')}</span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-400 font-medium">{t('footerPayTag')}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mr-2">Follow Our Community</span>
            <div className="flex items-center gap-3">
              <a 
                href="https://wa.me/251995852194?text=Hello%20ES%20Digital%20Service%20Center!%20I%20would%20like%20to%20inquire%20about%20your%20services." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                title="Contact via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com/ESDigitalCSC" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0EA5E9] hover:text-white transition-all shadow-sm"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://t.me/jemalfano" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0EA5E9] hover:text-white transition-all shadow-sm"
                title="Telegram"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/esdigital_csc" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr from-amber-500 via-red-500 to-purple-600 hover:text-white transition-all shadow-sm"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
