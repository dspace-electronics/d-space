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
    process.exit(1);
  }

  console.log('⚡ Connecting to Supabase PostgreSQL database via Drizzle ORM...');
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  console.log(`📦 Preparing catalog: ${INITIAL_PRODUCTS.length} official development boards...`);
  
  // Clean out legacy products that are not part of the official 38-board catalog
  const validIds = INITIAL_PRODUCTS.map((p) => p.id);
  const deleteOldSql = client`DELETE FROM products WHERE id NOT IN ${client(validIds)};`;
  await deleteOldSql;
  console.log('🧹 Purged legacy non-catalog products.');

  // Upsert all 38 boards with correct categories and packshot images
  for (const item of INITIAL_PRODUCTS) {
    const img = item.imageUrl || item.images?.[0] || `/images/products/${item.id}.jpg`;
    await client`
      INSERT INTO products (
        id, title, slug, category, price, compare_price, stock, blr_hub_stock,
        rating, reviews_count, description, specs, features, image_url,
        pinout_url, datasheet_url, is_same_day_eligible, is_featured, created_at
      ) VALUES (
        ${item.id}, ${item.title}, ${item.slug}, ${item.category}, ${item.price.toString()},
        ${item.comparePrice ? item.comparePrice.toString() : null}, ${item.stock ?? item.stockCount ?? 5},
        ${item.blrHubStock ?? 5}, ${item.rating.toString()}, ${item.reviewsCount || 45},
        ${item.description}, ${JSON.stringify(item.specs || {})}, ${JSON.stringify(item.features || [])},
        ${img}, ${item.pinoutUrl || null}, ${item.datasheetUrl || null},
        ${item.isSameDayEligible !== false}, ${item.isFeatured ?? false}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        compare_price = EXCLUDED.compare_price,
        stock = EXCLUDED.stock,
        blr_hub_stock = EXCLUDED.blr_hub_stock,
        description = EXCLUDED.description,
        specs = EXCLUDED.specs,
        features = EXCLUDED.features,
        image_url = EXCLUDED.image_url,
        is_same_day_eligible = EXCLUDED.is_same_day_eligible,
        is_featured = EXCLUDED.is_featured;
    `;
    console.log(`  ✓ Synced [${item.category}] ${item.title} (${img})`);
  }

  // Also check orders
  const existingOrders = await client`SELECT COUNT(*) FROM orders;`;
  if (Number(existingOrders[0].count) === 0) {
    console.log('🚚 Seeding demo orders...');
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
  }

  console.log('✅ Supabase PostgreSQL Database successfully synchronized with all 38 products!');
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
