import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { fixedLocations, mobileRoutes } from '../data/inventory';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('FATAL: DATABASE_URL environment variable is missing. A valid PostgreSQL connection string is required.');
}

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
        id SERIAL PRIMARY KEY,
        canonical_id TEXT UNIQUE,
        name TEXT,
        ciudad TEXT,
        tipo_soporte TEXT,
        lat NUMERIC,
        lng NUMERIC,
        address TEXT,
        description TEXT,
        characteristics TEXT,
        mapa_url TEXT,
        image_urls JSONB,
        disponibilidad TEXT DEFAULT 'disponible',
        available_from TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        schedule TEXT,
        duration TEXT,
        waypoints JSONB,
        route_path JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE supports DROP COLUMN IF EXISTS data;

      CREATE SEQUENCE IF NOT EXISTS supports_id_seq;
      ALTER TABLE supports ALTER COLUMN id SET DEFAULT nextval('supports_id_seq');
      ALTER SEQUENCE supports_id_seq OWNED BY supports.id;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_supports_canonical_id ON supports(canonical_id);

      CREATE TABLE IF NOT EXISTS mediakit_requests (
        id SERIAL PRIMARY KEY,
        request_id TEXT UNIQUE,
        requester_name TEXT,
        requester_email TEXT,
        requester_company TEXT,
        requester_phone TEXT,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE mediakit_requests DROP COLUMN IF EXISTS data;

      CREATE SEQUENCE IF NOT EXISTS mediakit_requests_id_seq;
      ALTER TABLE mediakit_requests ALTER COLUMN id SET DEFAULT nextval('mediakit_requests_id_seq');
      ALTER SEQUENCE mediakit_requests_id_seq OWNED BY mediakit_requests.id;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_mediakit_requests_request_id ON mediakit_requests(request_id);

      CREATE TABLE IF NOT EXISTS mediakit_request_items (
        id SERIAL PRIMARY KEY,
        request_id TEXT,
        support_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE mediakit_request_items DROP COLUMN IF EXISTS data;

      CREATE SEQUENCE IF NOT EXISTS mediakit_request_items_id_seq;
      ALTER TABLE mediakit_request_items ALTER COLUMN id SET DEFAULT nextval('mediakit_request_items_id_seq');
      ALTER SEQUENCE mediakit_request_items_id_seq OWNED BY mediakit_request_items.id;
    `);

    // 1.b Add Foreign Key Constraints & Cleanup Orphans (P0-4)
    await pool.query(`
      DELETE FROM mediakit_request_items WHERE support_id NOT IN (SELECT canonical_id FROM supports);
      DELETE FROM mediakit_request_items WHERE request_id NOT IN (SELECT request_id FROM mediakit_requests);

      ALTER TABLE mediakit_request_items DROP CONSTRAINT IF EXISTS fk_mediakit_request_items_request;
      ALTER TABLE mediakit_request_items DROP CONSTRAINT IF EXISTS fk_mediakit_request_items_support;

      ALTER TABLE mediakit_request_items 
        ADD CONSTRAINT fk_mediakit_request_items_request 
        FOREIGN KEY (request_id) REFERENCES mediakit_requests(request_id) ON DELETE CASCADE;

      ALTER TABLE mediakit_request_items 
        ADD CONSTRAINT fk_mediakit_request_items_support 
        FOREIGN KEY (support_id) REFERENCES supports(canonical_id) ON DELETE CASCADE;
    `);

    console.log('Database tables and foreign key constraints verified/created successfully.');

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
      // Existing record: DO NOT overwrite operational fields like disponibilidad (P0-3). Only sync static descriptive fields.
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
