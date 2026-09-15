'use client';

import React from 'react';
import { useProducts } from '@/context/product-context';
import { ProductCard } from './product-card';
import { CategoryTabs } from './category-tabs';
import { Cpu, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';

export function ProductGrid() {
  const {
    filteredProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    voltageFilter,
    setVoltageFilter,
  } = useProducts();

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setVoltageFilter('all');
  };

  const isFiltered = searchQuery !== '' || selectedCategory !== 'all' || voltageFilter !== 'all';

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header with Maker Badge */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Cpu className="h-3 w-3" />
            <span>Bangalore Hardware Inventory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 display-title">
            Electronic Components Catalog
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            All items stored in anti-static bins at HSR Layout for immediate Porter courier dispatch.
          </p>
        </div>

        {/* Count and Filter Stats */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 shadow-2xs">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Part' : 'Parts'} Available
          </span>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors apple-btn-press border border-gray-200"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Spec Filters */}
      <CategoryTabs />

      {/* Search status notification */}
      {searchQuery && (
        <div className="mb-6 p-3 rounded-xl bg-red-50/60 border border-red-100 flex items-center justify-between text-xs text-gray-700">
          <span>
            Showing search results for &ldquo;<strong className="text-red-600">{searchQuery}</strong>&rdquo;
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-red-600 hover:underline font-semibold"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl bg-white border border-gray-200/90 p-8 shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Cpu className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">
            No components matched your search
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            Try searching for &quot;ESP32&quot;, &quot;Raspberry Pi&quot;, &quot;BME280&quot;, &quot;OLED&quot;, or clear active category filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-semibold hover:bg-gray-800 transition-colors apple-btn-press shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </section>
  );
}
