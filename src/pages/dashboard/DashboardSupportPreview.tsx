import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { SupportCard } from '../../components/inventory/SupportCard';
import { getCardFacts } from '../../components/inventory/SupportCardPrimitives';
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
        if (!token) return navigate('/login');
        const response = await apiFetch(`/api/admin/supports/${encodeURIComponent(canonicalId || '')}`, {
          
        });
        
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

  const facts = item ? getCardFacts(item) : [];
  const locationConfigured = item
    ? Boolean(('address' in item && item.address) || item.ciudad)
    : false;
  const checks = item ? [
    { label: 'Publicación', value: item.active === false ? 'No publicado' : 'Publicado', ok: item.active !== false },
    { label: 'Disponibilidad', value: item.disponibilidad === 'reservado' ? 'Reservado' : 'Disponible', ok: true },
    { label: 'Imagen principal', value: item.imageUrls?.[0] ? 'Configurada' : 'Falta imagen', ok: Boolean(item.imageUrls?.[0]) },
    { label: 'Atributos de la Card', value: `${facts.length}/3 configurados`, ok: facts.length === 3 },
    { label: 'Ubicación', value: locationConfigured ? 'Configurada' : 'Falta ubicación', ok: locationConfigured },
  ] : [];

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
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Representación pública</div>
            <SupportCard item={item} variant="dashboard" />
          </section>

          <section className="border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Revisión de publicación</h2>
            <p className="mt-1 text-sm text-gray-500">Verificá los elementos que determinan cómo verá el soporte el usuario.</p>
            <div className="mt-5 space-y-3">
              {checks.map((check) => (
                <div key={check.label} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <div className="font-semibold text-gray-500">{check.label}</div>
                    {check.label === 'Atributos de la Card' && facts.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {facts.map((fact) => <span key={fact.label} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{fact.label}</span>)}
                      </div>
                    )}
                  </div>
                  <dd className={check.ok ? 'font-bold text-emerald-700' : 'font-bold text-amber-700'}>{check.value}</dd>
                </div>
              ))}
              <div className="flex items-start justify-between gap-4 pt-1">
                <dt className="font-semibold text-gray-500">Código</dt>
                <dd className="font-mono text-xs font-bold text-gray-900">{item.canonical_id}</dd>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  </DashboardShell>;
}
