import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Video, 
  FileCode, 
  Sparkles, 
  Link as LinkIcon, 
  ExternalLink, 
  Percent, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Code2, 
  GraduationCap, 
  FileText, 
  Download, 
  Play, 
  Layout, 
  Lock, 
  DollarSign, 
  Users, 
  Share2, 
  PlusCircle,
  Copy,
  Award
} from 'lucide-react';
import { formatETB } from '../utils';

interface AffiliateProduct {
  id: string;
  creatorName: string;
  productTitle: string;
  category: 'Design Template' | 'Project Structure' | 'Web Development' | 'Website Login' | 'Educational Book';
  originalUrl: string;
  price: number;
  commissionRate: number; // e.g. 2
  downloads: number;
  description: string;
  isFree: boolean;
}

const INITIAL_AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: 'aff_1',
    creatorName: 'IresoJ Digital Team',
    productTitle: 'Full-Stack React & Express Website Login Architecture',
    category: 'Website Login',
    originalUrl: 'https://github.com/gitdagray/react-user-auth',
    price: 0,
    commissionRate: 2,
    downloads: 342,
    description: 'Complete JWT & session security boilerplate with responsive login screens, password recovery, and admin role authorization.',
    isFree: true
  },
  {
    id: 'aff_2',
    creatorName: 'Dure Boru Academy',
    productTitle: 'Web Development & Modern Agriculture Tech Guide (Book PDF)',
    category: 'Educational Book',
    originalUrl: 'https://www.fao.org/3/i8220en/i8220en.pdf',
    price: 0,
    commissionRate: 2,
    downloads: 512,
    description: 'Comprehensive digital handbook covering modern web architecture, smart farming software tools, and database schema designs.',
    isFree: true
  },
  {
    id: 'aff_3',
    creatorName: 'Kore Tech Creator',
    productTitle: 'High-Converting UI/UX Design System Template',
    category: 'Design Template',
    originalUrl: 'https://www.figma.com/community/file/1164917531737754395',
    price: 1500,
    commissionRate: 2,
    downloads: 189,
    description: 'Tailwind CSS & Figma component library ready for production web applications and client portals.',
    isFree: false
  },
  {
    id: 'aff_4',
    creatorName: 'Alex Dev',
    productTitle: 'Production E-Commerce & Service Booking Project Structure',
    category: 'Project Structure',
    originalUrl: 'https://github.com/mikhail-cct/booking-system-react',
    price: 2500,
    commissionRate: 2,
    downloads: 275,
    description: 'Modular folder architecture, Express API routes, Drizzle ORM schemas, and Telebirr payment integration hooks.',
    isFree: false
  }
];

export default function HomeDashboardShowcase() {
  const [activeTab, setActiveTab] = useState<'welcome' | 'materials' | 'commission'>('welcome');
  const [affiliateList, setAffiliateList] = useState<AffiliateProduct[]>(INITIAL_AFFILIATE_PRODUCTS);
  
  // New Product Submission Form
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCreator, setNewCreator] = useState('');
  const [newCategory, setNewCategory] = useState<AffiliateProduct['category']>('Web Development');
  const [newUrl, setNewUrl] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newDesc, setNewDesc] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleAddAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const newProd: AffiliateProduct = {
      id: `aff_${Date.now()}`,
      creatorName: newCreator || 'Anonymous Creator',
      productTitle: newTitle,
      category: newCategory,
      originalUrl: newUrl,
      price: Number(newPrice) || 0,
      commissionRate: 2,
      downloads: 1,
      description: newDesc || 'Published digital educational resource with 2% partner referral program.',
      isFree: Number(newPrice) === 0
    };

    setAffiliateList([newProd, ...affiliateList]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowSubmitModal(false);
      setNewTitle('');
      setNewUrl('');
      setNewDesc('');
      setNewPrice(0);
    }, 1500);
  };

  const copyRefLink = (id: string, url: string) => {
    const refLink = `${url}?ref=es_digital_2percent&creator_id=${id}`;
    navigator.clipboard?.writeText(refLink);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Navigation Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'welcome' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Animated App Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'materials' 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-200' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Educational Books & Videos</span>
          </button>

          <button
            onClick={() => setActiveTab('commission')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'commission' 
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-200' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Percent className="w-4 h-4 text-amber-700" />
            <span>Publish Work & Earn 2% Commission</span>
          </button>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Source Product</span>
        </button>
      </div>

      {/* TAB 1: WELCOME & ANIMATED DASHBOARD SHOWCASE */}
      {activeTab === 'welcome' && (
        <div className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Interactive System Overview
            </span>
            <h2 className="text-3xl font-black text-slate-900 font-display">
              Welcome to <span className="text-sky-600">IresoJ Digital CSC</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Explore our real-time interactive dashboard introducing our core digital ecosystem, live service queue monitors, web development project structures, and educational academy resources.
            </p>
          </div>

          {/* Animated Dashboard Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Dashboard Mock Header Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 border-l border-slate-800 pl-3">
                  IresoJ-digital-computer-services-platfo.vercel.app/dashboard
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Live System Operating
                </span>
              </div>
            </div>

            {/* Animated Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Web Development & Website Login Prep */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded-full border border-sky-800">
                    Template Ready
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Web Dev & Login Preparation</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Pre-configured project structures with secure authentication, Express backend, and responsive UI layouts.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>Starter Templates</span>
                  <strong className="text-sky-400">100% Free Access</strong>
                </div>
              </motion.div>

              {/* Card 2: Educational Books & Documentation Videos */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    Academy
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Books & Video Masterclasses</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Step-by-step PDF handbooks and documentation video guides covering modern software and agricultural tech.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>Video Tutorials</span>
                  <strong className="text-emerald-400">Published Free</strong>
                </div>
              </motion.div>

              {/* Card 3: 2% Affiliate Referral Commission */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Percent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                    2% Earn Rate
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Creator Partner Program</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Link your source product or website to receive an automatic 2% referral commission on every successful customer booking.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>Commission Rate</span>
                  <strong className="text-amber-400">2% Per Sale</strong>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPECIFIC EDUCATIONAL MATERIALS (BOOKS, VIDEOS, TEMPLATES) */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-sky-50 border border-sky-100 p-6 rounded-3xl">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-600" />
                <span>Specific Educational Materials & Free Resources</span>
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Ready-to-use digital books, video tutorials, web development project structures, and design templates published for public learning and practical application.
              </p>
            </div>
          </div>

          {/* Educational Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Material Item 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-sky-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
                  Free Educational Book (PDF)
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  100% Free
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                Web Development & Project Architecture Handbook
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Learn modern frontend-backend setup, database schema structure, user authentication flows, and payment gateway logic step-by-step.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">PDF • 48 Pages</span>
                <a 
                  href="https://eloquentjavascript.net/Eloquent_JavaScript.pdf" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Book</span>
                </a>
              </div>
            </div>

            {/* Material Item 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-sky-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                  Documentation Video
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Free Access
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                Building & Preparing Website Login Authentication
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full documentation video tutorial explaining how to build secure website login forms, role permissions, and password hash security.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Video • 24 Min</span>
                <a 
                  href="https://www.youtube.com/watch?v=XVv6m0f98A8" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Watch Tutorial</span>
                </a>
              </div>
            </div>

            {/* Material Item 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-sky-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                  Design Template
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Source Template
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                IresoJ Digital CSC UI Component & Booklet Layout Pack
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ready-to-edit Figma and Tailwind CSS templates for corporate booklets, promotional flyers, ID badges, and web app dashboards.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">UI Kit • Vector/Code</span>
                <a 
                  href="https://www.figma.com/community/file/1218151817540209590" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Get Source Files</span>
                </a>
              </div>
            </div>

            {/* Material Item 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-sky-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Project Structure
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Free Architecture
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                Modern Full-Stack Express + React Boilerplate
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standard production directory layout featuring API route proxying, TypeScript type safety, and Telebirr payment webhook listeners.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">GitHub Repo • Boilerplate</span>
                <a 
                  href="https://github.com/sahat/hackathon-starter" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>View Repository</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: CREATOR SOURCE LINKING & 2% COMMISSION PROGRAM */}
      {activeTab === 'commission' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-300 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
                  <Percent className="w-3 h-3" />
                  Creator Partner Program
                </div>
                <h3 className="text-2xl font-black font-display tracking-tight text-slate-950">
                  Publish Your Products & Earn 2% Commission
                </h3>
                <p className="text-xs text-slate-900 max-w-xl font-medium">
                  Link your personal educational books, web development structures, or design templates. Every time a user accesses or purchases through your source link, you earn a 2% commission!
                </p>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-amber-300 rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Link New Source Work</span>
              </button>
            </div>
          </div>

          {/* Published Products Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {affiliateList.map((item) => {
              const commissionAmount = item.price > 0 ? (item.price * 0.02).toFixed(2) : 'FREE (2% Bonus on Ads)';
              return (
                <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Creator: <strong className="text-slate-900">{item.creatorName}</strong>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 leading-snug">{item.productTitle}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">Base Price</span>
                      <strong className="text-slate-900">{item.price === 0 ? 'FREE' : formatETB(item.price)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-600 uppercase block font-bold">2% Commission</span>
                      <strong className="text-amber-700 font-bold">
                        {item.price === 0 ? '2% Referral Reward' : `${commissionAmount} ETB`}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                    >
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.originalUrl}</span>
                    </a>

                    <button
                      onClick={() => copyRefLink(item.id, item.originalUrl)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedId === item.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied 2% Link!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Get 2% Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBMIT SOURCE WORK MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-500" />
                <span>Publish Source Product & Earn 2%</span>
              </h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base">Product Successfully Linked!</h4>
                <p className="text-xs text-emerald-600">Your 2% referral commission link is active.</p>
              </div>
            ) : (
              <form onSubmit={handleAddAffiliate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Name / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jemal Fano / IresoJ Digital CSC"
                    value={newCreator}
                    onChange={(e) => setNewCreator(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Web Development & Website Login Setup"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="Design Template">Design Template</option>
                      <option value="Project Structure">Project Structure</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Website Login">Website Login</option>
                      <option value="Educational Book">Educational Book</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Base Price (ETB)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Source Website / GitHub / PDF Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/... or https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the educational material or code..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 font-bold flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Automatic 2% commission rate applied to all sales generated via your referral link.</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-950 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-black rounded-xl transition-colors"
                  >
                    Publish & Get 2% Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
