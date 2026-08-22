import { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '../types';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/supports');
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        setItems(json.data);
      } else {
        throw new Error(json.message || 'Respuesta inválida del servidor');
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'No se pudo conectar con el servidor para cargar el inventario.');
      setItems([]);
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
