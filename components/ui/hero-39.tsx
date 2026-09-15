'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { Search, ArrowRight, Truck, ShieldCheck, Cpu, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { useSearch } from '@/context/search-context';
import { useTheme } from '@/context/theme-context';
import { useRouter } from 'next/navigation';
import Typed from 'typed.js';

function TypewriterHighlight({ isDark }: { isDark: boolean }) {
  const el = useRef<HTMLSpanElement>(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    if (!el.current) return;

    typed.current = new Typed(el.current, {
      strings: [
        'Delivered in Hours.',
        'At Lightspeed.',
        'To Your Lab Bench.',
        'Zero Waiting.',
      ],
      typeSpeed: 55,
      backSpeed: 35,
      backDelay: 2000,
      startDelay: 300,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
    });

    return () => {
      typed.current?.destroy();
    };
  }, []);

  return (
    <span
      className={`italic font-normal tracking-normal inline-block ${
        isDark
          ? 'bg-gradient-to-r from-white via-[#ffa4ab] to-[#ff2b3b] bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(255,255,255,0.4)]'
          : 'bg-gradient-to-r from-[#e51e2b] via-[#f97316] to-[#eab308] bg-clip-text text-transparent font-medium drop-shadow-[0_2px_14px_rgba(229,30,43,0.15)]'
      }`}
    >
      <span ref={el} />
    </span>
  );
}

import { useProducts } from '@/context/product-context';

function ComponentCarouselTicker({ isDark }: { isDark: boolean }) {
  const { products } = useProducts();
  const showcaseProducts = products.slice(0, 10);
  const duplicated = [...showcaseProducts, ...showcaseProducts];

  return (
    <div className="w-full max-w-5xl mt-7 sm:mt-9 overflow-hidden relative select-none">
      {/* Side Ambient Fade Gradients */}
      <div className="absolute left-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-r from-[#fbfbfd] dark:from-[#050608] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-l from-[#fbfbfd] dark:from-[#050608] to-transparent z-10 pointer-events-none" />

      {/* Infinite Scrolling Ticker Track */}
      <motion.div
        className="flex items-center gap-3 w-max hover:[animation-play-state:paused]"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 32,
          ease: 'linear',
        }}
      >
        {duplicated.map((item, idx) => (
          <Link
            key={`${item.id}-${idx}`}
            href={`/product/${item.slug}`}
            className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all shrink-0 border backdrop-blur-xl hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${
              isDark
                ? 'bg-neutral-900/50 hover:bg-neutral-800/80 border-white/10 hover:border-[#e51e2b]/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                : 'bg-white/70 hover:bg-white border-neutral-200/80 hover:border-[#e51e2b]/40 shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
            }`}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white dark:bg-black/40 border border-neutral-200/60 dark:border-white/10 shrink-0 flex items-center justify-center p-0.5">
              <img
                src={item.images[0] || '/placeholder.jpg'}
                alt={item.title}
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center gap-2 text-left pr-1.5 min-w-0">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[#e51e2b] transition-colors truncate max-w-[130px]">
                {item.title}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#e51e2b] shrink-0">
                ₹{item.price.toLocaleString('en-IN')}
              </span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

export interface Hero39Props {
  backgroundImageUrl?: string;
  lightBackgroundImageUrl?: string;
  badgeText?: string;
  headingLine1?: string;
  headingLine2Highlight?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  buttonText?: string;
  className?: string;
  isSeatedProp?: boolean;
}

export function Hero39({
  backgroundImageUrl = '/hero-hardware.jpg',
  lightBackgroundImageUrl = '/hero-hardware-light.jpg',
  badgeText = 'BENGALURU FEW-HOUR PORTER DISPATCH ACTIVE',
  headingLine1 = 'From Schematic to Silicon,',
  headingLine2Highlight = 'Delivered in Hours.',
  subtitle = 'Factory-direct ESP32-S3 boards, RP2040 microcontrollers, calibrated Bosch sensors, and precision lab tools. Dispatched across Bengaluru in 2–4 hours via Porter.',
  searchPlaceholder = 'Search chips, sensors, power modules...',
  buttonText = 'Explore Catalog',
  className = '',
}: Hero39Props) {
  const { isDark } = useTheme();
  const { products } = useProducts();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const currentBgImage = isDark ? backgroundImageUrl : lightBackgroundImageUrl;

  const matchedProducts = query.trim().length > 0
    ? products.filter((p) => {
        const q = query.toLowerCase();
        const titleMatch = p?.title?.toLowerCase().includes(q);
        const catMatch = p?.category?.toLowerCase().includes(q);
        const descMatch = p?.description?.toLowerCase().includes(q);
        return Boolean(titleMatch || catMatch || descMatch);
      }).slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  const contentContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 24, stiffness: 120 },
    },
  };

  const logosContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.25 },
    },
  };

  return (
    <div className={`relative w-full min-h-[88vh] lg:min-h-[92vh] flex flex-col justify-center items-center overflow-visible ${className}`}>
      {/* ── Background Image & Atmospheric Lighting ── */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden rounded-none">
        <motion.img
          key={currentBgImage}
          src={currentBgImage}
          alt="Hardware Electronics Engineering Lab Workbench"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full w-full object-cover object-center origin-center"
        />

        {/* Ambient Gradients for Typography Legibility */}
        {isDark ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/75 via-[#050608]/45 to-[#050608] pointer-events-none" />
            <div className="absolute inset-0 bg-radial-[at_center] from-transparent via-[#050608]/50 to-[#050608]/90 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050608] via-[#050608]/80 to-transparent pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/35 to-[#fbfbfd] pointer-events-none" />
            <div className="absolute inset-0 bg-radial-[at_center] from-transparent via-white/50 to-white/85 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#fbfbfd] via-[#fbfbfd]/80 to-transparent pointer-events-none" />
          </>
        )}
      </div>

      {/* ── Main Hero Content (Shifted very slightly down) ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 w-full flex flex-col justify-center items-center text-center">
        <motion.div
          variants={contentContainerVariants}
          initial="hidden"
          animate="show"
          className="flex w-full max-w-4xl flex-col items-center my-auto"
        >
          {/* Top Live Dispatch Status Chip */}
          <motion.div variants={itemVariants}>
            <Link
              href="/delivery"
              className={`group inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 backdrop-blur-xl transition-all shadow-md cursor-pointer ${
                isDark
                  ? 'border border-white/20 bg-neutral-900/80 hover:bg-neutral-800 hover:border-white/40 text-neutral-200'
                  : 'border border-neutral-300 bg-white/90 hover:bg-neutral-50 hover:border-neutral-400 text-neutral-800'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wide">
                {badgeText}
              </span>
              <ArrowRight className="size-3 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Main Title with The Seasons Style Luxury Serif Typography & Typewriter */}
          <motion.h1
            variants={itemVariants}
            className={`mt-6 text-[2.75rem] sm:text-[3.75rem] md:text-[4.65rem] lg:text-[5.35rem] leading-[1.05] font-display text-balance ${
              isDark ? 'text-white' : 'text-neutral-950'
            }`}
          >
            <span className="block font-normal tracking-[-0.015em]">{headingLine1}</span>
            <span className="block mt-1 min-h-[1.15em]">
              <TypewriterHighlight isDark={isDark} />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className={`mt-4 sm:mt-5 max-w-[660px] text-xs sm:text-sm md:text-base leading-[1.65] font-normal text-pretty ${
              isDark ? 'text-neutral-300' : 'text-neutral-700 font-medium'
            }`}
          >
            {subtitle}
          </motion.p>

          {/* Floating Search Capsule with Direct Inline Search & Dropdown */}
          <motion.div variants={itemVariants} className="mt-8 sm:mt-9 w-full max-w-[680px] relative z-30">
            <div
              className={`rounded-full p-1.5 backdrop-blur-2xl transition-all focus-within:ring-2 focus-within:ring-[#e51e2b]/40 ${
                isDark
                  ? 'bg-neutral-900/90 shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-white/20 focus-within:border-[#e51e2b]/70'
                  : 'bg-white/95 shadow-[0_12px_36px_rgba(0,0,0,0.08)] border border-neutral-300 focus-within:border-[#e51e2b]'
              }`}
            >
              <form
                onSubmit={handleSearchSubmit}
                className={`flex h-[52px] sm:h-[56px] w-full items-center justify-between rounded-full pl-4 pr-1.5 gap-2 ${
                  isDark ? 'bg-black/40' : 'bg-neutral-100/90'
                }`}
              >
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <Search className="h-5 w-5 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search chips, sensors, boards (e.g. ESP32, Bosch)..."
                    className={`w-full bg-transparent text-sm sm:text-base font-medium focus:outline-none truncate ${
                      isDark
                        ? 'text-white placeholder:text-neutral-400'
                        : 'text-neutral-900 placeholder:text-neutral-500'
                    }`}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="p-1 rounded-full text-neutral-400 hover:text-neutral-200 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    className="flex h-[42px] sm:h-[46px] items-center justify-center gap-1.5 rounded-full px-4 sm:px-6 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.97] cursor-pointer shrink-0 bg-[#e51e2b] text-white hover:bg-[#c91823] shadow-[#e51e2b]/30"
                  >
                    <span>{query.trim() ? 'Search' : buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Live Autocomplete Results Dropdown */}
            {query.trim().length > 1 && (
              <div
                className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border p-2 text-left shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-3xl z-50 overflow-hidden ${
                  isDark
                    ? 'bg-[#0c0d12]/95 border-white/20 text-white'
                    : 'bg-white/95 border-neutral-300 text-neutral-900'
                }`}
              >
                {matchedProducts.length > 0 ? (
                  <div className="space-y-1">
                    <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                      Matching Components ({matchedProducts.length})
                    </p>
                    {matchedProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                          isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.images[0] || '/placeholder.jpg'}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover bg-white shrink-0 border border-neutral-200/50 shadow-xs"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{product.title}</p>
                            <p className="text-[10px] text-neutral-500 capitalize">{product.category}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <p className="text-xs font-mono font-bold text-[#e51e2b]">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-emerald-500 font-medium">In Stock</p>
                        </div>
                      </Link>
                    ))}
                    <div className="pt-1 border-t border-neutral-200/50 dark:border-white/10 mt-1">
                      <Link
                        href={`/shop?search=${encodeURIComponent(query.trim())}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-colors font-medium text-xs text-[#e51e2b] ${
                          isDark ? 'hover:bg-white/5' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <span>View all results for <strong>"{query.trim()}"</strong></span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-neutral-500">No exact match found for "{query.trim()}".</p>
                    <Link
                      href={`/shop?search=${encodeURIComponent(query.trim())}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#e51e2b] mt-2 hover:underline"
                    >
                      <span>Search full catalog</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Popular Component Pills */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
              <span className={isDark ? 'text-neutral-400' : 'text-neutral-600 font-semibold'}>Popular:</span>
              {[
                { label: 'ESP32-S3 N8R8', slug: 'esp32-s3-devkitc-1' },
                { label: 'RP2040 Pi Pico W', slug: 'raspberry-pi-pico-w' },
                { label: 'BME688 AI Sensor', slug: 'bme688-air-quality-sensor' },
                { label: 'Miniware TS101', slug: 'miniware-ts101-soldering-iron' },
              ].map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug}`}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    isDark
                      ? 'bg-white/10 border border-white/10 text-neutral-200 hover:bg-white/20 hover:text-white'
                      : 'bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 shadow-2xs font-medium'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Value Props Row */}
          <motion.div
            variants={itemVariants}
            className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold"
          >
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>2–4 Hr Porter Delivery in BLR</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Genuine Tested ICs</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span>Direct Factory Silicon</span>
            </div>
          </motion.div>

          {/* Floating Hardware Components Marquee Carousel */}
          <motion.div variants={itemVariants} className="w-full flex justify-center">
            <ComponentCarouselTicker isDark={isDark} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Hero39;
