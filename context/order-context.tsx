'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus, BLRZone, CartItem } from '@/lib/types';
import { INITIAL_ORDERS } from '@/lib/mock-data';
import { generatePorterTrackingId, getRandomPorterRider, getMilestonesForStatus } from '@/lib/porter';
import { createOrderAction, updateOrderStatusAction, getOrdersAction } from '@/app/actions';
import { useAuth } from './auth-context';

interface OrderContextType {
  orders: Order[];
  placeOrder: (params: {
    customerName: string;
    phone: string;
    address: string;
    blrZone: BLRZone;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    courierService: 'porter_2wheeler' | 'porter_express';
    paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'cod';
    paymentId?: string;
  }) => Promise<Order>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<{ success: boolean; error?: string }>;
  getOrderById: (id: string) => Order | undefined;
  getOrderByTrackingId: (trackingId: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
}

const STORAGE_KEY = 'dspace_orders_v3';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Filter out any stale mock orders from prior test builds
const isGenuineOrder = (o: Order) => {
  if (!o || !o.id) return false;
  const lower = o.id.toLowerCase();
  const numLower = (o.orderNumber || '').toLowerCase();
  if (lower.includes('9041') || lower.includes('9042') || numLower.includes('9041') || numLower.includes('9042')) {
    return false;
  }
  return true;
};

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { role, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const refreshOrders = async () => {
    try {
      const res = await getOrdersAction(user?.id, role);
      if (res.success && res.data) {
        const cleanServerOrders = res.data.filter(isGenuineOrder);
        setOrders((prev) => {
          let localOrders: Order[] = [];
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) localOrders = JSON.parse(saved).filter(isGenuineOrder);
          } catch {
            // ignore
          }

          const map = new Map<string, Order>();
          // Add server orders
          cleanServerOrders.forEach((o) => map.set(o.id, o));
          // Overlay local orders (which might be newer)
          localOrders.forEach((o) => {
            const existing = map.get(o.id);
            map.set(o.id, existing ? { ...existing, ...o } : o);
          });
          prev.filter(isGenuineOrder).forEach((o) => {
            if (!map.has(o.id)) map.set(o.id, o);
          });

          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn('Could not fetch orders from db, using fallback:', err);
    }
  };

  useEffect(() => {
    // Purge legacy storage versions containing old seeded entries
    try {
      localStorage.removeItem('dspace_orders');
      localStorage.removeItem('dspace_orders_v2');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(isGenuineOrder);
          setOrders(clean);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        }
      }
    } catch {
      // ignore
    }

    refreshOrders();

    // Cross-tab and in-tab live synchronization listener
    const handleStorageChange = () => {
      try {
        const currentSaved = localStorage.getItem(STORAGE_KEY);
        if (currentSaved) {
          const parsed = JSON.parse(currentSaved);
          if (Array.isArray(parsed)) {
            setOrders(parsed.filter(isGenuineOrder));
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('dspace_orders_v3_updated', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('dspace_orders_v3_updated', handleStorageChange as EventListener);
    };
  }, []);

  const saveOrders = (updated: Order[]) => {
    const clean = updated.filter(isGenuineOrder);
    setOrders(clean);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      window.dispatchEvent(new CustomEvent('dspace_orders_v3_updated', { detail: clean }));
    } catch {
      // ignore
    }
  };

  const addOrder = (order: Order) => {
    const fullOrder: Order = {
      ...order,
      porterTrackingId: order.porterTrackingId || generatePorterTrackingId(),
      porterRider: order.porterRider || getRandomPorterRider(),
      deliveryMilestones:
        order.deliveryMilestones && order.deliveryMilestones.length > 0
          ? order.deliveryMilestones
          : getMilestonesForStatus(order.status || 'placed', order.createdAt || new Date().toISOString()),
    };

    setOrders((prev) => {
      const filtered = prev.filter((o) => o.id !== fullOrder.id && o.orderNumber !== fullOrder.orderNumber);
      const updated = [fullOrder, ...filtered];
      try {
        localStorage.setItem('dspace_orders_v2', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('dspace_orders_v2_updated', { detail: updated }));
      } catch {
        // ignore
      }
      return updated;
    });

    // Background sync to server/database
    createOrderAction(fullOrder).catch((err) => {
      console.warn('Could not sync placed order to backend:', err);
    });
  };

  const placeOrder = async (params: {
    customerName: string;
    phone: string;
    address: string;
    blrZone: BLRZone;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    courierService: 'porter_2wheeler' | 'porter_express';
    paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'cod';
    paymentId?: string;
  }): Promise<Order> => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = generatePorterTrackingId();
    const rider = getRandomPorterRider();
    const orderId = `dsp-ord-${orderNum}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber: `DSP-${orderNum}`,
      userId: user?.id || 'guest_user',
      customerName: params.customerName,
      phone: params.phone,
      address: params.address,
      blrZone: params.blrZone,
      items: params.items,
      subtotal: params.subtotal,
      discount: 0,
      deliveryFee: params.deliveryFee,
      total: params.total,
      shippingMethod: params.courierService,
      courierService: params.courierService,
      porterTrackingId: trackingId,
      porterRider: rider,
      status: 'placed',
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentId: params.paymentId || `pay_rzp_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: `In ${params.blrZone.deliveryEtaMinutes} mins via Porter`,
      deliveryMilestones: getMilestonesForStatus('placed', new Date().toISOString()),
    };

    try {
      await createOrderAction(newOrder);
    } catch (err) {
      console.warn('Could not sync order to database:', err);
    }

    setOrders((prev) => {
      const updated = [newOrder, ...prev.filter((o) => o.id !== newOrder.id)];
      try {
        localStorage.setItem('dspace_orders_v2', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('dspace_orders_v2_updated', { detail: updated }));
      } catch {
        // ignore
      }
      return updated;
    });

    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<{ success: boolean; error?: string }> => {
    if (role !== 'admin') {
      return {
        success: false,
        error: 'Permission Denied: Only Dspace Dispatch Operations can update live Porter status.',
      };
    }

    try {
      await updateOrderStatusAction(orderId, newStatus, role);
    } catch (err) {
      console.warn('Could not update order status in database:', err);
    }

    const updated = orders.map((ord) => {
      if (ord.id === orderId || ord.orderNumber === orderId) {
        return {
          ...ord,
          status: newStatus,
          deliveryMilestones: getMilestonesForStatus(newStatus, ord.createdAt),
        };
      }
      return ord;
    });

    saveOrders(updated);
    return { success: true };
  };

  const getOrderById = (id: string) => {
    return orders.find((o) => o.id === id || o.orderNumber === id || o.porterTrackingId === id);
  };

  const getOrderByTrackingId = (trackingId: string) => {
    return orders.find((o) => o.porterTrackingId?.toLowerCase() === trackingId.toLowerCase());
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        addOrder,
        updateOrderStatus,
        getOrderById,
        getOrderByTrackingId,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}

export const useOrder = useOrders;
