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
  for (let attempt = 1; attempt <= BOOTSTRAP_RETRIES; attempt += 1) {
    try {
      await initializeDatabaseOnce();
      return;
    } catch (err) {
      if (attempt === BOOTSTRAP_RETRIES || !isTransientBootstrapError(err)) {
        throw err;
      }
      console.warn(`Transient database bootstrap failure; retrying (${attempt}/${BOOTSTRAP_RETRIES - 1})`);
      await sleep(BOOTSTRAP_RETRY_DELAY_MS * attempt);
    }
  }
}

async function initializeDatabaseOnce() {
  try {
    // 1. Create tables if not exist and ensure columns exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS supports (
        id SERIAL PRIMARY KEY,
        canonical_id TEXT UNIQUE,
        name TEXT,
        ciudad TEXT,
        tipo_soporte TEXT,
        family TEXT DEFAULT 'traditional',
        active BOOLEAN DEFAULT TRUE,
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

      ALTER TABLE supports ADD COLUMN IF NOT EXISTS family TEXT DEFAULT 'traditional';
      ALTER TABLE supports ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
      ALTER TABLE supports DROP COLUMN IF EXISTS data;

      CREATE SEQUENCE IF NOT EXISTS supports_id_seq;
      ALTER TABLE supports ALTER COLUMN id SET DEFAULT nextval('supports_id_seq');
      ALTER SEQUENCE supports_id_seq OWNED BY supports.id;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_supports_canonical_id ON supports(canonical_id);

      CREATE TABLE IF NOT EXISTS support_locations (
        support_canonical_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        ciudad TEXT NOT NULL,
        family TEXT NOT NULL,
        category TEXT NOT NULL,
        lat NUMERIC,
        lng NUMERIC,
        address TEXT,
        mapa_url TEXT,
        availability TEXT NOT NULL DEFAULT 'disponible',
        available_from TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS support_faces (
        id SERIAL PRIMARY KEY,
        support_canonical_id TEXT NOT NULL,
        face_key TEXT NOT NULL,
        label TEXT NOT NULL,
        side TEXT,
        width_meters NUMERIC,
        height_meters NUMERIC,
        width_pixels INTEGER,
        height_pixels INTEGER,
        substrate TEXT,
        notes TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS support_technical (
        support_canonical_id TEXT PRIMARY KEY,
        summary TEXT,
        measures TEXT,
        resolution TEXT,
        turn_on_schedule TEXT,
        daily_frequency TEXT,
        requirements TEXT,
        spot_duration_seconds INTEGER,
        minimum_daily_outings INTEGER,
        max_advertisers INTEGER,
        route_duration_hours NUMERIC,
        operation_days TEXT,
        video_mode TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS support_pricing (
        support_canonical_id TEXT PRIMARY KEY,
        exhibition_price NUMERIC,
        installation_price NUMERIC,
        printing_price NUMERIC,
        monthly_price NUMERIC,
        exclusive_price NUMERIC,
        currency TEXT NOT NULL DEFAULT 'ARS',
        tax_included BOOLEAN NOT NULL DEFAULT FALSE,
        price_public BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS support_media (
        id SERIAL PRIMARY KEY,
        support_canonical_id TEXT NOT NULL,
        media_type TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        alt TEXT,
        mime_type TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        metadata JSONB,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS support_routes (
        support_canonical_id TEXT PRIMARY KEY,
        route_name TEXT,
        route_mode TEXT,
        route_path JSONB,
        waypoints JSONB,
        default_route BOOLEAN NOT NULL DEFAULT FALSE,
        schedule TEXT,
        duration TEXT,
        hours TEXT,
        weekdays TEXT,
        max_advertisers INTEGER,
        spot_duration_seconds INTEGER,
        minimum_daily_outings INTEGER,
        metadata JSONB,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

      ALTER TABLE support_locations DROP CONSTRAINT IF EXISTS fk_support_locations_support;
      ALTER TABLE support_faces DROP CONSTRAINT IF EXISTS fk_support_faces_support;
      ALTER TABLE support_technical DROP CONSTRAINT IF EXISTS fk_support_technical_support;
      ALTER TABLE support_pricing DROP CONSTRAINT IF EXISTS fk_support_pricing_support;
      ALTER TABLE support_media DROP CONSTRAINT IF EXISTS fk_support_media_support;
      ALTER TABLE support_routes DROP CONSTRAINT IF EXISTS fk_support_routes_support;

      ALTER TABLE support_locations
        ADD CONSTRAINT fk_support_locations_support
        FOREIGN KEY (support_canonical_id) REFERENCES supports(canonical_id) ON DELETE CASCADE;

      ALTER TABLE support_faces
        ADD CONSTRAINT fk_support_faces_support
        FOREIGN KEY (support_canonical_id) REFERENCES supports(canonical_id) ON DELETE CASCADE;

      ALTER TABLE support_technical
        ADD CONSTRAINT fk_support_technical_support
        FOREIGN KEY (support_canonical_id) REFERENCES supports(canonical_id) ON DELETE CASCADE;

      ALTER TABLE support_pricing
        ADD CONSTRAINT fk_support_pricing_support
        FOREIGN KEY (support_canonical_id) REFERENCES supports(canonical_id) ON DELETE CASCADE;

      ALTER TABLE support_media
        ADD CONSTRAINT fk_support_media_support
        FOREIGN KEY (support_canonical_id) REFERENCES supports(canonical_id) ON DELETE CASCADE;

      ALTER TABLE support_routes
        ADD CONSTRAINT fk_support_routes_support
        FOREIGN KEY (support_canonical_id) REFERENCES supports(canonical_id) ON DELETE CASCADE;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_support_faces_unique_face_key
        ON support_faces(support_canonical_id, face_key);
    `);

    await pool.query(`
      UPDATE supports
      SET family = CASE
        WHEN tipo_soporte = 'led_movil' THEN 'led_mobile'
        WHEN tipo_soporte = 'led' THEN 'led'
        ELSE 'traditional'
      END
      WHERE family IS NULL OR family = '';

      UPDATE supports
      SET active = FALSE
      WHERE canonical_id IS NULL OR canonical_id = '' OR name IS NULL OR name = '' OR ciudad IS NULL OR ciudad = '' OR tipo_soporte IS NULL OR tipo_soporte = '';
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
    const family = isMobile ? 'led_mobile' : item.tipo_soporte === 'led' ? 'led' : 'traditional';
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
        family,
        active: true,
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
      // Sync only structural/descriptive fields.
      // Preserve operational state such as disponibilidad.
      await db
        .update(schema.supports)
        .set({
          name: item.name,
          ciudad: item.ciudad,
          tipoSoporte: item.tipo_soporte,
          family,
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
        })
        .where(eq(schema.supports.canonicalId, canonicalId));
    }

    const locationRows = await db.select().from(schema.supportLocations).where(eq(schema.supportLocations.supportCanonicalId, canonicalId));
    if (locationRows.length === 0) {
      await db.insert(schema.supportLocations).values({
        supportCanonicalId: canonicalId,
        name: item.name,
        ciudad: item.ciudad,
        family,
        category: family,
        lat: latVal,
        lng: lngVal,
        address: addr,
        mapaUrl: mapaUrlVal,
        availability: disp,
        availableFrom: availFrom,
        active: true,
        isFeatured: isFeat,
      });
    }

    const technicalRows = await db.select().from(schema.supportTechnical).where(eq(schema.supportTechnical.supportCanonicalId, canonicalId));
    if (technicalRows.length === 0) {
      await db.insert(schema.supportTechnical).values({
        supportCanonicalId: canonicalId,
        summary: item.description,
        measures: item.characteristics,
        requirements: isMobile ? 'Requiere recepción de video por campaña' : null,
        turnOnSchedule: isMobile ? (item as any).schedule ?? null : null,
        dailyFrequency: isMobile ? 'Mínimo 180 salidas diarias' : null,
        spotDurationSeconds: isMobile ? 10 : null,
        minimumDailyOutings: isMobile ? 180 : null,
        maxAdvertisers: isMobile ? 8 : null,
        routeDurationHours: isMobile ? '4' : null,
        operationDays: isMobile ? 'Lunes a Viernes' : null,
        videoMode: isMobile ? 'single_campaign_video' : null,
      });
    }

    const pricingRows = await db.select().from(schema.supportPricing).where(eq(schema.supportPricing.supportCanonicalId, canonicalId));
    if (pricingRows.length === 0) {
      await db.insert(schema.supportPricing).values({
        supportCanonicalId: canonicalId,
        exhibitionPrice: '0',
        installationPrice: '0',
        printingPrice: '0',
        monthlyPrice: '0',
        exclusivePrice: '0',
        currency: 'ARS',
        taxIncluded: false,
        pricePublic: false,
      });
    }

    // support_routes aplica únicamente a soportes móviles.
    // No crear rutas artificiales para cartelería/LED fijo.
    if (isMobile) {
      const routeRows = await db
        .select()
        .from(schema.supportRoutes)
        .where(eq(schema.supportRoutes.supportCanonicalId, canonicalId));

      if (routeRows.length === 0) {
        await db.insert(schema.supportRoutes).values({
          supportCanonicalId: canonicalId,
          routeName: 'Recorrido predeterminado',
          routeMode: family,
          routePath: rp || [],
          waypoints: wp || [],
          defaultRoute: true,
          schedule: sched,
          duration: dur,
          hours: '09:00-20:00',
          weekdays: 'lunes-viernes',
          maxAdvertisers: 8,
          spotDurationSeconds: 10,
          minimumDailyOutings: 180,
          metadata: {
            modalities: [
              'pauta compartida',
              'uso exclusivo',
              'recorrido personalizado',
              'activaciones',
            ],
          },
          active: true,
        });
      }
    }

    const faceRows = await db.select().from(schema.supportFaces).where(eq(schema.supportFaces.supportCanonicalId, canonicalId));
    if (faceRows.length === 0) {
      if (isMobile) {
        await db.insert(schema.supportFaces).values({
          supportCanonicalId: canonicalId,
          faceKey: 'left',
          label: 'Cara lateral izquierda',
          side: 'left',
          widthMeters: '4',
          heightMeters: '2',
          widthPixels: 1024,
          heightPixels: 512,
          substrate: 'LED P3',
          sortOrder: 1,
        });
        await db.insert(schema.supportFaces).values({
          supportCanonicalId: canonicalId,
          faceKey: 'right',
          label: 'Cara lateral derecha',
          side: 'right',
          widthMeters: '4',
          heightMeters: '2',
          widthPixels: 1024,
          heightPixels: 512,
          substrate: 'LED P3',
          sortOrder: 2,
        });
        await db.insert(schema.supportFaces).values({
          supportCanonicalId: canonicalId,
          faceKey: 'rear',
          label: 'Cara posterior',
          side: 'rear',
          widthMeters: '2',
          heightMeters: '2',
          widthPixels: 512,
          heightPixels: 512,
          substrate: 'LED P3',
          sortOrder: 3,
        });
      } else {
        await db.insert(schema.supportFaces).values({
          supportCanonicalId: canonicalId,
          faceKey: 'front',
          label: 'Cara principal',
          side: 'front',
          substrate: item.characteristics,
          sortOrder: 1,
        });
      }
    }

    const mediaRows = await db.select().from(schema.supportMedia).where(eq(schema.supportMedia.supportCanonicalId, canonicalId));
    if (mediaRows.length === 0) {
      for (const [index, imageUrl] of imgs.entries()) {
        await db.insert(schema.supportMedia).values({
          supportCanonicalId: canonicalId,
          mediaType: 'image',
          url: imageUrl,
          title: item.name,
          alt: item.name,
          sortOrder: index,
          active: true,
        });
      }
    }
  }
  console.log('Inventory seed completed successfully.');
}

export { pool };
