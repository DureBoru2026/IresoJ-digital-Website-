import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  Printer, 
  Smartphone, 
  BookOpen, 
  Search,
  MessageCircle,
  HelpCircle,
  Clock,
  Zap,
  Lock,
  Globe
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail?: string;
  isAdmin?: boolean;
}

export default function UserManualModal({ 
  isOpen, 
  onClose, 
  adminEmail = 'jemalfano030@gmail.com',
  isAdmin = false 
}: UserManualModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'admin'>('customer');
  const [language, setLanguage] = useState<'om' | 'en'>('om');

  // Automatically switch tab if isAdmin becomes true
  React.useEffect(() => {
    if (isAdmin) {
      setActiveTab('all');
    } else {
      setActiveTab('customer');
    }
  }, [isAdmin]);

  const currentTab = isAdmin ? activeTab : 'customer';

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    const isOm = language === 'om';
    
    const adminCoverHeader = isAdmin ? `
      <div class="flex items-center justify-center gap-4 text-xs font-mono text-slate-400">
        <span>Admin: jemalfano030@gmail.com</span>
        <span>•</span>
        <span>PIN: 2194</span>
      </div>
    ` : `
      <div class="flex items-center justify-center gap-4 text-xs font-mono text-slate-400">
        <span>IresoJ Digital Customer Guide</span>
      </div>
    `;

    const adminSectionHTML = isAdmin ? `
      <!-- Section 2 -->
      <div class="space-y-6 pt-4">
        <div class="flex items-center gap-2 pb-2 border-b-2 border-indigo-500 text-indigo-900">
          <span class="text-xl">🔐</span>
          <h2 class="text-xl font-bold">
            \${isOm ? 'KUTAA 2: QAJEELFAMA BULCHAA (ADMINISTRATOR GUIDE)' : 'SECTION 2: ADMIN USER MANUAL'}
          </h2>
        </div>

        <div class="space-y-4">
          <div class="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <h3 class="font-bold text-indigo-950 flex items-center gap-2">
              <span>🔑</span> \${isOm ? 'A. Seensa Admin (Admin Login & Security)' : 'A. Administrator Login'}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              \${isOm 
                ? 'Header ykn Footer irraa "Admin Portal" cuqqaaluun lakkoofsa iccitii (Security PIN: 2194) galchuun seenaa. Bulchiinsi email admin jemalfano030@gmail.com waliin qindaa\\\'eera.'
                : 'Click "Admin Portal" in the navigation bar or footer. Authenticate using your Security PIN (2194). Admin session credentials align with jemalfano030@gmail.com.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 class="font-bold text-slate-900 flex items-center gap-2">
              <span>📊</span> \${isOm ? 'B. Command Center & Sync Telemetry' : 'B. Command Center Telemetry'}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              \${isOm 
                ? 'Dashboard irraa kaffaltii fi galmee haarawaa bataskaanaan ilaaluuf button "Refresh Data" cuqqaalaa. Galmee hunda kompiitara keessan irratti olkaawwachuuf "Export CSV" cuqqaalaa.'
                : 'In the Command Center, monitor live operational analytics. Click "Refresh Data" to pull latest orders and click "Export CSV" to store offline audit records on your computer.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 class="font-bold text-slate-900 flex items-center gap-2">
              <span>📣</span> \${isOm ? 'C. Beeksisa Miidiyaa Hawaasaa (Social Media Broadcast)' : 'C. Social Media Advert Broadcasting'}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              \${isOm 
                ? 'Kutaa "Announcements & Share" seenuun oduu teeknoolojii ykn beeksisa haaraa maxxansaa. Linkiileen YouTube, TikTok, Facebook, Telegram fi WhatsApp kallattiin qophaa\\\'uun tamsaasaaf gargaaru.'
                : 'Under "Announcements & Share", publish news or store promotional offers. The system auto-generates multi-platform campaign links for YouTube, TikTok, Facebook, Telegram & WhatsApp.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 class="font-bold text-slate-900 flex items-center gap-2">
              <span>✅</span> \${isOm ? 'D. Mirkaneessa Kaffaltii (Payment Verification)' : 'D. Payment Transaction Verification'}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              \${isOm 
                ? 'Kutaa "Transactions" seenuun kaffaltii telebirr fi CBE Birr miseensota irraa dhufe mirkaneessaa ("Approve"). Kaffaltiin yeroo mirkana\\\'u tajaajilli saamuufi asset download ta\\\'a.'
                : 'Go to the "Transactions" tab. Review reference IDs submitted by customers via telebirr or CBE Birr and click "Approve" to unlock digital assets or finalize service bookings.'}
            </p>
          </div>
        </div>
      </div>
    ` : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${isOm ? 'Qajeelfama Fayyadamaa - IresoJ Digital CSC' : 'User Manual - IresoJ Digital CSC'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; padding: 0 !important; }
      .container { max-width: 100% !important; border: none !important; box-shadow: none !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 p-4 sm:p-8 md:p-12">
  <div class="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 container">
    
    <!-- Top Bar with Print/Save button (Hidden on Print) -->
    <div class="no-print mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">💡</span>
        <div>
          <h4 class="font-bold text-amber-900 text-sm">
            \${isOm ? 'Qajeelfama kana Maaliif Buufattu?' : 'Why Download this Manual?'}
          </h4>
          <p class="text-xs text-amber-700">
            \${isOm ? 'Faayilli kun offline ni hojjata. Cuqaasi Print cuqqaaluun gara PDFtti jijjiiri!' : 'This file works completely offline. Click Print below to save it directly as a PDF!'}
          </p>
        </div>
      </div>
      <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer">
        🖨️ \${isOm ? 'Gara PDFtti Jijjiiri / Print' : 'Save as PDF / Print'}
      </button>
    </div>

    <!-- Cover Header -->
    <div class="text-center space-y-4 border-b border-slate-200 pb-8">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-black uppercase tracking-wider">
        🌍 IresoJ Digital CSC Computer &amp; Media Services
      </div>
      <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
        \${isOm ? 'Qajeelfama Fayyadamaa Applikeeshinii' : 'Complete Application User Manual'}
      </h1>
      <p class="text-sm text-slate-500 max-w-2xl mx-auto">
        \${isOm 
          ? 'Qajeelfama qabatamaa tajaajiloota fi bulchiinsa IresoJ Digital Computer &amp; Media Services Center (Kore Town Center).' 
          : 'Official operating manual for services and administration of IresoJ Digital Computer &amp; Media Services Center.'}
      </p>
      \${adminCoverHeader}
    </div>

    <!-- Manual Content -->
    <div class="mt-8 space-y-10">
      
      <!-- Section 1 -->
      <div class="space-y-6">
        <div class="flex items-center gap-2 pb-2 border-b-2 border-sky-500 text-sky-900">
          <span class="text-xl">👤</span>
          <h2 class="text-xl font-bold">
            \${isOm ? 'KUTAA 1: QAJEELFAMA FAYYADAMAA (CUSTOMER GUIDE)' : 'SECTION 1: CUSTOMER USER GUIDE'}
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span class="text-[10px] font-mono font-bold text-sky-600 uppercase bg-sky-100 px-2 py-0.5 rounded-full">Step 1</span>
            <h3 class="font-bold text-slate-900">
              \${isOm ? '1. Galmee Tajaajilaa Qindeessuu (Book a Service)' : '1. Booking a Service'}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              \${isOm 
                ? 'Home page irraa button "Book Service" cuqqaaluun tajaajila barbaaddan (Suphaa Kompiitaraa, Beeksisa Miidiyaa Hawaasaa TikTok/YouTube/Facebook, Maxxansaa) filadhaa. Maqaa fi bilbila keessan galchuun galmeessaa.'
                : 'Click "Book Service" on the home screen. Select your desired service (Laptop Repair, Social Media Promotion on TikTok/YouTube/Facebook, Graphic Layouts). Enter your contact info and submit.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span class="text-[10px] font-mono font-bold text-sky-600 uppercase bg-sky-100 px-2 py-0.5 rounded-full">Step 2</span>
            <h3 class="font-bold text-slate-900">
              \${isOm ? '2. Hordoffii Sadarkaa Tajaajilaa (Track Service Order)' : '2. Tracking Your Order'}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              \${isOm 
                ? 'Kutaa "Service Tracker" seenuun lakkoofsa eenyummeessaa (Reference Code BK-1001) ykn lakkoofsa bilbila keessan galchuun sadarkaa suphaa ykn tamsaasa miidiyaa keessaniitii hordofaa.'
                : 'Navigate to "Service Tracker". Input your Booking Code (e.g. BK-1001) or Phone Number to view live status updates and diagnostic workbench notes.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span class="text-[10px] font-mono font-bold text-sky-600 uppercase bg-sky-100 px-2 py-0.5 rounded-full">Step 3</span>
            <h3 class="font-bold text-slate-900">
              \${isOm ? '3. Gabaa Digital Asset & Barbaradaa Search' : '3. Marketplace & Recent Searches'}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              \${isOm 
                ? 'Kutaa "Marketplace" irratti meeshaa digital (PDF, Video Course, Templates) barbaaddan Search box ykn "Recent Searches" cuqqaaluun dafee isiiniif fida. telebirr ykn CBE Birr\\\'n kaffaluun faayila buufadhaa.'
                : 'In the "Marketplace", search digital products or click "Recent Searches" for instant filtering. Pay via telebirr or CBE Birr and verify payment reference for instant access.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span class="text-[10px] font-mono font-bold text-sky-600 uppercase bg-sky-100 px-2 py-0.5 rounded-full">Step 4</span>
            <h3 class="font-bold text-slate-900">
              \${isOm ? '4. Shakaallii Baasii (Service Cost Estimator)' : '4. Service Cost Estimator'}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              \${isOm 
                ? 'Gatiin suphaa fi tajaajilamaa hangam akka ta\\\'e tilmaamuuf "Service Cost Estimator" fayyadamaa. Baasii tilmaamaa argattanii akkuma sanaan galmee toora intarnaatiitiin qindeessaa.'
                : 'Use the interactive Cost Estimator tool to calculate estimated repair fees or design quotes before placing your booking order.'}
            </p>
          </div>
        </div>
      </div>

      \${adminSectionHTML}

    </div>

    <!-- Footer -->
    <div class="pt-8 border-t border-slate-200 text-center space-y-2 text-slate-400 font-mono text-xs mt-12">
      <p class="font-bold text-slate-600">IresoJ Digital CSC Computer &amp; Media Services Center</p>
      <p>Kore Town Center, West Arsi Zone, Oromia, Ethiopia | Contact: +251 995 852 194</p>
      <p class="text-[10px]">Generated on \${new Date().toLocaleDateString()}</p>
    </div>

  </div>
  
  <!-- Float print action for convenient offline view -->
  <div class="fixed bottom-6 right-6 no-print">
    <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm">
      🖨️ \${isOm ? 'Print / Gara PDF' : 'Print / Save PDF'}
    </button>
  </div>
</body>
</html>`;

    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', isOm ? 'Qajeelfama_Fayyadamaa_IresoJ_Digital.html' : 'User_Manual_IresoJ_Digital.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Header Bar - Hidden during printing */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between gap-4 shrink-0 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-white">
                  {language === 'om' ? 'Qajeelfama Fayyadamaa Applikeeshinii' : 'Application Complete User Manual'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                  PDF READY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'om' 
                  ? 'Ibsa Guutuu: Tartiiba Fayyadamaa Customer & Admin (jemalfano030@gmail.com)' 
                  : 'Complete Step-by-Step Guide for Customers & Administrator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
              <button
                onClick={() => setLanguage('om')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${language === 'om' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Afaan Oromoo
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
            </div>

            {/* Export PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Manual Category Filter Buttons - Hidden during printing */}
        {isAdmin ? (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                {language === 'om' ? 'Hunda (All Sections)' : 'All Sections'}
              </button>
              <button
                onClick={() => setActiveTab('customer')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'customer' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{language === 'om' ? 'Kutaa Fayyadamaa (Customer)' : 'Customer Section'}</span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'om' ? 'Kutaa Admin (Administrator)' : 'Admin Section'}</span>
              </button>
            </div>

            <span className="text-[11px] font-mono font-bold text-slate-500 hidden md:inline">
              Admin Email: <span className="text-indigo-600">{adminEmail}</span>
            </span>
          </div>
        ) : (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-xs text-sky-800 font-bold bg-sky-50/50 px-3 py-1 rounded-xl border border-sky-100">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>{language === 'om' ? 'Qajeelfama Tajaajila Fayyadamaa' : 'Customer Interactive Guide'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Verified Public Manual
            </span>
          </div>
        )}

        {/* Scrollable Printable Manual Body Content */}
        <div className="p-6 sm:p-10 space-y-8 overflow-y-auto print:p-0 print:overflow-visible text-slate-800">
          
          {/* Cover / Title Badge Header */}
          <div className="text-center space-y-3 border-b border-slate-200 pb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-black uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>IresoJ Digital CSC Computer &amp; Media Services</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              {language === 'om' 
                ? 'Qajeelfama Fayyadamaa Applikeeshinii (Jalqaba Hanga Xumuraatti)'
                : 'Complete Application User Manual (Start to Finish Guide)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
              {language === 'om'
                ? isAdmin 
                  ? 'Qajeelfama kana irraa akkaataa fayyadamaa (customer) fi bulchaa applikeeshiniichaa (admin) ta\'aniin hojiiwwan hunda itti raawwattan tartiibaan barattu. PDF dokumentii kana galmeeffachuuf button Download PDF cuqqaalaa.'
                  : 'Qajeelfama kana irraa akkaataa fayyadamaa (customer) ta\'aniin hojiiwwan tajaajilaa hunda itti raawwattan tartiibaan barattu.'
                : isAdmin
                  ? 'This comprehensive documentation guides both end-users and administrators through all system features step-by-step. Use the Download PDF button above to save or print.'
                  : 'This operating manual guides customers through all system features and booking workflows step-by-step.'}
            </p>
          </div>

          {/* SECTION 1: CUSTOMER MANUAL */}
          {(currentTab === 'all' || currentTab === 'customer') && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-sky-500 text-sky-900">
                <UserCheck className="w-6 h-6 text-sky-600" />
                <h2 className="text-xl font-black font-display">
                  {language === 'om' ? 'KUTAA 1: QAJEELFAMA FAYYADAMAA (CUSTOMER GUIDE)' : 'SECTION 1: CUSTOMER USER GUIDE'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1: Services Booking */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-sky-600 uppercase bg-sky-100 px-2 py-0.5 rounded-full">Tartiiba 1 / Step 1</span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'om' ? '1. Galmee Tajaajilaa Qindeessuu (Book a Service)' : '1. Booking a Service'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'om'
                      ? 'Home page irraa button "Book Service" cuqqaaluun tajaajila barbaaddan (Suphaa Kompiitaraa, Beeksisa Miidiyaa Hawaasaa TikTok/YouTube/Facebook, Maxxansaa) filadhaa. Maqaa fi bilbila keessan galchuun galmeessaa.'
                      : 'Click "Book Service" on the home screen. Select your desired service (Laptop Repair, Social Media Promotion on TikTok/YouTube/Facebook, Graphic Layouts). Enter your contact info and submit.'}
                  </p>
                </div>

                {/* Step 2: Service Tracking */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-sky-600 uppercase bg-sky-100 px-2 py-0.5 rounded-full">Tartiiba 2 / Step 2</span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'om' ? '2. Hordoffii Sadarkaa Tajaajilaa (Track Service Order)' : '2. Tracking Your Order'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'om'
                      ? 'Kutaa "Service Tracker" seenuun lakkoofsa eenyummeessaa (Reference Code BK-1001) ykn lakkoofsa bilbila keessan galchuun sadarkaa suphaa ykn tamsaasa miidiyaa keessaniitii hordofaa.'
                      : 'Navigate to "Service Tracker". Input your Booking Code (e.g. BK-1001) or Phone Number to view live status updates and diagnostic workbench notes.'}
                  </p>
                </div>

                {/* Step 3: Marketplace & Digital Purchasing */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-sky-600 uppercase bg-sky-100 px-2 py-0.5 rounded-full">Tartiiba 3 / Step 3</span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'om' ? '3. Gabaa Digital Asset & Barbaradaa Search' : '3. Marketplace & Recent Searches'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'om'
                      ? 'Kutaa "Marketplace" irratti meeshaa digital (PDF, Video Course, Templates) barbaaddan Search box ykn "Recent Searches" cuqqaaluun dafee isiiniif fida. telebirr ykn CBE Birr\'n kaffaluun faayila buufadhaa.'
                      : 'In the "Marketplace", search digital products or click "Recent Searches" for instant filtering. Pay via telebirr or CBE Birr and verify payment reference for instant access.'}
                  </p>
                </div>

                {/* Step 4: Airtime & Repair Cost Estimator */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-sky-600 uppercase bg-sky-100 px-2 py-0.5 rounded-full">Tartiiba 4 / Step 4</span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'om' ? '4. Shakaallii Baasii (Service Cost Estimator)' : '4. Service Cost Estimator'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'om'
                      ? 'Gatiin suphaa fi tajaajilamaa hangam akka ta\'e tilmaamuuf "Service Cost Estimator" fayyadamaa. Baasii tilmaamaa argattanii akkuma sanaan galmee toora intarnaatiitiin qindeessaa.'
                      : 'Use the interactive Cost Estimator tool to calculate estimated repair fees or design quotes before placing your booking order.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ADMINISTRATOR MANUAL */}
          {isAdmin && (currentTab === 'all' || currentTab === 'admin') && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-indigo-500 text-indigo-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-black font-display">
                    {language === 'om' ? 'KUTAA 2: QAJEELFAMA BULCHAA (ADMINISTRATOR GUIDE)' : 'SECTION 2: ADMIN USER MANUAL'}
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {adminEmail}
                </span>
              </div>

              <div className="space-y-4">
                {/* Admin Auth */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'om' ? 'A. Seensa Admin (Admin Login & Security)' : 'A. Administrator Login'}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'om'
                      ? 'Header ykn Footer irraa "Admin Portal" cuqqaaluun lakkoofsa iccitii (Security PIN: 2194) galchuun seenaa. Bulchiinsi email admin jemalfano030@gmail.com waliin qindaa\'eera.'
                      : 'Click "Admin Portal" in the navigation bar or footer. Authenticate using your Security PIN (2194). Admin session credentials align with jemalfano030@gmail.com.'}
                  </p>
                </div>

                {/* Command Center & Live Refresh */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>{language === 'om' ? 'B. Command Center & Sync Telemetry' : 'B. Command Center Telemetry'}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">CSV Export Ready</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'om'
                      ? 'Dashboard irraa kaffaltii fi galmee haarawaa bataskaanaan ilaaluuf button "Refresh Data" cuqqaalaa. Galmee hunda kompiitara keessan irratti olkaawwachuuf "Export CSV" cuqqaalaa.'
                      : 'In the Command Center, monitor live operational analytics. Click "Refresh Data" to pull latest orders and click "Export CSV" to store offline audit records on your computer.'}
                  </p>
                </div>

                {/* Social Media Broadcast & Promotion Adverts */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>{language === 'om' ? 'C. Beeksisa Miidiyaa Hawaasaa (Social Media Broadcast)' : 'C. Social Media Advert Broadcasting'}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'om'
                      ? 'Kutaa "Announcements & Share" seenuun oduu teeknoolojii ykn beeksisa haaraa maxxansaa. Linkiileen YouTube, TikTok, Facebook, Telegram fi WhatsApp kallattiin qophaa\'uun tamsaasaaf gargaaru.'
                      : 'Under "Announcements & Share", publish news or store promotional offers. The system auto-generates multi-platform campaign links for YouTube, TikTok, Facebook, Telegram & WhatsApp.'}
                  </p>
                </div>

                {/* Payment Approval */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'om' ? 'D. Mirkaneessa Kaffaltii (Payment Verification)' : 'D. Payment Transaction Verification'}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'om'
                      ? 'Kutaa "Transactions" seenuun kaffaltii telebirr fi CBE Birr miseensota irraa dhufe mirkaneessaa ("Approve"). Kaffaltiin yeroo mirkanaa\'u tajaajilli saamuufi asset download ta\'a.'
                      : 'Go to the "Transactions" tab. Review reference IDs submitted by customers via telebirr or CBE Birr and click "Approve" to unlock digital assets or finalize service bookings.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note for Print/PDF */}
          <div className="pt-6 border-t border-slate-200 text-center space-y-1 text-slate-400 font-mono text-[11px]">
            <p className="font-bold text-slate-600">IresoJ Digital CSC Computer &amp; Media Services Center</p>
            <p>Kore Town Center, West Arsi Zone, Oromia, Ethiopia | Contact: +251 995 852 194</p>
            <p className="text-[10px]">Document generated on {new Date().toLocaleDateString()}</p>
          </div>

        </div>

        {/* Modal Bottom Actions Bar - Hidden during printing */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0 print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            {language === 'om' ? 'Qajeelfama kana PDF godhanii save gochuuf:' : 'To save this manual as a PDF file:'} <strong className="text-slate-800">Click Download PDF → Choose "Save as PDF"</strong>
          </span>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>{language === 'om' ? 'PDF Maxxansi / Save PDF' : 'Print / Save as PDF'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
