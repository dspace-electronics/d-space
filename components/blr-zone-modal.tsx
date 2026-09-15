'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Zap, Clock, Bike, Check } from 'lucide-react';
import { BLR_ZONES } from '@/lib/mock-data';
import { useCart } from '@/context/cart-context';
import { BLRZone } from '@/lib/types';

interface BLRZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BLRZoneModal({ isOpen, onClose }: BLRZoneModalProps) {
  const { selectedZone, setSelectedZone } = useCart();

  const handleSelect = (zone: BLRZone) => {
    setSelectedZone(zone);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Scrim with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-gray-950">
                    Select Bangalore Delivery Hub
                  </h3>
                  <p className="text-xs text-gray-500">
                    Dispatched from Dspace Central Hub (1273, First Floor, 2nd Cross, HAL 3rd Stage, New Thippasandra PO, Bengaluru 560075) via Porter
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List of Bengaluru Tech Zones */}
            <div className="mt-4 max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
              {BLR_ZONES.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => handleSelect(zone)}
                    className={`group relative flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-150 border ${
                      isSelected
                        ? 'bg-red-50/80 border-2 border-red-600 shadow-2xs'
                        : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-red-50 group-hover:text-red-600'
                        }`}
                      >
                        <Bike className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {zone.name}
                          </span>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200/60">
                            {zone.pincode}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {zone.popularTechHub} • {zone.hubDistanceKm} km from Hub
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-xs font-bold text-red-600">
                          <Clock className="h-3 w-3" />
                          <span>{zone.deliveryEtaMinutes} mins</span>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          Porter: ₹{zone.porterBikeFee}
                        </span>
                      </div>

                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-red-600 bg-red-600 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom info */}
            <div className="mt-5 pt-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Orders before 7:00 PM qualify for guaranteed same-day dispatch</span>
              </span>
              <span className="font-semibold text-emerald-700">
                Free shipping over ₹999
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
