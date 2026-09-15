'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, Plus, Minus } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';

interface StickyBuyBarProps {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export function StickyBuyBar({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
}: StickyBuyBarProps) {
  const { addToCart, openCart } = useCart();
  const { success } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling down past hero area (approx 450px)
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setIsAdded(true);
    success('Added to Cart', `${quantity}x ${product.title} added.`);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const currentPrice = product.price + (selectedVariant?.priceModifier || 0);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#090a0f]/90 backdrop-blur-2xl border-t border-neutral-200 dark:border-white/10 py-3 px-4 sm:px-6 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Thumbnail & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'}
                alt={product.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
                }}
                className="w-11 h-11 object-cover rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#0e1117] shrink-0"
              />
              <div className="min-w-0 hidden sm:block">
                <h4 className="text-xs font-bold text-neutral-950 dark:text-white truncate leading-tight">
                  {product.title}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {selectedVariant ? `Selected: ${selectedVariant.name}` : product.categoryName} ·{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">In Stock</span>
                </p>
              </div>
            </div>

            {/* Right: Quantity & Add to Cart */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="text-right">
                <span className="text-sm sm:text-base font-mono font-extrabold text-neutral-950 dark:text-white block leading-tight">
                  ₹{(currentPrice * quantity).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">Fast Dispatch</span>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-neutral-200 dark:border-white/10 rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#0e1117]">
                <button
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 py-1 text-xs font-mono font-bold text-neutral-950 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="px-2.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 bg-[#e51e2b] hover:bg-[#c91823] active:scale-95 text-white text-xs font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-md shadow-[#e51e2b]/20 cursor-pointer"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
