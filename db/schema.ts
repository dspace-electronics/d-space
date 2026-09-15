import { pgTable, text, timestamp, integer, numeric, boolean, jsonb } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: text('role').notNull().default('user'), // 'user' | 'admin'
  phone: text('phone'),
  defaultAddress: text('default_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(), // 'microcontrollers' | 'sensors' | 'power' | 'actuators' | 'passives' | 'tools'
  price: numeric('price').notNull(),
  comparePrice: numeric('compare_price'),
  stock: integer('stock').notNull().default(0),
  blrHubStock: integer('blr_hub_stock').notNull().default(0),
  rating: numeric('rating').default('5.0'),
  reviewsCount: integer('reviews_count').default(0),
  description: text('description'),
  specs: jsonb('specs').default({}),
  features: jsonb('features').default([]),
  imageUrl: text('image_url').notNull(),
  pinoutUrl: text('pinout_url'),
  datasheetUrl: text('datasheet_url'),
  isSameDayEligible: boolean('is_same_day_eligible').default(true),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id'),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  blrZoneId: text('blr_zone_id').notNull(),
  items: jsonb('items').notNull(),
  subtotal: numeric('subtotal').notNull(),
  deliveryFee: numeric('delivery_fee').notNull().default('0'),
  total: numeric('total').notNull(),
  courierService: text('courier_service').notNull().default('porter_2wheeler'),
  porterTrackingId: text('porter_tracking_id').notNull(),
  porterRider: jsonb('porter_rider'),
  status: text('status').notNull().default('placed'), // 'placed' | 'packed' | 'driver_assigned' | 'in_transit' | 'delivered'
  paymentMethod: text('payment_method').notNull().default('razorpay_upi'),
  paymentStatus: text('payment_status').notNull().default('paid'), // 'paid' | 'pending'
  paymentId: text('payment_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type DBProduct = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type DBOrder = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
