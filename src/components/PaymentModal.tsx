import React, { useState } from 'react';
import { X, Copy, Check, Info, ShieldCheck, CreditCard, Send, QrCode, Languages } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PaymentQRCode from './PaymentQRCode';
import { ProductService, Transaction } from '../types';
import { formatETB } from '../utils';
import { PAYMENT_CONFIG } from '../config';

interface PaymentModalProps {
  product: ProductService;
  onClose: () => void;
  onSubmitTransaction: (txData: {
    referenceNumber: string;
    paymentGateway: 'telebirr' | 'CBE Birr';
    customerName: string;
    customerPhone: string;
    amount: number;
    purpose: string;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function PaymentModal({ product, onClose, onSubmitTransaction }: PaymentModalProps) {
  if (!product || !product.title) return null;
  
  const [gateway, setGateway] = useState<'telebirr' | 'CBE Birr'>('telebirr');
  const [lang, setLang] = useState<'en' | 'om'>('en');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const config = gateway === 'telebirr' ? PAYMENT_CONFIG.telebirr : PAYMENT_CONFIG.cbeBirr;
  const MERCHANT_TELEBIRR = PAYMENT_CONFIG.telebirr.accountNumber;
  const MERCHANT_CBE_BIRR = PAYMENT_CONFIG.cbeBirr.accountNumber; // Using accountNumber as reference

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();
    const trimmedRef = referenceNumber.trim().toUpperCase();

    if (!trimmedName || !trimmedPhone || !trimmedRef) {
      setErrorMessage('Please fill in all fields with valid information.');
      return;
    }

    // Phone format validation (Ethiopian phone or general)
    const phoneRegex = /^(\+251|0)9[0-9]{8}$|^(\+251|0)7[0-9]{8}$/;
    if (!phoneRegex.test(trimmedPhone.replace(/\s+/g, ''))) {
      setErrorMessage('Please enter a valid Ethiopian mobile number (e.g., 09xxxxxxxx or 07xxxxxxxx).');
      return;
    }

    if (gateway === 'telebirr') {
      // Telebirr transaction reference is typically a 10-character alphanumeric code
      if (trimmedRef.length < 8) {
        setErrorMessage('Telebirr transaction reference should be at least 8 alphanumeric characters long.');
        return;
      }
    } else {
      // CBE Birr reference is typically an 8-12 character alphanumeric or numeric code
      if (trimmedRef.length < 8) {
        setErrorMessage('CBE Birr transaction reference should be at least 8 characters long.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await onSubmitTransaction({
        referenceNumber: trimmedRef,
        paymentGateway: gateway,
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        amount: product.price,
        purpose: product.title,
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Payment reference submitted successfully!');
        // Reset state
        setCustomerName('');
        setCustomerPhone('');
        setReferenceNumber('');
      } else {
        setErrorMessage(response.error || 'Failed to submit transaction reference. Please check and try again.');
      }
    } catch (err) {
      setErrorMessage('An unexpected connection error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="payment-modal" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row animate-in fade-in zoom-in duration-200">
        
        {/* Left Side: Product Summary Panel */}
        <div className="md:w-5/12 bg-slate-50 p-6 border-r border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center md:hidden mb-4">
              <span className="text-xs font-mono font-bold text-[#0EA5E9] bg-sky-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Checkout
              </span>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              referrerPolicy="no-referrer"
              className="w-full h-40 object-cover rounded-xl shadow-sm border border-slate-200/60 mb-4"
            />
            <h3 className="font-display font-bold text-slate-900 leading-snug">
              {product.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-3">
              {product.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-400 block uppercase font-mono tracking-widest">
              Total Payable
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-3xl font-display font-black text-slate-900">
                {formatETB(product.price)}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
              <span>Verified Merchant Escrow Securing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Guides & Form */}
        <div className="md:w-7/12 p-6 flex flex-col justify-between relative">
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 hidden md:block p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <span className="text-xs font-mono font-bold text-[#0EA5E9] bg-sky-50 px-2.5 py-1 rounded-full uppercase tracking-wider hidden md:inline-block">
              Payment Gateway
            </span>
            <h2 className="text-xl font-display font-bold text-slate-900 mt-2">
              Select Payment Method
            </h2>

            {/* Gateway Toggle */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => setGateway('telebirr')}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center space-x-2 ${
                  gateway === 'telebirr'
                    ? 'border-[#0EA5E9] bg-sky-50/50 text-sky-700 shadow-sm shadow-sky-100'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#005ea6]" />
                <span>telebirr</span>
              </button>
              <button
                type="button"
                onClick={() => setGateway('CBE Birr')}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center space-x-2 ${
                  gateway === 'CBE Birr'
                    ? 'border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#7a137b]" />
                <span>CBE Birr</span>
              </button>
            </div>

            {/* Step-by-Step Payment Guide with Dynamic QR */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 mt-4 text-xs text-slate-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{lang === 'en' ? `Scan to pay using ${gateway}:` : `${gateway} fayyadamuun kaffaltii raawwadhaa:`}</span>
                </h4>
                <button 
                  onClick={() => setLang(lang === 'en' ? 'om' : 'en')}
                  className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-[#0EA5E9] hover:bg-sky-50 transition-colors"
                >
                  <Languages className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Afaan Oromoo' : 'English'}</span>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="shrink-0 mx-auto sm:mx-0">
                  <PaymentQRCode 
                    gateway={gateway}
                    accountNumber={config.accountNumber}
                    amount={product.price}
                    size={110}
                  />
                </div>
                
                <div className="flex-1 w-full">
                  <div className="space-y-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px] mb-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 uppercase text-[9px] font-bold">{gateway === 'telebirr' ? 'Merchant No:' : 'Account No:'}</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-extrabold">{config.accountNumber}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(config.accountNumber, 'acc')}
                            className="text-[#0EA5E9] hover:text-sky-600 flex items-center gap-0.5 font-sans font-medium"
                          >
                            {copiedText === 'acc' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                        <span className="text-slate-400 uppercase text-[9px] font-bold">Name:</span>
                        <strong className="text-slate-900 font-extrabold text-[10px]">{config.accountName}</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {config.instructions[lang].map((step, idx) => (
                        <div key={idx} className="flex gap-2 items-start leading-tight">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{idx + 1}</span>
                          <p>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="mt-5 border-t border-slate-150 pt-4">
            
            {successMessage ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex flex-col items-center text-center">
                <ShieldCheck className="w-10 h-10 text-green-600 mb-2 animate-bounce" />
                <h4 className="font-display font-bold text-sm">Reference Lodged!</h4>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  {successMessage} We will cross-reference this and contact you immediately for product handover/service initiation!
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <h3 className="font-display font-bold text-sm text-slate-800">
                  Submit Payment Reference to Verify
                </h3>

                {errorMessage && (
                  <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                    {errorMessage}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Almaz Kebede"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +2519..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    SMS Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TX-TELEBIRR-87429 or CBE-827..."
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg uppercase focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] font-mono tracking-wider"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0EA5E9] hover:bg-sky-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-sky-100 active:scale-[0.98] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Verifying Reference...' : 'Submit Transaction Reference'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
