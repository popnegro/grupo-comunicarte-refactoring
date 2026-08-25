import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSelection } from '../context/SelectionContext';
import { InventoryItem } from '../types';
import { buttonStyles } from '../components/ui/Button';
import { SupportCard } from '../components/inventory/SupportCard';

export default function Seleccion() {
  const { selectedIds, selectedCount, removeSelected, clearSelection } = useSelection();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/supports')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('No se pudo cargar el inventario')))
      .then((json: { status?: string; data?: InventoryItem[]; message?: string }) => {
        if (cancelled) return;
        if (json.status === 'success' && Array.isArray(json.data)) {
          setItems(json.data);
          return;
        }
        throw new Error(json.message || 'Respuesta inválida del servidor');
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const selectedItems = useMemo(() => items.filter(item => selectedIds.has(item.canonical_id)), [items, selectedIds]);

  return (
    <section className="flex-1 bg-[#F9F9F9]">
      <div className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Tu selección</p>
          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">Soportes seleccionados</h1>
              <p className="mt-5 max-w-2xl text-lg text-gray-300">Revisá los soportes que querés incluir en tu próxima propuesta de Media Kit.</p>
            </div>
            <div className="text-5xl font-semibold tabular-nums">{selectedCount}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {loading ? (
          <div className="py-16 text-center text-gray-600">Cargando selección…</div>
        ) : selectedItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 md:p-16 text-center">
            <h2 className="text-2xl font-semibold">Todavía no seleccionaste soportes</h2>
            <p className="mt-3 text-gray-600">Explorá el inventario y agregá los soportes que quieras comparar.</p>
            <Link to="/inventario" className={buttonStyles({ className: 'mt-7 rounded-full px-6 inline-flex items-center gap-2' })}>Explorar inventario <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {selectedItems.map(item => (
                <SupportCard key={item.canonical_id} item={item} variant="selectable" onRemove={(support) => removeSelected(support.canonical_id, support.name)} />
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">
              <button type="button" onClick={clearSelection} className="min-h-11 text-sm font-semibold text-gray-600 hover:text-gray-950">Vaciar selección</button>
              <Link to="/inventario" className={buttonStyles({ variant: 'outline', className: 'rounded-full px-6 min-h-11' })}>Seguir explorando</Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
