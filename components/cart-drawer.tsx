'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, Bike, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { CheckoutModal } from './checkout-modal';

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85';

export function CartDrawer() {
  const {
    items,
    totalItems,
    subtotal,
    deliveryFee,
    total,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    selectedZone,
    amountForFreeDelivery,
    freeDeliveryThreshold,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              {/* Apple Fluid Spring Sheet Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="w-screen max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 display-title">
                        Your Parts Cart ({totalItems})
                      </h3>
                      <span className="text-[11px] text-gray-500">
                        Dispatching to {selectedZone.name}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Free Delivery Progress Bar */}
                <div className="bg-gray-50 p-3 border-b border-gray-100 text-xs">
                  {amountForFreeDelivery > 0 ? (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-gray-600">
                          Add <strong className="text-red-600">₹{amountForFreeDelivery}</strong> more for <strong>FREE Porter Delivery</strong>
                        </span>
                        <span className="font-semibold text-gray-400">{freeDeliveryPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full transition-all duration-300"
                          style={{ width: `${freeDeliveryPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Unlocked Free Same-Day Porter Delivery in Bengaluru!</span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
                  {items.length > 0 ? (
                    items.map(({ product, quantity }) => (
                      <div key={product.id} className="py-4 first:pt-0 last:pb-0 flex gap-3">
                        <div className="h-16 w-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                          <img
                            src={product.imageUrl || fallbackImage}
                            alt={product.title}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = fallbackImage;
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                              {product.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center rounded-lg bg-gray-100 p-0.5 border border-gray-200">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="p-1 hover:bg-white rounded text-gray-700"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-gray-900">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="p-1 hover:bg-white rounded text-gray-700"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <span className="text-xs font-bold text-gray-950">
                              ₹{product.price * quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-400">
                      <ShoppingBag className="h-10 w-10 stroke-[1.5] mb-2 text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">Your cart is empty</p>
                      <span className="text-[11px] text-gray-400 mt-1">
                        Add ESP32s, sensors, or lab tools to get started
                      </span>
                    </div>
                  )}
                </div>

                {/* Drawer Footer / Checkout Summary */}
                {items.length > 0 && (
                  <div className="p-5 border-t border-gray-100 bg-white">
                    {/* Courier choice pill */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs mb-3">
                      <div className="flex items-center gap-2">
                        <Bike className="h-4 w-4 text-red-600" />
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            Porter 2-Wheeler ({selectedZone.name})
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Est. {selectedZone.deliveryEtaMinutes}m direct courier
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">
                        {deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-gray-900">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Courier Fee</span>
                        <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-gray-950 pt-1 border-t border-gray-100">
                        <span>Total</span>
                        <span className="text-red-600">₹{total}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-xs transition-all apple-btn-press"
                    >
                      <span>Proceed to Express Checkout</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
