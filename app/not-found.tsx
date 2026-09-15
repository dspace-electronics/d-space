'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Home, Cpu, Layers } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#0e1017] border border-neutral-200/90 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>HTTP_404_PAGE_NOT_FOUND</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight font-mono">
            404
          </h1>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Silicon Component Address Not Located
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The hardware pinout, product slug, or route you requested does not exist in our Bengaluru catalog database.
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chips, sensors, tools..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#161a22] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </form>

        {/* Quick Nav Links */}
        <div className="pt-2 border-t border-neutral-100 dark:border-white/10 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200/70 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>Home</span>
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#111827] dark:bg-white dark:text-neutral-950 text-white hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-[#6366f1] dark:text-indigo-600" />
            <span>Catalog (36 SKUs)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
