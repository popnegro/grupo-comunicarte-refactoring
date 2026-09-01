import { getSupportCatalog, getSupportDetail } from './supportModel.ts';
import { InventoryItem } from '../types.ts';

/**
 * Public inventory DTO boundary.
 * Pricing is intentionally removed from all public catalog/detail responses.
 * Administrative pricing remains available through protected /api/admin/* pricing endpoints.
 */
function sanitizePublicSupport(item: InventoryItem): InventoryItem {
  const { pricing: _pricing, ...publicItem } = item as InventoryItem & { pricing?: unknown };
  return publicItem as InventoryItem;
}

export async function getAllSupportsFromDB(options?: { includeInactive?: boolean }): Promise<InventoryItem[]> {
  const supports = await getSupportCatalog(options);
  return supports.map(sanitizePublicSupport);
}

export async function getSupportByIdFromDB(canonicalId: string, options?: { includeInactive?: boolean }): Promise<InventoryItem | null> {
  const support = await getSupportDetail(canonicalId, options);
  return support ? sanitizePublicSupport(support) : null;
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
        statusCode: 409,
        message: `El soporte '${item.name}' no está disponible (estado: ${item.disponibilidad}) y no puede incluirse en el Media Kit.`,
      };
    }

    matchedSupports.push(item);
  }

  return { valid: true, matchedSupports };
}
