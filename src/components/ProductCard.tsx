import React, { useState } from 'react';
import { Sparkles, Info, ShoppingCart, QrCode, X, Copy, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ProductService } from '../types';

import { formatETB } from '../utils';

interface ProductCardProps {
  key?: React.Key;
  product?: ProductService;
  onSelect?: (product: ProductService) => void;
  isLoading?: boolean;
}

export default function ProductCard({ product, onSelect, isLoading }: ProductCardProps) {
  if (isLoading) {
    return (
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-full">
        {/* Shimmer Image */}
        <div className="relative aspect-video w-full shimmer-bg shrink-0" />
        {/* Shimmer Details */}
        <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
          <div className="space-y-3">
            <div className="h-4 shimmer-bg rounded-lg w-3/4" />
            <div className="space-y-2">
              <div className="h-3 shimmer-bg rounded w-full" />
              <div className="h-3 shimmer-bg rounded w-5/6" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-2 shimmer-bg rounded w-8" />
              <div className="h-5 shimmer-bg rounded w-20" />
            </div>
            <div className="h-9 shimmer-bg rounded-xl w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || !onSelect) return null;

  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'maintenance': return 'Maintenance';
      case 'print_publish': return 'Printing & Layouts';
      case 'training': return 'IT Basic Training';
      case 'sales': return 'Store Sales';
      default: return 'Service';
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'maintenance': return 'bg-sky-50 text-[#0EA5E9] border-sky-100';
      case 'print_publish': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'training': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'sales': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Check if it represents our premium genuine leather goods
  const isLeatherGoods = product.title.toLowerCase().includes('leather');

  const getShareUrl = () => {
    try {
      const origin = window.location.origin || 'https://IresoJ-digital-computer-services-platfo.vercel.app';
      const path = window.location.pathname || '/';
      return `${origin}${path}?productId=${encodeURIComponent(product.id)}`;
    } catch (e) {
      return `https://IresoJ-digital-computer-services-platfo.vercel.app/?productId=${encodeURIComponent(product.id)}`;
    }
  };

  return (
    <div 
      id={`product-card-${product.id}`} 
      className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-300 flex flex-col overflow-hidden h-full group"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 shrink-0">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pr-10">
          <span className={`px-2.5 py-1 text-[10px] font-bold font-mono tracking-wide uppercase rounded-full border shadow-sm ${getCategoryStyle(product.category)}`}>
            {getCategoryLabel(product.category)}
          </span>
          {isLeatherGoods && (
            <span className="bg-amber-800 text-amber-50 border border-amber-900 px-2.5 py-1 text-[10px] font-bold font-mono tracking-wide uppercase rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Genuine Leather</span>
            </span>
          )}
        </div>

        {/* QR Code trigger button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowQR(true);
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/95 text-slate-700 hover:text-[#0EA5E9] hover:bg-white rounded-full flex items-center justify-center border border-slate-200/80 shadow-md hover:scale-105 transition-all duration-200 z-10 cursor-pointer"
          title="Scan QR to open details on mobile"
        >
          <QrCode className="w-4 h-4" />
        </button>
        
        {product.stock !== null && (
          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono">
            {product.stock > 0 ? `${product.stock} left in stock` : 'Out of stock'}
          </div>
        )}
      </div>

      {/* QR Code overlay */}
      {showQR && (
        <div className="absolute inset-0 bg-white/98 z-30 flex flex-col items-center justify-center p-5 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setShowQR(false)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-center mb-4 px-2">
            <h4 className="font-display font-bold text-slate-900 text-sm line-clamp-1">
              {product.title}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Scan with your phone to instantly view details
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
            <QRCodeSVG 
              value={getShareUrl()}
              size={130}
              level="M"
              includeMargin={true}
              className="rounded-lg"
            />
          </div>

          <div className="mt-4 flex flex-col items-center w-full gap-2 px-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(getShareUrl());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-[10.5px] font-bold text-[#0EA5E9] hover:text-sky-600 flex items-center gap-1 cursor-pointer bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100/40 w-full justify-center transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Product Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Product Information Panel */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-base leading-snug group-hover:text-[#0EA5E9] transition-colors">
            {product.title}
          </h3>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            {product.description}
          </p>

          {/* Specifications Box (e.g. dimensions, details) */}
          {product.specifications && (
            <div className="mt-3.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 font-mono space-y-1">
              <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Technical Specifications</span>
              </div>
              {product.specifications.split('|').map((spec, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="text-amber-500 mr-1.5">•</span>
                  <span>{spec.trim()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
              Price
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-display font-black text-slate-900">
                {formatETB(product.price)}
              </span>
              {product.category === 'print_publish' && product.id === 'prod_print_1' && (
                <span className="text-xs font-bold text-[#0EA5E9] uppercase">
                  /page
                </span>
              )}
            </div>
          </div>

          <button
            id={`btn-order-${product.id}`}
            type="button"
            onClick={() => onSelect(product)}
            disabled={product.stock === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm ${
              product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : isLeatherGoods
                  ? 'bg-amber-900 hover:bg-amber-950 text-white shadow-amber-900/10 hover:-translate-y-0.5'
                  : 'bg-[#0EA5E9] hover:bg-sky-600 text-white shadow-lg shadow-sky-100 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>{isLeatherGoods ? 'Secure Wallet' : product.type === 'service' ? 'Order Service' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
