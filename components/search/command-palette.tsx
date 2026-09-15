'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles, Clock, Trash2, ArrowUpRight } from 'lucide-react';
import { useSearch } from '@/context/search-context';
import { useProducts } from '@/context/product-context';
import { searchProducts } from '@/lib/products';
import { Product } from '@/lib/types';

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85';

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, closeSearch, recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useSearch();
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(query, products).slice(0, 7);
  }, [query, products]);

  const handleSelectProduct = (product: Product) => {
    addRecentSearch(product.title);
    closeSearch();
    router.push(`/product/${product.slug}`);
  };

  const handleSearchTerm = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
  };

  // Keyboard navigation within list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(searchResults.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(searchResults.length, 1)) % Math.max(searchResults.length, 1));
      } else if (e.key === 'Enter' && searchResults.length > 0) {
        e.preventDefault();
        const selected = searchResults[selectedIndex] || searchResults[0];
        if (selected) {
          handleSelectProduct(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
          />

          {/* Dialog Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#0e1117] border border-neutral-200/90 dark:border-white/10 rounded-2xl shadow-2xl shadow-neutral-950/15 dark:shadow-black/60 overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02]">
              <Search className="w-5 h-5 text-neutral-400 dark:text-neutral-500 shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search chips, sensors, microcontrollers, tools..."
                className="w-full py-4 text-sm sm:text-base bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-white/10 transition-colors mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 dark:text-neutral-400 bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>

            {/* Content Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim() === '' ? (
                <div className="p-3 space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Recent & Popular Searches
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[11px] text-neutral-400 hover:text-red-600 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            className="group inline-flex items-center gap-1.5 bg-neutral-100/80 dark:bg-white/5 hover:bg-neutral-200/80 dark:hover:bg-white/10 border border-neutral-200/60 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
                          >
                            <span onClick={() => handleSearchTerm(term)}>{term}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentSearch(term);
                              }}
                              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Catalog Shortcuts */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-white/10">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 block mb-2">
                      Jump to Catalog Section
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
                      {[
                        { name: 'Development Boards & SBCs', path: '/shop?category=microcontrollers' },
                        { name: 'Precision Sensors & IMUs', path: '/shop?category=sensors' },
                        { name: 'Power & Battery Management', path: '/shop?category=power' },
                        { name: 'Displays & Actuators', path: '/shop?category=actuators' },
                        { name: 'Lab Workbench & Soldering', path: '/shop?category=tools' },
                        { name: `All Catalog Products (${products.length})`, path: '/shop' },
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            closeSearch();
                            router.push(item.path);
                          }}
                          className="flex items-center justify-between text-left px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <span>{item.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {searchResults.length} Products Found
                  </div>
                  {searchResults.map((product, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-neutral-100 dark:bg-white/10 text-neutral-950 dark:text-white border border-neutral-200/80 dark:border-white/10'
                            : 'hover:bg-neutral-50 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.images[0] || fallbackImage}
                            alt={product.title}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = fallbackImage;
                            }}
                            className="w-10 h-10 object-cover rounded-lg border border-neutral-200/80 dark:border-white/10 bg-neutral-100 dark:bg-[#161a22] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold truncate leading-tight">{product.title}</p>
                              {product.isFeatured && (
                                <span className="shrink-0 text-[10px] font-medium bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.2 rounded">
                                  Flagship
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                              {product.subtitle || product.categoryName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-white">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <div className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                            {isSelected ? (
                              <CornerDownLeft className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Sparkles className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No components match &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                    Try searching for common terms like &ldquo;ESP32&rdquo;, &ldquo;Sensors&rdquo;, &ldquo;Soldering&rdquo;, or check our catalog.
                  </p>
                  <button
                    onClick={() => {
                      closeSearch();
                      router.push('/shop');
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#e51e2b] hover:underline"
                  >
                    Browse full {products.length}-item catalog <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-white/[0.02] border-t border-neutral-100 dark:border-white/10 text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/10 px-1 py-0.5 rounded text-[10px]">↑</kbd>
                  <kbd className="font-mono bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/10 px-1 py-0.5 rounded text-[10px]">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/10 px-1 py-0.5 rounded text-[10px]">↵</kbd>
                  to select
                </span>
              </div>
              <span className="text-neutral-400 dark:text-neutral-500 hidden sm:inline">Dspace Instant Hardware Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
