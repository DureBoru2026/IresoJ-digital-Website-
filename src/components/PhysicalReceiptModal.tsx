import React from 'react';
import { X, Printer, CheckCircle2, QrCode, Building, ShieldCheck, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatETB } from '../utils';

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ReceiptData {
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  paymentGateway: 'telebirr' | 'CBE Birr' | 'Cash' | 'Bank Transfer';
  referenceNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  purpose?: string;
  notes?: string;
  servedBy?: string;
}

interface PhysicalReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export default function PhysicalReceiptModal({ receipt, onClose }: PhysicalReceiptModalProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Container Box */}
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden relative flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Action Header (Hidden during window.print) */}
        <div className="print:hidden bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base">Physical Receipt Preview</h3>
              <p className="text-[11px] text-slate-400 font-mono">Receipt No: {receipt.receiptNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT BODY */}
        <div id="printable-receipt-card" className="p-6 sm:p-8 space-y-6 overflow-y-auto bg-white font-sans text-slate-900">
          
          {/* Receipt Header & Logo */}
          <div className="text-center space-y-2 border-b-2 border-dashed border-slate-300 pb-5">
            <div className="inline-flex items-center justify-center gap-2 bg-slate-950 text-amber-300 px-4 py-1.5 rounded-2xl border border-amber-400 font-mono font-black text-xs tracking-wider uppercase mb-1">
              <Building className="w-4 h-4 text-amber-400" />
              <span>IRESO-J DIGITAL WEBSITE & CSC</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 uppercase">
              Official Customer Receipt
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Kore Town Reception Counter, Ethiopia • Phone: +251 995 852 194
            </p>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              TIN: 009852194-ET • Service & Technology Store
            </p>
          </div>

          {/* Transaction & Customer Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt ID:</span>
              <span className="font-black text-slate-900 block">{receipt.receiptNumber}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-2">Date & Time:</span>
              <span className="font-bold text-slate-700 block">{receipt.date}</span>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Name:</span>
              <span className="font-black text-slate-900 block truncate">{receipt.customerName || 'Walk-in Customer'}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-2">Phone / Contact:</span>
              <span className="font-bold text-slate-700 block">{receipt.customerPhone || 'N/A'}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <div className="border-b-2 border-slate-900 pb-1 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-700 font-mono">
              <span>Item / Description</span>
              <div className="flex gap-4">
                <span className="w-12 text-center">Qty</span>
                <span className="w-20 text-right">Amount</span>
              </div>
            </div>

            <div className="divide-y divide-slate-200 text-xs font-mono py-1">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">{item.description}</span>
                    <span className="text-[10px] text-slate-500">Unit: {formatETB(item.unitPrice)}</span>
                  </div>
                  <div className="flex gap-4 shrink-0 font-bold">
                    <span className="w-12 text-center text-slate-600">x{item.quantity}</span>
                    <span className="w-20 text-right text-slate-900">{formatETB(item.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Totals Summary Box */}
          <div className="border-t-2 border-dashed border-slate-300 pt-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Amount:</span>
              <span className="font-bold">{formatETB(receipt.subtotal)}</span>
            </div>
            {receipt.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>VAT / Tax:</span>
                <span className="font-bold">{formatETB(receipt.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL PAID (ETB):</span>
              <span className="text-[#0EA5E9] font-mono text-base">{formatETB(receipt.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Badge & Ref Code */}
          <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Payment Method</span>
              <span className="font-black text-slate-900">{receipt.paymentGateway}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Reference / Tx ID</span>
              <span className="font-black text-emerald-700">{receipt.referenceNumber || 'PAID-CSC'}</span>
            </div>
          </div>

          {/* Verification Barcode / QR & Counter Stamp */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 border border-slate-300 rounded-xl shadow-xs">
                <QRCodeSVG
                  value={`REC:${receipt.receiptNumber}|AMT:${receipt.totalAmount}|REF:${receipt.referenceNumber}`}
                  size={65}
                  level="L"
                />
              </div>
              <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
                <span className="font-bold text-slate-800 block">Digital Verification QR</span>
                <span>Scan for authenticity</span>
                <span className="block text-emerald-600 font-bold">✓ Verified Counter Receipt</span>
              </div>
            </div>

            <div className="text-right space-y-3 font-mono">
              <div className="inline-block border-2 border-dashed border-amber-600 px-3 py-1 rounded-lg text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50">
                ★ IresoJ Official Stamp ★
              </div>
              <div className="text-[9px] text-slate-400 border-t border-slate-300 pt-1">
                Served By: {receipt.servedBy || 'Kore Town CSC Staff'}
              </div>
            </div>
          </div>

          <div className="text-center pt-3 border-t-2 border-dashed border-slate-300">
            <p className="text-[10.5px] font-bold text-slate-700 italic">
              "Thank you for choosing IresoJ Digital Computer Services & Store!"
            </p>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5">
              Please retain this physical receipt for warranty claims & service check-in lookups.
            </p>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="print:hidden p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            Close Receipt
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-xs shadow-md shadow-sky-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Physical Receipt</span>
          </button>
        </div>

      </div>

      {/* Embedded CSS for clean printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt-card, #printable-receipt-card * {
            visibility: visible;
          }
          #printable-receipt-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
