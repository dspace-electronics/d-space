'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck, Zap, FileText, ShoppingBag, Plus, Minus, MapPin, Bike } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart, selectedZone } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Scrim with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/35 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200 z-10 my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column: Image & Stock */}
            <div className="relative bg-gray-50 dark:bg-white/5 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10">
              <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-white dark:bg-black shadow-xs border border-gray-100 dark:border-white/10 flex items-center justify-center">
                <img
                  src={product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85'}
                  alt={product.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85';
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#e51e2b] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                  {product.category}
                </div>
              </div>

              {/* Bangalore Quick Dispatch Guarantee */}
              <div className="w-full mt-4 p-3 rounded-xl bg-white border border-gray-200 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                  <Bike className="h-3.5 w-3.5" />
                  <span>In Stock at HSR Central Hub</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  <strong>{product.blrHubStock} units</strong> ready for immediate Porter 2-Wheeler pickup. Delivery to {selectedZone.name} in ~{selectedZone.deliveryEtaMinutes} mins.
                </p>
              </div>
            </div>

            {/* Right Column: Details, Specs, Add to Cart */}
            <div className="p-6 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                    Dspace Electronics
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    ★ {product.rating} <span className="text-gray-400 font-normal">({product.reviewsCount})</span>
                  </div>
                </div>

                <h2 className="text-xl font-extrabold text-gray-950 display-title mb-2">
                  {product.title}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-2.5 mb-3">
                  <span className="text-2xl font-extrabold text-gray-950">
                    ₹{product.price}
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.comparePrice}
                    </span>
                  )}
                  {product.comparePrice && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Hardware Specifications Table */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                    Hardware Specifications
                  </h4>
                  <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 text-[11px] overflow-hidden">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-2 px-3 bg-gray-50/50">
                        <span className="text-gray-500 font-medium">{key}</span>
                        <span className="text-gray-900 font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Datasheet Link if available */}
                {product.datasheetUrl && (
                  <a
                    href={product.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold mb-4"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Download Official PDF Datasheet</span>
                  </a>
                )}
              </div>

              {/* Quantity Stepper & Add to Cart */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper with tactile feel */}
                  <div className="flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-700 apple-btn-press"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-700 apple-btn-press"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={added}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-xs transition-all apple-btn-press"
                  >
                    {added ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        <span>Add to Cart • ₹{product.price * quantity}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
