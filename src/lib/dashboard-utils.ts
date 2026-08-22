import { getDisponibilidad, type InventoryItem, type Disponibilidad, type TipoSoporte } from '../types';
import { getMergedInventory } from './dashboard-store';

export interface InventoryFilters {
  query?: string;
  availability?: 'todos' | Disponibilidad;
  plaza?: 'todas' | InventoryItem['ciudad'];
  tipo?: 'todos' | TipoSoporte;
}

export function getAddress(item: InventoryItem): string {
  return 'address' in item
    ? item.address
    : item.waypoints?.map((point) => point.name).join(' · ') || 'Ruta móvil';
}

export function listInventory(filters: InventoryFilters = {}): InventoryItem[] {
  const query = filters.query?.trim().toLowerCase() ?? '';
  const availability = filters.availability ?? 'todos';
  const plaza = filters.plaza ?? 'todas';
  const tipo = filters.tipo ?? 'todos';

  const inventory = getMergedInventory();

  return inventory.filter((item) => {
    const haystack = `${item.name} ${getAddress(item)} ${item.ciudad} ${item.tipo_soporte} ${item.canonical_id}`.toLowerCase();

    return (
      (!query || haystack.includes(query)) &&
      (availability === 'todos' || getDisponibilidad(item) === availability) &&
      (plaza === 'todas' || item.ciudad === plaza) &&
      (tipo === 'todos' || item.tipo_soporte === tipo)
    );
  });
}

export function getInventoryStats() {
  const inventory = getMergedInventory();

  return inventory.reduce(
    (stats, item) => {
      stats.total += 1;
      const disp = getDisponibilidad(item);
      if (disp === 'disponible') {
        stats.available += 1;
      } else {
        stats.reserved += 1;
      }

      if (item.ciudad === 'mendoza') {
        stats.mendozaTotal += 1;
        if (disp === 'disponible') stats.mendozaAvailable += 1;
      } else if (item.ciudad === 'buenos-aires') {
        stats.buenosAiresTotal += 1;
        if (disp === 'disponible') stats.buenosAiresAvailable += 1;
      }

      if (item.tipo_soporte === 'led') stats.ledCount += 1;
      else if (item.tipo_soporte === 'led_movil') stats.movilCount += 1;
      else stats.tradicionalCount += 1;

      return stats;
    },
    {
      total: 0,
      available: 0,
      reserved: 0,
      mendozaTotal: 0,
      mendozaAvailable: 0,
      buenosAiresTotal: 0,
      buenosAiresAvailable: 0,
      ledCount: 0,
      movilCount: 0,
      tradicionalCount: 0,
    }
  );
}
