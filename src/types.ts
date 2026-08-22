export type Plaza = 'mendoza' | 'buenos-aires';
export type TipoSoporte = 'tradicional' | 'led' | 'led_movil';
export type EstadoGPS = 'ready' | 'pending_geocode' | 'error';
export type Disponibilidad = 'disponible' | 'reservado';

export interface LocationRecord {
  canonical_id: string;
  name: string;
  ciudad: Plaza;
  tipo_soporte: TipoSoporte;
  lat: number | null;
  lng: number | null;
  address: string;
  description: string;
  characteristics: string;
  mapa_url: string;
  imageUrls?: string[];
  disponibilidad?: Disponibilidad;
  availableFrom?: string;
  isFeatured?: boolean;
}

export interface MobileRoute {
  canonical_id: string;
  name: string;
  ciudad: Plaza;
  tipo_soporte: TipoSoporte;
  description: string;
  characteristics: string;
  schedule: string;
  duration: string;
  waypoints: { name: string; lat: number | null; lng: number | null }[];
  routePath: [number, number][]; // coordinates for Polyline
  imageUrls?: string[];
  disponibilidad?: Disponibilidad;
  availableFrom?: string;
  isFeatured?: boolean;
}

export type InventoryItem = LocationRecord | MobileRoute;

export function isMobileRoute(item: InventoryItem): item is MobileRoute {
  return 'waypoints' in item;
}

export function getDisponibilidad(item: InventoryItem): Disponibilidad {
  return item.disponibilidad ?? 'disponible';
}
