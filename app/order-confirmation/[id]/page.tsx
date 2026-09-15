'use client';

import React, { useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  Printer,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOrder } from '@/context/order-context';
import { Order, CartItem } from '@/lib/types';

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85';

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { orders } = useOrder();
  const orderId = resolvedParams.id;

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#e51e2b', '#111827', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

  const order = orders.find(
    (o: Order) => o.id.toLowerCase() === orderId.toLowerCase() || o.orderNumber.toLowerCase() === orderId.toLowerCase()
  ) || orders[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs border border-emerald-500/20"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block font-mono">
          Order Verified &amp; Confirmed
        </span>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Your components are being packed!
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
          Order ID: <span className="font-mono font-bold text-neutral-900 dark:text-white">{order?.orderNumber || orderId}</span>.
          A dedicated Porter 2-Wheeler courier will dispatch directly from our HSR Layout hub shortly.
        </p>
      </div>

      {/* Live Dispatch Tracker Card */}
      <div className="bg-white dark:bg-[#0e1017] border border-neutral-200/90 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-white/10">
          <div>
            <span className="text-xs font-bold text-[#e51e2b] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              Porter Live Courier Telemetry
            </span>
            <h3 className="text-base font-bold text-neutral-950 dark:text-white mt-0.5">
              Estimated Delivery: 25–40 Minutes
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Dispatching from HSR Sector 1 Hub
            </span>
          </div>
        </div>

        {/* 4-Stage Visual Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {[
            { step: '1. Placed', status: 'Confirmed', done: true, time: 'Just now' },
            { step: '2. ESD Packing', status: 'In Progress', done: true, time: 'Now' },
            { step: '3. Porter Rider', status: 'Assigning', done: false, time: 'ETA 5m' },
            { step: '4. Delivered', status: 'At Your Lab', done: false, time: 'ETA 30m' },
          ].map((m) => (
            <div
              key={m.step}
              className={`p-3.5 rounded-xl border text-left space-y-1 ${
                m.done
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs'
                  : 'bg-neutral-50 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-white/10'
              }`}
            >
              <span className="text-[10px] uppercase font-mono block opacity-70">{m.step}</span>
              <p className="text-xs font-bold leading-tight">{m.status}</p>
              <span className="text-[10px] font-mono block opacity-80">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Rider Info Mock */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#e51e2b] text-white flex items-center justify-center font-bold font-mono">
              P
            </div>
            <div>
              <p className="font-bold text-neutral-900 dark:text-white">Porter Courier Rider: Manjunath K.</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Honda Activa (KA-01-EQ-4492) · 4.9 ★ (1,840 trips)</p>
            </div>
          </div>
          <a
            href="tel:9845000000"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/20 font-semibold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#e51e2b]" /> Call Rider
          </a>
        </div>
      </div>

      {/* Order Summary & Item Breakdown */}
      {order && (
        <div className="bg-white dark:bg-[#0e1017] border border-neutral-200/90 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/10">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white">Itemized Component Receipt</h3>
            <button
              onClick={() => window.print()}
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-white/10">
            {order.items.map((item: CartItem) => (
              <div key={item.product.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.product?.images?.[0] || (item.product as any)?.imageUrl || fallbackImage}
                    alt={item.product?.title || 'Product'}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackImage;
                    }}
                    className="w-10 h-10 object-cover rounded-lg border border-neutral-200 dark:border-white/10 shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-bold text-neutral-900 dark:text-white truncate">{item.product.title}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Qty: {item.quantity} · {item.selectedVariant ? item.selectedVariant.name : 'Standard'}
                    </p>
                  </div>
                </div>

                <span className="font-mono font-bold text-neutral-950 dark:text-white ml-3">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-neutral-100 dark:border-white/10 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono font-medium text-neutral-900 dark:text-white">
                ₹{order.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>Promotional Discount</span>
                <span className="font-mono">-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Porter Courier Dispatch ({order.blrZone.name})</span>
              <span className="font-mono font-medium text-neutral-900 dark:text-white">
                {order.deliveryFee === 0 ? <span className="text-emerald-700 dark:text-emerald-400 font-bold">FREE</span> : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-neutral-950 dark:text-white pt-2 border-t border-neutral-200 dark:border-white/10">
              <span>Total Paid</span>
              <span className="font-mono">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          href="/account"
          className="flex items-center gap-2 bg-[#111827] hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-xs"
        >
          <span>View in Order History</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/shop"
          className="flex items-center gap-2 bg-white hover:bg-neutral-50 dark:bg-white/10 dark:hover:bg-white/20 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-xs"
        >
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
