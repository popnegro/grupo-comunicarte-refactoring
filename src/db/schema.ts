import { pgTable, serial, text, numeric, boolean, json, timestamp } from 'drizzle-orm/pg-core';

export const supports = pgTable('supports', {
  id: serial('id').primaryKey(),
  canonicalId: text('canonical_id').notNull().unique(),
  name: text('name').notNull(),
  ciudad: text('ciudad').notNull(),
  tipoSoporte: text('tipo_soporte').notNull(),
  lat: numeric('lat'),
  lng: numeric('lng'),
  address: text('address'),
  description: text('description'),
  characteristics: text('characteristics'),
  mapaUrl: text('mapa_url'),
  imageUrls: json('image_urls').$type<string[]>(),
  disponibilidad: text('disponibilidad').notNull().default('disponible'),
  availableFrom: text('available_from'),
  isFeatured: boolean('is_featured').default(false),
  schedule: text('schedule'),
  duration: text('duration'),
  waypoints: json('waypoints').$type<{ name: string; lat: number | null; lng: number | null }[]>(),
  routePath: json('route_path').$type<[number, number][]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const mediakitRequests = pgTable('mediakit_requests', {
  id: serial('id').primaryKey(),
  requestId: text('request_id').notNull().unique(),
  requesterName: text('requester_name').notNull(),
  requesterEmail: text('requester_email').notNull(),
  requesterCompany: text('requester_company'),
  requesterPhone: text('requester_phone'),
  message: text('message'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const mediakitRequestItems = pgTable('mediakit_request_items', {
  id: serial('id').primaryKey(),
  requestId: text('request_id').notNull(),
  supportId: text('support_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
