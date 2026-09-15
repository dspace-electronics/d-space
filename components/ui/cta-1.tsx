'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface CTAProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  buttonText: string;
  buttonLink?: string;
  buttonIcon?: React.ReactNode;
  onButtonClick?: () => void;
  className?: string;
}

export function Cta1({
  title,
  description,
  buttonText,
  buttonLink,
  buttonIcon,
  onButtonClick,
  className = '',
}: CTAProps) {
  return (
    <section className={`w-full max-w-6xl mx-auto py-12 md:py-16 ${className}`}>
      <div className="px-4 sm:px-6">
        <div className="relative isolate flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-900 text-white p-8 md:p-12 lg:flex-row lg:gap-12 shadow-lg">
          {/* Subtle Ambient Gradients */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-3xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
              }}
              className="aspect-[577/310] w-[36rem] bg-gradient-to-r from-emerald-500/20 to-sky-500/20 opacity-40"
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-3xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
              }}
              className="aspect-[577/310] w-[36rem] bg-gradient-to-r from-sky-500/20 to-indigo-500/20 opacity-40"
            />
          </div>

          {/* Text Content */}
          <div className="flex max-w-2xl flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1 text-xs font-mono text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>BENGALURU LAB DISPATCH</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              {title}
            </h2>
            {description && (
              <p className="text-neutral-400 max-w-[580px] text-sm sm:text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-2 flex w-full shrink-0 justify-center sm:w-auto lg:mt-0">
            {buttonLink ? (
              <Button
                asChild
                size="lg"
                className="h-12 w-full sm:w-auto bg-white hover:bg-neutral-100 text-neutral-950 font-semibold px-8 text-sm sm:text-base shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Link href={buttonLink} className="flex items-center gap-2">
                  <span>{buttonText}</span>
                  {buttonIcon && <span className="shrink-0">{buttonIcon}</span>}
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={onButtonClick}
                className="h-12 w-full sm:w-auto bg-white hover:bg-neutral-100 text-neutral-950 font-semibold px-8 text-sm sm:text-base shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <span>{buttonText}</span>
                {buttonIcon && <span className="ml-2 shrink-0">{buttonIcon}</span>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
