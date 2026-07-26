import React, { useState } from 'react';
import { MessageSquare, Phone, Send, MessageCircle, X, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    { 
      name: 'Contact via WhatsApp', 
      icon: <MessageCircle className="w-5 h-5" />, 
      href: 'https://wa.me/251995852194?text=Hello%20ES%20Digital%20Service%20Center!%20I%20would%20like%20to%20inquire%20about%20your%20computer%20repair%20and%20digital%20printing%20services%20in%20Kore%20Town.', 
      color: 'bg-emerald-600',
      desc: 'Instant WhatsApp Inquiry'
    },
    { 
      name: 'Telegram Support', 
      icon: <Send className="w-5 h-5" />, 
      href: 'https://t.me/jemalfano', 
      color: 'bg-[#0088cc]',
      desc: 'Instant Chat'
    },
    { 
      name: 'Facebook Messenger', 
      icon: <MessageCircle className="w-5 h-5" />, 
      href: 'https://m.me/ESDigitalCSC', 
      color: 'bg-[#0084FF]',
      desc: 'Official Support'
    },
    { 
      name: 'Phone Call', 
      icon: <Phone className="w-5 h-5" />, 
      href: 'tel:+251995852194', 
      color: 'bg-indigo-600',
      desc: '+251 995 852 194'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] p-4 shadow-2xl shadow-indigo-900/20 border border-slate-100 min-w-[240px] mb-2"
          >
            <div className="p-3 mb-2 border-b border-slate-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Connect With Us</p>
              <h4 className="text-sm font-black text-slate-900 tracking-tight">How can we help you?</h4>
            </div>
            <div className="space-y-2">
              {contactOptions.map((opt) => (
                <a
                  key={opt.name}
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all group"
                >
                  <div className={`w-10 h-10 ${opt.color} rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110`}>
                    {opt.icon}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{opt.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{opt.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${isOpen ? 'bg-slate-900 rotate-180' : 'bg-indigo-600 hover:bg-indigo-500'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
