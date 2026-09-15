'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { Bike, Phone, MessageSquare, ShieldCheck, CheckCircle2, Clock, MapPin, RefreshCw, Sparkles, Navigation } from 'lucide-react';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';

interface LivePorterTrackerProps {
  order: Order;
}

export function LivePorterTracker({ order: initialOrder }: LivePorterTrackerProps) {
  const { updateOrderStatus } = useOrders();
  const { isAdmin } = useAuth();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [progressPercent, setProgressPercent] = useState(65);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Simulate rider progress along the route
  useEffect(() => {
    if (order.status === 'in_transit') {
      const interval = setInterval(() => {
        setProgressPercent((prev) => (prev >= 92 ? 60 : prev + 1.5));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [order.status]);

  const handleNextStatus = async () => {
    const sequence: OrderStatus[] = ['placed', 'packed', 'driver_assigned', 'in_transit', 'delivered'];
    const currentIdx = sequence.indexOf(order.status);
    if (currentIdx < sequence.length - 1) {
      const nextStatus = sequence[currentIdx + 1];
      await updateOrderStatus(order.id, nextStatus);
      setOrder((prev) => ({
        ...prev,
        status: nextStatus,
      }));
    }
  };

  const rider = order.porterRider || {
    name: 'Ramesh Gowda',
    phone: '+91 99801 44520',
    vehicleType: 'TVS Jupiter 125 (2-Wheeler)',
    vehicleNumber: 'KA-05-EV-4192',
    rating: 4.9,
    totalDeliveries: 3412,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span className="font-mono font-bold text-gray-900">#{order.orderNumber}</span>
            <span>•</span>
            <span>Porter Tracking ID: <strong className="font-mono text-red-600">{order.porterTrackingId}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 display-title">
            Live Porter 2-Wheeler Tracking
          </h1>
        </div>

        {/* Live Delivery Pulse Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 beacon-pulse" />
          <span>{order.status === 'delivered' ? 'Package Delivered' : 'Porter Driver Moving on BLR Route'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Bangalore Route Map & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* High-Tech Route Map Box */}
          <div className="relative overflow-hidden rounded-3xl bg-[#111317] text-white p-6 shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-4 z-10 relative">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Active GPS Telemetry
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Route: Dspace Hub (New Thippasandra) ➔ {order.blrZone.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-gray-400 block">Est. Arrival</span>
                <span className="text-sm font-bold text-white font-mono">
                  {order.status === 'delivered' ? 'Arrived' : order.estimatedDeliveryTime}
                </span>
              </div>
            </div>

            {/* Interactive Animated Route Vector Canvas */}
            <div className="relative h-48 w-full rounded-2xl bg-[#0a0c0f] border border-gray-800 overflow-hidden flex items-center justify-center p-4">
              {/* Bangalore Grid Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Highway Curves */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 200" fill="none">
                <path
                  d="M 60,140 C 180,140 220,60 360,60 C 460,60 500,120 540,120"
                  stroke="#262b35"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 60,140 C 180,140 220,60 360,60 C 460,60 500,120 540,120"
                  stroke="#6366f1"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                />
              </svg>

              {/* Start Point */}
              <div className="absolute left-8 bottom-8 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-300 mt-1 bg-black/70 px-2 py-0.5 rounded">
                  New Thippasandra Hub (Start)
                </span>
              </div>

              {/* Moving Porter Rider Icon */}
              {order.status !== 'delivered' && (
                <div
                  className="absolute transition-all duration-1000 flex flex-col items-center z-20"
                  style={{
                    left: `${progressPercent}%`,
                    top: progressPercent < 60 ? '30%' : '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <div className="h-9 w-9 rounded-full bg-white text-red-600 flex items-center justify-center shadow-xl border-2 border-red-600">
                      <Bike className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mt-1 bg-black/80 px-2 py-0.5 rounded whitespace-nowrap">
                    Porter Bike • Moving (~32 km/h)
                  </span>
                </div>
              )}

              {/* Destination Point */}
              <div className="absolute right-8 bottom-12 flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                  order.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-300 mt-1 bg-black/70 px-2 py-0.5 rounded">
                  {order.blrZone.name}
                </span>
              </div>
            </div>

            {/* Bottom Telemetry bar */}
            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <Bike className="h-3.5 w-3.5 text-red-500" />
                <span>Porter 2-Wheeler Courier • Dispatched via Bengaluru arterial network</span>
              </span>
              <span className="font-mono text-gray-300">
                Speed: 34 km/h • Traffic: Normal
              </span>
            </div>
          </div>

          {/* Delivery Milestones Timeline */}
          <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-xs border border-gray-200/90">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">
              Dispatch Milestones
            </h3>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {(order.deliveryMilestones || []).map((milestone, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-1">
                  <div
                    className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      milestone.completed
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-400 border border-gray-300'
                    }`}
                  >
                    {milestone.completed ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${milestone.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {milestone.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">{milestone.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Driver Details & Components */}
        <div className="space-y-6">
          {/* Porter Rider Card */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border border-gray-200/90">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Porter Delivery Partner
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Verified Rider
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-800 text-white font-bold flex items-center justify-center text-base shadow-xs">
                {rider.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {rider.name}
                </h4>
                <p className="text-xs text-gray-500">
                  ★ {rider.rating} • {rider.totalDeliveries} BLR trips
                </p>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 mb-4 text-xs space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Vehicle:</span>
                <span className="font-semibold text-gray-900">{rider.vehicleType}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Registration:</span>
                <span className="font-mono font-bold text-gray-900">{rider.vehicleNumber}</span>
              </div>
            </div>

            {/* Quick Call / Message Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${rider.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-semibold apple-btn-press hover:bg-gray-800"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Rider</span>
              </a>
              <a
                href={`https://wa.me/919980144520?text=Hello%20Ramesh,%20checking%20status%20for%20Dspace%20Order%20${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold apple-btn-press hover:bg-emerald-700"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Items Summary in Package */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border border-gray-200/90">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Components in Parcel ({order.items.length})
            </h4>

            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
              {order.items.map(({ product, quantity }) => (
                <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-400">{quantity}x</span>
                    <span className="text-gray-800 font-medium line-clamp-1">{product.title}</span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0 ml-2">
                    ₹{product.price * quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 mt-3 text-xs space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Porter Courier Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-950 pt-1">
                <span>Total Paid (Razorpay)</span>
                <span className="text-red-600">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Admin Dispatch Controls */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-neutral-900 dark:bg-white/10 text-white text-xs border border-neutral-800 dark:border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white block">
                  Admin Dispatch Controls
                </span>
                <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                  Admin Only
                </span>
              </div>
              <p className="text-neutral-400 text-[11px] mb-3">
                Advance delivery state to simulate courier progress.
              </p>
              <button
                onClick={handleNextStatus}
                disabled={order.status === 'delivered'}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs apple-btn-press disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{order.status === 'delivered' ? 'Delivery Completed' : 'Advance Order Status'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
