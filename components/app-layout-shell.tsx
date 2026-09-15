'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/navigation/footer';

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Standalone auth pages & Admin portal: omit storefront Navbar, Footer, and store chrome
  const isStandalonePage =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/login' ||
    pathname === '/auth' ||
    pathname?.startsWith('/admin');

  if (isStandalonePage) {
    return <main className="min-h-screen flex-1 w-full bg-[#fbfbfd] dark:bg-[#050608] text-neutral-900 dark:text-white">{children}</main>;
  }

  const isHome = pathname === '/';

  return (
    <>
      <Navbar />
      <main className={`flex-1 ${isHome ? '' : 'pt-20 sm:pt-24'}`}>{children}</main>
      <Footer />
    </>
  );
}
