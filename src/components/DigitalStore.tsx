import React, { useState } from 'react';
import { 
  Download, 
  ShoppingCart, 
  Lock, 
  CheckCircle2, 
  FileVideo, 
  FileImage, 
  FileText, 
  FileCode, 
  Package, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  Search, 
  AlertCircle,
  Heart,
  Share2,
  ChevronDown,
  LayoutGrid,
  Sprout,
  GraduationCap,
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DigitalAsset } from '../types';
import { formatETB } from '../utils';

interface DigitalStoreProps {
  assets: DigitalAsset[];
  onDownload: (id: string) => void;
  onInitiatePurchase: (asset: DigitalAsset) => void;
}

export default function DigitalStore({ assets, onDownload, onInitiatePurchase }: DigitalStoreProps) {
  const [filter, setFilter] = useState<'all' | 'agriculture' | 'academy' | 'software' | DigitalAsset['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refSearch, setRefSearch] = useState('');
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [checkingRef, setCheckingRef] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);

  // New state from Screenshot 3
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [viewMode, setViewMode] = useState<'market' | 'wishlist'>('market');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [sortArrival, setSortArrival] = useState<'newest' | 'popular'>('newest');

  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('iresoj_recent_searches_catalog');
      return saved ? JSON.parse(saved) : ['YouTube Broadcast', 'Basic Computer Skills', 'TikTok Promotion', 'Graphic Design', 'Agriculture Guide'];
    } catch {
      return ['YouTube Broadcast', 'Basic Computer Skills', 'TikTok Promotion', 'Graphic Design', 'Agriculture Guide'];
    }
  });

  const handleApplySearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== term.trim().toLowerCase());
      const updated = [term.trim(), ...filtered].slice(0, 6);
      try {
        localStorage.setItem('iresoj_recent_searches_catalog', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving recent searches:', err);
      }
      return updated;
    });
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('iresoj_recent_searches_catalog');
    } catch (err) {
      console.error('Error clearing recent searches:', err);
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlistIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRefCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refSearch.trim()) return;
    
    setCheckingRef(true);
    setRefError(null);
    setDownloadLink(null);

    try {
      const res = await fetch(`/api/transactions/verify/${refSearch}`);
      const data = await res.json();

      if (res.ok && data.status === 'approved') {
        const assetTitle = data.purpose.replace('Digital: ', '');
        const asset = (assets || []).find(a => a && a.title === assetTitle);
        
        if (asset) {
          setDownloadLink(asset.fileUrl);
          fetch(`/api/assets/${asset.id}/download`, { method: 'POST' });
        } else {
          setRefError('Payment verified, but asset not found. Contact support.');
        }
      } else if (res.ok) {
        setRefError(`Payment status: ${data.status.toUpperCase()}. Link will be available once approved.`);
      } else {
        setRefError('Reference number not found or still processing.');
      }
    } catch (err) {
      setRefError('Service temporarily unavailable.');
    } finally {
      setCheckingRef(false);
    }
  };

  const categoryCounts = {
    all: assets.length,
    agriculture: assets.filter(a => a.type === 'pdf' || a.title.toLowerCase().includes('agri') || a.title.toLowerCase().includes('farm')).length || 2,
    academy: assets.filter(a => a.type === 'video' || a.title.toLowerCase().includes('course') || a.title.toLowerCase().includes('web')).length || 3,
    software: assets.filter(a => a.type === 'template' || a.type === 'ppt' || a.title.toLowerCase().includes('app')).length || 4,
  };

  const filteredAssets = assets.filter(asset => {
    // Wishlist view check
    if (viewMode === 'wishlist' && !wishlistIds.includes(asset.id)) {
      return false;
    }

    // Category filter check
    let matchesCategory = true;
    if (filter === 'agriculture') {
      matchesCategory = asset.type === 'pdf' || asset.title.toLowerCase().includes('agri') || asset.title.toLowerCase().includes('farm');
    } else if (filter === 'academy') {
      matchesCategory = asset.type === 'video' || asset.title.toLowerCase().includes('course') || asset.title.toLowerCase().includes('academy');
    } else if (filter === 'software') {
      matchesCategory = asset.type === 'template' || asset.type === 'ppt' || asset.title.toLowerCase().includes('code');
    } else if (filter !== 'all') {
      matchesCategory = asset.type === filter;
    }

    // Search term
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Price filter
    const matchesPrice = asset.price <= maxPrice;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const formatPrice = (amountInETB: number) => {
    if (amountInETB === 0) return 'FREE';
    if (currency === 'USD') {
      const usd = (amountInETB / 120).toFixed(2);
      return `$ ${usd} USD`;
    }
    return formatETB(amountInETB);
  };

  const getIcon = (type: DigitalAsset['type']) => {
    switch (type) {
      case 'video': return <FileVideo className="w-6 h-6 text-purple-600" />;
      case 'image': return <FileImage className="w-6 h-6 text-blue-600" />;
      case 'template': return <FileCode className="w-6 h-6 text-amber-600" />;
      case 'pdf': return <FileText className="w-6 h-6 text-red-600" />;
      case 'ppt': return <Package className="w-6 h-6 text-orange-600" />;
      default: return <FileText className="w-6 h-6 text-[#0EA5E9]" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header Card matching Screenshot 3 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
              Marketplace &amp; Services Catalog
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Search digital assets, courses, social media promos &amp; computer services.
            </p>
          </div>

          {/* Interactive Search Bar */}
          <div className="w-full md:w-80 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog or services..."
                value={searchTerm}
                onChange={(e) => handleApplySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Searches Pills Section */}
        {recentSearches.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Recent Searches:
            </span>
            {recentSearches.map((term, idx) => (
              <button
                key={idx}
                onClick={() => handleApplySearch(term)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                  searchTerm.toLowerCase() === term.toLowerCase()
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span>{term}</span>
              </button>
            ))}
            <button
              onClick={handleClearRecentSearches}
              className="text-[10px] text-slate-400 hover:text-rose-500 font-bold underline ml-auto transition-colors cursor-pointer"
              title="Clear search history"
            >
              Clear History
            </button>
          </div>
        )}

        {/* Toolbar Row matching Screenshot 3 */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 pr-9 text-xs font-black uppercase text-slate-800 tracking-wider focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">ALL ASSETS</option>
                <option value="agriculture">MODERN AGRICULTURE</option>
                <option value="academy">DIGITAL ACADEMY</option>
                <option value="software">SOFTWARE & TEMPLATES</option>
                <option value="template">CODE TEMPLATES</option>
                <option value="video">VIDEO COURSES</option>
                <option value="pdf">PDF GUIDES</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Arrival Sort Dropdown */}
            <div className="relative">
              <select
                value={sortArrival}
                onChange={(e) => setSortArrival(e.target.value as any)}
                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 pr-9 text-xs font-black uppercase text-slate-800 tracking-wider focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="newest">NEWEST ARRIVALS</option>
                <option value="popular">MOST POPULAR</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle (Market / Wishlist) */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('market')}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all ${
                  viewMode === 'market' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                MARKET
              </button>
              <button
                onClick={() => setViewMode('wishlist')}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-1.5 ${
                  viewMode === 'wishlist' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>WISHLIST ({wishlistIds.length})</span>
              </button>
            </div>

            {/* Currency Switcher (ETB / USD) */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setCurrency('ETB')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  currency === 'ETB' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                ETB
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  currency === 'USD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                USD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Max Price Limit Slider & In-Stock Toggle Card matching Screenshot 3 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="w-full sm:w-1/2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
              <span>$</span> MAX PRICE LIMIT
            </span>
            <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
              ETB {maxPrice.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-emerald-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0 ETB</span>
            <span>100,000 ETB</span>
          </div>
        </div>

        {/* In-Stock Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600">IN-STOCK ONLY</span>
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
              inStockOnly ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* FILTER BY CORE CATEGORY Cards Grid matching Screenshot 3 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            FILTER BY CORE CATEGORY
          </span>
          <span className="text-xs font-bold text-slate-500">
            Selected Category: <strong className="text-slate-900">{filter.toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* All Assets Card */}
          <div
            onClick={() => setFilter('all')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
              filter === 'all'
                ? 'bg-slate-950 text-white border-slate-900 shadow-xl shadow-slate-900/10 ring-2 ring-slate-900'
                : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-2xl ${filter === 'all' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <LayoutGrid className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${filter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {categoryCounts.all}
              </span>
            </div>
            <div>
              <h3 className="font-black text-sm">All Assets</h3>
              <p className={`text-[11px] ${filter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>Browse entire marketplace catalog</p>
            </div>
          </div>

          {/* Modern Agriculture Card */}
          <div
            onClick={() => setFilter('agriculture')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
              filter === 'agriculture'
                ? 'bg-slate-950 text-white border-slate-900 shadow-xl shadow-slate-900/10 ring-2 ring-slate-900'
                : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-2xl ${filter === 'agriculture' ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                <Sprout className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${filter === 'agriculture' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {categoryCounts.agriculture}
              </span>
            </div>
            <div>
              <h3 className="font-black text-sm">Modern Agriculture</h3>
              <p className={`text-[11px] ${filter === 'agriculture' ? 'text-slate-400' : 'text-slate-500'}`}>Smart farming tools & agricultural assets</p>
            </div>
          </div>

          {/* Digital Academy Card */}
          <div
            onClick={() => setFilter('academy')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
              filter === 'academy'
                ? 'bg-slate-950 text-white border-slate-900 shadow-xl shadow-slate-900/10 ring-2 ring-slate-900'
                : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-2xl ${filter === 'academy' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${filter === 'academy' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {categoryCounts.academy}
              </span>
            </div>
            <div>
              <h3 className="font-black text-sm">Digital Academy</h3>
              <p className={`text-[11px] ${filter === 'academy' ? 'text-slate-400' : 'text-slate-500'}`}>Educational courses, masterclasses & guides</p>
            </div>
          </div>

          {/* Software & Templates Card */}
          <div
            onClick={() => setFilter('software')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
              filter === 'software'
                ? 'bg-slate-950 text-white border-slate-900 shadow-xl shadow-slate-900/10 ring-2 ring-slate-900'
                : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-2xl ${filter === 'software' ? 'bg-white/10 text-white' : 'bg-amber-50 text-amber-600'}`}>
                <Code2 className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${filter === 'software' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {categoryCounts.software}
              </span>
            </div>
            <div>
              <h3 className="font-black text-sm">Software</h3>
              <p className={`text-[11px] ${filter === 'software' ? 'text-slate-400' : 'text-slate-500'}`}>Software tools, apps & digital templates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Already Purchased / Reference Unlock Banner */}
      <div className="bg-sky-50/70 border border-sky-100 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Already Purchased a Paid Asset?
            </h3>
            <p className="text-xs text-slate-500">
              Enter your telebirr or CBE Birr reference number to unlock instant download.
            </p>
          </div>
          <form onSubmit={handleRefCheck} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Ref: 9G47H..."
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold min-w-[180px] focus:outline-none focus:border-blue-500"
            />
            <button 
              disabled={checkingRef}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-colors shrink-0"
            >
              {checkingRef ? 'Checking...' : 'Unlock Asset'}
            </button>
          </form>
        </div>

        {refError && (
          <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {refError}
          </div>
        )}

        {downloadLink && (
          <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Verified!
            </span>
            <a 
              href={downloadLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Start Download
            </a>
          </div>
        )}
      </div>

      {/* Asset Cards Grid matching Screenshot 3 styling */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredAssets.length === 0 ? (
            <motion.div 
              key="no-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 p-8"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Filter className="w-6 h-6" />
              </div>
              <p className="text-slate-600 font-bold text-sm">No assets found matching your criteria.</p>
              <p className="text-slate-400 text-xs mt-1">Try broadening your category or price filter slider.</p>
            </motion.div>
          ) : (
            filteredAssets.map((asset) => {
              const isWishlisted = wishlistIds.includes(asset.id);
              return (
                <motion.div 
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-2xs transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                {/* Top Actions Overlay */}
                <div className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      {getIcon(asset.type)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard?.writeText?.(window.location.href);
                          alert('Asset link copied to clipboard!');
                        }}
                        className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                        title="Share asset"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleWishlist(asset.id)}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                          isWishlisted 
                            ? 'bg-rose-50 border-rose-200 text-rose-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                        }`}
                        title="Add to Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Asset Details */}
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/60 inline-block mb-2">
                    {asset.type}
                  </span>

                  <h3 className="text-lg font-black text-slate-900 leading-snug mb-2">
                    {asset.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {asset.description || 'Professional digital asset created by IresoJ Digital CSC & Dure Boru experts.'}
                  </p>
                </div>

                {/* Price & Action Row */}
                <div className="p-6 pt-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Price</span>
                    <span className="text-base font-black text-slate-900">
                      {formatPrice(asset.price)}
                    </span>
                  </div>

                  {asset.priceType === 'free' || asset.price === 0 ? (
                    <button
                      onClick={() => onDownload(asset.id)}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-xs font-black transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <span>Download</span>
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onInitiatePurchase(asset)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black transition-colors flex items-center gap-2 shadow-md shadow-blue-200"
                    >
                      <span>Buy Now</span>
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

