'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useWishlist } from '@/context/wishlist-context';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';
import { ProductCard } from '@/components/products/product-card';

export default function WishlistPage() {
  const { wishlist, clearWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { success } = useToast();

  const handleMoveAllToCart = () => {
    wishlist.forEach((p) => addToCart(p, 1));
    success('All Items Moved to Cart', `${wishlist.length} saved components added to cart.`);
    openCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-white/10">
        <div>
          <span className="text-xs font-bold text-[#6366f1] uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Saved Electronics
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white mt-1 tracking-tight">
            Your Hardware Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Components bookmarked for upcoming prototypes and lab workbench projects.
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={clearWishlist}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Clear List</span>
            </button>
            <button
              onClick={handleMoveAllToCart}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white dark:text-neutral-900" />
              <span>Move All to Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center mx-auto text-neutral-400">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Your wishlist is currently empty</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Explore the 36-product catalog of verified development boards, sensors, and lab tools to bookmark items for your next hardware build.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold shadow-xs transition-colors"
            >
              <span>Explore Hardware Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
