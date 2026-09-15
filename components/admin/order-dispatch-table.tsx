'use client';

import React from 'react';
import Link from 'next/link';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Bike, CheckCircle2, ArrowUpRight, Clock, Navigation } from 'lucide-react';
import { OrderStatus } from '@/lib/types';

export function OrderDispatchTable() {
  const { orders, updateOrderStatus } = useOrders();
  const { isAdmin } = useAuth();

  const handleAdvanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    if (!isAdmin) {
      alert('Only Dspace Admins can dispatch and update order status.');
      return;
    }

    const nextMap: Record<OrderStatus, OrderStatus> = {
      placed: 'packed',
      packed: 'driver_assigned',
      driver_assigned: 'in_transit',
      in_transit: 'delivered',
      delivered: 'delivered',
    };

    const next = nextMap[currentStatus];
    if (next !== currentStatus) {
      await updateOrderStatus(orderId, next);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-950 display-title">
          Bengaluru Live Dispatch Queue ({orders.length} Orders)
        </h3>
        <p className="text-xs text-gray-500">
          Book Porter 2-Wheeler pickups and advance fulfillment milestones
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white border border-gray-200 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 font-semibold">Order #</th>
              <th className="py-3 px-3 font-semibold">Customer & Destination</th>
              <th className="py-3 px-3 font-semibold">Components</th>
              <th className="py-3 px-3 font-semibold">Total & Payment</th>
              <th className="py-3 px-3 font-semibold">Porter Logistics</th>
              <th className="py-3 px-3 font-semibold">Current Status</th>
              <th className="py-3 px-4 font-semibold text-right">Dispatch Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-gray-950 block">
                    {ord.orderNumber}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="font-semibold text-gray-900 block">
                    {ord.customerName}
                  </span>
                  <span className="text-[11px] text-gray-500 line-clamp-1">
                    {ord.blrZone.name} ({ord.phone})
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="font-medium text-gray-700">
                    {ord.items.map((i) => `${i.quantity}x ${i.product.title.split(' ')[0]}`).join(', ')}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="font-bold text-gray-950 block">
                    ₹{ord.total}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">
                    {ord.paymentStatus} via Razorpay
                  </span>
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 text-red-600 font-mono text-[11px] font-semibold">
                    <Bike className="h-3.5 w-3.5" />
                    <span>{ord.porterTrackingId}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {ord.porterRider?.name || 'Assigning Rider'}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ord.status === 'in_transit'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="capitalize">{ord.status.replace('_', ' ')}</span>
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {ord.status !== 'delivered' && (
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, ord.status)}
                        className="px-2.5 py-1 rounded-lg bg-gray-950 hover:bg-gray-800 text-white text-[11px] font-semibold apple-btn-press shadow-2xs"
                      >
                        {ord.status === 'placed' && 'Mark Packed'}
                        {ord.status === 'packed' && 'Assign Porter'}
                        {ord.status === 'driver_assigned' && 'Dispatch Bike'}
                        {ord.status === 'in_transit' && 'Mark Delivered'}
                      </button>
                    )}

                    <Link
                      href={`/tracking/${ord.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                      title="View Live GPS Telemetry"
                    >
                      <Navigation className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
