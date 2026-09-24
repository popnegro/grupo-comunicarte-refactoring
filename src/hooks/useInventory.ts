import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, getDisponibilidad } from '../types';

function normalizeItems(rawItems: InventoryItem[]): InventoryItem[] {
  const seen = new Set<string>();
  return rawItems.filter((item) => {
    if (!item.canonical_id || seen.has(item.canonical_id)) return false;
    seen.add(item.canonical_id);
    return true;
  });
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/supports');
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`La API no devolvió JSON (Content-Type: ${contentType || 'desconocido'}).`);
      }

      const json = await response.json();
      if (json.status !== 'success' || !Array.isArray(json.data)) {
        throw new Error(json.message || 'La API devolvió un inventario inválido.');
      }

      const publicItems = normalizeItems(json.data).filter(
        (item: InventoryItem) => getDisponibilidad(item) !== 'inactivo',
      );
      setItems(publicItems);
    } catch (err: any) {
      const message = err?.message || 'No se pudo cargar el inventario.';
      console.error('Inventory fetch failed:', message);
      setItems([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    items,
    fixedLocations: items.filter((item) => !('waypoints' in item)) as any[],
    mobileRoutes: items.filter((item) => 'waypoints' in item) as any[],
    loading,
    error,
    refetch: fetchInventory,
  };
}
