import { useEffect, useState } from 'react';
import { FilePlus2, FileText, MapPin, MonitorSmartphone, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { KPICard } from '../../components/dashboard/ui/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/dashboard/ui/Card';
import { Feedback } from '../../components/dashboard/ui/Feedback';
import { apiFetch } from '../../lib/api';

interface Stats {
  total: number; available: number; reserved: number; inactive: number;
  mendozaTotal: number; mendozaAvailable: number; buenosAiresTotal: number; buenosAiresAvailable: number;
  tradicionalCount: number; ledCount: number; movilCount: number; totalRequests: number; pendingRequests: number;
}

const emptyStats: Stats = { total: 0, available: 0, reserved: 0, inactive: 0, mendozaTotal: 0, mendozaAvailable: 0, buenosAiresTotal: 0, buenosAiresAvailable: 0, tradicionalCount: 0, ledCount: 0, movilCount: 0, totalRequests: 0, pendingRequests: 0 };

function formatDate(value: unknown) {
  if (!value) return '';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(date);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/login'); return; }
    let cancelled = false;
    (async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, requestsRes] = await Promise.all([
          apiFetch('/api/admin/stats', { headers }),
          apiFetch('/api/admin/requests', { headers }),
        ]);
        if (statsRes.status === 401 || requestsRes.status === 401) {
          localStorage.removeItem('admin_token'); navigate('/login'); return;
        }
        const [statsJson, requestsJson] = await Promise.all([statsRes.json(), requestsRes.json()]);
        if (!statsRes.ok || statsJson.status !== 'success') throw new Error(statsJson.message || 'No pudimos cargar el resumen.');
        if (!cancelled) { setStats({ ...emptyStats, ...statsJson.data }); setRequests(requestsJson.status === 'success' ? requestsJson.data : []); }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No pudimos cargar el resumen.');
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const availableRate = stats.total ? Math.round((stats.available / stats.total) * 100) : 0;
  const occupancyRate = stats.total ? Math.round((stats.reserved / stats.total) * 100) : 0;
  const recentRequests = requests.slice(0, 5);

  if (loading) return <DashboardShell><div className="mx-auto max-w-7xl space-y-6"><header><h1 className="text-2xl font-semibold tracking-tight text-gray-950">Resumen</h1><p className="mt-1 text-sm text-gray-500">Estado actual de la operación.</p></header><Feedback type="loading" message="Cargando información del dashboard…" /></div></DashboardShell>;
  if (error) return <DashboardShell><div className="mx-auto max-w-7xl space-y-6"><header><h1 className="text-2xl font-semibold tracking-tight text-gray-950">Resumen</h1><p className="mt-1 text-sm text-gray-500">Estado actual de la operación.</p></header><Feedback type="error" message={error} action={<button type="button" onClick={() => window.location.reload()} className="font-semibold underline underline-offset-2">Reintentar</button>} /></div></DashboardShell>;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl space-y-6 pb-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-950">Resumen</h1><p className="mt-1 text-sm text-gray-500">Estado actual del inventario y la actividad comercial.</p></div>
          <div className="flex flex-wrap gap-2"><Link to="/dashboard/mediakits/nuevo" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-950 px-3.5 text-sm font-semibold text-white hover:bg-gray-800"><FilePlus2 className="h-4 w-4" />Nuevo Media Kit</Link><Link to="/dashboard/soportes" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"><MonitorSmartphone className="h-4 w-4" />Ver soportes</Link></div>
        </header>

        <section aria-label="Indicadores principales" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Soportes" value={stats.total} unit={`${stats.available} disponibles`} icon={MonitorSmartphone} footer={`${availableRate}% del inventario disponible`} />
          <KPICard title="Ocupación" value={`${occupancyRate}%`} unit={`${stats.reserved} reservados`} icon={MapPin} footer="Inventario actualmente reservado" />
          <KPICard title="Solicitudes" value={stats.totalRequests || requests.length} unit={stats.pendingRequests ? `${stats.pendingRequests} pendientes` : 'sin pendientes'} icon={FileText} footer="Solicitudes recibidas" />
          <KPICard title="Plazas" value="2" unit="Mendoza · Buenos Aires" icon={MapPin} footer={`${stats.mendozaTotal + stats.buenosAiresTotal} soportes registrados`} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4 border-b border-gray-100"><div><CardTitle>Disponibilidad</CardTitle><p className="mt-1 text-sm text-gray-500">Inventario por plaza.</p></div><Link to="/dashboard/soportes" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-950">Gestionar<ArrowUpRight className="h-3.5 w-3.5" /></Link></CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              {([['Mendoza', stats.mendozaTotal, stats.mendozaAvailable], ['Buenos Aires', stats.buenosAiresTotal, stats.buenosAiresAvailable]] as const).map(([name,total,available]) => <div key={name} className="space-y-2"><div className="flex items-baseline justify-between gap-3"><span className="font-semibold text-gray-950">{name}</span><span className="text-sm text-gray-500">{total} soportes</span></div><div className="flex items-center justify-between text-sm"><span className="text-gray-700">{available} disponibles</span><span className="text-gray-500">{Math.max(total - available, 0)} reservados</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${total ? Math.min(100, (available / total) * 100) : 0}%` }} /></div></div>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Acciones</CardTitle><p className="mt-1 text-sm text-gray-500">Tareas frecuentes.</p></CardHeader>
            <CardContent className="space-y-2">
              <Link to="/dashboard/mediakits/nuevo" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"><span className="flex items-center gap-2"><FilePlus2 className="h-4 w-4 text-emerald-700" />Crear Media Kit</span><ArrowUpRight className="h-4 w-4 text-gray-400" /></Link>
              <Link to="/dashboard/soportes" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"><span className="flex items-center gap-2"><MonitorSmartphone className="h-4 w-4 text-gray-500" />Gestionar soportes</span><ArrowUpRight className="h-4 w-4 text-gray-400" /></Link>
              <Link to="/dashboard/solicitudes" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"><span className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-500" />Revisar solicitudes</span><ArrowUpRight className="h-4 w-4 text-gray-400" /></Link>
              <Link to="/inventario" className="flex min-h-11 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-500" />Abrir mapa público</span><ArrowUpRight className="h-4 w-4 text-gray-400" /></Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4 border-b border-gray-100"><div><CardTitle>Solicitudes recientes</CardTitle><p className="mt-1 text-sm text-gray-500">Últimos contactos recibidos.</p></div><Link to="/dashboard/solicitudes" className="text-sm font-semibold text-gray-700 hover:text-gray-950">Ver todas</Link></CardHeader>
          {recentRequests.length ? <div className="divide-y divide-gray-100">{recentRequests.map((req: any) => <Link key={req.id || req.requestId} to="/dashboard/solicitudes" className="flex min-h-16 items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-950">{req.requesterName || req.name || 'Solicitud'}</p><p className="truncate text-xs text-gray-500">{req.requestId || req.email || 'Sin identificador'}</p></div><span className="shrink-0 text-xs text-gray-500">{formatDate(req.createdAt || req.created_at || req.date)}</span></Link>)}</div> : <CardContent><Feedback type="empty" message="No hay solicitudes recientes." action={<Link to="/dashboard/mediakits/nuevo" className="font-semibold text-gray-900 underline underline-offset-2">Crear un Media Kit</Link>} /></CardContent>}
        </Card>

        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-200 pt-4 text-xs text-gray-500"><span>Tradicionales: <strong className="font-semibold text-gray-900">{stats.tradicionalCount}</strong></span><span>Pantallas LED: <strong className="font-semibold text-gray-900">{stats.ledCount}</strong></span><span>LED móvil: <strong className="font-semibold text-gray-900">{stats.movilCount}</strong></span></div>
      </div>
    </DashboardShell>
  );
}
