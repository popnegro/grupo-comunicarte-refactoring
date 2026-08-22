import { db } from '../db';
import { supports } from '../db/schema';
import { eq } from 'drizzle-orm';
import { InventoryItem, LocationRecord, MobileRoute, Disponibilidad, Plaza, TipoSoporte } from '../types';

function rowToInventoryItem(row: typeof supports.$inferSelect): InventoryItem {
  const isMobile = row.tipoSoporte === 'led_movil' || row.waypoints !== null;
  const base = {
    canonical_id: row.canonicalId,
    name: row.name,
    ciudad: row.ciudad as Plaza,
    tipo_soporte: row.tipoSoporte as TipoSoporte,
    description: row.description || '',
    characteristics: row.characteristics || '',
    mapa_url: row.mapaUrl || '',
    imageUrls: (row.imageUrls as string[]) || [],
    disponibilidad: (row.disponibilidad as Disponibilidad) || 'disponible',
    availableFrom: row.availableFrom || undefined,
    isFeatured: row.isFeatured ?? false,
  };

  if (isMobile) {
    return {
      ...base,
      schedule: row.schedule || '',
      duration: row.duration || '',
      waypoints: (row.waypoints as any[]) || [],
      routePath: (row.routePath as [number, number][]) || [],
    } as MobileRoute;
  } else {
    return {
      ...base,
      lat: row.lat !== null && row.lat !== undefined ? Number(row.lat) : null,
      lng: row.lng !== null && row.lng !== undefined ? Number(row.lng) : null,
      address: row.address || '',
    } as LocationRecord;
  }
}

export async function getAllSupportsFromDB(): Promise<InventoryItem[]> {
  const rows = await db.select().from(supports);
  const validItems: InventoryItem[] = [];

  for (const row of rows) {
    if (!row.canonicalId || !row.name || !row.ciudad || !row.tipoSoporte || !row.disponibilidad) {
      console.warn(`[DB WARNING] Skipping incomplete or legacy support record (ID: ${row.id}, canonical_id: ${row.canonicalId}, name: ${row.name}, ciudad: ${row.ciudad}, tipo_soporte: ${row.tipoSoporte}): missing required core fields.`);
      continue;
    }
    validItems.push(rowToInventoryItem(row));
  }
  return validItems;
}

export async function getSupportByIdFromDB(canonicalId: string): Promise<InventoryItem | null> {
  const rows = await db.select().from(supports).where(eq(supports.canonicalId, canonicalId));
  if (rows.length === 0) return null;
  const row = rows[0];
  if (!row.canonicalId || !row.name || !row.ciudad || !row.tipoSoporte || !row.disponibilidad) {
    console.warn(`[DB WARNING] Support record with canonical_id '${canonicalId}' is incomplete/legacy and was ignored.`);
    return null;
  }
  return rowToInventoryItem(row);
}

export async function validateSupportsForRequest(selectedIds: string[]): Promise<{
  valid: boolean;
  statusCode?: number;
  message?: string;
  matchedSupports?: InventoryItem[];
}> {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return {
      valid: false,
      statusCode: 400,
      message: 'Debes seleccionar al menos un soporte para solicitar el Media Kit.',
    };
  }

  const matchedSupports: InventoryItem[] = [];

  for (const id of selectedIds) {
    if (typeof id !== 'string') {
      return {
        valid: false,
        statusCode: 400,
        message: `Identificador de soporte inválido: ${String(id)}`,
      };
    }

    const item = await getSupportByIdFromDB(id);
    if (!item) {
      return {
        valid: false,
        statusCode: 404,
        message: `El soporte con ID '${id}' no existe en el catálogo.`,
      };
    }

    if (item.disponibilidad !== 'disponible') {
      return {
        valid: false,
        statusCode: 409, // Conflict / not available
        message: `El soporte '${item.name}' no está disponible (estado: ${item.disponibilidad}) y no puede incluirse en el Media Kit.`,
      };
    }

    matchedSupports.push(item);
  }

  return { valid: true, matchedSupports };
}
