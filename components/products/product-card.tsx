'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Check, Zap, Eye } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useToast } from '@/context/toast-context';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    success('Added to Cart', `${product.title} added.`);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      success('Saved to Wishlist', `${product.title} saved.`);
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  const primaryImage = (product.images && product.images[0]) || product.imageUrl || fallbackImage;
  const secondaryImage = (product.images && product.images[1]) || primaryImage;

  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white dark:bg-[#0e1117] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:border-neutral-300 dark:hover:border-white/25 hover:shadow-xl transition-all">
        {/* Thumbnail Image */}
        <Link href={`/product/${product.slug}`} className="relative w-full sm:w-40 h-40 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 block">
          <img
            src={primaryImage}
            alt={product.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== fallbackImage) {
                target.src = fallbackImage;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-[#e51e2b] text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
              -{discountPercent}%
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {product.categoryName}
            </span>
            {product.voltageLogic && (
              <span className="text-[10px] font-mono font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                {product.voltageLogic}
              </span>
            )}
            {product.blrHubStock > 0 && (
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                In BLR Hub ({product.blrHubStock})
              </span>
            )}
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white group-hover:text-[#e51e2b] transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{product.rating}</span>
              <span className="text-[11px] text-neutral-500">({product.reviewsCount})</span>
            </div>
            {product.variants && (
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                {product.variants.length} configurations
              </span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-200 dark:border-white/10 shrink-0 gap-3">
          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono font-bold text-neutral-950 dark:text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.comparePrice && (
                <span className="text-xs font-mono text-neutral-400 line-through">
                  ₹{product.comparePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block mt-0.5">Incl. of GST</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWishlist}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                inWishlist
                  ? 'bg-rose-50 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/40 text-[#e51e2b]'
                  : 'bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleQuickAdd}
              className="flex items-center gap-2 bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 active:scale-95 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Mode (Default)
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-[#0e1117] border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden hover:border-neutral-300 dark:hover:border-white/25 hover:shadow-xl dark:hover:shadow-2xl transition-all flex flex-col justify-between"
    >
      {/* Top Image Box with Dual Flip */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden border-b border-neutral-200/80 dark:border-white/10">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && product.images.length > 1 ? secondaryImage : primaryImage}
            alt={product.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== fallbackImage) {
                target.src = fallbackImage;
              }
            }}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges & Tags */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-[#e51e2b] text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono shadow-md">
              -{discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-neutral-900/80 dark:bg-white/15 backdrop-blur-md border border-neutral-800 dark:border-white/20 text-white text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-xs">
              Flagship
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            inWishlist
              ? 'bg-white text-[#e51e2b] shadow-md'
              : 'bg-white/80 dark:bg-black/60 backdrop-blur-md border border-neutral-200 dark:border-white/15 text-neutral-700 dark:text-neutral-300 hover:text-[#e51e2b] hover:bg-white dark:hover:bg-black/80 shadow-xs'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current text-[#e51e2b]' : ''}`} />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-bold text-xs py-2 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
          <Link
            href={`/product/${product.slug}`}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/90 dark:bg-black/70 backdrop-blur-md hover:bg-white dark:hover:bg-black text-neutral-950 dark:text-white border border-neutral-200 dark:border-white/20 shadow-lg"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Details Box */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="uppercase tracking-wider font-mono truncate max-w-[130px]">{product.categoryName}</span>
            {product.voltageLogic && (
              <span className="font-mono bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded text-[10px]">
                {product.voltageLogic}
              </span>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-950 dark:text-white line-clamp-1 group-hover:text-[#e51e2b] transition-colors">
              {product.title}
            </h3>
          </Link>

          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1 leading-snug">
            {product.subtitle || product.description}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-mono font-bold text-neutral-950 dark:text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.comparePrice && (
                <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 line-through">
                  ₹{product.comparePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-current" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.rating}</span>
              <span>({product.reviewsCount})</span>
            </div>
          </div>

          {/* Mobile Quick Add */}
          <button
            onClick={handleQuickAdd}
            className="sm:hidden p-2 rounded-xl bg-neutral-100 dark:bg-white/10 active:bg-neutral-200 dark:active:bg-white/20 text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/15 cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
