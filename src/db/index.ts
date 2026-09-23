import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

const connectionString = process.env.DATABASE_URL;
export const isDatabaseConfigured = Boolean(connectionString && connectionString.trim().length > 0);

const pool = new Pool(
  isDatabaseConfigured
    ? {
        connectionString,
        ssl:
          connectionString!.includes('neon.tech') || connectionString!.includes('sslmode=require')
            ? { rejectUnauthorized: true }
            : undefined,
      }
    : {
        connectionString: 'postgresql://localhost:5432/mockdb',
      },
);

export const db = drizzle(pool, { schema });

/**
 * Database bootstrap is deployment-owned and never runs as part of a
 * serverless request/cold start. Apply versioned Drizzle migrations during
 * deployment/startup instead.
 */
export async function initDatabase() {
  if (!isDatabaseConfigured) {
    console.info('DATABASE_URL is not configured. Running server with static inventory fallback.');
    return;
  }
  console.info('Database migrations are managed outside the request runtime. Use npm run db:migrate during deployment.');
}

export { pool };
