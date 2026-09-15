'use client';

import React from 'react';
import Image from 'next/image';

interface DspaceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

export function DspaceLogo({ className = '', size = 'md', priority = true }: DspaceLogoProps) {
  // Height configurations
  const heightClass =
    size === 'lg'
      ? 'h-10 sm:h-12 w-auto'
      : size === 'sm'
      ? 'h-6 sm:h-7 w-auto'
      : 'h-8 sm:h-9 w-auto';

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {/* Light Mode Original Logo */}
      <img
        src="/dspace-brand-logo.png"
        alt="Dspace Electronics"
        className={`block dark:hidden object-contain ${heightClass} transition-opacity`}
      />
      {/* Dark Mode Original Logo (with White Text and Red D) */}
      <img
        src="/dspace-brand-logo-dark.png"
        alt="Dspace Electronics"
        className={`hidden dark:block object-contain ${heightClass} transition-opacity`}
      />
    </div>
  );
}

export default DspaceLogo;
