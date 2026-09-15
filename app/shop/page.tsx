'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SlidersHorizontal,
  Grid,
  List,
  Search,
  X,
  RotateCcw,
  Sparkles,
  Check,
  Star,
  ChevronDown,
} from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { filterProducts, CATEGORIES } from '@/lib/products';
import { ProductCategory } from '@/lib/types';
import { useProducts } from '@/context/product-context';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CustomSelect, SelectOption } from '@/components/ui/custom-select';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products } = useProducts();

  // URL state
  const initialCategory = (searchParams.get('category') as ProductCategory) || 'all';
  const [category, setCategory] = useState<ProductCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [voltage, setVoltage] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync category if URL param changes
  React.useEffect(() => {
    const urlCat = searchParams.get('category') as ProductCategory;
    if (urlCat) {
      setCategory(urlCat);
    }
  }, [searchParams]);

  // Compute dynamic category counts based on live Admin products
  const categoriesWithCounts = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      count: products.filter((p) => p.category === cat.id).length,
    }));
  }, [products]);

  // Compute filtered products based on live Admin products
  const filteredProducts = useMemo(() => {
    return filterProducts(
      {
        category,
        searchQuery,
        maxPrice,
        voltage,
        inStockOnly,
        minRating,
        sortBy,
      },
      products
    );
  }, [category, searchQuery, maxPrice, voltage, inStockOnly, minRating, sortBy, products]);

  const hasActiveFilters =
    category !== 'all' ||
    searchQuery.trim() !== '' ||
    maxPrice < 10000 ||
    voltage !== 'all' ||
    inStockOnly ||
    minRating > 0;

  const handleResetFilters = () => {
    setCategory('all');
    setSearchQuery('');
    setMaxPrice(10000);
    setVoltage('all');
    setInStockOnly(false);
    setMinRating(0);
    router.replace('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-12 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-neutral-200 dark:border-white/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#e51e2b] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e51e2b] animate-pulse"></span>
              Component Discovery
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white mt-1 tracking-tight">
              Precision Electronics Catalog
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Browse {products.length} verified laboratory dev boards, precision sensors, power supplies, and workbench tools.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{filteredProducts.length} of {products.length} components available</span>
          </div>
        </div>
      </div>

      {/* Main Catalog Grid & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          <div className="p-5 bg-white dark:bg-[#0e1117] border border-neutral-200/80 dark:border-white/10 rounded-2xl space-y-6 shadow-sm dark:shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10">
              <span className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#e51e2b]" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-[#e51e2b] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider block">
                Category
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCategory('all');
                    router.replace('/shop');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    category === 'all'
                      ? 'bg-neutral-950/10 dark:bg-white/15 text-neutral-950 dark:text-white font-semibold border border-neutral-300 dark:border-white/10'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="font-mono text-[10px] opacity-70">{products.length}</span>
                </button>

                {categoriesWithCounts.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        router.replace(`/shop?category=${cat.id}`);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-950/10 dark:bg-white/15 text-neutral-950 dark:text-white font-semibold border border-neutral-300 dark:border-white/10'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-950 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="font-mono text-[10px] opacity-70 shrink-0">{cat.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-white/10">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider">Max Price</label>
                <span className="font-mono font-bold text-neutral-950 dark:text-white bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-transparent px-2 py-0.5 rounded-md">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <Slider
                value={[maxPrice]}
                min={100}
                max={10000}
                step={100}
                onValueChange={(val) => setMaxPrice(val[0])}
                className="w-full py-1.5"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>₹100</span>
                <span>₹10,000</span>
              </div>
            </div>

            {/* Voltage Logic */}
            <div className="space-y-2 pt-4 border-t border-neutral-200 dark:border-white/10">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider block">
                Logic Voltage
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'All Levels', val: 'all' },
                  { label: '3.3V Logic', val: '3.3V' },
                  { label: '5V Logic', val: '5V' },
                  { label: 'Multi / Wide', val: 'Multi-Voltage' },
                ].map((v) => (
                  <button
                    key={v.val}
                    onClick={() => setVoltage(v.val)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer ${
                      voltage === v.val
                        ? 'bg-neutral-950/10 dark:bg-white/15 border-neutral-300 dark:border-white/20 text-neutral-950 dark:text-white font-bold'
                        : 'bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-950 dark:hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-4 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <label htmlFor="shop-instock" className="text-xs font-bold text-neutral-800 dark:text-neutral-300 block cursor-pointer">In-Stock Only</label>
                <span className="text-[10px] text-neutral-500 block">New Thippasandra Hub stock</span>
              </div>
              <Switch
                id="shop-instock"
                checked={inStockOnly}
                onCheckedChange={setInStockOnly}
              />
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-200 dark:border-white/10">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider block">
                Minimum Rating
              </label>
              <RadioGroup
                value={String(minRating)}
                onValueChange={(val) => setMinRating(Number(val))}
                className="gap-1.5"
              >
                {[
                  { label: 'All Ratings', score: 0 },
                  { label: '4.8 ★ and higher', score: 4.8 },
                  { label: '4.5 ★ and higher', score: 4.5 },
                  { label: '4.0 ★ and higher', score: 4.0 },
                ].map((r) => (
                  <label
                    key={r.score}
                    htmlFor={`rating-${r.score}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      minRating === r.score
                        ? 'border-neutral-400 dark:border-white/30 bg-neutral-950/10 dark:bg-white/15 font-semibold text-neutral-950 dark:text-white shadow-2xs'
                        : 'border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <RadioGroupItem value={String(r.score)} id={`rating-${r.score}`} />
                      <span>{r.label}</span>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Control Bar: Search input, Mobile Filter trigger, Sort dropdown, View switch */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#0e1117] border border-neutral-200/80 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-2xl">
            {/* Search within results */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, spec, or interface..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Filters Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/15 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e51e2b]"></span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="w-44">
                <CustomSelect
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  options={[
                    { value: 'featured', label: 'Featured First' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'newest', label: 'Newest Arrivals' },
                  ]}
                />
              </div>

              {/* View Switcher (Grid vs List) */}
              <div className="hidden sm:flex items-center border border-neutral-200 dark:border-white/10 rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-white/15 text-neutral-950 dark:text-white shadow-2xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-white/15 text-neutral-950 dark:text-white shadow-2xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Active filters:</span>
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-300 text-xs px-2.5 py-0.5 rounded-lg">
                  Category: {CATEGORIES.find((c) => c.id === category)?.name || category}
                  <button onClick={() => setCategory('all')}>
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" />
                  </button>
                </span>
              )}
              {voltage !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-300 text-xs px-2.5 py-0.5 rounded-lg">
                  Voltage: {voltage}
                  <button onClick={() => setVoltage('all')}>
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" />
                  </button>
                </span>
              )}
              {maxPrice < 10000 && (
                <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-300 text-xs px-2.5 py-0.5 rounded-lg">
                  Under ₹{maxPrice}
                  <button onClick={() => setMaxPrice(10000)}>
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-300 text-xs px-2.5 py-0.5 rounded-lg">
                  In-Stock Only
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" />
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-300 text-xs px-2.5 py-0.5 rounded-lg">
                  ★ {minRating}+
                  <button onClick={() => setMinRating(0)}>
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-[#e51e2b] dark:text-red-400 hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Items Display */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-[#0e1117] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-2xl">
              <Sparkles className="w-10 h-10 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">No components match your filter criteria</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-6">
                Try widening your price limit or clearing active category filters to see available electronics silicon.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode="list" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-in Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-[#0e1117] border-l border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">Catalog Filters</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider block">Category</label>
                <CustomSelect
                  value={category}
                  onChange={(val) => setCategory(val as any)}
                  options={[
                    { value: 'all', label: `All Categories (${products.length})` },
                    ...categoriesWithCounts.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.count})`,
                    })),
                  ]}
                />
              </div>

              {/* Price */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-neutral-800 dark:text-neutral-300">Max Price</label>
                  <span className="font-mono font-bold bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-md text-neutral-950 dark:text-white">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <Slider
                  value={[maxPrice]}
                  min={100}
                  max={10000}
                  step={100}
                  onValueChange={(val) => setMaxPrice(val[0])}
                  className="w-full py-1.5"
                />
              </div>

              {/* Voltage */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider block">Logic Voltage</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['all', '3.3V', '5V', 'Multi-Voltage'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVoltage(v)}
                      className={`p-2 text-xs rounded-xl border ${
                        voltage === v ? 'bg-neutral-950/10 dark:bg-white/15 border-neutral-300 dark:border-white/20 text-neutral-950 dark:text-white font-bold' : 'bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Stock */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-300 block">In-Stock Only</span>
                  <span className="text-[10px] text-neutral-500 block">New Thippasandra Hub stock</span>
                </div>
                <Switch
                  checked={inStockOnly}
                  onCheckedChange={setInStockOnly}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-white/10 space-y-2">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#e51e2b] hover:bg-[#c91823] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                View {filteredProducts.length} Results
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full py-2 bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/20 text-xs font-medium rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-neutral-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
