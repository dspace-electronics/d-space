'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Check, Zap, Truck } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85';

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    deliveryFee,
    total,
    promoCode,
    promoDiscount,
    applyPromoCode,
    removePromoCode,
    freeDeliveryThreshold,
    amountForFreeDelivery,
    selectedZone,
  } = useCart();

  const { success, error } = useToast();
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    const result = applyPromoCode(promoInput);
    if (result.success) {
      success('Promo code applied!', result.message);
      setPromoInput('');
    } else {
      error('Invalid Promo Code', result.message);
    }
    setIsApplyingPromo(false);
  };

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white dark:bg-[#0e1117] border-l border-neutral-200/90 dark:border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-neutral-100 dark:border-white/10 flex items-center justify-between bg-neutral-50/50 dark:bg-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-neutral-800 dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">Your Hardware Cart</h2>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {items.reduce((s, i) => s + i.quantity, 0)} items · Dispatching to {selectedZone.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeCart}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Free Delivery Bar */}
              {items.length > 0 && (
                <div className="px-5 py-3 bg-[#fbfbfd] dark:bg-white/5 border-b border-neutral-100 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#e51e2b]" />
                      {amountForFreeDelivery === 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Free Bengaluru Porter Delivery Unlocked!</span>
                      ) : (
                        <span>
                          Add <span className="font-mono font-bold text-neutral-950 dark:text-white">₹{amountForFreeDelivery}</span> for Free Delivery
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200/70 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        progressPercent >= 100 ? 'bg-emerald-500' : 'bg-[#e51e2b]'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Items List / Empty State */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 flex items-center justify-center text-neutral-400 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Your cart is empty</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mt-1 mb-6">
                      Explore our precision silicon catalog. In-stock boards and sensors dispatch across Bengaluru in few hours.
                    </p>
                    <button
                      onClick={() => {
                        closeCart();
                        router.push('/shop');
                      }}
                      className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Browse Components <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const unitPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
                    return (
                      <div
                        key={`${item.product.id}-${item.selectedVariant?.id || 'std'}`}
                        className="flex gap-3.5 p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white dark:bg-white/5 hover:border-neutral-300 dark:hover:border-white/20 transition-colors"
                      >
                        <img
                          src={item.product?.images?.[0] || (item.product as any)?.imageUrl || fallbackImage}
                          alt={item.product?.title || 'Product'}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackImage;
                          }}
                          className="w-16 h-16 object-cover rounded-lg border border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-black/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                onClick={() => {
                                  closeCart();
                                  router.push(`/product/${item.product.slug}`);
                                }}
                                className="text-xs font-semibold text-neutral-900 dark:text-white truncate hover:text-[#e51e2b] cursor-pointer transition-colors"
                              >
                                {item.product.title}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                                className="text-neutral-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {item.selectedVariant && (
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                Variant: <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.selectedVariant.name}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-100 dark:border-white/10">
                            {/* Stepper */}
                            <div className="flex items-center border border-neutral-200 dark:border-white/10 rounded-lg overflow-hidden bg-neutral-50 dark:bg-black/40">
                              <button
                                onClick={() => updateQuantity(item.product.id, -1, item.selectedVariant?.id)}
                                className="px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold text-neutral-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, 1, item.selectedVariant?.id)}
                                className="px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-mono font-bold text-neutral-950 dark:text-white">
                              ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Checkout Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-neutral-100 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 space-y-3.5">
                  {/* Promo Input */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Discount code (e.g. MAKER10)"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white uppercase font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingPromo || !promoInput.trim()}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-50 text-white dark:text-neutral-950 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Active Promo Tag */}
                  {promoCode && (
                    <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-500/20 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Code &ldquo;{promoCode}&rdquo; active ({promoDiscount?.percent}% OFF)
                      </span>
                      <button
                        onClick={removePromoCode}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 pt-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium text-neutral-900 dark:text-white">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                        <span>Discount ({promoCode})</span>
                        <span className="font-mono font-medium">-₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        Porter 2-Wheeler Dispatch
                        <span className="text-[10px] text-neutral-400">({selectedZone.name})</span>
                      </span>
                      <span className="font-mono font-medium text-neutral-900 dark:text-white">
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">FREE</span>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-neutral-950 dark:text-white pt-2 border-t border-neutral-200 dark:border-white/10">
                      <span>Estimated Total</span>
                      <span className="font-mono text-base text-neutral-950 dark:text-white">
                        ₹{total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 bg-[#e51e2b] hover:bg-[#c91823] active:scale-[0.98] text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-[#e51e2b]/15 cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-neutral-400">
                    Dispatched in few hours via Porter from New Thippasandra Hub · Tested Silicon
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
