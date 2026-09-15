'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrders } from '@/context/order-context';
import { LivePorterTracker } from '@/components/live-porter-tracker';
import { ArrowLeft, Search, Bike } from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const id = params?.id as string;
  const { getOrderById, orders } = useOrders();

  const order = getOrderById(id) || orders[0];

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
            <Bike className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Order Not Found
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Could not find an active Porter courier assignment for code &ldquo;{id}&rdquo;.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Component Catalog
        </Link>
      </div>

      <LivePorterTracker order={order} />
    </div>
  );
}
