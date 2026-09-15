'use server';

import { db, schema, isDrizzleConfigured } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { Product, Order, OrderStatus } from '@/lib/types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, BLR_ZONES } from '@/lib/mock-data';
import { getMilestonesForStatus } from '@/lib/porter';

// Global server-side products cache for instant in-memory persistence and cross-session sync
const globalForProducts = globalThis as unknown as {
  __DSPACE_PRODUCTS__?: Product[];
};

if (!globalForProducts.__DSPACE_PRODUCTS__) {
  globalForProducts.__DSPACE_PRODUCTS__ = [...INITIAL_PRODUCTS];
}

export async function getProductsAction(): Promise<{ success: boolean; data: Product[]; source: 'drizzle' | 'mock' }> {
  if (isDrizzleConfigured() && db) {
    try {
      const rows = await db.select().from(schema.products).orderBy(desc(schema.products.createdAt));
      if (rows && rows.length > 0) {
        const valid5Ids = new Set(INITIAL_PRODUCTS.map((p) => p.id));
        const activeRows = rows.filter((r: any) => valid5Ids.has(r.id) || (r.id && r.id.startsWith('dsp-')));
        const targetRows = activeRows.length > 0 ? activeRows : rows.slice(0, 5);

        const formatted: Product[] = targetRows.map((r: any) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          category: r.category,
          price: Number(r.price),
          comparePrice: r.comparePrice ? Number(r.comparePrice) : undefined,
          stock: r.stock,
          stockCount: r.stock,
          blrHubStock: r.blrHubStock,
          inStock: (r.stock ?? 0) > 0,
          rating: Number(r.rating || 5),
          reviewsCount: r.reviewsCount || 0,
          description: r.description || '',
          specs: (r.specs as any) || {},
          features: (r.features as any) || [],
          imageUrl: r.imageUrl,
          images: r.imageUrl
            ? [r.imageUrl]
            : (r.images && Array.isArray(r.images) && r.images.length > 0)
            ? r.images
            : ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'],
          pinoutUrl: r.pinoutUrl || undefined,
          datasheetUrl: r.datasheetUrl || undefined,
          isSameDayEligible: r.isSameDayEligible ?? true,
          isFeatured: r.isFeatured ?? false,
        }));
        // Sync server memory with DB
        globalForProducts.__DSPACE_PRODUCTS__ = formatted;
        return { success: true, data: formatted, source: 'drizzle' };
      }
    } catch (err) {
      console.warn('[Server Action] Drizzle fetch products error, using cached catalog:', err);
    }
  }
  const currentProducts = globalForProducts.__DSPACE_PRODUCTS__ || INITIAL_PRODUCTS;
  return { success: true, data: currentProducts, source: 'mock' };
}

export async function addProductAction(product: Product, userRole: string): Promise<{ success: boolean; error?: string }> {
  if (userRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Dspace Admins can list or add electronic components.' };
  }

  // Update in-memory server store immediately
  if (globalForProducts.__DSPACE_PRODUCTS__) {
    const exists = globalForProducts.__DSPACE_PRODUCTS__.some((p) => p.id === product.id || p.slug === product.slug);
    if (!exists) {
      globalForProducts.__DSPACE_PRODUCTS__ = [product, ...globalForProducts.__DSPACE_PRODUCTS__];
    } else {
      globalForProducts.__DSPACE_PRODUCTS__ = globalForProducts.__DSPACE_PRODUCTS__.map((p) =>
        p.id === product.id || p.slug === product.slug ? product : p
      );
    }
  }

  if (isDrizzleConfigured() && db) {
    try {
      await db.insert(schema.products).values({
        id: product.id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        price: product.price.toString(),
        comparePrice: product.comparePrice?.toString(),
        stock: product.stock ?? product.stockCount ?? 0,
        blrHubStock: product.blrHubStock ?? 0,
        rating: (product.rating || 5).toString(),
        reviewsCount: product.reviewsCount || 0,
        description: product.description || '',
        specs: product.specs || {},
        features: product.features || [],
        imageUrl: product.imageUrl,
        pinoutUrl: product.pinoutUrl,
        datasheetUrl: product.datasheetUrl,
        isSameDayEligible: product.isSameDayEligible ?? true,
        isFeatured: product.isFeatured ?? false,
      });
      return { success: true };
    } catch (err: any) {
      console.error('[Server Action] Drizzle insert error:', err);
      return { success: true }; // Memory write succeeded
    }
  }

  return { success: true };
}

export async function deleteProductAction(productId: string, userRole: string): Promise<{ success: boolean; error?: string }> {
  if (userRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Dspace Admins can remove items.' };
  }

  // Update in-memory server store immediately
  if (globalForProducts.__DSPACE_PRODUCTS__) {
    globalForProducts.__DSPACE_PRODUCTS__ = globalForProducts.__DSPACE_PRODUCTS__.filter((p) => p.id !== productId && p.slug !== productId);
  }

  if (isDrizzleConfigured() && db) {
    try {
      await db.delete(schema.products).where(eq(schema.products.id, productId));
      return { success: true };
    } catch (err: any) {
      return { success: true }; // Memory write succeeded
    }
  }

  return { success: true };
}

export async function updateProductStockAction(productId: string, newStock: number, userRole: string): Promise<{ success: boolean; error?: string }> {
  if (userRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Admins can update inventory stock levels.' };
  }

  // Update in-memory server store immediately
  if (globalForProducts.__DSPACE_PRODUCTS__) {
    globalForProducts.__DSPACE_PRODUCTS__ = globalForProducts.__DSPACE_PRODUCTS__.map((p) => {
      if (p.id === productId || p.slug === productId) {
        return {
          ...p,
          stock: newStock,
          stockCount: newStock,
          blrHubStock: Math.min(newStock, p.blrHubStock),
          inStock: newStock > 0,
        };
      }
      return p;
    });
  }

  if (isDrizzleConfigured() && db) {
    try {
      await db.update(schema.products).set({ stock: newStock }).where(eq(schema.products.id, productId));
      return { success: true };
    } catch (err: any) {
      return { success: true }; // Memory write succeeded
    }
  }

  return { success: true };
}

// Global server-side orders cache for instant in-memory persistence and cross-session sync
const globalForOrders = globalThis as unknown as {
  __DSPACE_ORDERS__?: Order[];
};

if (!globalForOrders.__DSPACE_ORDERS__) {
  globalForOrders.__DSPACE_ORDERS__ = [...INITIAL_ORDERS];
}

export async function createOrderAction(order: Order): Promise<{ success: boolean; error?: string }> {
  // Always update in-memory server store
  if (globalForOrders.__DSPACE_ORDERS__) {
    const exists = globalForOrders.__DSPACE_ORDERS__.some((o) => o.id === order.id || o.orderNumber === order.orderNumber);
    if (!exists) {
      globalForOrders.__DSPACE_ORDERS__ = [order, ...globalForOrders.__DSPACE_ORDERS__];
    } else {
      globalForOrders.__DSPACE_ORDERS__ = globalForOrders.__DSPACE_ORDERS__.map((o) =>
        o.id === order.id || o.orderNumber === order.orderNumber ? order : o
      );
    }
  }

  if (isDrizzleConfigured() && db) {
    try {
      await db.insert(schema.orders).values({
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId || 'guest_user',
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        blrZoneId: order.blrZone?.id || 'indiranagar',
        items: order.items,
        subtotal: order.subtotal.toString(),
        deliveryFee: order.deliveryFee.toString(),
        total: order.total.toString(),
        courierService: order.courierService || order.shippingMethod || 'porter_2wheeler',
        porterTrackingId: order.porterTrackingId,
        porterRider: order.porterRider,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentId: order.paymentId,
      });
      return { success: true };
    } catch (err: any) {
      console.error('[Server Action] Drizzle create order error:', err);
      // Even if database fails or is not connected, in-memory succeeds
      return { success: true };
    }
  }
  return { success: true };
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  if (userRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Admins can update delivery and order status.' };
  }

  // Update in-memory server store
  if (globalForOrders.__DSPACE_ORDERS__) {
    globalForOrders.__DSPACE_ORDERS__ = globalForOrders.__DSPACE_ORDERS__.map((ord) => {
      if (ord.id === orderId || ord.orderNumber === orderId) {
        return {
          ...ord,
          status: newStatus,
          deliveryMilestones: getMilestonesForStatus(newStatus, ord.createdAt),
        };
      }
      return ord;
    });
  }

  if (isDrizzleConfigured() && db) {
    try {
      await db.update(schema.orders).set({ status: newStatus }).where(eq(schema.orders.id, orderId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

export async function getOrdersAction(
  userId?: string,
  userRole?: string
): Promise<{ success: boolean; data: Order[]; source: 'drizzle' | 'mock' }> {
  if (isDrizzleConfigured() && db) {
    try {
      const rows = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
      if (rows && rows.length > 0) {
        const formatted: Order[] = rows.map((r: any) => {
          const zone = BLR_ZONES.find((z) => z.id === r.blrZoneId) || BLR_ZONES[0];
          const createdAtIso = r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString();
          return {
            id: r.id,
            orderNumber: r.orderNumber,
            userId: r.userId || 'guest_user',
            customerName: r.customerName,
            phone: r.phone,
            address: r.address,
            blrZone: zone,
            items: (r.items as any) || [],
            subtotal: Number(r.subtotal),
            deliveryFee: Number(r.deliveryFee),
            total: Number(r.total),
            courierService: r.courierService,
            shippingMethod: r.courierService || 'porter_2wheeler',
            porterTrackingId: r.porterTrackingId,
            porterRider: r.porterRider as any,
            status: r.status as OrderStatus,
            paymentMethod: r.paymentMethod as any,
            paymentStatus: r.paymentStatus as any,
            paymentId: r.paymentId || undefined,
            createdAt: createdAtIso,
            estimatedDeliveryTime: `In ${zone.deliveryEtaMinutes} mins via Porter`,
            deliveryMilestones: getMilestonesForStatus(r.status as OrderStatus, createdAtIso),
          };
        });

        // Also merge any in-memory orders that might not be in DB yet
        const inMemory = globalForOrders.__DSPACE_ORDERS__ || [];
        const combined = new Map<string, Order>();
        formatted.forEach((o) => combined.set(o.id, o));
        inMemory.forEach((o) => {
          if (!combined.has(o.id)) combined.set(o.id, o);
        });

        const merged = Array.from(combined.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Security check: If not admin, restrict order view to caller's own userId
        const scopedOrders = userRole === 'admin' 
          ? merged 
          : userId 
          ? merged.filter((o) => o.userId === userId)
          : [];

        return { success: true, data: scopedOrders, source: 'drizzle' };
      }
    } catch (err) {
      console.warn('[Server Action] Drizzle fetch orders error, using cached orders:', err);
    }
  }

  const serverOrders = globalForOrders.__DSPACE_ORDERS__ || INITIAL_ORDERS;
  const scopedOrders = userRole === 'admin'
    ? serverOrders
    : userId
    ? serverOrders.filter((o) => o.userId === userId)
    : [];

  return { success: true, data: scopedOrders, source: 'mock' };
}

