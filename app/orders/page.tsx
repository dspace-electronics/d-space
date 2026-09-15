'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Bike, ArrowLeft, ArrowUpRight, CheckCircle2, Clock, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const { orders } = useOrders();
  const { user } = useAuth();

  const userOrders = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return orders;
    return orders.filter(
      (o) =>
        (user.id && o.userId === user.id) ||
        (user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase())
    );
  }, [orders, user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-semibold mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white display-title">
            Bengaluru Orders &amp; Live Tracking
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time status of component deliveries dispatched via Porter 2-Wheeler
          </p>
        </div>
      </div>

      {!user ? (
        <div className="rounded-3xl bg-white dark:bg-[#0e1017] p-10 text-center border border-neutral-200/90 dark:border-white/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Sign In to View Orders</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Sign in with your account to view your live orders and track your Porter 2-Wheeler courier in real time.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/signin?redirect=/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6366f1] text-white text-xs font-bold hover:bg-[#4f46e5] transition-colors shadow-xs"
            >
              Sign In <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : userOrders.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#0e1017] p-12 text-center border border-neutral-200/90 dark:border-white/10 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">No Orders Placed Yet</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Place an order from our silicon components catalog to track your Porter courier in real-time.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e51e2b] text-white text-xs font-bold hover:bg-[#c91823] transition-colors"
          >
            Browse Silicon SKUs <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {userOrders.map((ord) => (
            <div
              key={ord.id}
              className="rounded-3xl bg-white dark:bg-[#0e1017] p-6 sm:p-7 border border-neutral-200/90 dark:border-white/10 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-base text-neutral-950 dark:text-white">
                      #{ord.orderNumber || ord.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : ord.status === 'in_transit' || ord.status === 'driver_assigned'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-[#e51e2b]/15 text-[#e51e2b] border border-[#e51e2b]/30'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span className="capitalize">{ord.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Placed on {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-neutral-950 dark:text-white block font-mono">
                    ₹{(ord.total || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono">
                    {ord.paymentStatus === 'paid' ? 'Paid' : 'Pending'} via {ord.paymentMethod?.replace('razorpay_', 'Razorpay ').toUpperCase() || 'COD'}
                  </span>
                </div>
              </div>

              {/* Middle info */}
              <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-1 font-medium font-mono uppercase text-[10px]">Destination:</span>
                  <p className="text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">
                    {ord.address}
                  </p>
                </div>

                <div>
                  <span className="text-neutral-400 block mb-1 font-medium font-mono uppercase text-[10px]">Logistics &amp; Rider:</span>
                  <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
                    <Bike className="h-4 w-4 text-[#e51e2b]" />
                    <span className="font-bold">Porter 2-Wheeler ({ord.porterTrackingId || 'PTR-BLR-AUTO'})</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Rider: {ord.porterRider?.name || 'Assigned Rider'} • {ord.estimatedDeliveryTime || 'In 30 mins via Porter'}
                  </p>
                </div>
              </div>

              {/* Components in order */}
              <div className="pt-4 border-t border-neutral-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  {ord.items?.map((i, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 font-medium border border-neutral-200/60 dark:border-white/10"
                    >
                      {i.quantity}x {i.product?.title}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/tracking/${ord.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] active:bg-[#a5151e] text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <span>Live Porter Map Tracking</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
