import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

const connectionString = process.env.DATABASE_URL;
export const isDatabaseConfigured = Boolean(connectionString && connectionString.trim().length > 0);
const isVercelRuntime = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

const pool = new Pool(
  isDatabaseConfigured
    ? {
        connectionString,
        ssl: connectionString!.includes('neon.tech') || connectionString!.includes('sslmode=require') ? { rejectUnauthorized: true } : undefined,
      }
    : {
        connectionString: 'postgresql://localhost:5432/mockdb',
      }
);

export const db = drizzle(pool, { schema });

/**
 * Database bootstrap is intentionally disabled inside Vercel serverless
 * requests. Schema/seed work is deployment/startup responsibility for the
 * persistent Render runtime, never a request/cold-start dependency.
 */
const BOOTSTRAP_RETRIES = 3;
const BOOTSTRAP_RETRY_DELAY_MS = 500;

function isTransientBootstrapError(err: unknown) {
  if (!err || typeof err !== 'object') return false;
  const error = err as { name?: string; message?: string; code?: string; type?: string };
  const message = String(error.message ?? '').toLowerCase();
  return error.name === 'ErrorEvent' || error.type === 'error' || /connection|websocket|socket|timeout|econnreset|enotfound|etimedout/.test(message) || ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'].includes(String(error.code ?? ''));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function initDatabase() {
  if (!isDatabaseConfigured) {
    console.info('DATABASE_URL is not configured. Running server with static inventory fallback.');
    return;
  }
  console.info('Database migrations are managed outside the request runtime. Use npm run db:migrate during deployment.');
}

export { pool };
