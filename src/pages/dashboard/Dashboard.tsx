import { useEffect, useState } from 'react';
import { FilePlus2, FileText, MapPin, MonitorSmartphone, ArrowUpRight, ClipboardList, PackageOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { KPICard } from '../../components/dashboard/ui/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/dashboard/ui/Card';
import { LoadingState, EmptyState, ErrorState } from '../../components/dashboard/ui/Feedback';
import { apiFetch } from '../../lib/api';

interface Stats { total:number; available:number; reserved:number; inactive:number; mendozaTotal:number; mendozaAvailable:number; buenosAiresTotal:number; buenosAiresAvailable:number; tradicionalCount:number; ledCount:number; movilCount:number; totalRequests:number; pendingRequests:number; }
const emptyStats: Stats = { total:0, available:0, reserved:0, inactive:0, mendozaTotal:0, mendozaAvailable:0, buenosAiresTotal:0, buenosAiresAvailable:0, tradicionalCount:0, ledCount:0, movilCount:0, totalRequests:0, pendingRequests:0 };
function formatDate(value: unknown) { if (!value) return ''; const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('es-AR',{day:'2-digit',month:'short'}).format(d); }

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats,setStats]=useState<Stats>(emptyStats); const [requests,setRequests]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{ const token=localStorage.getItem('admin_token'); if(!token){navigate('/login');return;} let cancelled=false; (async()=>{try{const headers={Authorization:`Bearer ${token}`}; const [sr,rr]=await Promise.all([apiFetch('/api/admin/stats',{headers}),apiFetch('/api/admin/requests',{headers})]); if(sr.status===401||rr.status===401){localStorage.removeItem('admin_token');navigate('/login');return;} const [sj,rj]=await Promise.all([sr.json(),rr.json()]); if(!sr.ok||sj.status!=='success')throw new Error(sj.message||'No pudimos cargar el resumen.'); if(!cancelled){setStats({...emptyStats,...sj.data});setRequests(rj.status==='success'?rj.data:[]);}}catch(e){if(!cancelled)setError(e instanceof Error?e.message:'No pudimos cargar el resumen.');}finally{if(!cancelled)setLoading(false);}})(); return()=>{cancelled=true;};},[navigate]);
  const availableRate=stats.total?Math.round(stats.available/stats.total*100):0; const occupancyRate=stats.total?Math.round(stats.reserved/stats.total*100):0; const recent=requests.slice(0,5);

  const Header = () => (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">Centro de trabajo</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">Resumen</h1>
        <p className="mt-1 text-sm text-gray-500">Una vista rápida de lo que requiere atención y del estado del inventario.</p>
      </div>
      <Link to="/dashboard/mediakits/nuevo" className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-gray-950 px-3 text-xs font-semibold text-white transition hover:bg-gray-800"><FilePlus2 className="h-3.5 w-3.5 text-emerald-400"/>Nuevo Media Kit</Link>
    </header>
  );

  if(loading)return <DashboardShell><div className="mx-auto max-w-[1320px] space-y-5"><Header/><LoadingState label="Cargando información del dashboard…"/></div></DashboardShell>;
  if(error)return <DashboardShell><div className="mx-auto max-w-[1320px] space-y-5"><Header/><ErrorState description={error} action={<button type="button" onClick={()=>window.location.reload()} className="font-semibold underline underline-offset-2">Reintentar</button>}/></div></DashboardShell>;

  return <DashboardShell><div className="mx-auto max-w-[1320px] space-y-5 pb-8">
    <Header/>

    <section aria-label="Accesos de trabajo" className="grid gap-3 md:grid-cols-3">
      <Link to="/dashboard/soportes" className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950/10">
        <div className="flex items-start justify-between gap-4"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-700"><PackageOpen className="h-4 w-4"/></span><ArrowUpRight className="h-4 w-4 text-gray-400 transition group-hover:text-gray-700"/></div>
        <p className="mt-3 text-sm font-semibold text-gray-950">Gestionar soportes</p><p className="mt-0.5 text-xs text-gray-500">Editar, revisar disponibilidad y administrar inventario.</p>
      </Link>
      <Link to="/dashboard/solicitudes" className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950/10">
        <div className="flex items-start justify-between gap-4"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-700"><ClipboardList className="h-4 w-4"/></span><ArrowUpRight className="h-4 w-4 text-gray-400 transition group-hover:text-gray-700"/></div>
        <div className="mt-3 flex items-center gap-2"><p className="text-sm font-semibold text-gray-950">Revisar solicitudes</p>{stats.pendingRequests>0&&<span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{stats.pendingRequests} pendientes</span>}</div>
        <p className="mt-0.5 text-xs text-gray-500">Consultar contactos y avanzar oportunidades comerciales.</p>
      </Link>
      <Link to="/dashboard/mediakits/nuevo" className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950/10">
        <div className="flex items-start justify-between gap-4"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-700"><FilePlus2 className="h-4 w-4"/></span><ArrowUpRight className="h-4 w-4 text-gray-400 transition group-hover:text-gray-700"/></div>
        <p className="mt-3 text-sm font-semibold text-gray-950">Crear Media Kit</p><p className="mt-0.5 text-xs text-gray-500">Seleccionar soportes y preparar una propuesta comercial.</p>
      </Link>
    </section>

    <section aria-label="Indicadores principales" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KPICard title="Soportes" value={stats.total} unit={`${stats.available} disponibles`} icon={MonitorSmartphone} footer={`${availableRate}% del inventario disponible`} />
      <KPICard title="Ocupación" value={`${occupancyRate}%`} unit={`${stats.reserved} reservados`} icon={MapPin} footer="Inventario actualmente reservado" />
      <KPICard title="Solicitudes" value={stats.totalRequests||requests.length} unit={stats.pendingRequests?`${stats.pendingRequests} pendientes`:'sin pendientes'} icon={FileText} footer="Solicitudes recibidas" />
      <KPICard title="Plazas" value="2" unit="Mendoza · Buenos Aires" icon={MapPin} footer={`${stats.mendozaTotal+stats.buenosAiresTotal} soportes registrados`} />
    </section>

    <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 border-b border-gray-100"><div><CardTitle>Disponibilidad por plaza</CardTitle><p className="mt-1 text-xs text-gray-500">Inventario disponible y reservado actualmente.</p></div><Link to="/dashboard/soportes" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-950">Gestionar<ArrowUpRight className="h-3.5 w-3.5"/></Link></CardHeader>
        <CardContent className="space-y-6 pt-5">
          {([['Mendoza',stats.mendozaTotal,stats.mendozaAvailable],['Buenos Aires',stats.buenosAiresTotal,stats.buenosAiresAvailable]] as const).map(([name,total,available])=><div key={name} className="space-y-2.5"><div className="flex items-baseline justify-between gap-3"><span className="text-sm font-semibold text-gray-950">{name}</span><span className="text-xs text-gray-500">{total} soportes</span></div><div className="flex justify-between text-xs"><span className="text-gray-700">{available} disponibles</span><span className="text-gray-500">{Math.max(total-available,0)} reservados</span></div><div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{width:`${total?Math.min(100,available/total*100):0}%`}}/></div></div>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 border-b border-gray-100"><div><CardTitle>Solicitudes recientes</CardTitle><p className="mt-1 text-xs text-gray-500">Últimos contactos recibidos.</p></div><Link to="/dashboard/solicitudes" className="shrink-0 text-xs font-semibold text-gray-600 hover:text-gray-950">Ver todas</Link></CardHeader>
        {recent.length?<div className="divide-y divide-gray-100">{recent.map((req:any)=><Link key={req.id||req.requestId} to="/dashboard/solicitudes" className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-gray-50 sm:px-5"><div className="min-w-0"><p className="truncate text-xs font-semibold text-gray-950">{req.requesterName||req.name||'Solicitud'}</p><p className="truncate text-[11px] text-gray-500">{req.requestId||req.email||'Sin identificador'}</p></div><span className="shrink-0 text-[11px] text-gray-500">{formatDate(req.createdAt||req.created_at||req.date)}</span></Link>)}</div>:<CardContent><EmptyState title="No hay solicitudes recientes" description="Las nuevas solicitudes aparecerán aquí." action={<Link to="/dashboard/solicitudes" className="font-semibold text-gray-900 underline underline-offset-2">Ver solicitudes</Link>}/></CardContent>}
      </Card>
    </div>

    <Card>
      <CardHeader className="border-b border-gray-100"><CardTitle>Inventario por tipología</CardTitle><p className="mt-1 text-xs text-gray-500">Distribución de soportes registrados en el sistema.</p></CardHeader>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
        {([['Tradicionales',stats.tradicionalCount],['Pantallas LED',stats.ledCount],['LED móvil',stats.movilCount]] as const).map(([label,value])=><div key={label} className="rounded-md border border-gray-200 bg-gray-50/40 px-4 py-3"><span className="block text-xs font-medium text-gray-500">{label}</span><span className="mt-1 block text-xl font-semibold tracking-tight text-gray-950">{value}</span></div>)}
      </CardContent>
    </Card>
  </div></DashboardShell>;
}
