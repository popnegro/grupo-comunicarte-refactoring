import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  X,
  Search,
  FilterX,
  Sparkles,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { StatusBadge } from '../../components/dashboard/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';
import { calculateSupportTotal, formatSupportCurrency } from '../../lib/supportPricing';
import {
  downloadMediaKitPdf,
  downloadMediaKitPpt,
  sendMediaKitToLead,
  ExportSupport,
} from '../../lib/adminMediaKitExport';

type WorkflowStatus = 'request' | 'in_progress' | 'done';

type Pricing = {
  exhibition_price?: number | string | null;
  installation_price?: number | string | null;
  printing_price?: number | string | null;
  currency?: string | null;
};

type LeadRequest = {
  id: string;
  requestId: string;
  clientName: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  status: WorkflowStatus;
  supportIds: string[];
  supportNames: string[];
  createdAt: string;
};

type SupportForKit = ExportSupport & { pricing?: Pricing | null };

const labels: Record<WorkflowStatus, string> = {
  request: 'REQUEST',
  in_progress: 'IN PROGRESS',
  done: 'DONE',
};

function toWorkflowStatus(status: string): WorkflowStatus {
  if (status === 'contactado' || status === 'in_progress') return 'in_progress';
  if (status === 'enviado' || status === 'quoted' || status === 'done' || status === 'cerrado') return 'done';
  return 'request';
}

export default function DashboardMediaKitWorkflow() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<LeadRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | WorkflowStatus>('all');
  const [selected, setSelected] = useState<LeadRequest | null>(null);
  const [supports, setSupports] = useState<SupportForKit[]>([]);
  const [approvedPrices, setApprovedPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isFetchingLeads, setIsFetchingLeads] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const notify = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(''), 3000);
  };

  const load = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }
    setIsFetchingLeads(true);
    try {
      const r = await apiFetch('/api/admin/requests', { headers: { Authorization: `Bearer ${token}` } });
      if (r.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }
      const j = await r.json();
      if (j.status !== 'success') throw new Error(j.message || 'No pudimos cargar las solicitudes.');
      setLeads(
        (j.data || []).map((x: any) => ({
          id: String(x.id),
          requestId: x.requestId,
          clientName: x.requesterName || 'Sin nombre',
          email: x.requesterEmail || '',
          company: x.requesterCompany || 'Particular / Directo',
          phone: x.requesterPhone || '',
          message: x.message || '',
          status: toWorkflowStatus(x.status),
          supportIds: x.supportIds || [],
          supportNames: x.supportNames || x.supportIds || [],
          createdAt: x.createdAt || new Date().toISOString(),
        }))
      );
    } catch (e: any) {
      notify(e.message || 'Error al cargar solicitudes.');
    } finally {
      setIsFetchingLeads(false);
    }
  };

  useEffect(() => {
    load();
  }, [navigate]);

  // Handle ESC for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selected && !busy) {
        setSelected(null);
      }
    };
    if (selected) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selected, busy]);

  const counts = useMemo(
    () => ({
      all: leads.length,
      request: leads.filter((x) => x.status === 'request').length,
      in_progress: leads.filter((x) => x.status === 'in_progress').length,
      done: leads.filter((x) => x.status === 'done').length,
    }),
    [leads]
  );

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((item) => {
      const matchStatus = filter === 'all' || item.status === filter;
      const matchQuery =
        !q ||
        [
          item.clientName,
          item.company,
          item.email,
          item.phone,
          item.requestId,
          ...item.supportNames,
        ].some((val) => String(val || '').toLowerCase().includes(q));

      return matchStatus && matchQuery;
    });
  }, [leads, filter, searchQuery]);

  const changeStatus = async (lead: LeadRequest, next: WorkflowStatus) => {
    setBusy(true);
    try {
      const token = localStorage.getItem('admin_token');
      const persisted = next === 'request' ? 'pending' : next === 'in_progress' ? 'contactado' : 'enviado';
      const r = await fetch(`/api/admin/requests/${encodeURIComponent(lead.requestId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: persisted }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || j?.status !== 'success') throw new Error(j?.message || 'No pudimos actualizar el estado.');
      await load();
      setSelected((x) => (x ? { ...x, status: next } : null));
      notify(`Solicitud ${labels[next]}`);
    } catch (e: any) {
      notify(e.message || 'Error al actualizar.');
    } finally {
      setBusy(false);
    }
  };

  const open = async (lead: LeadRequest) => {
    setSelected(lead);
    setSupports([]);
    setApprovedPrices({});
    setLoading(true);
    try {
      const r = await fetch('/api/supports');
      const j = await r.json();
      if (!r.ok || j.status !== 'success') throw new Error('No pudimos cargar los datos del inventario.');
      const ids = new Set(lead.supportIds);
      const filtered = (j.data || [])
        .filter((x: any) => ids.has(x.canonical_id))
        .map((x: any) => ({
          canonical_id: x.canonical_id,
          name: x.name,
          ciudad: x.ciudad,
          tipo_soporte: x.tipo_soporte,
          address: x.address,
          description: x.description,
          characteristics: x.characteristics,
          pricing: x.pricing || null,
        }));
      setSupports(filtered);
    } catch (e: any) {
      notify(e.message || 'Error al cargar soportes.');
    } finally {
      setLoading(false);
    }
  };

  const applyBaseCatalogPrices = () => {
    const newPrices: Record<string, string> = {};
    supports.forEach((s) => {
      const total = calculateSupportTotal(s.pricing);
      if (total > 0) {
        newPrices[s.canonical_id] = String(total);
      }
    });
    setApprovedPrices((prev) => ({ ...prev, ...newPrices }));
    notify('Tarifas base aplicadas desde el catálogo.');
  };

  const lead = selected
    ? {
        name: selected.clientName,
        email: selected.email,
        company: selected.company,
        phone: selected.phone,
      }
    : null;

  const approvalsReady =
    supports.length > 0 &&
    supports.every((s) => {
      const v = Number(approvedPrices[s.canonical_id] || 0);
      return Number.isFinite(v) && v > 0;
    });

  const approvedCount = supports.filter((s) => {
    const v = Number(approvedPrices[s.canonical_id] || 0);
    return Number.isFinite(v) && v > 0;
  }).length;

  const totalApprovedQuote = supports.reduce(
    (sum, s) => sum + (Number(approvedPrices[s.canonical_id]) || 0),
    0
  );

  const exportSupports: ExportSupport[] = supports.map(
    (s) =>
      ({
        ...s,
        approvedPriceWithTax: Number(approvedPrices[s.canonical_id] || 0),
      } as ExportSupport)
  );

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed right-6 top-20 z-[4500] rounded-xl bg-gray-950 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-white/10 animate-in fade-in"
          >
            {toast}
          </div>
        )}

        {/* Page Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Gestión Comercial
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950">
              Solicitudes de Media Kit
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Flujo comercial: REQUEST → IN PROGRESS → DONE con cotización personalizada.
            </p>
          </div>

          <button
            type="button"
            onClick={() => load().catch(() => notify('No pudimos actualizar la bandeja.'))}
            aria-label="Actualizar bandeja de solicitudes"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-800 shadow-2xs transition hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 active:scale-95 min-h-[40px]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLeads ? 'animate-spin' : ''}`} />
            <span>Actualizar bandeja</span>
          </button>
        </header>

        {/* KPI Metrics / Filter Tabs (Frente 3) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Todas */}
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`group rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 active:scale-98 ${
              filter === 'all'
                ? 'border-gray-950 bg-gray-950 text-white shadow-sm'
                : 'border-gray-200/90 bg-white text-gray-800 hover:border-gray-300 hover:shadow-2xs'
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                filter === 'all' ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              Todas
            </span>
            <span className="mt-1 block text-2xl sm:text-3xl font-extrabold tracking-tight">{counts.all}</span>
          </button>

          {/* REQUEST (Nuevas) */}
          <button
            type="button"
            onClick={() => setFilter('request')}
            className={`group rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 active:scale-98 ${
              filter === 'request'
                ? 'border-blue-700 bg-blue-700 text-white shadow-sm'
                : 'border-blue-100 bg-blue-50/40 text-blue-950 hover:border-blue-200 hover:bg-blue-50/80 hover:shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  filter === 'request' ? 'text-blue-100' : 'text-blue-800'
                }`}
              >
                Nuevas (Request)
              </span>
              <Sparkles className="w-3.5 h-3.5 opacity-80" />
            </div>
            <span className="mt-1 block text-2xl sm:text-3xl font-extrabold tracking-tight">{counts.request}</span>
          </button>

          {/* IN PROGRESS */}
          <button
            type="button"
            onClick={() => setFilter('in_progress')}
            className={`group rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 active:scale-98 ${
              filter === 'in_progress'
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                : 'border-amber-100 bg-amber-50/40 text-amber-950 hover:border-amber-200 hover:bg-amber-50/80 hover:shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  filter === 'in_progress' ? 'text-amber-100' : 'text-amber-800'
                }`}
              >
                En Proceso
              </span>
              <Clock className="w-3.5 h-3.5 opacity-80" />
            </div>
            <span className="mt-1 block text-2xl sm:text-3xl font-extrabold tracking-tight">{counts.in_progress}</span>
          </button>

          {/* DONE */}
          <button
            type="button"
            onClick={() => setFilter('done')}
            className={`group rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 active:scale-98 ${
              filter === 'done'
                ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                : 'border-emerald-100 bg-emerald-50/40 text-emerald-950 hover:border-emerald-200 hover:bg-emerald-50/80 hover:shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  filter === 'done' ? 'text-emerald-100' : 'text-emerald-800'
                }`}
              >
                Completadas
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 opacity-80" />
            </div>
            <span className="mt-1 block text-2xl sm:text-3xl font-extrabold tracking-tight">{counts.done}</span>
          </button>
        </div>

        {/* Search & Action Bar */}
        <section className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-2xs space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs sm:text-sm rounded-xl border-gray-200"
              placeholder="Buscar por cliente, empresa, correo, teléfono o código de solicitud..."
              aria-label="Buscar solicitudes"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
            <span>
              Mostrando <strong className="text-gray-950 font-bold">{visible.length}</strong> de{' '}
              <strong className="text-gray-950 font-bold">{leads.length}</strong> solicitudes
            </span>

            {(searchQuery || filter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
                className="inline-flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Limpiar búsqueda y filtros</span>
              </button>
            )}
          </div>
        </section>

        {/* Table List View */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-bold uppercase tracking-wider text-gray-600 select-none">
                <tr>
                  <th className="px-4 py-3.5">Solicitud / Fecha</th>
                  <th className="px-4 py-3.5">Cliente / Empresa</th>
                  <th className="px-4 py-3.5">Soportes Seleccionados</th>
                  <th className="px-4 py-3.5">Estado Workflow</th>
                  <th className="px-4 py-3.5 text-right">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {isFetchingLeads ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="font-semibold text-xs text-gray-600">Cargando solicitudes comerciales...</span>
                      </div>
                    </td>
                  </tr>
                ) : visible.length > 0 ? (
                  visible.map((x) => (
                    <tr key={x.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-xs font-bold text-gray-950">{x.requestId}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(x.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-gray-950 text-sm leading-snug">{x.clientName}</div>
                        <div className="text-xs text-gray-600 font-medium">{x.company}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{x.email}</div>
                      </td>

                      <td className="max-w-sm px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {x.supportNames.slice(0, 3).map((n: string) => (
                            <span
                              key={n}
                              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200/60"
                            >
                              {n}
                            </span>
                          ))}
                          {x.supportNames.length > 3 && (
                            <span className="rounded-md bg-gray-200/80 px-2 py-0.5 text-xs font-bold text-gray-700">
                              +{x.supportNames.length - 3} más
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={x.status} label={labels[x.status]} size="sm" />
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => open(x)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 hover:text-gray-950 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 active:scale-95 min-h-[36px]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Gestionar</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                      <div className="mx-auto max-w-sm flex flex-col items-center justify-center">
                        <Inbox className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm font-bold text-gray-900">No hay solicitudes para mostrar</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {searchQuery || filter !== 'all'
                            ? 'No se encontraron resultados con los filtros actuales.'
                            : 'Las solicitudes comerciales que envíen los clientes aparecerán aquí.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal de Detalle y Cotización Comercial */}
        {selected && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-request-title"
            className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => !busy && setSelected(null)}
          >
            <div
              className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200">
                      Solicitud #{selected.requestId}
                    </span>
                    <StatusBadge status={selected.status} label={labels[selected.status]} size="sm" />
                  </div>
                  <h2 id="modal-request-title" className="mt-2 text-2xl font-extrabold text-gray-950">
                    {selected.clientName}
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {selected.company} {selected.email ? `· ${selected.email}` : ''} {selected.phone ? `· Tel: ${selected.phone}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Cerrar modal"
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 2-Column Responsive Grid on Desktop / Linear on Mobile */}
              <div className="mt-6 grid gap-6 lg:grid-cols-12 items-start">
                {/* Left Column (lg:col-span-5) - Lead Context & Status */}
                <div className="space-y-4 lg:col-span-5">
                  {/* Lead Contact Info Card */}
                  <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 p-4 sm:p-5 space-y-3.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                      Datos del Solicitante
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Cliente</span>
                        <span className="font-bold text-gray-950 text-sm">{selected.clientName}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Empresa</span>
                        <span className="font-semibold text-gray-800">{selected.company || '—'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Email</span>
                          <span className="font-medium text-gray-700 break-all">{selected.email || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Teléfono</span>
                          <span className="font-medium text-gray-700">{selected.phone || 'No especificado'}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200/60">
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Fecha de Solicitud</span>
                        <span className="font-medium text-gray-600">
                          {new Date(selected.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Status Indicators Card */}
                  <div className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 space-y-3 shadow-2xs">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                      Resumen de Gestión
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Soportes</span>
                        <div className="mt-1 font-extrabold text-xs text-gray-900">{selected.supportIds.length} seleccionados</div>
                      </div>

                      <div
                        className={`rounded-xl p-3 border ${
                          approvalsReady
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : 'bg-amber-50 border-amber-200 text-amber-950'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Cotización</span>
                        <div className="mt-1 font-extrabold text-xs">
                          {approvalsReady ? '✓ Todos definidos' : `${approvedCount}/${supports.length} cotizados`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Message (if any) */}
                  {selected.message && (
                    <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 text-xs leading-relaxed text-slate-700">
                      <strong className="block text-[11px] font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
                        Consulta / Nota del cliente:
                      </strong>
                      <p className="italic text-slate-800 font-normal">"{selected.message}"</p>
                    </div>
                  )}
                </div>

                {/* Right Column (lg:col-span-7) - Supports, Pricing & Commercial Actions */}
                <div className="space-y-5 lg:col-span-7">
                  {/* Supports List & Pricing Section */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-950">
                        Soportes y Tarifas para el Media Kit
                      </h3>

                      {supports.length > 0 && (
                        <button
                          type="button"
                          onClick={applyBaseCatalogPrices}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                        >
                          <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Aplicar tarifas base de catálogo</span>
                        </button>
                      )}
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        <span>Cargando datos del inventario...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {supports.map((s) => {
                          const base = calculateSupportTotal(s.pricing);
                          const approved = approvedPrices[s.canonical_id] || '';
                          const isApproved = approved && Number(approved) > 0;

                          return (
                            <div
                              key={s.canonical_id}
                              className="rounded-2xl border border-gray-200/90 p-4 bg-white shadow-2xs space-y-3"
                            >
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="font-bold text-sm text-gray-950">{s.name}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {s.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'} · {s.tipo_soporte}
                                    {s.address ? ` · ${s.address}` : ''}
                                  </div>
                                </div>

                                <div className="text-left sm:text-right shrink-0">
                                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Tarifa lista
                                  </span>
                                  <div className="font-extrabold text-xs text-gray-900 mt-0.5">
                                    {formatSupportCurrency(base, s.pricing?.currency || 'ARS')}
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-2.5 sm:grid-cols-[1fr_auto] sm:items-end pt-2 border-t border-gray-100">
                                <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Precio cotizado en Media Kit (IVA inc.)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={approved}
                                    onChange={(e) =>
                                      setApprovedPrices((prev) => ({ ...prev, [s.canonical_id]: e.target.value }))
                                    }
                                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs sm:text-sm font-bold text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                    placeholder={`Ej: ${base > 0 ? base : '150000'}`}
                                  />
                                </div>

                                <div
                                  className={`h-10 flex items-center justify-center rounded-xl px-3 text-xs font-bold select-none ${
                                    isApproved
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}
                                >
                                  {isApproved ? '✓ DEFINIDO' : '⏳ PENDIENTE'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Resumen Económico / Total Acumulado */}
                  {supports.length > 0 && (
                    <div className="rounded-2xl border border-gray-200/90 bg-gray-50/80 p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                          Total Cotizado (IVA incluido)
                        </span>
                        <span className="text-xs text-gray-500">
                          {approvedCount} de {supports.length} soportes con precio
                        </span>
                      </div>
                      <div className="text-right font-extrabold text-lg sm:text-xl text-gray-950">
                        {formatSupportCurrency(totalApprovedQuote, 'ARS')}
                      </div>
                    </div>
                  )}

                  {/* Workflow Actions Section */}
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                      Acciones del Workflow Comercial
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {selected.status === 'request' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus(selected, 'in_progress')}
                          className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-colors"
                        >
                          {busy ? 'Actualizando...' : 'Pasar a IN PROGRESS (En Cotización)'}
                        </button>
                      )}

                      {selected.status === 'in_progress' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus(selected, 'done')}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-colors"
                        >
                          {busy ? 'Actualizando...' : 'Marcar como DONE (Listo para entrega)'}
                        </button>
                      )}

                      {selected.status === 'done' && lead && (
                        <>
                          <button
                            type="button"
                            disabled={!approvalsReady}
                            onClick={() =>
                              approvalsReady && downloadMediaKitPdf(lead, exportSupports, selected.requestId)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                            title={!approvalsReady ? 'Defina los precios de todos los soportes primero' : undefined}
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Descargar PDF</span>
                          </button>

                          <button
                            type="button"
                            disabled={!approvalsReady}
                            onClick={() =>
                              approvalsReady && downloadMediaKitPpt(lead, exportSupports, selected.requestId)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                            title={!approvalsReady ? 'Defina los precios de todos los soportes primero' : undefined}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Descargar PPT</span>
                          </button>

                          <button
                            type="button"
                            disabled={!approvalsReady}
                            onClick={async () => {
                              if (!approvalsReady) return;
                              try {
                                const m = await sendMediaKitToLead(lead, exportSupports, selected.requestId);
                                notify(
                                  m === 'shared'
                                    ? 'Archivos listos para compartir con el lead.'
                                    : 'Se abrió el cliente de correo para adjuntar la cotización.'
                                );
                              } catch (e: any) {
                                notify(e.message || 'No pudimos preparar el envío.');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                            title={!approvalsReady ? 'Defina los precios de todos los soportes primero' : undefined}
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Enviar al Lead</span>
                          </button>
                        </>
                      )}
                    </div>

                    {selected.status === 'done' && !approvalsReady && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-100/50 p-2.5 rounded-xl border border-amber-200">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                        <span>
                          Ingrese o aplique el precio final con IVA incluido para cada soporte antes de generar el PDF/PPT o enviar al lead.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl bg-gray-950 hover:bg-gray-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
