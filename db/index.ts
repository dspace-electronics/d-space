import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const isDrizzleConfigured = () => {
  const cs = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return typeof cs === 'string' && cs.startsWith('postgres');
};

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!dbInstance && isDrizzleConfigured()) {
    try {
      const cs = (process.env.DATABASE_URL || process.env.POSTGRES_URL)!;
      client = postgres(cs, { prepare: false });
      dbInstance = drizzle(client, { schema });
    } catch (err) {
      console.warn('[Dspace DB] Could not initialize PostgreSQL client:', err);
    }
  }
  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) return undefined;
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export { schema };
