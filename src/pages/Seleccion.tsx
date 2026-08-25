import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import { InventoryItem } from '../types';
import { buttonStyles } from '../components/ui/Button';
import { SupportCard } from '../components/inventory/SupportCard';

export default function Seleccion() {
  const { selectedIds, selectedCount, removeSelected, clearSelection } = useSelection();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');
  const [lead, setLead] = useState({ name: '', email: '', company: '', phone: '', message: '' });

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setRequestId('');

    try {
      const response = await fetch('/api/mediakit/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, selectedIds: Array.from(selectedIds) }),
      });
      const json = await response.json();

      if (!response.ok || json.status !== 'success') {
        throw new Error(json.message || 'No se pudo registrar la solicitud.');
      }

      setRequestId(json.requestId || json.data?.requestId || '');
      clearSelection();
      setLead({ name: '', email: '', company: '', phone: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  }

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
        ) : selectedItems.length === 0 && !requestId ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 md:p-16 text-center">
            <h2 className="text-2xl font-semibold">Todavía no seleccionaste soportes</h2>
            <p className="mt-3 text-gray-600">Explorá el inventario y agregá los soportes que quieras comparar.</p>
            <Link to="/inventario" className={buttonStyles({ className: 'mt-7 rounded-full px-6 inline-flex items-center gap-2' })}>Explorar inventario <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : requestId ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">✓</div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Solicitud recibida</p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-950">Tu Media Kit ya está en camino.</h2>
            <p className="mt-4 text-gray-600">Registramos tu selección y el equipo comercial podrá continuar con la propuesta.</p>
            {requestId && <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">Referencia: {requestId}</p>}
            <Link to="/inventario" className={buttonStyles({ className: 'mt-7 rounded-full px-6' })}>Volver al inventario</Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {selectedItems.map(item => (
                <SupportCard key={item.canonical_id} item={item} variant="selectable" onRemove={(support) => removeSelected(support.canonical_id, support.name)} />
              ))}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px]">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-gray-500">Selección actual</p>
                  <p className="mt-1 text-lg font-semibold text-gray-950">{selectedCount} {selectedCount === 1 ? 'soporte' : 'soportes'} para tu Media Kit</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={clearSelection} className="min-h-11 text-sm font-semibold text-gray-600 hover:text-gray-950">Vaciar selección</button>
                  <Link to="/inventario" className={buttonStyles({ variant: 'outline', className: 'rounded-full px-6 min-h-11' })}>Seguir explorando</Link>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-7">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-gray-500">Siguiente paso</p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-950">Solicitar Media Kit</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">Dejanos tus datos y registraremos la solicitud con los soportes seleccionados.</p>
                </div>

                {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

                <div className="mt-6 space-y-4">
                  <label className="block text-sm font-semibold text-gray-800">
                    Nombre *
                    <input required value={lead.name} onChange={e => setLead(prev => ({ ...prev, name: e.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-950 focus:bg-white" />
                  </label>
                  <label className="block text-sm font-semibold text-gray-800">
                    Email *
                    <input required type="email" value={lead.email} onChange={e => setLead(prev => ({ ...prev, email: e.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-950 focus:bg-white" />
                  </label>
                  <label className="block text-sm font-semibold text-gray-800">
                    Empresa
                    <input value={lead.company} onChange={e => setLead(prev => ({ ...prev, company: e.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-950 focus:bg-white" />
                  </label>
                  <label className="block text-sm font-semibold text-gray-800">
                    Teléfono
                    <input value={lead.phone} onChange={e => setLead(prev => ({ ...prev, phone: e.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-950 focus:bg-white" />
                  </label>
                  <label className="block text-sm font-semibold text-gray-800">
                    Comentario
                    <textarea value={lead.message} onChange={e => setLead(prev => ({ ...prev, message: e.target.value }))} rows={4} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-950 focus:bg-white" />
                  </label>
                  <button type="submit" disabled={submitting} className={buttonStyles({ className: 'min-h-12 w-full justify-center rounded-full px-6 disabled:cursor-not-allowed disabled:opacity-60' })}>
                    {submitting ? 'Registrando solicitud…' : 'Solicitar Media Kit'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
