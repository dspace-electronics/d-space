'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className="p-1 rounded-full bg-white/80 dark:bg-[#12151f]/85 backdrop-blur-xl border border-neutral-200/90 dark:border-white/15 shadow-[0_8px_25px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-[#e51e2b] dark:hover:bg-[#e51e2b] dark:hover:text-white active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e51e2b]"
            >
              <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
