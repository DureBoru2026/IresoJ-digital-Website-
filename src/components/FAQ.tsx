import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Clock, CreditCard, Printer, Facebook, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../LanguageContext';

interface FAQItemProps {
  question: { en: string; om: string };
  answer: { en: string; om: string };
  icon: React.ElementType;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useLanguage();

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between gap-4 text-left group hover:bg-slate-50/50 transition-colors px-4 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-sky-100 text-[#0EA5E9]' : 'bg-slate-100 text-slate-500'} transition-colors`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={`font-display font-bold text-sm sm:text-base ${isOpen ? 'text-[#0EA5E9]' : 'text-slate-800'}`}>
            {lang === 'en' ? question.en : question.om}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0EA5E9]' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 px-16 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {lang === 'en' ? answer.en : answer.om}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const { lang } = useLanguage();

  const faqs = [
    {
      question: { 
        en: "What are your store hours in Kore Town?", 
        om: "Sa'aatiin hojii mana murtii keessanii Magaalaa Koree keessatti akkam?" 
      },
      answer: { 
        en: "We are open Monday to Saturday from 8:30 AM to 6:30 PM (Local Time). We are closed on Sundays and Public Holidays.", 
        om: "Wiixata hanga Sanbataatti ganama sa'aatii 2:30 hanga galgala sa'aatii 12:30tti (Sa'aatii biyya keessaa) banaadha. Dilbataa fi Ayyaanota mootummaa irratti cufaa dha." 
      },
      icon: Clock
    },
    {
      question: { 
        en: "How long do computer or phone repairs typically take?", 
        om: "Suphaan kompuyitaraa ykn bilbilaa yeroo hammamii fudhata?" 
      },
      answer: { 
        en: "Basic software issues and simple hardware fixes (like screen or battery replacements) usually take 1–3 hours. Complex motherboard repairs may take 1–2 business days depending on parts availability.", 
        om: "Rakkooleen sooftiweerii fi suphaan haardweerii salphaa (kan akka jijjiirraa iskiriinii ykn baatirii) yeroo baay'ee sa'aatii 1–3 fudhatu. Suphaan moodarboordii walxaxaa ta'an yeroo hojii guyyaa 1–2 fudhachuu danda'u." 
      },
      icon: HelpCircle
    },
    {
      question: { 
        en: "What payment methods do you accept for services?", 
        om: "Kaffaltii tajaajilaatiif mala kaffaltii akkamii fudhattu?" 
      },
      answer: { 
        en: "We accept Telebirr, CBE Birr, Commercial Bank of Ethiopia (CBE) transfers, and Cash. You can scan our QR codes in-store or use our secure online payment verification form.", 
        om: "Telebirr, CBE Birr, kaffaltii Baankii Daldala Itiyoophiyaa (CBE) fi maallaqa callaa ni fudhanna. QR koodii keenya mana murtii keessatti iskaan gochuu ykn unka mirkaneessaa kaffaltii toora interneetii keenya fayyadamuu dandeessu." 
      },
      icon: CreditCard
    },
    {
      question: { 
        en: "Do you offer professional document printing and binding?", 
        om: "Waraqaa maxxansuu fi baayindii gochuu ni hojjettuu?" 
      },
      answer: { 
        en: "Yes! We provide high-quality black & white or color printing, photocopying, document scanning, and professional spiral binding for reports and booklets.", 
        om: "Eeyyee! Maxxansaa gurraacha fi adii ykn halluu, fookoopii, iskaaniingii waraqaa fi baayindii ispaayiraalii piroofeeshinaalii gabaasotaa fi kitaabotaaf ni kennina." 
      },
      icon: Printer
    },
    {
      question: { 
        en: "How can I contact you or follow your updates?", 
        om: "Akkamitti isin qunnamuu ykn odeeffannoo haaraa hordofuu danda'a?" 
      },
      answer: { 
        en: "You can call us directly at +251 995 852 194, message us on Telegram, or follow our official Facebook page 'IresoJ Digital CSC' for the latest service updates and price lists.", 
        om: "Bilbila lakkoofsa +251 995 852 194 irratti bilbilaan, Telegiraamiidhaan ergaa nuuf erguun ykn fuula Feesbuukii 'IresoJ Digital CSC' hordofuun odeeffannoo tajaajilaa fi gatii haaraa argachuu dandeessu." 
      },
      icon: Facebook
    }
  ];

  return (
    <section id="faq-section" className="py-12 px-6 sm:px-12 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          <HelpCircle className="w-3.5 h-3.5 text-[#0EA5E9]" />
          <span className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider">
            {lang === 'en' ? 'Support Center' : 'Giddu-gala Deeggarsaa'}
          </span>
        </div>
        <h2 className="font-display text-3xl font-extrabold text-slate-900">
          {lang === 'en' ? 'Frequently Asked Questions' : 'Gaaffilee Yeroo Baay\'ee Gaafataman'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {lang === 'en' 
            ? 'Quick answers to common inquiries about our computing services, logistics, and store policies.' 
            : 'Tajaajila kompuyitaraa, loojistiksii fi qajeelfamoota mana murtii keenya irratti gaaffilee yeroo baay\'ee gaafatamanif deebii gabaabaa.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-2 sm:p-4 overflow-hidden">
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question}
            answer={faq.answer}
            icon={faq.icon}
          />
        ))}
      </div>

      {/* Social Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a 
          href="https://facebook.com/IresoJDigitalCSC" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-[#1877F2]/5 border border-[#1877F2]/10 rounded-2xl group hover:bg-[#1877F2]/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white">
              <Facebook className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-bold text-[#1877F2] uppercase tracking-wider">Follow Us</span>
              <span className="font-display font-extrabold text-slate-800 text-sm">IresoJ Digital CSC</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#1877F2] opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        <a 
          href="https://t.me/jemalfano" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-[#0088cc]/5 border border-[#0088cc]/10 rounded-2xl group hover:bg-[#0088cc]/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0088cc] flex items-center justify-center text-white">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-bold text-[#0088cc] uppercase tracking-wider">Telegram</span>
              <span className="font-display font-extrabold text-slate-800 text-sm">Direct Support</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#0088cc] opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </section>
  );
}

// Internal component for the arrow icon inside links
function ArrowRight(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
