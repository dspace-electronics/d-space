'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, ShieldCheck, Quote, MapPin, Zap } from 'lucide-react';
import Avatar from 'boring-avatars';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  location: string;
  labTag: string;
  rating: number;
  deliveryEta: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    quote:
      'We fried an ESP32-S3 board during battery BMS firmware testing at 4:30 PM. Dspace had a replacement at our Koramangala lab in 28 minutes via Porter. Unbelievable response time.',
    author: 'Siddharth Nair',
    role: 'Embedded Systems Lead, EV Startup',
    location: 'Koramangala 4th Block',
    labTag: 'BMS Firmware Lab',
    rating: 5,
    deliveryEta: '28m Porter Delivery',
  },
  {
    id: 't-2',
    quote:
      'The silicon authenticity is 100% genuine. We inspect the Bosch Sensortec markings under microscopes; no fake clones or factory rejects. The ESD packaging is pristine.',
    author: 'Dr. Ananya Murthy',
    role: 'Robotics Lab Researcher',
    location: 'IISc Bengaluru, CV Raman Rd',
    labTag: 'Sensor Calibration',
    rating: 5,
    deliveryEta: 'Verified Silicon',
  },
  {
    id: 't-3',
    quote:
      'Linear-level frontend quality with instant local dispatch. The command palette search makes finding logic analyzers and buck converters a breeze when building hardware.',
    author: 'Gaurav K.',
    role: 'Hardware Hacker & Founder',
    location: 'HSR Layout Sector 2',
    labTag: 'Rapid Prototyping',
    rating: 5,
    deliveryEta: 'New Thippasandra Direct',
  },
  {
    id: 't-4',
    quote:
      'Precision components delivered with proper datasheets and ESD moisture bags. When you are assembling flight telemetry payloads, having same-day genuine chips changes everything.',
    author: 'Meera Krishnan',
    role: 'Avionics Lead, SpaceTech Venture',
    location: 'Indiranagar 100ft Rd',
    labTag: 'Avionics & Telemetry',
    rating: 5,
    deliveryEta: '35m Porter Delivery',
  },
  {
    id: 't-5',
    quote:
      'Ordered 12 RP2040 microcontrollers and CAN-bus transceivers at noon for an emergency testbed overhaul. Arrived before our 2 PM sprint review. Dspace is a lifesaver.',
    author: 'Vikramaditya Rao',
    role: 'Senior IoT Architect, Smart Energy',
    location: 'Electronic City Phase 1',
    labTag: 'Industrial IoT',
    rating: 5,
    deliveryEta: '42m Porter Delivery',
  },
  {
    id: 't-6',
    quote:
      'Finding authentic I2C IMUs and low-noise LDOs in Bengaluru with instant delivery used to require driving through SP Road traffic. Dspace delivers factory-grade silicon to your workbench.',
    author: 'Tanvi Sengupta',
    role: 'Firmware Engineer, Biometrics Lab',
    location: 'Bellandur Outer Ring Rd',
    labTag: 'Bio-Telemetry',
    rating: 5,
    deliveryEta: '31m Porter Delivery',
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive items calculation
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalPages = Math.max(1, TESTIMONIALS.length - itemsPerPage + 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1 >= totalPages ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? totalPages - 1 : prev - 1));
  };

  // Auto-play interval with pause on hover
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalPages, itemsPerPage]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header with Navigation Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-[#e51e2b] dark:text-red-400 uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e51e2b] dark:text-red-400" />
            <span>Community Trust</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            Endorsed by Bengaluru Hardware Labs
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-xl leading-relaxed">
            Verified engineers at electric vehicle startups, deep tech ventures, and robotics research institutions.
          </p>
        </div>

        {/* Carousel Prev/Next Buttons & Counter */}
        <div className="flex items-center gap-3 self-start md:self-end">
          <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mr-2">
            <span className="text-neutral-950 dark:text-white font-bold">{currentIndex + 1}</span>
            <span> / </span>
            <span>{totalPages}</span>
          </div>

          <button
            onClick={prevSlide}
            aria-label="Previous testimonials"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#131722] border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next testimonials"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#131722] border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Viewport & Sliding Track */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex gap-5 transition-transform ease-out"
          animate={{
            x: `calc(-${currentIndex} * (${100 / itemsPerPage}% + ${20 / itemsPerPage}px))`,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="w-full shrink-0 flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0e1117] border border-neutral-200/80 dark:border-white/10 shadow-sm dark:shadow-2xl hover:border-neutral-300 dark:hover:border-white/25 transition-all duration-300 group"
              style={{
                width: `calc(${100 / itemsPerPage}% - ${(20 * (itemsPerPage - 1)) / itemsPerPage}px)`,
              }}
            >
              <div className="space-y-4">
                {/* Top Row: Stars + Lab Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300">
                    <Zap className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                    {t.deliveryEta}
                  </span>
                </div>

                {/* Testimonial Quote */}
                <div className="relative">
                  <Quote className="w-6 h-6 text-neutral-200 dark:text-white/5 absolute -top-1 -left-1 pointer-events-none group-hover:text-red-500/20 transition-colors" />
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed relative z-10 pl-2">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Author & Location Footer */}
              <div className="pt-5 mt-5 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full ring-2 ring-neutral-200 dark:ring-white/10 overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0 shadow-inner">
                    <Avatar
                      size={40}
                      name={t.author}
                      variant="beam"
                      colors={['#e51e2b', '#111827', '#3b82f6', '#10b981', '#f59e0b']}
                    />
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white truncate group-hover:text-[#e51e2b] dark:group-hover:text-red-400 transition-colors">
                      {t.author}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{t.role}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 text-[#e51e2b] dark:text-red-400 shrink-0" />
                      {t.location}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-mono px-2 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-medium">
                  {t.labTag}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx
                ? 'w-8 bg-[#e51e2b] shadow-xs shadow-[#e51e2b]/40'
                : 'w-2 bg-neutral-300 dark:bg-white/20 hover:bg-neutral-400 dark:hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default TestimonialCarousel;
