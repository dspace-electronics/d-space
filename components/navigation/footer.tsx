'use client';

import React from 'react';
import FlickeringFooter from '@/components/ui/flickering-footer';

export function Footer() {
  return (
    <div className="w-full bg-[#fbfbfd] dark:bg-[#050608] transition-colors">
      <FlickeringFooter />
    </div>
  );
}
