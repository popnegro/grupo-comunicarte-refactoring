import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, ExternalLink, FileText, CheckCircle2, Clock3, Send, Archive } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { apiFetch } from '../../lib/api';

type MediaKit = {
  kitId: string;
  sourceRequestId?: string | null;
  status: 'draft' | 'ready' | 'sent' | 'archived';
  clientName: string;
  clientEmail?: string | null;
  clientCompany?: string | null;
  clientPhone?: string | null;
  supportIds: string[];
  approvedPrices?: Record<string, string | number>;
  totalAmount?: number | string | null;
  currency?: string;
  notes?: string | null;
  pdfUrl?: string | null;
  pptUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS: Record<MediaKit['status'], { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  ready: { label: 'Listo', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  sent: { label: 'Enviado', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  archived: { label: 'Archivado', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export default function DashboardMediaKits() {
  const navigate = useNavigate();
  const [kits, setKits] = useState<MediaKit[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | MediaKit['status']>('todos');
  const [selected, setSelected] = useState<MediaKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/mediakits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }
      const json = await res.json();
      if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No pudimos cargar los Media Kits.');
      setKits(Array.isArray(json.data) ? json.data : []);
    } catch (error: any) {
      showToast(error.message || 'No pudimos cargar los Media Kits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [navigate]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };

  const updateStatus = async (kit: MediaKit, status: MediaKit['status']) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await apiFetch(`/api/admin/mediakits/${encodeURIComponent(kit.kitId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No pudimos actualizar el Media Kit.');
      await load();
      setSelected((current) => current ? { ...current, status } : null);
      showToast(`Media Kit: ${STATUS[status].label.toLowerCase()}.`);
    } catch (error: any) {
      showToast(error.message || 'No pudimos actualizar el Media Kit.');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return kits.filter((kit) => {
      const matchesQuery = !q || [kit.kitId, kit.sourceRequestId, kit.clientName, kit.clientCompany, kit.clientEmail]
        .filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
      return matchesQuery && (statusFilter === 'todos' || kit.status === statusFilter);
    });
  }, [kits, query, statusFilter]);

  const counts = {
    total: kits.length,
    draft: kits.filter((k) => k.status === 'draft').length,
    ready: kits.filter((k) => k.status === 'ready').length,
    sent: kits.filter((k) => k.status === 'sent').length,
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-6xl">
        {toast && (
          <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </div>
        )}

        <header>
          <span className="text-eyebrow text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
            Gestión Comercial
          </span>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-page-title text-gray-900">Media Kits</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cotizaciones persistidas y listas para seguimiento y entrega.
              </p>
            </div>
            <Link to="/dashboard/solicitudes" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
              Ver solicitudes →
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            ['todos', 'Todos', counts.total],
            ['draft', 'Borradores', counts.draft],
            ['ready', 'Listos', counts.ready],
            ['sent', 'Enviados', counts.sent],
          ] as const).map(([value, label, count]) => (
            <button key={value} onClick={() => setStatusFilter(value)} className={`rounded-2xl border p-3.5 text-left transition ${statusFilter === value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
              <span className="mt-1 block text-xl font-extrabold">{count}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por cliente, empresa, Kit o solicitud..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs font-medium outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3.5">Media Kit</th>
                  <th className="px-4 py-3.5">Cliente</th>
                  <th className="px-4 py-3.5">Soportes</th>
                  <th className="px-4 py-3.5">Importe</th>
                  <th className="px-4 py-3.5">Actualizado</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">Cargando Media Kits...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">No hay Media Kits que coincidan con el filtro.</td></tr>
                ) : filtered.map((kit) => (
                  <tr key={kit.kitId} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-[11px] font-bold text-gray-500">{kit.kitId}</div>
                      {kit.sourceRequestId && <div className="mt-0.5 text-[10px] text-gray-400">Solicitud {kit.sourceRequestId}</div>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-sm text-gray-900">{kit.clientName}</div>
                      <div className="text-[11px] text-gray-500">{kit.clientCompany || kit.clientEmail || '—'}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700">{kit.supportIds.length}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {kit.totalAmount != null ? `${kit.currency || 'ARS'} ${Number(kit.totalAmount).toLocaleString('es-AR')}` : 'Sin cotizar'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-gray-500">
                      {new Date(kit.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${STATUS[kit.status].className}`}>
                        {kit.status === 'draft' ? <Clock3 className="h-3 w-3" /> : kit.status === 'ready' ? <CheckCircle2 className="h-3 w-3" /> : kit.status === 'sent' ? <Send className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
                        {STATUS[kit.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => setSelected(kit)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50">
                        <Eye className="h-3.5 w-3.5 text-gray-500" />
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-gray-400">{selected.kitId}</div>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">{selected.clientName}</h2>
                  <p className="mt-1 text-xs text-gray-500">{selected.clientCompany || selected.clientEmail || 'Cliente directo'}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-50">Cerrar</button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3"><span className="block text-[9px] font-bold uppercase text-gray-400">Estado</span><strong className="mt-1 block text-sm">{STATUS[selected.status].label}</strong></div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3"><span className="block text-[9px] font-bold uppercase text-gray-400">Soportes</span><strong className="mt-1 block text-sm">{selected.supportIds.length}</strong></div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3"><span className="block text-[9px] font-bold uppercase text-gray-400">Total</span><strong className="mt-1 block text-sm">{selected.totalAmount != null ? `${selected.currency || 'ARS'} ${Number(selected.totalAmount).toLocaleString('es-AR')}` : '—'}</strong></div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3"><span className="block text-[9px] font-bold uppercase text-gray-400">Solicitud</span><strong className="mt-1 block text-sm">{selected.sourceRequestId || '—'}</strong></div>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900"><FileText className="h-4 w-4 text-emerald-700" /> Documentos</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.pdfUrl ? <a href={selected.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-50">PDF <ExternalLink className="h-3 w-3" /></a> : <span className="text-xs text-gray-400">PDF aún no generado</span>}
                  {selected.pptUrl ? <a href={selected.pptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-50">PPT <ExternalLink className="h-3 w-3" /></a> : <span className="text-xs text-gray-400">PPT aún no generado</span>}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-4">
                {selected.sourceRequestId && <Link to={`/dashboard/solicitudes?request=${encodeURIComponent(selected.sourceRequestId)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-50">Abrir solicitud</Link>}
                <div className="flex flex-wrap gap-2">
                  {selected.status === 'draft' && <button onClick={() => updateStatus(selected, 'ready')} className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700">Marcar listo</button>}
                  {selected.status === 'ready' && <button onClick={() => updateStatus(selected, 'sent')} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700"><Send className="h-3 w-3" /> Marcar enviado</button>}
                  {selected.status !== 'archived' && <button onClick={() => updateStatus(selected, 'archived')} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">Archivar</button>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
