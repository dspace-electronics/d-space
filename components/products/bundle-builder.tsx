'use client';

import React, { useState } from 'react';
import { Plus, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';

interface BundleBuilderProps {
  currentProduct: Product;
  bundleItems: Product[];
}

export function BundleBuilder({ currentProduct, bundleItems }: BundleBuilderProps) {
  const { addToCart, openCart } = useCart();
  const { success } = useToast();

  const allItems = [currentProduct, ...bundleItems];
  const [selectedIds, setSelectedIds] = useState<string[]>(allItems.map((i) => i.id));

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return; // Keep at least one item
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedProducts = allItems.filter((i) => selectedIds.includes(i.id));
  const rawTotal = selectedProducts.reduce((sum, i) => sum + i.price, 0);
  const bundleDiscount = selectedProducts.length > 1 ? Math.round(rawTotal * 0.08) : 0; // 8% bundle savings
  const bundlePrice = rawTotal - bundleDiscount;

  const handleAddBundle = () => {
    selectedProducts.forEach((p) => addToCart(p, 1));
    success('Hardware Bundle Added', `${selectedProducts.length} items added to your cart.`);
    openCart();
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h3 className="text-base font-bold text-neutral-950 dark:text-white">Frequently Bought Together</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Engineered companion silicon and power modules commonly paired with this component.
          </p>
        </div>
        {bundleDiscount > 0 && (
          <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
            Bundle Savings: Save 8% (₹{bundleDiscount})
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Products Visual Row */}
        <div className="flex flex-wrap items-center gap-3">
          {allItems.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <React.Fragment key={item.id}>
                {idx > 0 && <Plus className="w-4 h-4 text-neutral-400 dark:text-neutral-600 shrink-0" />}
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 bg-neutral-50 dark:bg-black/40 ${
                    isSelected
                      ? 'border-neutral-300 dark:border-white/30 bg-white dark:bg-white/5 shadow-xs'
                      : 'border-neutral-200 dark:border-white/10 opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'}
                    alt={item.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-12 h-12 object-cover rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] shrink-0"
                  />
                  <div className="min-w-0 max-w-[140px]">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs font-mono font-bold text-neutral-950 dark:text-white mt-0.5">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-[#e51e2b] border-[#e51e2b] text-white'
                        : 'border-neutral-300 dark:border-white/20 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Price & Action */}
        <div className="w-full md:w-auto p-4 rounded-xl bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/10 text-left md:text-right shrink-0 space-y-2">
          <div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
              Total for {selectedProducts.length} selected items
            </span>
            <div className="flex items-baseline md:justify-end gap-2">
              <span className="text-xl font-mono font-bold text-neutral-950 dark:text-white">
                ₹{bundlePrice.toLocaleString('en-IN')}
              </span>
              {bundleDiscount > 0 && (
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 line-through">
                  ₹{rawTotal.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddBundle}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#e51e2b] hover:bg-[#c91823] active:scale-95 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add Bundle to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
