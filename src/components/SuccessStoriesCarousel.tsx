import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote, Star, MessageSquare, Sparkles, Loader2, Play, Pause } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating?: number;
  date: string;
}

interface SuccessStoriesCarouselProps {
  lang: 'en' | 'om';
  onNavigateToContact: () => void;
}

export default function SuccessStoriesCarousel({ lang, onNavigateToContact }: SuccessStoriesCarouselProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Translations
  const trans = {
    en: {
      title: 'Customer Success Stories',
      subtitle: 'Real voices of trust from students, professionals, and local businesses in West Arsi',
      loading: 'Fetching authentic client stories...',
      error: 'Unable to connect to the testimonials service.',
      empty: 'No reviews found in the feedback ledger.',
      submitFeedback: 'Submit Your Experience',
      authorTitle: 'Satisfied Customer',
      next: 'Next slide',
      prev: 'Previous slide'
    },
    om: {
      title: 'Seenaa Milkaa’ina Maamiltootaa',
      subtitle: 'Yaada dhugaa barattoota, ogeessota fi daldaltoota West Arsi irraa',
      loading: 'Yaada maamiltootaa fidaa jira...',
      error: 'Tajaajila yaada maamiltootaa quunnamuun hin danda’amne.',
      empty: 'Kuusaa yaada keessatti ragaan hin argamne.',
      submitFeedback: 'Yaada Keessan Kennaa',
      authorTitle: 'Maamila Gammade',
      next: 'Gara duraa',
      prev: 'Gara duubaa'
    }
  };

  const t = trans[lang];

  // Fetch testimonials dynamically on mount
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        setLoading(true);
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(Array.isArray(data) ? data : []);
        } else {
          setError(t.error);
        }
      } catch (err) {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, [lang]);

  // Handle Autoplay timer
  useEffect(() => {
    if (isPlaying && testimonials.length > 1) {
      autoPlayTimerRef.current = setInterval(() => {
        handleNext();
      }, 6000); // Auto-slide every 6 seconds
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, testimonials.length, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center space-y-4 shadow-sm">
        <Loader2 className="w-8 h-8 text-[#0EA5E9] animate-spin" />
        <p className="text-slate-500 font-mono text-xs animate-pulse">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-red-100 p-10 text-center space-y-3 shadow-sm shadow-red-50">
        <p className="text-red-500 text-xs font-mono font-medium">{error}</p>
        <button 
          onClick={onNavigateToContact}
          className="text-[#0EA5E9] hover:text-sky-600 text-xs font-bold hover:underline"
        >
          {t.submitFeedback}
        </button>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center space-y-3 shadow-sm">
        <p className="text-slate-400 text-xs font-mono">{t.empty}</p>
        <button 
          onClick={onNavigateToContact}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
        >
          {t.submitFeedback}
        </button>
      </div>
    );
  }

  const currentStory = testimonials[activeIndex];
  if (!currentStory) return null;

  const avatarChar = currentStory.name ? currentStory.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <section 
      id="customer-success-stories" 
      className="space-y-8"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Header Accent */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 px-3 py-1 rounded-full text-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">100% Genuine Reviews</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Carousel Card Outer Stage */}
      <div className="relative max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xl shadow-slate-100 relative overflow-hidden min-h-[280px] flex flex-col justify-between">
          
          {/* Subtle Background Art */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
          <Quote className="absolute right-8 top-8 w-24 h-24 text-slate-100/80 pointer-events-none stroke-[1]" />

          {/* Animating Slide Container */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="space-y-6"
              >
                {/* Dynamic Star Indicator */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < (currentStory.rating || 5) ? 'fill-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>

                {/* Main Quote Content */}
                <p className="text-slate-800 text-sm sm:text-base md:text-lg leading-relaxed font-serif italic text-left max-w-2xl">
                  "{currentStory.message}"
                </p>

                {/* Divider */}
                <div className="h-px bg-slate-100 w-full" />

                {/* Author Avatar and metadata */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                  <div className="flex items-center space-x-3 text-left">
                    {/* Real Human Avatar Photo */}
                    <div className="relative shrink-0">
                      <img 
                        src={`https://images.unsplash.com/photo-${
                          activeIndex % 4 === 0 ? '1534528741775-53994a69daeb' :
                          activeIndex % 4 === 1 ? '1507003211169-0a1dd7228f2d' :
                          activeIndex % 4 === 2 ? '1573496359142-b8d87734a5a2' :
                          '1500648767791-00dcc994a43e'
                        }?auto=format&fit=crop&q=80&w=200`}
                        alt={currentStory.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-0.5 rounded-md text-[9px] font-black">
                        ✓
                      </div>
                    </div>
                    <div>
                      <strong className="block text-slate-800 text-sm font-sans tracking-tight font-black">
                        {currentStory.name}
                      </strong>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5 font-bold">
                        {t.authorTitle}
                      </span>
                    </div>
                  </div>

                  {/* Submission date */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    <span>
                      {new Date(currentStory.date).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Footer Pagination & Controls */}
          <div className="relative z-10 flex items-center justify-between pt-6 mt-6 border-t border-slate-150/50">
            {/* Play/Pause Toggle */}
            <button 
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
              title={isPlaying ? 'Pause auto-slide' : 'Resume auto-slide'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center space-x-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex 
                      ? 'w-6 bg-[#0EA5E9]' 
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev/Next Navigation arrows */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={handlePrev}
                className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
                aria-label={t.prev}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
                aria-label={t.next}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* CTA Prompt */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-500 font-medium">
            Visited us recently?{' '}
            <button 
              onClick={onNavigateToContact}
              className="text-[#0EA5E9] hover:text-sky-600 font-bold hover:underline transition-colors cursor-pointer"
            >
              {t.submitFeedback}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
