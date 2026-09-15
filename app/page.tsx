'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  Sparkles,
  Truck,
  ShieldCheck,
  Zap,
  Cpu,
  CheckCircle2,
  MapPin,
  Layers,
  Wrench,
  Gauge,
  ShoppingBag,
} from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { getFeaturedProducts, getBestSellers, getNewArrivals, CATEGORIES } from '@/lib/products';
import { useProducts } from '@/context/product-context';
import { useSearch } from '@/context/search-context';
import { useCart } from '@/context/cart-context';
import { useTheme } from '@/context/theme-context';
import { Hero39 } from '@/components/ui/hero-39';
import { TestimonialCarousel } from '@/components/testimonials/testimonial-carousel';

export default function HomePage() {
  const { products } = useProducts();
  const { openSearch } = useSearch();
  const { addToCart } = useCart();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'new'>('featured');

  const featured = React.useMemo(() => getFeaturedProducts(8, products), [products]);
  const bestSellers = React.useMemo(() => getBestSellers(8, products), [products]);
  const newArrivals = React.useMemo(() => getNewArrivals(8, products), [products]);

  const displayedProducts =
    activeTab === 'featured' ? featured : activeTab === 'bestsellers' ? bestSellers : newArrivals;

  return (
    <div
      className="min-h-screen bg-[#fbfbfd] dark:bg-[#050608] text-neutral-900 dark:text-white space-y-12 sm:space-y-20 pb-20 transition-colors"
    >
      {/* 1. REIMAGINED HERO SECTION */}
      <section className="w-full pt-0 overflow-visible">
        <Hero39 />
      </section>

      {/* 2. BENGALURU SAME-DAY LOGISTICS STATUS PILL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e1017]/90 p-4 sm:px-6 shadow-sm dark:shadow-2xl backdrop-blur-md transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-white/10 flex items-center justify-center text-neutral-900 dark:text-white shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">Porter Few-Hour Delivery Across Bengaluru</span>
                <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Immediate dispatch from New Thippasandra (HAL 3rd Stage) to Indiranagar, Koramangala, Bellandur, Whitefield &amp; beyond.
              </p>
            </div>
          </div>
          <Link
            href="/delivery"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:text-neutral-900 dark:bg-white dark:hover:bg-neutral-200 px-4 py-2.5 rounded-xl transition-all shrink-0 shadow-xs"
          >
            <span>Check Delivery Time &amp; Courier Fee</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. HARDWARE CATEGORIES BENTO MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#e51e2b] uppercase tracking-wider">Catalog Taxonomy</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white mt-1">
              Browse by Engineering Discipline
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="group p-5 rounded-2xl bg-white dark:bg-[#0e1017]/90 border border-neutral-200/90 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/25 shadow-xs hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/10 border border-neutral-200/80 dark:border-white/15 flex items-center justify-center text-neutral-900 dark:text-white group-hover:bg-[#e51e2b] group-hover:text-white transition-colors mb-3">
                  {cat.id === 'microcontrollers' && <Cpu className="w-5 h-5" />}
                  {cat.id === 'sensors' && <Gauge className="w-5 h-5" />}
                  {cat.id === 'power' && <Zap className="w-5 h-5" />}
                  {cat.id === 'actuators' && <Layers className="w-5 h-5" />}
                  {cat.id === 'tools' && <Wrench className="w-5 h-5" />}
                </div>

                <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#e51e2b] transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-neutral-100 dark:border-white/10 text-xs font-semibold text-neutral-900 dark:text-white">
                <span className="font-mono text-neutral-500 dark:text-neutral-400">
                  {products.filter((p) => p.category === cat.id).length} SKUs
                </span>
                <span className="group-hover:translate-x-1 transition-transform text-[#e51e2b]">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. CURATED PRODUCT SHOWCASE TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#e51e2b] uppercase tracking-wider">Silicon Inventory</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white mt-1">
              Curated Component Racks
            </h2>
          </div>

          {/* Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-200/70 dark:bg-white/10 border border-neutral-300/80 dark:border-white/10 rounded-xl self-start sm:self-auto backdrop-blur-md">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'featured'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Flagship Picks
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'bestsellers'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Lab Best Sellers
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'new'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Product Grid (8 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/20 border border-neutral-300 dark:border-white/15 text-xs font-bold text-neutral-900 dark:text-white shadow-xs transition-all"
          >
            <span>Browse Complete 36-Product Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 6. VERIFIED ENGINEER TESTIMONIALS CAROUSEL */}
      <TestimonialCarousel />

      {/* 7. NEWSLETTER / SILICON DROPS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0e1017]/90 border border-neutral-200/90 dark:border-white/10 text-center space-y-3 shadow-md dark:shadow-2xl">
          <span className="text-xs font-bold text-[#e51e2b] uppercase tracking-wider">Hardware Intel</span>
          <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
            Subscribe to Bengaluru Silicon Restocks
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            Get pinged when rare boards like Raspberry Pi 5 8GB, RP2350, and Miniware TS101 land at our New Thippasandra hub.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to Dspace hardware drops!');
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              required
              placeholder="engineer@startup.com"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-300 dark:border-white/15 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#e51e2b] dark:focus:border-[#e51e2b]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#e51e2b] hover:bg-[#c91823] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#e51e2b]/25 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
