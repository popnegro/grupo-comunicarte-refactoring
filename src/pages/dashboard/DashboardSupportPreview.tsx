import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { SupportCard } from '../../components/inventory/SupportCard';
import { apiFetch } from '../../lib/api';
import { InventoryItem } from '../../types';

export default function DashboardSupportPreview() {
  const { canonicalId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return navigate('/login');
        const response = await apiFetch(`/api/admin/supports/${encodeURIComponent(canonicalId || '')}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) return navigate('/login');
        const json = await response.json();
        if (!response.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo cargar la vista previa.');
        setItem(json.data as InventoryItem);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la vista previa.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [canonicalId, navigate]);

  if (loading) return <DashboardShell><div className="mx-auto max-w-7xl py-16 text-center text-sm text-gray-500"><Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />Cargando vista previa…</div></DashboardShell>;

  return <DashboardShell>
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={() => navigate('/dashboard/soportes')} className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-950"><ArrowLeft className="h-4 w-4" />Gestión de Soportes</button>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Vista previa de publicación</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 md:text-3xl">{item?.name || 'Soporte'}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Así se presenta este soporte al usuario en el inventario público.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(canonicalId || '')}/edit`)} className="rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Editar soporte</button>
          <button onClick={() => navigate(`/inventario?soporte=${encodeURIComponent(canonicalId || '')}`)} className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-gray-800"><ExternalLink className="h-4 w-4" />Ver en inventario</button>
        </div>
      </header>

      {error && <div role="alert" className="border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {item && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
          <section>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Product Card publicada</div>
            <SupportCard item={item} variant="catalog" />
          </section>

          <section className="border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Control de publicación</h2>
            <p className="mt-1 text-sm text-gray-500">Revisá lo que determina la visibilidad y el contenido de la tarjeta.</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3"><dt className="font-semibold text-gray-500">Publicación</dt><dd className="font-bold text-gray-900">{item.active === false ? 'No publicado' : 'Publicado'}</dd></div>
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3"><dt className="font-semibold text-gray-500">Disponibilidad</dt><dd className="font-bold text-gray-900">{item.disponibilidad === 'reservado' ? 'Reservado' : 'Disponible'}</dd></div>
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3"><dt className="font-semibold text-gray-500">Imagen principal</dt><dd className="font-bold text-gray-900">{item.imageUrls?.[0] ? 'Configurada' : 'Sin imagen'}</dd></div>
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3"><dt className="font-semibold text-gray-500">Atributos visibles</dt><dd className="font-bold text-gray-900">Hasta 2 según tipo</dd></div>
              <div className="flex items-start justify-between gap-4"><dt className="font-semibold text-gray-500">Código</dt><dd className="font-mono text-xs font-bold text-gray-900">{item.canonical_id}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </div>
  </DashboardShell>;
}
