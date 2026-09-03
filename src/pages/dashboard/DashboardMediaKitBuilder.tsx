import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Download, FileText, Loader2, Search, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { Input } from '../../components/ui/Input';
import { calculateSupportTotal, formatSupportCurrency } from '../../lib/supportPricing';
import { downloadMediaKitPdf, downloadMediaKitPpt, ExportSupport } from '../../lib/adminMediaKitExport';

type Pricing = { exhibition_price?: number | string | null; installation_price?: number | string | null; printing_price?: number | string | null; currency?: string | null };
type Support = ExportSupport & { pricing?: Pricing | null; imageUrls?: string[]; media?: Array<{ url?: string; media_type?: string; active?: boolean }> };
type MediaKitStatus = 'draft' | 'ready' | 'sent' | 'archived';
type PersistedKit = {
  kitId: string;
  status: MediaKitStatus;
  clientName: string;
  clientEmail?: string | null;
  clientCompany?: string | null;
  clientPhone?: string | null;
  supportIds: string[];
  approvedPrices?: Record<string, string | number>;
  totalAmount?: number | string | null;
  currency?: string | null;
};

const makeRequestId = () => `MK-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

export default function DashboardMediaKitBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kitIdParam = searchParams.get('kitId');
  const [allSupports, setAllSupports] = useState<Support[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [client, setClient] = useState({ name: '', company: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [requestId, setRequestId] = useState<string>(() => kitIdParam || makeRequestId());
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3000); };

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/login'); return; }
    if (kitIdParam) setRequestId(kitIdParam);

    (async () => {
      try {
        const supportsResponse = await fetch('/api/supports');
        const supportsJson = await supportsResponse.json();
        if (!supportsResponse.ok || supportsJson.status !== 'success') throw new Error(supportsJson.message || 'No pudimos cargar el inventario.');
        const supports = (supportsJson.data || []).map((x: any) => ({
          canonical_id: x.canonical_id, name: x.name, ciudad: x.ciudad, tipo_soporte: x.tipo_soporte, address: x.address,
          description: x.description, characteristics: x.characteristics, pricing: x.pricing || null,
          imageUrls: Array.isArray(x.imageUrls) ? x.imageUrls : [], media: Array.isArray(x.media) ? x.media : [],
          imageUrl: x.imageUrl, image_url: x.image_url,
        })) as Support[];
        setAllSupports(supports);

        if (kitIdParam) {
          const kitResponse = await fetch(`/api/admin/mediakits/${encodeURIComponent(kitIdParam)}`, { headers: authHeaders() });
          const kitJson = await kitResponse.json();
          if (!kitResponse.ok || kitJson.status !== 'success') throw new Error(kitJson.message || 'No pudimos recuperar el Media Kit.');
          const kit = kitJson.data as PersistedKit;
          setRequestId(kit.kitId);
          setClient({ name: kit.clientName || '', company: kit.clientCompany || '', email: kit.clientEmail || '', phone: kit.clientPhone || '' });
          setSelectedIds(Array.isArray(kit.supportIds) ? kit.supportIds : []);
          setPrices(Object.fromEntries(Object.entries(kit.approvedPrices || {}).map(([key, value]) => [key, String(value)])));
          notify(`Media Kit ${kit.kitId} recuperado.`);
        }
      } catch (e: any) {
        notify(e.message || 'Error al cargar el Media Kit.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, kitIdParam]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allSupports.filter(s => !q || [s.name, s.ciudad, s.tipo_soporte, s.address].some(v => String(v || '').toLowerCase().includes(q)));
  }, [allSupports, query]);
  const selected = useMemo(() => selectedIds.map(id => allSupports.find(s => s.canonical_id === id)).filter(Boolean) as Support[], [selectedIds, allSupports]);
  const total = selected.reduce((sum, s) => sum + (Number(prices[s.canonical_id]) || 0), 0);
  const ready = selected.length > 0 && selected.every(s => Number(prices[s.canonical_id]) > 0) && client.name.trim().length > 0;
  const toggle = (support: Support) => {
    setSelectedIds(prev => prev.includes(support.canonical_id) ? prev.filter(id => id !== support.canonical_id) : [...prev, support.canonical_id]);
    if (!prices[support.canonical_id]) {
      const base = calculateSupportTotal(support.pricing);
      if (base > 0) setPrices(prev => ({ ...prev, [support.canonical_id]: String(base) }));
    }
  };
  const applyBasePrices = () => {
    const next = { ...prices };
    selected.forEach(s => { const base = calculateSupportTotal(s.pricing); if (base > 0) next[s.canonical_id] = String(base); });
    setPrices(next);
    notify('Tarifas base aplicadas.');
  };
  const exportSupports: ExportSupport[] = selected.map(s => ({ ...s, approvedPriceWithTax: Number(prices[s.canonical_id] || 0) }));
  const lead = { name: client.name || 'Cliente', company: client.company, email: client.email, phone: client.phone };

  const persist = async (status: MediaKitStatus = 'draft'): Promise<PersistedKit> => {
    const response = await fetch('/api/admin/mediakits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ kitId: requestId, clientName: client.name, clientCompany: client.company || null, clientEmail: client.email || null, clientPhone: client.phone || null, supportIds: selectedIds, approvedPrices: prices, totalAmount: total, currency: 'ARS', status }),
    });
    const json = await response.json();
    if (!response.ok || json.status !== 'success') throw new Error(json.message || 'No pudimos guardar el Media Kit.');
    const kit = json.data as PersistedKit;
    setRequestId(kit.kitId);
    if (kit.kitId !== kitIdParam) navigate(`/dashboard/mediakits/nuevo?kitId=${encodeURIComponent(kit.kitId)}`, { replace: true });
    return kit;
  };

  const saveDraft = async () => {
    if (!client.name.trim()) { notify('Ingresá el nombre del cliente para guardar.'); return; }
    setSaving(true);
    try { const kit = await persist('draft'); notify(`Borrador ${kit.kitId} guardado.`); }
    catch (e: any) { notify(e.message || 'No pudimos guardar el borrador.'); }
    finally { setSaving(false); }
  };

  const exportPdf = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      const kit = await persist('ready');
      await downloadMediaKitPdf(lead, exportSupports, kit.kitId);
      notify('PDF generado y Media Kit marcado como listo.');
    } catch (e: any) { notify(e.message || 'No pudimos generar el PDF.'); }
    finally { setBusy(false); }
  };
  const exportPpt = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      const kit = await persist('ready');
      await downloadMediaKitPpt(lead, exportSupports, kit.kitId);
      notify('PPT generado y Media Kit marcado como listo.');
    } catch (e: any) { notify(e.message || 'No pudimos generar el PPT.'); }
    finally { setBusy(false); }
  };

  return <DashboardShell><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
    {toast && <div role="status" className="fixed right-6 top-20 z-[4500] rounded-xl bg-gray-950 px-4 py-3 text-xs font-semibold text-white shadow-xl">{toast}</div>}
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><button type="button" onClick={() => navigate('/dashboard/mediakits')} className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-950"><ArrowLeft className="h-3.5 w-3.5" /> Volver a solicitudes</button><div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Gestión Comercial</div><h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-950">{kitIdParam ? 'Editar Media Kit' : 'Nuevo Media Kit'}</h1><p className="mt-1 text-sm text-gray-500">Elegí soportes del inventario y armá una cotización desde cero.</p></div><div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-right"><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Código</div><div className="font-mono text-sm font-bold text-gray-950">{requestId}</div></div></header>
    <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr] items-start">
      <section className="rounded-2xl border border-gray-200 bg-white shadow-2xs overflow-hidden"><div className="border-b border-gray-100 p-4 space-y-3"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-gray-950">1. Elegir soportes</h2><span className="rounded-full bg-gray-950 px-2.5 py-1 text-xs font-bold text-white">{selected.length} seleccionados</span></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar soporte, ciudad, tipo o dirección..." className="pl-9 rounded-xl"/></div></div>{loading ? <div className="flex justify-center py-16 text-gray-500"><Loader2 className="h-6 w-6 animate-spin" /></div> : <div className="max-h-[620px] overflow-y-auto p-4 grid gap-3 sm:grid-cols-2">{visible.map(s => { const checked = selectedIds.includes(s.canonical_id); const base = calculateSupportTotal(s.pricing); const img = s.media?.find(m => m.active !== false && m.media_type !== 'video' && m.url)?.url || s.imageUrl || s.image_url || s.imageUrls?.[0]; return <button type="button" key={s.canonical_id} onClick={() => toggle(s)} className={`text-left rounded-2xl border overflow-hidden transition ${checked ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'}`}><div className="relative h-36 bg-gray-100">{img ? <img src={img} alt="" className="h-full w-full object-cover"/> : <div className="h-full flex items-center justify-center text-[10px] font-bold text-gray-400">SIN FOTOGRAFÍA</div>}{checked && <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-4 w-4"/></span>}</div><div className="p-3"><div className="font-bold text-sm text-gray-950 truncate">{s.name}</div><div className="mt-0.5 text-xs text-gray-500">{s.ciudad} · {s.tipo_soporte}</div><div className="mt-2 text-xs font-bold text-gray-800">{base > 0 ? formatSupportCurrency(base, s.pricing?.currency || 'ARS') : 'Sin tarifa base'}</div></div></button>; })}{!visible.length && <div className="sm:col-span-2 py-12 text-center text-sm text-gray-500">No hay soportes que coincidan.</div>}</div>}</section>
      <aside className="space-y-4 lg:sticky lg:top-6"><section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs"><h2 className="text-sm font-extrabold text-gray-950">2. Datos del cliente</h2><div className="mt-3 space-y-2.5">{([['name','Nombre / Razón social','Ej. Empresa SA'],['company','Empresa','Ej. Empresa SA'],['email','Email','cliente@empresa.com'],['phone','Teléfono','+54 9 ...']] as const).map(([key,label,placeholder]) => <label key={key} className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span><input value={client[key]} onChange={e => setClient(prev => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"/></label>)}</div></section><section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-gray-950">3. Cotización</h2>{selected.length > 0 && <button type="button" onClick={applyBasePrices} className="text-[11px] font-bold text-emerald-800 hover:underline">Aplicar tarifas base</button>}</div><div className="mt-3 space-y-2">{selected.length ? selected.map(s => <div key={s.canonical_id} className="rounded-xl border border-gray-100 bg-gray-50 p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="text-xs font-bold text-gray-950 truncate">{s.name}</div><div className="text-[10px] text-gray-500">{s.tipo_soporte}</div></div><button type="button" onClick={() => toggle(s)} className="text-gray-400 hover:text-gray-950" aria-label={`Quitar ${s.name}`}><X className="h-4 w-4"/></button></div><div className="mt-2"><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Precio IVA incluido</label><input type="number" min="0" value={prices[s.canonical_id] || ''} onChange={e => setPrices(prev => ({ ...prev, [s.canonical_id]: e.target.value }))} className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-bold"/></div></div>) : <p className="py-5 text-center text-xs text-gray-500">Seleccioná al menos un soporte.</p>}</div>{selected.length > 0 && <div className="mt-3 border-t border-gray-100 pt-3 flex items-center justify-between"><span className="text-xs font-bold text-gray-500">Total estimado</span><strong className="text-lg text-gray-950">{formatSupportCurrency(total, 'ARS')}</strong></div>}</section><section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-950">4. Generar Media Kit</div><p className="mt-1 text-xs leading-relaxed text-emerald-900/70">{ready ? 'Listo para generar. Las fotografías reales y el logo se incorporan automáticamente.' : 'Completá cliente, seleccioná soportes y definí un precio para cada uno.'}</p><div className="mt-3 grid grid-cols-3 gap-2"><button type="button" disabled={!client.name.trim() || saving || busy} onClick={saveDraft} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 disabled:opacity-40">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : null} Guardar</button><button type="button" disabled={!ready || busy || saving} onClick={exportPdf} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gray-950 text-xs font-bold text-white disabled:opacity-40"><Download className="h-3.5 w-3.5"/> PDF</button><button type="button" disabled={!ready || busy || saving} onClick={exportPpt} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 disabled:opacity-40"><FileText className="h-3.5 w-3.5"/> PPT</button></div></section></aside>
    </div>
  </div></DashboardShell>;
}
