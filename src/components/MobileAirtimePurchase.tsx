import React, { useState } from 'react';
import { Phone, CheckCircle2, ShieldCheck, CreditCard, Send, X, AlertCircle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../LanguageContext';

interface MobileAirtimePurchaseProps {
  onSubmitTransaction: (txData: {
    referenceNumber: string;
    paymentGateway: 'telebirr' | 'CBE Birr';
    customerName: string;
    customerPhone: string;
    amount: number;
    purpose: string;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function MobileAirtimePurchase({ onSubmitTransaction }: MobileAirtimePurchaseProps) {
  const { t } = useLanguage();
  const [carrier, setCarrier] = useState<'ethio' | 'safaricom'>('ethio');
  const [gateway, setGateway] = useState<'telebirr' | 'CBE Birr'>('telebirr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState<number>(100);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const MERCHANT_TELEBIRR = '+251995852194';
  const MERCHANT_CBE_BIRR = '456012';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!phoneNumber || !reference || amount <= 0) {
      setMessage({ type: 'error', text: t('fillAllFields') });
      return;
    }
    setSubmitting(true);
    
    try {
      const res = await onSubmitTransaction({
        referenceNumber: reference,
        paymentGateway: gateway,
        customerName: 'Mobile Top-Up User',
        customerPhone: phoneNumber,
        amount: amount,
        purpose: `${t('airtimeTitle')} (${carrier === 'ethio' ? 'Ethio Telecom' : 'Safaricom'}) - ${amount} ETB`
      });

      if (res.success) {
        setMessage({ type: 'success', text: t('airtimeSuccess') });
        setPhoneNumber('');
        setReference('');
        setAmount(100);
      } else {
        setMessage({ type: 'error', text: res.error || t('airtimeError') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('networkError') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9]/5 rounded-bl-full pointer-events-none" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-[#0EA5E9]">
          <Phone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900">Mobile Airtime Top-Up</h3>
          <p className="text-xs text-slate-500">{t('airtimeDesc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        
        {/* Carrier Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('selectCarrier')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCarrier('ethio')}
              className={`p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${carrier === 'ethio' ? 'bg-[#0EA5E9]/10 border-[#0EA5E9] text-[#0EA5E9]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              <div className={`w-3 h-3 rounded-full ${carrier === 'ethio' ? 'bg-[#0EA5E9]' : 'bg-slate-300'}`} />
              Ethio Telecom
            </button>
            <button
              type="button"
              onClick={() => setCarrier('safaricom')}
              className={`p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${carrier === 'safaricom' ? 'bg-green-600/10 border-green-600 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              <div className={`w-3 h-3 rounded-full ${carrier === 'safaricom' ? 'bg-green-600' : 'bg-slate-300'}`} />
              Safaricom
            </button>
          </div>
        </div>

        {/* Direct Ethio Telecom Notice */}
        <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-center gap-2 text-xs text-sky-800 font-medium">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Ethio Telecom Provider Mobile Cards purchased directly via telebirr and dispatched instantly to your customer phone number.</span>
        </div>

        {/* Amount Selection with 5 ETB, 10 ETB, 15 ETB, 25 ETB, 50 ETB, 100 ETB Card Vouchers */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Mobile Card Denomination (ETB)</label>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 25, 50, 100, 250, 500].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  amount === val ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-sky-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {val} BIRR CARD
              </button>
            ))}
          </div>
        </div>

        {/* Payment Gateway & QR Code */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pay With</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGateway('telebirr')}
              className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${gateway === 'telebirr' ? 'bg-sky-50 border-sky-300 text-[#0EA5E9]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              telebirr
            </button>
            <button
              type="button"
              onClick={() => setGateway('CBE Birr')}
              className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${gateway === 'CBE Birr' ? 'bg-sky-50 border-sky-300 text-[#0EA5E9]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              CBE Birr
            </button>
          </div>

          <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/50 p-4 rounded-2xl border border-sky-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-600 uppercase tracking-wider">Official Merchant Account</span>
                <p className="font-extrabold text-slate-900 text-xs">Jemal Fano Haji (IresoJ Digital CSC)</p>
              </div>
              <div className="text-right font-mono text-xs font-black text-[#0EA5E9] bg-white px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs">
                {gateway === 'telebirr' ? MERCHANT_TELEBIRR : MERCHANT_CBE_BIRR}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md shrink-0 flex flex-col items-center">
                <QRCodeSVG 
                  value={gateway === 'telebirr' ? `telebirr://pay?merchant=${MERCHANT_TELEBIRR}&amount=${amount}&name=JemalFano` : `cbebirr://pay?merchant=${MERCHANT_CBE_BIRR}&amount=${amount}`}
                  size={110}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
                <span className="mt-1.5 font-mono text-[9px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-[#0EA5E9]" />
                  Scan to Pay {amount} ETB
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-2 flex-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-[10px]">1</span>
                  Open your {gateway} App & Tap Scan
                </p>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-[10px]">2</span>
                  Verify Name: <strong className="text-slate-900 underline">Jemal Fano Haji</strong>
                </p>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-[10px]">3</span>
                  Pay exact amount: <strong className="text-emerald-700 font-mono text-sm">{amount}.00 ETB</strong>
                </p>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-[10px]">4</span>
                  Paste SMS reference below for instant delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('phoneNumber')}</label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0911234567"
              className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('refCode')}</label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. TBD..."
              className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:bg-white transition-all"
            />
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-xl border text-sm font-semibold flex items-start gap-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0EA5E9] hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-200"
        >
          {submitting ? t('verifying') : t('submitPayment')}
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
