import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { fixedLocations, mobileRoutes } from '../data/inventory';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/grupo_comunicarte';

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') || connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });

/**
 * Initializes database tables if they do not exist and runs idempotent seeding.
 */
export async function initDatabase() {
  try {
    // 1. Create tables if not exist and ensure columns exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS supports (
        id SERIAL PRIMARY KEY
      );

      ALTER TABLE supports ADD COLUMN IF NOT EXISTS canonical_id TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS ciudad TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS tipo_soporte TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS lat NUMERIC;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS lng NUMERIC;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS characteristics TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS mapa_url TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS image_urls JSONB;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS disponibilidad TEXT DEFAULT 'disponible';
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS available_from TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS schedule TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS duration TEXT;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS waypoints JSONB;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS route_path JSONB;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      CREATE TABLE IF NOT EXISTS mediakit_requests (
        id SERIAL PRIMARY KEY
      );

      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS request_id TEXT;
      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS requester_name TEXT;
      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS requester_email TEXT;
      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS requester_company TEXT;
      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS requester_phone TEXT;
      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS message TEXT;
      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE mediakit_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      CREATE TABLE IF NOT EXISTS mediakit_request_items (
        id SERIAL PRIMARY KEY
      );

      ALTER TABLE mediakit_request_items ADD COLUMN IF NOT EXISTS request_id TEXT;
      ALTER TABLE mediakit_request_items ADD COLUMN IF NOT EXISTS support_id TEXT;
      ALTER TABLE mediakit_request_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    console.log('Database tables verified/created successfully.');

    // 2. Idempotent Seed
    await seedInventory();
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

async function seedInventory() {
  const allItems = [...fixedLocations, ...mobileRoutes];
  for (const item of allItems) {
    const canonicalId = item.canonical_id;
    const existing = await db.select().from(schema.supports).where(eq(schema.supports.canonicalId, canonicalId));

    const isMobile = 'waypoints' in item;
    const latVal = 'lat' in item && item.lat !== null && item.lat !== undefined ? String(item.lat) : null;
    const lngVal = 'lng' in item && item.lng !== null && item.lng !== undefined ? String(item.lng) : null;
    const disp = item.disponibilidad ?? 'disponible';
    const availFrom = item.availableFrom ?? null;
    const isFeat = item.isFeatured ?? false;
    const sched = isMobile ? (item as any).schedule : null;
    const dur = isMobile ? (item as any).duration : null;
    const wp = isMobile ? (item as any).waypoints : null;
    const rp = isMobile ? (item as any).routePath : null;
    const addr = 'address' in item ? (item as any).address : '';
    const mapaUrlVal = 'mapa_url' in item ? item.mapa_url : '';
    const imgs = item.imageUrls ?? [];

    if (existing.length === 0) {
      await db.insert(schema.supports).values({
        canonicalId,
        name: item.name,
        ciudad: item.ciudad,
        tipoSoporte: item.tipo_soporte,
        lat: latVal,
        lng: lngVal,
        address: addr,
        description: item.description,
        characteristics: item.characteristics,
        mapaUrl: mapaUrlVal,
        imageUrls: imgs,
        disponibilidad: disp,
        availableFrom: availFrom,
        isFeatured: isFeat,
        schedule: sched,
        duration: dur,
        waypoints: wp,
        routePath: rp,
      });
    } else {
      // Update existing record to keep seed in sync if needed, or leave it. Updating ensures seed idempotency with latest fields.
      await db.update(schema.supports).set({
        name: item.name,
        ciudad: item.ciudad,
        tipoSoporte: item.tipo_soporte,
        lat: latVal,
        lng: lngVal,
        address: addr,
        description: item.description,
        characteristics: item.characteristics,
        mapaUrl: mapaUrlVal,
        imageUrls: imgs,
        disponibilidad: disp,
        availableFrom: availFrom,
        isFeatured: isFeat,
        schedule: sched,
        duration: dur,
        waypoints: wp,
        routePath: rp,
        updatedAt: new Date(),
      }).where(eq(schema.supports.canonicalId, canonicalId));
    }
  }
  console.log('Inventory seed completed successfully.');
}

export { pool };
