'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/theme-context';

interface DspaceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

export function DspaceLogo({ className = '', size = 'md', priority = true }: DspaceLogoProps) {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Responsive height configurations to ensure comfortable fit on mobile
  const heightClass =
    size === 'lg'
      ? 'h-9 sm:h-12 w-auto'
      : size === 'sm'
      ? 'h-5 sm:h-6 w-auto'
      : 'h-6 sm:h-8 md:h-9 w-auto';

  return (
    <div className={`relative inline-flex items-center shrink-0 select-none ${className}`}>
      {mounted ? (
        <img
          src={isDark ? '/dspace-brand-logo-dark.png' : '/dspace-brand-logo.png'}
          alt="Dspace Electronics"
          className={`object-contain ${heightClass} transition-opacity duration-200`}
        />
      ) : (
        <>
          {/* Light Mode Original Logo */}
          <img
            src="/dspace-brand-logo.png"
            alt="Dspace Electronics"
            className={`block dark:hidden object-contain ${heightClass}`}
          />
          {/* Dark Mode Original Logo (with White Text and Red D) */}
          <img
            src="/dspace-brand-logo-dark.png"
            alt="Dspace Electronics"
            className={`hidden dark:block object-contain ${heightClass}`}
          />
        </>
      )}
    </div>
  );
}

export default DspaceLogo;
