import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BarChart3, ExternalLink, LogOut, FileText, MonitorSmartphone, Layers, MapPin, Bell, ChevronRight,
  Menu, X, FilePlus2,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { getStoredLeads, subscribeToLeads } from '../../lib/dashboard-store';

interface DashboardShellProps { children: ReactNode; }

const pageLabels: Record<string, string> = {
  '/dashboard': 'Resumen Ejecutivo',
  '/dashboard/soportes': 'Gestión de Soportes',
  '/dashboard/soportes/new': 'Nuevo Soporte',
  '/dashboard/solicitudes': 'Solicitudes',
  '/dashboard/mediakits': 'Media Kits',
  '/dashboard/mediakits/nuevo': 'Nuevo Media Kit',
};

export function DashboardShell({ children }: DashboardShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const leads = getStoredLeads();
    setNewLeadsCount(leads.filter((l) => l.status === 'nuevo').length);
    const unsubscribe = subscribeToLeads((updatedLeads) => {
      setNewLeadsCount(updatedLeads.filter((l) => l.status === 'nuevo').length);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);

  const currentPage = useMemo(() => {
    if (pageLabels[location.pathname]) return pageLabels[location.pathname];
    if (location.pathname.includes('/edit')) return 'Editar Soporte';
    if (location.pathname.includes('/preview')) return 'Vista previa';
    if (location.pathname.includes('/reservation')) return 'Reserva';
    return 'Panel';
  }, [location.pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${isActive ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950'}`;

  const handleLogout = () => { localStorage.removeItem('admin_token'); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-gray-900 font-sans selection:bg-gray-950 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileNavOpen((open) => !open)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 md:hidden" aria-label={mobileNavOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={mobileNavOpen}>
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link to="/dashboard" className="flex shrink-0 items-center" title="Ir al Dashboard"><img src="/brand/brand-dark.svg" alt="Grupo Comunicarte" className="h-6 w-auto" /></Link>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/dashboard/mediakits/nuevo" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gray-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"><FilePlus2 className="h-3.5 w-3.5 text-emerald-400" /><span>Nuevo Media Kit</span></Link>
            <Link to="/inventario" className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-950" title="Abrir mapa de inventario público"><MapPin className="h-3.5 w-3.5 text-emerald-600" /><span>Mapa Público</span><ExternalLink className="h-3 w-3 text-gray-400" /></Link>
            <Link to="/dashboard/solicitudes" className="relative rounded-lg p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950" title={`${newLeadsCount} solicitudes nuevas`} aria-label="Solicitudes nuevas"><Bell className="h-4 w-4" />{newLeadsCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />}</Link>
            <div className="hidden items-center gap-2 border-l border-gray-200 pl-3 lg:flex"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-xs font-black text-white">GC</div><div className="text-left leading-tight"><span className="block text-xs font-semibold text-gray-950">Administrador</span><span className="text-[11px] text-gray-500">Centro de Operaciones</span></div></div>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700" title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Salir</span></button>
          </div>
        </div>
      </header>

      <div className="relative flex max-w-[1600px] mx-auto w-full">
        {mobileNavOpen && <button type="button" aria-label="Cerrar menú" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 top-16 z-30 bg-gray-950/20 md:hidden" />}
        <aside className={`${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-16 bottom-0 z-40 w-[280px] border-r border-gray-200 bg-white p-4 shadow-xl transition-transform duration-200 md:static md:z-auto md:block md:w-60 md:translate-x-0 md:shadow-none lg:w-64 lg:p-5`}>
          <div className="flex h-full flex-col justify-between">
            <nav aria-label="Navegación principal del panel" className="space-y-1">
              <NavLink to="/dashboard" end className={navClass}>{({ isActive }) => <><BarChart3 className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} /><span>Resumen Ejecutivo</span>{isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-gray-500" />}</>}</NavLink>
              <NavLink to="/dashboard/soportes" className={navClass}>{({ isActive }) => <><MonitorSmartphone className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} /><span>Gestión de Soportes</span>{isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-gray-500" />}</>}</NavLink>
              <NavLink to="/dashboard/solicitudes" className={navClass}>{({ isActive }) => <><FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} /><span>Solicitudes</span>{newLeadsCount > 0 && <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? 'bg-emerald-400 text-gray-950' : 'bg-emerald-50 text-emerald-800'}`}>{newLeadsCount}</span>}</>}</NavLink>
              <NavLink to="/dashboard/mediakits" className={navClass}>{({ isActive }) => <><FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} /><span>Media Kits</span>{isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-gray-500" />}</>}</NavLink>
            </nav>
            <div className="hidden border-t border-gray-100 pt-5 md:block">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Accesos</p>
              <div className="space-y-1">
                <Link to="/dashboard/mediakits/nuevo" className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"><FilePlus2 className="h-4 w-4 text-emerald-600" /><span>Crear Media Kit</span></Link>
                <Link to="/inventario" className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"><Layers className="h-4 w-4 text-gray-400" /><span>Explorador de Mapa</span></Link>
                <Link to="/" className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"><ExternalLink className="h-4 w-4 text-gray-400" /><span>Portal Institucional</span></Link>
              </div>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex min-h-6 items-center gap-2 text-xs" aria-label="Breadcrumb"><Link to="/dashboard" className="font-semibold text-gray-500 hover:text-gray-950">Dashboard</Link><ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" /><span className="font-semibold text-gray-900" aria-current="page">{currentPage}</span></div>
          {children}
        </main>
      </div>
    </div>
  );
}
