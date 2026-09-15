'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Clock, Shield, Sparkles, ArrowRight, Bike, Check, ShoppingBag, Star, Cpu, Wrench } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useProducts } from '@/context/product-context';
import { BLR_ZONES } from '@/lib/mock-data';
import { Product } from '@/lib/types';

export function Hero() {
  const { selectedZone, setSelectedZone, addToCart } = useCart();
  const { products } = useProducts();
  
  // Showcase products for the interactive hero card
  const showcaseProducts: Product[] = products.slice(0, 4);

  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const activeProduct = showcaseProducts[activeProductIndex] || showcaseProducts[0];
  const [isAdded, setIsAdded] = useState(false);

  const handleShowcaseAdd = () => {
    addToCart(activeProduct, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const discountPercent = activeProduct.comparePrice
    ? Math.round(((activeProduct.comparePrice - activeProduct.price) / activeProduct.comparePrice) * 100)
    : 0;

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-white via-rose-50/20 to-[#fbfbfd] border-b border-gray-200/70">
      {/* Ambient background light gradients */}
      <div className="absolute -top-40 right-10 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Value Prop & Zone Switcher */}
          <div className="lg:col-span-7 text-left">
            {/* Live Hub Dispatch Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-5 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-red-600 beacon-pulse" />
              <span>Bengaluru Few-Hour Component Dispatch</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 font-normal text-gray-700">
                <Clock className="h-3 w-3 text-red-600" />
                <span>ETA {selectedZone.deliveryEtaMinutes}m to {selectedZone.name}</span>
              </span>
            </div>

            {/* Apple Optical Tracking Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 display-title tracking-tight mb-5">
              Hardware at the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-600">
                speed of software.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-7 font-normal">
              Bangalore’s dedicated electronics quick-commerce hub for makers, IoT labs, and hardware startups.
              Order genuine ESP32-S3s, precision sensors, passives, and soldering tools delivered straight to your lab bench via Porter 2-Wheeler.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-8">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all apple-btn-press"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Shop Components</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <Link
                href="/orders"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm px-5 py-3 rounded-2xl border border-gray-300/80 shadow-2xs hover:border-gray-400 transition-all apple-btn-press"
              >
                <Bike className="h-4 w-4 text-red-600" />
                <span>Track Porter Courier</span>
              </Link>
            </div>

            {/* Quick Hub Selector Pill Strip */}
            <div className="pt-4 border-t border-gray-200/80">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-xs font-semibold text-gray-700">Quick Delivery Hubs:</span>
                <span className="text-[11px] text-gray-400">Click to calculate Porter ETA</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {BLR_ZONES.slice(0, 6).map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all apple-btn-press ${
                        isSelected
                          ? 'bg-gray-950 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {zone.name} <span className={isSelected ? 'text-red-300' : 'text-gray-400'}>({zone.deliveryEtaMinutes}m)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Hardware Showcase Card */}
          <div className="lg:col-span-5">
            <div className="apple-card p-6 relative overflow-hidden bg-white shadow-lg border border-gray-200">
              
              {/* Product Switcher Mini Tabs */}
              <div className="flex items-center gap-1 pb-3 mb-4 border-b border-gray-100 overflow-x-auto scrollbar-none">
                {showcaseProducts.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProductIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all apple-btn-press ${
                      activeProductIndex === idx
                        ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {p.id === 'esp32-s3-devkitc-1' ? 'ESP32-S3' :
                     p.id === 'raspberry-pi-5-8gb' ? 'Pi 5 (8GB)' :
                     p.id === 'bme280-environmental-sensor' ? 'BME280' : 'TS101 Iron'}
                  </button>
                ))}
              </div>

              {/* Top Tags */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600 text-white">
                    Bengaluru Best-Seller
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  <span>{activeProduct.blrHubStock} in HSR Hub</span>
                </div>
              </div>

              {/* Product Image Stage */}
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100/60 p-4 flex items-center justify-center mb-4 border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeProduct.imageUrl}
                  alt={activeProduct.title}
                  className="h-full w-full object-cover rounded-xl transition-transform duration-500 hover:scale-105"
                />

                {/* Overlaid ETA pill */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200/80 shadow-xs flex items-center gap-1.5 text-[11px] font-medium text-gray-700">
                  <Bike className="h-3 w-3 text-red-600" />
                  <span>Porter to {selectedZone.name}: ~{selectedZone.deliveryEtaMinutes}m</span>
                </div>
              </div>

              {/* Title & Rating */}
              <div className="mb-3">
                <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{activeProduct.rating}</span>
                  <span className="text-gray-400 font-normal">({activeProduct.reviewsCount} Bengaluru reviews)</span>
                </div>
                <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                  {activeProduct.title}
                </h3>
              </div>

              {/* Hardware Spec Chips */}
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {Object.entries(activeProduct.specs).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-xl bg-gray-50 border border-gray-200/60 text-[11px]">
                    <span className="text-gray-400 block text-[10px] leading-tight">{k}</span>
                    <span className="font-semibold text-gray-800 truncate block">{v}</span>
                  </div>
                ))}
              </div>

              {/* Price & 1-Click Dispatch Action */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-gray-950">₹{activeProduct.price}</span>
                    {activeProduct.comparePrice && (
                      <span className="text-xs text-gray-400 line-through">₹{activeProduct.comparePrice}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium block">
                    Same-day ESD sealed dispatch
                  </span>
                </div>

                <button
                  onClick={handleShowcaseAdd}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all apple-btn-press ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Trust & Feature Ribbon */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-gray-900 block">Porter 2-Wheeler</span>
              <span className="text-[11px] text-gray-500">From ₹49 across BLR</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-gray-900 block">45-Min Avg. Dispatch</span>
              <span className="text-[11px] text-gray-500">From HSR Central Hub</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-gray-900 block">ESD-Safe Packaging</span>
              <span className="text-[11px] text-gray-500">Shielded anti-static bags</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-gray-900 block">Razorpay Instant UPI</span>
              <span className="text-[11px] text-gray-500">GPay, PhonePe, Cards</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
