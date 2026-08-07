import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Wrench, 
  Laptop, 
  Printer, 
  BookOpen, 
  HardDrive, 
  Sparkles, 
  ArrowRight, 
  ChevronRight,
  Info,
  Check,
  Send,
  CalendarCheck,
  DollarSign,
  CalendarPlus
} from 'lucide-react';
import { formatETB } from '../utils';
import { downloadICal } from '../utils/calendar';

export interface RepairTaskOption {
  id: string;
  name: string;
  category: 'hardware' | 'software' | 'print' | 'training';
  iconName: string;
  minPrice: number;
  maxPrice: number;
  description: string;
  estimatedDuration: string;
  tooltip?: string;
}

const COMMON_REPAIR_TASKS: RepairTaskOption[] = [
  {
    id: 'screen_replacement',
    name: 'Laptop Screen Replacement',
    category: 'hardware',
    iconName: 'laptop',
    minPrice: 3500,
    maxPrice: 6500,
    description: 'Original HD/FHD screen panel replacement with 3-month warranty.',
    estimatedDuration: '1 - 2 Hours',
    tooltip: 'We use genuine A-grade replacement panels. This service includes full testing for dead pixels and color accuracy.'
  },
  {
    id: 'os_install',
    name: 'OS Install & System Tuning',
    category: 'software',
    iconName: 'wrench',
    minPrice: 500,
    maxPrice: 1200,
    description: 'Clean Windows 11/10 installation, official drivers, antivirus, and office software.',
    estimatedDuration: '45 Mins',
    tooltip: 'A fresh installation that removes all bloatware and viruses. We optimize the registry and startup items for peak performance.'
  },
  {
    id: 'diagnostic_check',
    name: 'Motherboard Diagnostic Check',
    category: 'hardware',
    iconName: 'wrench',
    minPrice: 300,
    maxPrice: 800,
    description: 'Full electrical and chip-level inspection for no-power or overheating issues.',
    estimatedDuration: '30 Mins',
    tooltip: 'Using professional diagnostic cards and multimeters, we trace power rails and check for short circuits at the component level.'
  },
  {
    id: 'battery_replacement',
    name: 'Battery / Power Adapter Replacement',
    category: 'hardware',
    iconName: 'laptop',
    minPrice: 1800,
    maxPrice: 3200,
    description: 'Brand new high-capacity internal or external battery with charger calibration.',
    estimatedDuration: '20 Mins',
    tooltip: 'Replacement of lithium cells with high-quality alternatives that meet or exceed original capacity specifications.'
  },
  {
    id: 'keyboard_repair',
    name: 'Keyboard Repair & Clean',
    category: 'hardware',
    iconName: 'laptop',
    minPrice: 700,
    maxPrice: 1400,
    description: 'Key replacement or full keyboard assembly refresh with dust extraction.',
    estimatedDuration: '45 Mins',
    tooltip: 'Includes ultrasonic cleaning of keycaps and replacement of individual faulty switches or the entire membrane assembly.'
  },
  {
    id: 'printer_maintenance',
    name: 'Printer Head Clean & Ink Refill',
    category: 'print',
    iconName: 'printer',
    minPrice: 800,
    maxPrice: 1600,
    description: 'Inkjet/LaserJet head alignment, roller cleaning, and eco-tank ink refilling.',
    estimatedDuration: '1 Hour',
    tooltip: 'Specialized solvent cleaning for clogged print heads and professional calibration for color matching.'
  },
  {
    id: 'graphics_layout',
    name: 'Corporate Layout & Print Design',
    category: 'print',
    iconName: 'print',
    minPrice: 400,
    maxPrice: 1200,
    description: 'Professional layout design for brochures, business booklets, and ID cards.',
    estimatedDuration: 'Same Day',
    tooltip: 'High-resolution graphic design tailored for CMYK printing, ensuring no bleeding or pixelation in final outputs.'
  },
  {
    id: 'data_recovery',
    name: 'Data Recovery & Backup',
    category: 'software',
    iconName: 'harddrive',
    minPrice: 1000,
    maxPrice: 2500,
    description: 'Deep sector scanning for corrupted hard drives, USB flash drives, or deleted files.',
    estimatedDuration: '2 - 4 Hours',
    tooltip: 'We use non-destructive cloning tools to recover data from failing drives before performing deep sector analysis.'
  },
  {
    id: 'it_training',
    name: 'Basic IT & Computer Course',
    category: 'training',
    iconName: 'book',
    minPrice: 1500,
    maxPrice: 2800,
    description: 'Practical 2-week hands-on coaching on OS navigation, Word, Excel, and Web safety.',
    estimatedDuration: '2 Weeks',
    tooltip: 'Personalized 1-on-1 sessions focusing on practical skills needed for modern office environments and digital literacy.'
  }
];

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM'
];

interface ServiceCostEstimatorProps {
  onBookingSubmitted?: (bookingData: any) => void;
}

export default function ServiceCostEstimator({ onBookingSubmitted }: ServiceCostEstimatorProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(['screen_replacement']);
  const [urgency, setUrgency] = useState<'standard' | 'express'>('standard');
  const [activeStep, setActiveStep] = useState<'estimate' | 'calendar'>('estimate');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState(TIME_SLOTS[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Toggle selection
  const toggleTask = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(t => t !== id) : prev) : [...prev, id]
    );
  };

  // Price Calculation
  const priceRange = useMemo(() => {
    let minSum = 0;
    let maxSum = 0;
    selectedTaskIds.forEach(id => {
      const task = COMMON_REPAIR_TASKS.find(t => t.id === id);
      if (task) {
        minSum += task.minPrice;
        maxSum += task.maxPrice;
      }
    });

    if (urgency === 'express') {
      minSum += 250;
      maxSum += 400;
    }

    return { min: minSum, max: maxSum };
  }, [selectedTaskIds, urgency]);

  const selectedTasks = useMemo(() => {
    return COMMON_REPAIR_TASKS.filter(t => selectedTaskIds.includes(t.id));
  }, [selectedTaskIds]);

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    setIsSubmitting(true);
    const serviceTitleCombined = selectedTasks.map(t => t.name).join(' + ');
    const newBookingData = {
      customerName,
      customerPhone,
      customerEmail,
      serviceId: selectedTaskIds[0] || 'custom',
      serviceTitle: serviceTitleCombined,
      bookingDate,
      bookingTime,
      notes: `Estimated Cost: ${formatETB(priceRange.min)} - ${formatETB(priceRange.max)} (${urgency.toUpperCase()} Urgency). ${notes ? 'Notes: ' + notes : ''}`,
      date: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookingData)
      });

      let created = newBookingData;
      if (res.ok) {
        created = await res.json();
      } else {
        (created as any).id = 'BK-' + Math.floor(100000 + Math.random() * 900000);
      }

      setBookingSuccess({
        ...created,
        estimatedPrice: `${formatETB(priceRange.min)} - ${formatETB(priceRange.max)}`,
        tasks: serviceTitleCombined
      });

      if (onBookingSubmitted) {
        onBookingSubmitted(created);
      }
    } catch (err) {
      setBookingSuccess({
        id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
        customerName,
        customerPhone,
        serviceTitle: serviceTitleCombined,
        bookingDate,
        bookingTime,
        estimatedPrice: `${formatETB(priceRange.min)} - ${formatETB(priceRange.max)}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'laptop': return <Laptop className="w-4 h-4 text-sky-500" />;
      case 'printer': return <Printer className="w-4 h-4 text-emerald-500" />;
      case 'book': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'harddrive': return <HardDrive className="w-4 h-4 text-amber-500" />;
      default: return <Wrench className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div id="service-cost-estimator-widget" className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden transition-all">
      
      {/* Widget Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#0EA5E9]/15 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2 border border-sky-500/30">
              <Calculator className="w-3.5 h-3.5 text-sky-400" />
              <span>Interactive Service Cost Estimator & Booking</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Estimate Repair Cost & Schedule Slot
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Select common hardware, software, or printing tasks to calculate your estimated price range in ETB, then pick an appointment date.
            </p>
          </div>

          {/* Navigation Pills */}
          <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
            <button
              onClick={() => setActiveStep('estimate')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStep === 'estimate' 
                  ? 'bg-[#0EA5E9] text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>1. Select Services ({selectedTaskIds.length})</span>
            </button>
            <button
              onClick={() => setActiveStep('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStep === 'calendar' 
                  ? 'bg-[#0EA5E9] text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>2. Booking Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Estimator Workspace */}
      <div className="p-6 sm:p-8">

        {bookingSuccess ? (
          /* Confirmation Screen */
          <div className="p-8 bg-emerald-50/60 rounded-3xl border border-emerald-200 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">Appointment Scheduled</span>
              <h3 className="text-2xl font-black text-slate-900 font-display">Service Ticket #{bookingSuccess.id || 'CONFIRMED'}</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you <strong>{bookingSuccess.customerName}</strong>! Your service slot is reserved at IresoJ Digital CSC Center in Kore Town.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left space-y-2.5 font-sans text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Service Request</span>
                <span className="font-bold text-slate-900 text-right">{bookingSuccess.serviceTitle || bookingSuccess.tasks}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Date & Time</span>
                <span className="font-mono font-bold text-slate-800">{bookingSuccess.bookingDate} at {bookingSuccess.bookingTime}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Estimated Price Quote</span>
                <span className="font-bold text-[#0EA5E9] font-mono text-sm">{bookingSuccess.estimatedPrice}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  const [year, month, day] = bookingSuccess.bookingDate.split('-').map(Number);
                  const [hours, minutes] = bookingSuccess.bookingTime.replace(/(AM|PM)/, '').split(':').map(Number);
                  const isPM = bookingSuccess.bookingTime.includes('PM');
                  const finalHours = isPM && hours < 12 ? hours + 12 : (!isPM && hours === 12 ? 0 : hours);
                  
                  const startDate = new Date(year, month - 1, day, finalHours, minutes);

                  downloadICal({
                    title: `Repair: ${bookingSuccess.serviceTitle || bookingSuccess.tasks}`,
                    description: `Booking for ${bookingSuccess.customerName}. Estimated Price: ${bookingSuccess.estimatedPrice}`,
                    location: 'IresoJ Digital CSC, Kore Town, Ethiopia',
                    startDate: startDate.toISOString(),
                  });
                }}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <CalendarPlus className="w-4 h-4 text-[#0EA5E9]" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                onClick={() => {
                  setBookingSuccess(null);
                  setActiveStep('estimate');
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition-all"
              >
                Estimate Another Repair
              </button>
            </div>
          </div>
        ) : activeStep === 'estimate' ? (
          
          /* Step 1: Select Repair Tasks */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMMON_REPAIR_TASKS.map(task => {
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-sky-50/70 border-[#0EA5E9] shadow-md shadow-sky-100 ring-2 ring-[#0EA5E9]/20' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-white rounded-xl shadow-2xs border border-slate-100">
                          {getIcon(task.iconName)}
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                          {task.name}
                        </h4>
                        <div className="group/tooltip relative">
                          <Info className="w-3.5 h-3.5 text-slate-300 hover:text-sky-500 transition-colors" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-20">
                            {task.tooltip}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between font-mono text-xs">
                      <span className="text-[10px] text-slate-400 font-semibold">{task.estimatedDuration}</span>
                      <span className="font-extrabold text-[#0EA5E9]">
                        {formatETB(task.minPrice)} - {formatETB(task.maxPrice)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Urgency & Speed Options */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Turnaround Speed Option
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Select standard queue diagnostic or express 1-hour prioritize option.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUrgency('standard')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    urgency === 'standard' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Standard Turnaround
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('express')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    urgency === 'express' 
                      ? 'bg-amber-500 text-slate-950 shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Express Fast (+250 ETB)</span>
                </button>
              </div>
            </div>

            {/* Bottom Summary Bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">Calculated Price Estimate</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {formatETB(priceRange.min)} – {formatETB(priceRange.max)}
                  </span>
                  <span className="text-xs text-slate-400">({selectedTaskIds.length} Task{selectedTaskIds.length > 1 ? 's' : ''} Selected)</span>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('calendar')}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Calendar Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        ) : (

          /* Step 2: Interactive Booking Calendar & Appointment Form */
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">
                Selected Estimate: <strong className="text-slate-900">{selectedTasks.map(t => t.name).join(', ')}</strong>
              </div>
              <div className="font-mono font-extrabold text-[#0EA5E9] text-sm">
                {formatETB(priceRange.min)} - {formatETB(priceRange.max)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time Slot Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    Select Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    Available Time Slots *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          bookingTime === slot 
                            ? 'bg-[#0EA5E9] text-white shadow-xs' 
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jemal Ireso"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone Number (SMS Confirmation) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +251 995 852 194"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Special Hardware Notes / Model Number
              </label>
              <textarea
                rows={2}
                placeholder="e.g. HP Pavilion 15 inch with broken left hinge..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0EA5E9]"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStep('estimate')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Back to Service Selection
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-lg shadow-sky-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Confirming Appointment...' : 'Confirm Service Booking Ticket'}</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
