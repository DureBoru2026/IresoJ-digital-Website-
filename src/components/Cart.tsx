import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Phone, ShieldCheck, CheckCircle2, AlertCircle, Send, QrCode, ArrowRight, Printer, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../LanguageContext';
import PhysicalReceiptModal, { ReceiptData } from './PhysicalReceiptModal';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CartItem {
  id: string;
  carrier: 'ethio' | 'safaricom';
  denomination: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (item: { carrier: 'ethio' | 'safaricom'; denomination: number }) => void;
  onSubmitTransaction: (txData: {
    referenceNumber: string;
    paymentGateway: 'telebirr' | 'CBE Birr';
    customerName: string;
    customerPhone: string;
    amount: number;
    purpose: string;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
  onClearCart: () => void;
}

export default function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onAddItem,
  onSubmitTransaction,
  onClearCart
}: CartProps) {
  const { t } = useLanguage();
  const [carrier, setCarrier] = useState<'ethio' | 'safaricom'>('ethio');
  const [selectedDenom, setSelectedDenom] = useState<number>(50);
  const [gateway, setGateway] = useState<'telebirr' | 'CBE Birr'>('telebirr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const MERCHANT_TELEBIRR = '+251995852194';
  const MERCHANT_CBE_BIRR = '456012';

  const totalAmount = items.reduce((sum, item) => sum + item.denomination * item.quantity, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const generateReceiptObject = () => {
    return {
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      customerName: 'Airtime Customer',
      customerPhone: phoneNumber || '+2519...',
      date: new Date().toLocaleString(),
      paymentGateway: gateway,
      referenceNumber: reference || 'REF-PENDING',
      items: items.map(item => ({
        id: item.id,
        description: `${item.carrier === 'ethio' ? 'Ethio Telecom' : 'Safaricom'} ${item.denomination} ETB Airtime Card`,
        quantity: item.quantity,
        unitPrice: item.denomination,
        totalPrice: item.denomination * item.quantity
      })),
      subtotal: totalAmount,
      tax: 0,
      totalAmount: totalAmount,
      purpose: `Consolidated Airtime (${totalItemsCount} cards)`
    };
  };

  const handleAddCardToCart = () => {
    onAddItem({ carrier, denomination: selectedDenom });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Your cart is empty. Please add at least one airtime card.' });
      return;
    }

    if (!phoneNumber || !reference) {
      setMessage({ type: 'error', text: t('fillAllFields') });
      return;
    }

    setSubmitting(true);

    try {
      const summaryItemsDesc = items
        .map(i => `${i.quantity}x ${i.carrier === 'ethio' ? 'Ethio Telecom' : 'Safaricom'} ${i.denomination} ETB`)
        .join(', ');

      const res = await onSubmitTransaction({
        referenceNumber: reference,
        paymentGateway: gateway,
        customerName: 'Multi-Card Cart Customer',
        customerPhone: phoneNumber,
        amount: totalAmount,
        purpose: `Airtime Cart (${totalItemsCount} cards): ${summaryItemsDesc}`
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Airtime cart checkout successful! Cards dispatched instantly via SMS/system.' });
        setPhoneNumber('');
        setReference('');
        onClearCart();
      } else {
        setMessage({ type: 'error', text: res.error || t('airtimeError') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('networkError') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestBulkQuote = async () => {
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Your cart is empty. Add items to request a quote.' });
      return;
    }

    if (!phoneNumber) {
      setMessage({ type: 'error', text: 'Please provide your phone number so we can contact you regarding the quote.' });
      return;
    }

    setQuoteSubmitting(true);
    setMessage(null);

    try {
      const summaryItemsDesc = items
        .map(i => `${i.quantity}x ${i.carrier === 'ethio' ? 'Ethio' : 'Safaricom'} ${i.denomination} ETB`)
        .join('\n');

      const quoteMessage = {
        name: phoneNumber, // Using phone as identifier if name isn't present
        email: 'quote_request@iresoj.com',
        subject: `BULK QUOTE REQUEST: ${totalAmount} ETB Total Value`,
        message: `Customer with phone ${phoneNumber} is requesting a bulk discount quote for the following items:\n\n${summaryItemsDesc}\n\nTotal Face Value: ${totalAmount} ETB\nTotal Cards: ${totalItemsCount}`,
        status: 'new',
        createdAt: serverTimestamp(),
        type: 'quote'
      };

      await addDoc(collection(db, 'supportMessages'), quoteMessage);
      
      setMessage({ 
        type: 'success', 
        text: 'Bulk quote request sent! Our team will review your order and contact you with a discounted offer via phone.' 
      });
    } catch (err) {
      console.error("Quote error:", err);
      setMessage({ type: 'error', text: 'Failed to send quote request. Please try again later.' });
    } finally {
      setQuoteSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-sky-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0EA5E9] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-sky-400 uppercase tracking-widest">Multi-Card Ordering</span>
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">Airtime & Voucher Cart</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">Select multiple Ethio Telecom & Safaricom cards and pay in a single consolidated transaction.</p>
            </div>
          </div>
          <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">Total Items:</span>
            <span className="font-mono text-lg font-black text-amber-300">{totalItemsCount} Cards</span>
            <span className="text-xs font-bold text-slate-300 border-l border-white/20 pl-3">Total:</span>
            <span className="font-mono text-lg font-black text-[#0EA5E9]">{totalAmount} ETB</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Add Cards & Cart Items */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Add Airtime Card Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0EA5E9]" />
              Add Airtime Card to Cart
            </h3>

            {/* Carrier selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Carrier</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCarrier('ethio')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${carrier === 'ethio' ? 'bg-[#0EA5E9]/10 border-[#0EA5E9] text-[#0EA5E9]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${carrier === 'ethio' ? 'bg-[#0EA5E9]' : 'bg-slate-300'}`} />
                  Ethio Telecom
                </button>
                <button
                  type="button"
                  onClick={() => setCarrier('safaricom')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${carrier === 'safaricom' ? 'bg-green-600/10 border-green-600 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${carrier === 'safaricom' ? 'bg-green-600' : 'bg-slate-300'}`} />
                  Safaricom
                </button>
              </div>
            </div>

            {/* Denomination selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Denomination (ETB)</label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 25, 50, 100, 250, 500].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSelectedDenom(val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${selectedDenom === val ? 'bg-slate-900 text-amber-300 shadow-sm ring-2 ring-sky-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {val} ETB
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCardToCart}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#0EA5E9]" />
              Add {selectedDenom} ETB {carrier === 'ethio' ? 'Ethio Telecom' : 'Safaricom'} Card to Cart
            </button>
          </div>

          {/* Cart Items List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#0EA5E9]" />
                Cart Items ({items.length})
              </h3>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-medium">Your cart is currently empty. Add cards above to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs ${item.carrier === 'ethio' ? 'bg-[#0EA5E9]' : 'bg-green-600'}`}>
                        {item.carrier === 'ethio' ? 'ET' : 'SF'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {item.carrier === 'ethio' ? 'Ethio Telecom' : 'Safaricom'} {item.denomination} ETB Card
                        </h4>
                        <p className="text-[11px] font-mono text-slate-500">Unit: {item.denomination}.00 ETB</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-black text-slate-900 text-xs w-16 text-right">
                        {item.denomination * item.quantity} ETB
                      </span>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout & Consolidated QR Code */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <QrCode className="w-4 h-4 text-[#0EA5E9]" />
              Consolidated Checkout & QR Payment
            </h3>

            {/* Gateway selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Payment Method</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGateway('telebirr')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${gateway === 'telebirr' ? 'bg-sky-50 border-sky-300 text-[#0EA5E9]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  telebirr
                </button>
                <button
                  type="button"
                  onClick={() => setGateway('CBE Birr')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${gateway === 'CBE Birr' ? 'bg-sky-50 border-sky-300 text-[#0EA5E9]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  CBE Birr
                </button>
              </div>
            </div>

            {/* Consolidated QR Display */}
            <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/50 p-4 rounded-2xl border border-sky-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-600 uppercase tracking-wider">Official Merchant Account</span>
                  <p className="font-extrabold text-slate-900 text-xs">Jemal Fano Haji (IresoJ Digital CSC)</p>
                </div>
                <div className="text-right font-mono text-xs font-black text-[#0EA5E9] bg-white px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs">
                  {gateway === 'telebirr' ? MERCHANT_TELEBIRR : MERCHANT_CBE_BIRR}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <QRCodeSVG
                  value={gateway === 'telebirr' 
                    ? `telebirr://pay?merchant=${MERCHANT_TELEBIRR}&amount=${totalAmount}&name=JemalFano&purpose=CartCheckout` 
                    : `cbebirr://pay?merchant=${MERCHANT_CBE_BIRR}&amount=${totalAmount}`}
                  size={130}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
                <div className="mt-2 text-center">
                  <span className="font-mono text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    SCAN TO PAY TOTAL
                  </span>
                  <span className="font-mono text-base font-black text-emerald-700">
                    {totalAmount}.00 ETB
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-[9px]">1</span>
                  Scan QR in your {gateway} App
                </p>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-[9px]">2</span>
                  Verify Name: <strong className="text-slate-900 underline">Jemal Fano Haji</strong>
                </p>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-[9px]">3</span>
                  Pay exact amount: <strong className="text-emerald-700 font-mono">{totalAmount}.00 ETB</strong>
                </p>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="space-y-4 pt-2">
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

              {message && (
                <div className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full bg-[#0EA5E9] hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-200 text-sm cursor-pointer"
              >
                {submitting ? t('verifying') : `Complete Checkout (${totalAmount} ETB)`}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleRequestBulkQuote}
                disabled={quoteSubmitting || items.length === 0}
                className="w-full bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-900 border-2 border-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
              >
                {quoteSubmitting ? 'Sending Request...' : 'Request Bulk Quote (Volume Discount)'}
                <FileText className="w-4 h-4" />
              </button>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReceiptData(generateReceiptObject())}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm text-xs cursor-pointer border border-amber-500/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Physical Customer Receipt</span>
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Physical Receipt Modal */}
      {receiptData && (
        <PhysicalReceiptModal
          receipt={receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}
    </div>
  );
}
