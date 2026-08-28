import { useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle2, Edit3, ExternalLink, MoreHorizontal, Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { Input } from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';

type Support = {
  canonical_id: string;
  name: string;
  ciudad: string;
  tipo_soporte: string;
  disponibilidad: string;
  active?: boolean;
  address?: string;
};

const chip = 'rounded-full px-2.5 py-1 text-[11px] font-bold';

export default function DashboardSupportList() {
  const navigate = useNavigate();
  const [supports, setSupports] = useState<Support[]>([]);
  const [query, setQuery] = useState('');
  const [plaza, setPlaza] = useState('todas');
  const [type, setType] = useState('todos');
  const [availability, setAvailability] = useState('todos');
  const [active, setActive] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const notify = (text: string) => { setMessage(text); window.setTimeout(() => setMessage(''), 2500); };

  const load = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/supports', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { localStorage.removeItem('admin_token'); navigate('/login'); return; }
      const json = await res.json();
      if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo cargar el inventario.');
      setSupports(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se pudo cargar el inventario.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [navigate]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return supports.filter((item) => {
      const matchQ = !q || [item.name, item.canonical_id, item.ciudad, item.address].some((v) => String(v || '').toLowerCase().includes(q));
      const matchPlaza = plaza === 'todas' || item.ciudad === plaza;
      const matchType = type === 'todos' || item.tipo_soporte === type;
      const matchAvailability = availability === 'todos' || item.disponibilidad === availability;
      const matchActive = active === 'todos' || (active === 'activos' ? item.active !== false : item.active === false);
      return matchQ && matchPlaza && matchType && matchAvailability && matchActive;
    });
  }, [supports, query, plaza, type, availability, active]);

  const toggleAvailability = async (item: Support) => {
    const token = localStorage.getItem('admin_token');
    const next = item.disponibilidad === 'disponible' ? 'reservado' : 'disponible';
    const res = await apiFetch(`/api/admin/supports/${encodeURIComponent(item.canonical_id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ disponibilidad: next }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.status !== 'success') { notify(json?.message || 'No se pudo cambiar la disponibilidad.'); return; }
    notify(`Disponibilidad: ${next}.`); load();
  };

  const archive = async (item: Support) => {
    if (!window.confirm(`¿Archivar “${item.name}”?`)) return;
    const token = localStorage.getItem('admin_token');
    const res = await apiFetch(`/api/admin/supports/${encodeURIComponent(item.canonical_id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.status !== 'success') { notify(json?.message || 'No se pudo archivar.'); return; }
    notify('Soporte archivado.'); load();
  };

  return <DashboardShell>
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      {message && <div role="status" className="fixed right-6 top-20 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white shadow-lg">{message}</div>}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="text-eyebrow text-emerald-700">INVENTARIO</div><h1 className="mt-2 text-page-title text-gray-900">Gestión de Soportes</h1><p className="mt-1 max-w-2xl text-sm text-gray-500">Catálogo administrativo de soportes. Listá, filtrá y abrí cada soporte como un producto.</p></div>
        <div className="flex gap-2"><button onClick={() => load()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700"><RefreshCw className="h-4 w-4"/>Actualizar</button><button onClick={() => navigate('/dashboard/soportes/new')} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white"><Plus className="h-4 w-4"/>Nuevo soporte</button></div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/><Input value={query} onChange={(e)=>setQuery(e.target.value)} className="pl-10" placeholder="Buscar nombre, código o dirección…"/></div>
          <select value={plaza} onChange={(e)=>setPlaza(e.target.value)} className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"><option value="todas">Todas las plazas</option><option value="mendoza">Mendoza</option><option value="buenos-aires">Buenos Aires</option></select>
          <select value={type} onChange={(e)=>setType(e.target.value)} className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"><option value="todos">Todos los formatos</option><option value="tradicional">Tradicional</option><option value="led">LED</option><option value="led_movil">LED móvil</option></select>
          <select value={availability} onChange={(e)=>setAvailability(e.target.value)} className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"><option value="todos">Disponibilidad</option><option value="disponible">Disponible</option><option value="reservado">Reservado</option></select>
          <select value={active} onChange={(e)=>setActive(e.target.value)} className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"><option value="todos">Estado</option><option value="activos">Activos</option><option value="inactivos">Archivados</option></select>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500"><span><strong className="text-gray-900">{visible.length}</strong> soportes</span>{(query || plaza !== 'todas' || type !== 'todos' || availability !== 'todos' || active !== 'todos') && <button onClick={()=>{setQuery('');setPlaza('todas');setType('todos');setAvailability('todos');setActive('todos')}} className="font-bold text-emerald-700 hover:underline">Limpiar filtros</button>}</div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500"><tr><th className="px-4 py-3.5">Soporte / Código</th><th className="px-4 py-3.5">Plaza / Formato</th><th className="px-4 py-3.5">Disponibilidad</th><th className="px-4 py-3.5 text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={4} className="px-4 py-14 text-center text-gray-400">Cargando soportes…</td></tr> : visible.map(item => <tr key={item.canonical_id} className={item.active === false ? 'bg-gray-50' : 'hover:bg-gray-50/70'}>
            <td className="px-4 py-3.5"><div className="font-bold text-gray-900">{item.name}</div><div className="font-mono text-[11px] text-gray-400">{item.canonical_id}</div></td>
            <td className="px-4 py-3.5"><div className="font-semibold text-gray-700">{item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}</div><div className="text-[11px] capitalize text-gray-500">{item.tipo_soporte?.replace('_',' ')}</div></td>
            <td className="px-4 py-3.5"><button onClick={()=>toggleAvailability(item)} className={`${chip} ${item.disponibilidad === 'disponible' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{item.disponibilidad === 'disponible' ? 'Disponible' : 'Reservado'}</button>{item.active === false && <span className="ml-2 text-[10px] font-bold text-gray-400">Archivado</span>}</td>
            <td className="px-4 py-3.5 text-right"><div className="inline-flex items-center gap-2"><button onClick={()=>navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/edit`)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700"><Edit3 className="h-3.5 w-3.5"/>Editar</button><button onClick={()=>archive(item)} aria-label={`Archivar ${item.name}`} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"><Archive className="h-3.5 w-3.5"/></button><button onClick={()=>navigate('/inventario')} aria-label="Ver inventario público" className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"><ExternalLink className="h-3.5 w-3.5"/></button><button aria-label="Más acciones" className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"><MoreHorizontal className="h-3.5 w-3.5"/></button></div></td>
          </tr>)}{!loading && visible.length===0 && <tr><td colSpan={4} className="px-4 py-14 text-center text-gray-400">No se encontraron soportes con estos filtros.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  </DashboardShell>;
}
