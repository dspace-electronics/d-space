'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AnnouncementProps {
  message?: string;
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Announcement4({
  message = 'Bengaluru Few-Hour Porter Dispatch active — 36+ verified boards and tools ready for rapid lab delivery.',
  badgeText = 'ACTIVE',
  buttonText = 'Check Courier Fee & ETA',
  buttonLink = '/delivery',
  onButtonClick,
  dismissible = true,
  onDismiss,
  className = '',
}: AnnouncementProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className={`w-full flex items-center justify-center p-2 sm:px-4 sm:py-2.5 ${className}`}>
      <div className="relative isolate flex w-full max-w-7xl items-center justify-between overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-900/95 text-white px-3 sm:px-5 py-2 shadow-xs backdrop-blur-md">
        {/* Subtle Ambient Background Gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        >
          <div
            style={{
              clipPath:
                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
            }}
            className="aspect-[577/310] w-[36rem] bg-gradient-to-r from-emerald-500/30 to-sky-500/30 opacity-40"
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        >
          <div
            style={{
              clipPath:
                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
            }}
            className="aspect-[577/310] w-[36rem] bg-gradient-to-r from-sky-500/30 to-indigo-500/30 opacity-40"
          />
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex flex-1 flex-col items-start gap-2 text-xs sm:flex-row sm:items-center sm:gap-3 sm:text-sm pr-6">
          <div className="flex items-center gap-2 font-medium text-neutral-100 min-w-0">
            {badgeText && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {badgeText}
              </span>
            )}
            <span className="truncate text-xs sm:text-sm text-neutral-200">
              {message}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-neutral-600" />
            {buttonLink ? (
              <Link
                href={buttonLink}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-lg transition-all"
              >
                <span>{buttonText}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onButtonClick}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-lg transition-all cursor-pointer"
              >
                <span>{buttonText}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Announcement4;
