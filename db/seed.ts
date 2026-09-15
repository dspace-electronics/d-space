import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../lib/mock-data';

async function seed() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL or POSTGRES_URL environment variable is missing.');
    console.log('👉 Please set DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" in .env.local');
    process.exit(1);
  }

  console.log('⚡ Connecting to database via Drizzle ORM...');
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  console.log('📦 Seeding Electronic Components catalog...');
  for (const item of INITIAL_PRODUCTS) {
    await db.insert(schema.products).values({
      id: item.id,
      title: item.title,
      slug: item.slug,
      category: item.category,
      price: item.price.toString(),
      comparePrice: item.comparePrice?.toString(),
      stock: item.stock ?? item.stockCount ?? 0,
      blrHubStock: item.blrHubStock,
      rating: item.rating.toString(),
      reviewsCount: item.reviewsCount,
      description: item.description,
      specs: item.specs,
      features: item.features,
      imageUrl: item.imageUrl || item.images?.[0] || '',
      pinoutUrl: item.pinoutUrl,
      datasheetUrl: item.datasheetUrl,
      isSameDayEligible: item.isSameDayEligible,
      isFeatured: item.isFeatured ?? false,
    }).onConflictDoNothing();
  }

  console.log('🚚 Seeding initial Porter delivery orders...');
  for (const ord of INITIAL_ORDERS) {
    await db.insert(schema.orders).values({
      id: ord.id,
      orderNumber: ord.orderNumber,
      userId: ord.userId,
      customerName: ord.customerName,
      phone: ord.phone,
      address: ord.address,
      blrZoneId: ord.blrZone.id,
      items: ord.items,
      subtotal: ord.subtotal.toString(),
      deliveryFee: ord.deliveryFee.toString(),
      total: ord.total.toString(),
      courierService: ord.courierService || 'porter_2wheeler',
      porterTrackingId: ord.porterTrackingId || 'PTR-BLR-88219',
      porterRider: ord.porterRider,
      status: ord.status,
      paymentMethod: ord.paymentMethod,
      paymentStatus: ord.paymentStatus,
      paymentId: ord.paymentId,
    }).onConflictDoNothing();
  }

  console.log('✅ Dspace Electronics Database successfully seeded via Drizzle ORM!');
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
