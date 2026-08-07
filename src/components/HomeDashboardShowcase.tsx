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
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      
      {/* Navigation Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'welcome' 
                ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-md' 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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

      {/* TAB 1: WELCOME & ANIMATED DASHBOARD SHOWCASE (YE-BUNA HERO) */}
      {activeTab === 'welcome' && (
        <div className="space-y-12">
          
          {/* YE-BUNA Hero Section */}
          <div className="bg-[#FAF8F5] dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-8 relative overflow-hidden shadow-xs">
            
            <div className="max-w-xl mx-auto space-y-4">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
                Publish, book computer services, and earn — all in one platform built for <span className="text-sky-600 dark:text-sky-400 font-serif italic underline decoration-sky-400 decoration-wavy">IresoJ Digital patrons & creators</span>.
              </h1>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button 
                onClick={() => window.location.hash = '#start'}
                className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start my page</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button 
                onClick={() => window.location.hash = '#marketplace'}
                className="w-full sm:w-auto border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold px-8 py-4 rounded-full transition-all text-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Browse marketplace</span>
              </button>
            </div>

            {/* Social Proof with Fresh High-Res Portrait Avatars */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="flex -space-x-2 overflow-hidden p-0.5">
                <img className="inline-block h-9 w-9 rounded-full ring-2 ring-amber-400 object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Creator 1" />
                <img className="inline-block h-9 w-9 rounded-full ring-2 ring-amber-400 object-cover shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Creator 2" />
                <img className="inline-block h-9 w-9 rounded-full ring-2 ring-amber-400 object-cover shadow-sm" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" alt="Creator 3" />
                <img className="inline-block h-9 w-9 rounded-full ring-2 ring-amber-400 object-cover shadow-sm" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" alt="Creator 4" />
                <div className="h-9 w-9 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center ring-2 ring-amber-300 shadow-sm">
                  ★
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white font-black">Free to start</strong> · No monthly fees
              </span>
            </div>
          </div>

          {/* Just Arrived! Section */}
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                — NEW ARRIVALS
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🔥</span>
                  <span>Just Arrived!</span>
                </h2>
                <button 
                  onClick={() => window.location.hash = '#store'}
                  className="border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold px-6 py-2.5 rounded-full text-xs flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Discover our latest physical product releases from top Ethiopian creators.
              </p>
            </div>

            {/* Showcase Grid of Physical & Digital Products */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Product 1 */}
              <div className="bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all group">
                <div className="h-44 rounded-2xl bg-amber-50 dark:bg-amber-950/40 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600" 
                    alt="Ethiopian Leather Notebook" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Physical Release
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                    By Jemal Fano (IresoJ)
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                    Hand-Crafted Genuine Ethiopian Leather Journal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Full-grain Ethiopian leather notebook with traditional Ethiopian bindery. Perfect for creators, daily logs, and sketchbooks.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800">
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    1,200 ETB
                  </span>
                  <button className="bg-slate-950 hover:bg-slate-800 text-white dark:bg-amber-400 dark:text-slate-950 font-bold text-xs px-4 py-2 rounded-full cursor-pointer transition-all">
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Product 2 */}
              <div className="bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all group">
                <div className="h-44 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=600" 
                    alt="Computer Accessories Kit" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Tech Hardware
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    By IresoJ Tech Hub
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                    High-Performance SSD & RAM Upgrade Kit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Tested hardware kit for computer service stations in Ethiopia with warranty and installation guide included.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800">
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    3,500 ETB
                  </span>
                  <button className="bg-slate-950 hover:bg-slate-800 text-white dark:bg-amber-400 dark:text-slate-950 font-bold text-xs px-4 py-2 rounded-full cursor-pointer transition-all">
                    Order Kit
                  </button>
                </div>
              </div>

              {/* Product 3 */}
              <div className="bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all group">
                <div className="h-44 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600" 
                    alt="Digital Starter Kit" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Digital Download
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    By Dure Boru Academy
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                    Full Ethiopian Creator Handbook & Source Bundle
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Complete digital publishing guide, Telebirr payment integration code, and graphic layout templates.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800">
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    FREE / 0 ETB
                  </span>
                  <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-full cursor-pointer transition-all">
                    Download PDF
                  </button>
                </div>
              </div>

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
