import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { ProductService } from '../types';

interface BookServiceModalProps {
  onClose: () => void;
  products: ProductService[];
  lang: 'en' | 'om';
  onSubmitBooking: (bookingData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    serviceTitle: string;
    bookingDate: string;
    bookingTime: string;
    notes?: string;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function BookServiceModal({ onClose, products, lang, onSubmitBooking }: BookServiceModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedService, setSelectedService] = useState('maint_general');
  const [customServiceTitle, setCustomServiceTitle] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Translations dictionary inside the modal for extreme local modularity
  const mTrans = {
    en: {
      title: 'Book a Professional Service',
      subtitle: 'Schedule expert computer repairs, layout designs, or custom IT tutoring',
      customerName: 'Your Full Name *',
      customerPhone: 'Phone Number *',
      customerEmail: 'Email Address (Optional)',
      selectService: 'Preferred Service *',
      customServiceLabel: 'Specify Custom Service *',
      bookingDate: 'Preferred Date *',
      bookingTime: 'Preferred Time Slot *',
      notes: 'Additional Details or Specific Requirements',
      submitBtn: 'Confirm Appointment Booking',
      submitting: 'Saving booking reservation...',
      successTitle: 'Booking Registered!',
      successDesc: 'Your appointment has been registered in our database. Our expert technician in Kore Town will contact you shortly to confirm.',
      closeBtn: 'Close Window',
      validationErr: 'Please fill in all required fields.',
      customSvcPlaceholder: 'e.g. Printer roller replacement, custom booklet design',
      notesPlaceholder: 'Specify any brand/model names, error messages, or custom specifications you have...',
      services: {
        maint_general: '🚀 Social Media Promotion & Tech News Broadcast (YouTube, TikTok, Facebook)',
        print_general: '🖨️ Graphic Design, Content Posts & Layout Publishing',
        train_general: '🎓 Tech Insights, Video Editing & Digital Literacy Training',
        phone_repair: '📲 Tech News Article & Multi-Platform Post Publishing',
        custom_other: '✨ Custom Social Media Campaign & Tech Broadcast'
      }
    },
    om: {
      title: 'Tajaajila Galmeessisi (Book)',
      subtitle: 'Beeksisa Miidiyaa Hawaasaa (YouTube, TikTok, Facebook), Oduu Teeknoolojii fi Dizaayinii Qindeessi',
      customerName: 'Maqaa Guutuu Keessan *',
      customerPhone: 'Lakkoofsa Bilbilaa *',
      customerEmail: 'Teessoo Imeeylii (Filannoo)',
      selectService: 'Tajaajila Filatame *',
      customServiceLabel: 'Tajaajila Addaa Ibsi *',
      bookingDate: 'Guyyaa Filatame *',
      bookingTime: 'Sa\'aatii Filatame *',
      notes: 'Yaada Dabalataa ykn Waantota Barbaachisan',
      submitBtn: 'Mirkaneessa Galmee Ergi',
      submitting: 'Galmeen qindaa\'aa jira...',
      successTitle: 'Galmeeffameera!',
      successDesc: 'Galmeen keessan kuusaa ragaa (database) keenya keessatti olkaa\'ameera. Ogeessi keenya Magaalaa Qoree dhiyeenyatti isin quunnama.',
      closeBtn: 'Cufi',
      validationErr: 'Maaloo iddoowwan dirqama ta\'an hunda guutaa.',
      customSvcPlaceholder: 'Fakkeenya: Beeksisa TikTok/YouTube, Dizaayinii Oduu Teeknoolojii',
      notesPlaceholder: 'Maaloo ergaa beeksisaa, fakkii/viidiyo, ykn qulqullina barbaaddan ibsaa...',
      services: {
        maint_general: '🚀 Beeksisa Miidiyaa Hawaasaa (YouTube, TikTok, Facebook)',
        print_general: '🖨️ Dizaayinii Grafiksii fi Maxxansaa Poostii',
        train_general: '🎓 Oduu Teeknoolojii, Viidiyoo Gulantaa fi Barnoota IT',
        phone_repair: '📲 Tamsaasa Oduu fi Odeeffannoo Teeknoolojii',
        custom_other: '✨ Beeksisa Addaa / Tajaajila Miidiyaa Biraa'
      }
    }
  };

  const t = mTrans[lang];

  // Dynamically obtain service title
  const getServiceTitle = () => {
    if (selectedService === 'custom_other') {
      return customServiceTitle.trim() || t.services.custom_other;
    }
    // Look up in hardcoded dictionary
    if (t.services[selectedService as keyof typeof t.services]) {
      return t.services[selectedService as keyof typeof t.services];
    }
    // Look up in actual catalog products
    const matched = products.find(p => p.id === selectedService);
    return matched ? matched.title : selectedService;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const finalServiceTitle = getServiceTitle();

    if (!customerName.trim() || !customerPhone.trim() || !bookingDate || !bookingTime || !selectedService) {
      setErrorMsg(t.validationErr);
      return;
    }

    if (selectedService === 'custom_other' && !customServiceTitle.trim()) {
      setErrorMsg(t.customServiceLabel);
      return;
    }

    setSubmitting(true);
    try {
      const response = await onSubmitBooking({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        serviceId: selectedService,
        serviceTitle: finalServiceTitle,
        bookingDate,
        bookingTime,
        notes: notes.trim() || undefined
      });

      if (response.success) {
        setSuccessMsg(response.message || t.successTitle);
      } else {
        setErrorMsg(response.error || 'Failed to register service booking. Please try again.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred while communicating with the database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      id="booking-modal-overlay" 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
    >
      <div 
        id="booking-modal-card"
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in slide-in-from-bottom-12 duration-300"
      >
        {/* Top Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-[#0EA5E9]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start">
          <div className="space-y-1 pr-4">
            <h2 className="font-display font-black text-xl text-slate-800 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0EA5E9] animate-pulse" />
              <span>{t.title}</span>
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          /* Success Content View */
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-md shadow-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-black text-xl text-slate-800">{t.successTitle}</h3>
              <p className="text-slate-600 text-xs leading-relaxed max-w-sm mx-auto">
                {t.successDesc}
              </p>
            </div>
            
            {/* Booking Receipt Preview Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 w-full text-left space-y-2.5 font-mono text-xs text-slate-700">
              <div className="flex justify-between pb-1.5 border-b border-dashed border-slate-200">
                <span className="font-sans font-bold text-slate-500 uppercase tracking-wider text-[9px]">Customer:</span>
                <span className="font-bold text-slate-900">{customerName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-dashed border-slate-200">
                <span className="font-sans font-bold text-slate-500 uppercase tracking-wider text-[9px]">Phone:</span>
                <span className="font-bold text-slate-900">{customerPhone}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-dashed border-slate-200">
                <span className="font-sans font-bold text-slate-500 uppercase tracking-wider text-[9px]">Service:</span>
                <span className="font-bold text-[#0EA5E9] truncate max-w-[200px]">{getServiceTitle()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans font-bold text-slate-500 uppercase tracking-wider text-[9px]">Schedule:</span>
                <span className="font-bold text-slate-900">{bookingDate} • {bookingTime}</span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3 bg-[#0EA5E9] hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-100 transition-colors"
            >
              {t.closeBtn}
            </button>
          </div>
        ) : (
          /* Form Content View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Service Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <span>{t.selectService}</span>
              </label>
              <div className="relative">
                <select 
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    if (e.target.value !== 'custom_other') {
                      setCustomServiceTitle('');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0EA5E9] transition-all cursor-pointer font-medium"
                >
                  <optgroup label={lang === 'en' ? 'Core Categories' : 'Gareewwan Suphaa'}>
                    <option value="maint_general">{t.services.maint_general}</option>
                    <option value="print_general">{t.services.print_general}</option>
                    <option value="train_general">{t.services.train_general}</option>
                    <option value="phone_repair">{t.services.phone_repair}</option>
                  </optgroup>
                  
                  {products.length > 0 && (
                    <optgroup label={lang === 'en' ? 'Direct Catalog Services' : 'Tajaajila Katalogii'}>
                      {products
                        .filter(p => p.type === 'service' || p.category === 'maintenance' || p.category === 'print_publish')
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            🛠️ {p.title} ({formatPrice(p.price)})
                          </option>
                        ))}
                    </optgroup>
                  )}
                  
                  <option value="custom_other">{t.services.custom_other}</option>
                </select>
              </div>
            </div>

            {/* Custom service specify field if Custom other is selected */}
            {selectedService === 'custom_other' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-3 duration-200">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {t.customServiceLabel}
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    value={customServiceTitle}
                    onChange={(e) => setCustomServiceTitle(e.target.value)}
                    placeholder={t.customSvcPlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0EA5E9] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Date and Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.bookingDate}</span>
                </label>
                <input 
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0EA5E9] transition-all cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.bookingTime}</span>
                </label>
                <input 
                  type="time"
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0EA5E9] transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Customer Information Section */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.customerName}</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Jemal Fano"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0EA5E9] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.customerPhone}</span>
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="e.g. +251 900 000000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0EA5E9] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.customerEmail}</span>
                </label>
                <input 
                  type="email"
                  placeholder="e.g. jemal@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0EA5E9] transition-all"
                />
              </div>
            </div>

            {/* Notes / Special Instructions */}
            <div className="space-y-1.5 pt-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.notes}</span>
              </label>
              <textarea 
                rows={3}
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0EA5E9] transition-all resize-none"
              />
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#0EA5E9] hover:bg-sky-600 disabled:bg-sky-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-100 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.submitting}</span>
                </>
              ) : (
                <span>{t.submitBtn}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Simple price formatter helper local to file
function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price).replace('ETB', 'ETB ');
}
