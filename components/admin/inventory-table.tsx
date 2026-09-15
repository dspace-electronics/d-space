'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Cpu, Bike, AlertCircle, RefreshCw } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { useAuth } from '@/context/auth-context';
import { AddProductModal } from './add-product-modal';

export function InventoryTable() {
  const { products, deleteProduct, updateStock, refreshProducts, isLoading } = useProducts();
  const { isAdmin } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = async (id: string, title: string) => {
    if (!isAdmin) {
      alert('Only Dspace Admins can remove inventory.');
      return;
    }
    if (confirm(`Are you sure you want to remove "${title}" from the live catalog?`)) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-950 display-title">
            Electronics Inventory ({products.length} Items)
          </h3>
          <p className="text-xs text-gray-500">
            Real-time stock tracking for Bangalore Hub dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshProducts()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 apple-btn-press border border-gray-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-xs apple-btn-press"
          >
            <Plus className="h-4 w-4" />
            <span>List Component</span>
          </button>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="overflow-x-auto rounded-2xl bg-white border border-gray-200 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 font-semibold">Component</th>
              <th className="py-3 px-3 font-semibold">Category</th>
              <th className="py-3 px-3 font-semibold">Price</th>
              <th className="py-3 px-3 font-semibold">HSR Hub Stock</th>
              <th className="py-3 px-3 font-semibold">Total Stock</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.images?.[0] ||
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.id}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-700 border border-gray-200/60">
                    {item.category}
                  </span>
                </td>

                <td className="py-3 px-3 font-bold text-gray-950">
                  ₹{item.price}
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Bike className="h-3 w-3" />
                    <span>{item.blrHubStock} units</span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.stock ?? item.stockCount ?? 0}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => updateStock(item.id, Math.max(0, (item.stock ?? item.stockCount ?? 0) - 5))}
                        className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold border border-gray-200"
                        title="Reduce 5 units"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateStock(item.id, (item.stock ?? item.stockCount ?? 0) + 10)}
                        className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold border border-gray-200"
                        title="Add 10 units"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}
