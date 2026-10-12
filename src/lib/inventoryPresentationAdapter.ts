import {
  getDisponibilidad,
  isMobileRoute,
  type InventoryItem,
} from '../types';

/**
 * Read-only presentation contract for the OOH inventory redesign.
 *
 * Deliberately excludes SupportPricing: this adapter is for commercial
 * inventory views and must never expose internal exhibition/installation/
 * printing prices. It does not write to or mutate the source inventory.
 */
export type InventoryPresentationType =
  | 'Tradicional'
  | 'LED móvil'
  | 'Pantallas LED'
  | 'Pendiente de mapeo';

export type InventoryPresentationAvailability = 'Disponible' | 'Reservado';
export type InventoryOperationalState =
  | 'Operativo'
  | 'Mantenimiento'
  | 'Inactivo'
  | 'En revisión';

export interface InventoryPresentationItem {
  id: string;
  nombre: string;
  tipo: InventoryPresentationType;
  direccion: string;
  localidad: string;
  disponibilidad: InventoryPresentationAvailability;
  destacado: boolean;
  medidas?: string;
  formato?: string;
  impactoMensual?: string;
  caras?: number;
  estadoOperativo: InventoryOperationalState;
  latitud?: number;
  longitud?: number;
  descripcion?: string;
  imagenUrl?: string;
}

function mapType(item: InventoryItem): InventoryPresentationType {
  if (item.tipo_soporte === 'tradicional') return 'Tradicional';
  if (item.tipo_soporte === 'led_movil') return 'LED móvil';

  // Legacy "led" does not distinguish fixed LED screens from other LED
  // inventory. Do not guess a commercial classification.
  return 'Pendiente de mapeo';
}

function mapOperationalState(item: InventoryItem): InventoryOperationalState {
  if (item.active === false) return 'Inactivo';

  const metadata = item.technical?.metadata;
  const rawState =
    metadata && typeof metadata === 'object'
      ? (metadata as Record<string, unknown>).estadoOperativo
      : undefined;

  if (rawState === 'Operativo' || rawState === 'Mantenimiento' ||
      rawState === 'Inactivo' || rawState === 'En revisión') {
    return rawState;
  }

  // The current model does not have a first-class operational-state field.
  return 'En revisión';
}

/**
 * Converts the current API/domain model to the redesign's display model.
 * This is intentionally one-way until a persistence contract for editing is
 * verified. Unknown classifications are shown as "Pendiente de mapeo".
 */
export function toInventoryPresentationItem(
  item: InventoryItem,
): InventoryPresentationItem {
  const mobile = isMobileRoute(item);
  const firstWaypoint = mobile ? item.waypoints[0] : undefined;
  const address = mobile ? (firstWaypoint?.name ?? '') : item.address;
  const lat = mobile ? firstWaypoint?.lat : item.lat;
  const lng = mobile ? firstWaypoint?.lng : item.lng;
  const technical = item.technical;

  return {
    id: item.canonical_id,
    nombre: item.name,
    tipo: mapType(item),
    direccion: address,
    localidad: item.ciudad === 'buenos-aires' ? 'Buenos Aires' : 'Mendoza',
    disponibilidad: getDisponibilidad(item) === 'reservado' ? 'Reservado' : 'Disponible',
    destacado: Boolean(item.isFeatured),
    medidas: technical?.measures || undefined,
    formato: technical?.format || undefined,
    impactoMensual:
      technical?.monthly_impacts == null ? undefined : String(technical.monthly_impacts),
    caras: technical?.caras == null ? undefined : technical.caras,
    estadoOperativo: mapOperationalState(item),
    latitud: lat == null ? undefined : lat,
    longitud: lng == null ? undefined : lng,
    descripcion: item.description || undefined,
    imagenUrl: item.imageUrls?.[0] || undefined,
  };
}
