import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const isDrizzleConfigured = () => {
  return typeof connectionString === 'string' && connectionString.startsWith('postgres');
};

let client: any = null;
let dbInstance: any = null;

if (isDrizzleConfigured()) {
  try {
    client = postgres(connectionString!, { prepare: false });
    dbInstance = drizzle(client, { schema });
  } catch (err) {
    console.warn('[Dspace DB] Could not initialize PostgreSQL client:', err);
  }
}

export const db = dbInstance;
export { schema };
