import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BarChart3, ExternalLink, LogOut, FileText, MonitorSmartphone, MapPin, Bell, ChevronRight,
  Menu, X, FilePlus2, PanelLeft,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    `group flex min-h-9 items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${isActive ? 'bg-gray-100 text-gray-950' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'}`;

  const handleLogout = () => { localStorage.removeItem('admin_token'); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', label: 'Resumen', icon: BarChart3, end: true },
    { to: '/dashboard/soportes', label: 'Soportes', icon: MonitorSmartphone },
    { to: '/dashboard/solicitudes', label: 'Solicitudes', icon: FileText, count: newLeadsCount },
    { to: '/dashboard/mediakits', label: 'Media Kits', icon: FileText },
    { to: '/dashboard/mediakits/nuevo', label: 'Nuevo Media Kit', icon: FilePlus2 },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans text-gray-900 selection:bg-gray-950 selection:text-white">
      <header className="sticky top-0 z-50 h-14 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between px-3 sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setMobileNavOpen((open) => !open)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 md:hidden" aria-label={mobileNavOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={mobileNavOpen}>
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} className="hidden h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-950 md:inline-flex" aria-label={sidebarCollapsed ? 'Expandir navegación' : 'Colapsar navegación'} title={sidebarCollapsed ? 'Expandir navegación' : 'Colapsar navegación'}>
              <PanelLeft className="h-4 w-4" />
            </button>
            <Link to="/dashboard" className="flex shrink-0 items-center" title="Ir al Dashboard"><img src="/brand/brand-dark.svg" alt="Grupo Comunicarte" className="h-5 w-auto" /></Link>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/dashboard/solicitudes" className="relative rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950" title={`${newLeadsCount} solicitudes nuevas`} aria-label="Solicitudes nuevas"><Bell className="h-4 w-4" />{newLeadsCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />}</Link>
            <div className="hidden items-center gap-2 border-l border-gray-200 pl-3 sm:flex"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-950 text-[10px] font-bold text-white">GC</div><div className="hidden text-left leading-tight lg:block"><span className="block text-xs font-semibold text-gray-950">Administrador</span><span className="text-[10px] text-gray-500">Centro de Operaciones</span></div></div>
            <button type="button" onClick={handleLogout} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700" title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Salir</span></button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-[1600px]">
        {mobileNavOpen && <button type="button" aria-label="Cerrar menú" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 top-14 z-30 bg-gray-950/20 md:hidden" />}
        <aside className={`${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-14 bottom-0 z-40 w-[280px] border-r border-gray-200 bg-white px-3 py-4 shadow-xl transition-all duration-200 md:static md:z-auto md:block md:translate-x-0 md:shadow-none ${sidebarCollapsed ? 'md:w-[68px]' : 'md:w-56 lg:w-60'}`}>
          <nav aria-label="Navegación principal del panel" className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end, count }) => (
              <NavLink key={to} to={to} end={end} className={navClass} title={sidebarCollapsed ? label : undefined}>
                {({ isActive }) => <><Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} /><span className={sidebarCollapsed ? 'sr-only' : ''}>{label}</span>{count ? <span className={`${sidebarCollapsed ? 'ml-auto h-1.5 w-1.5 p-0' : 'ml-auto px-1.5 py-0.5'} shrink-0 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-800 ${sidebarCollapsed ? 'bg-emerald-500' : ''}`}>{sidebarCollapsed ? null : count}</span> : null}{isActive && !sidebarCollapsed && <ChevronRight className="ml-auto h-3 w-3 text-gray-400" />}</>}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <Link to="/inventario" title={sidebarCollapsed ? 'Mapa Público' : undefined} className="flex min-h-9 items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"><MapPin className="h-4 w-4 shrink-0 text-gray-400" /><span className={sidebarCollapsed ? 'sr-only' : ''}>Mapa Público</span><ExternalLink className={sidebarCollapsed ? 'hidden' : 'ml-auto h-3 w-3 text-gray-400'} /></Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="mb-5 flex min-h-5 items-center gap-1.5 text-xs" aria-label="Breadcrumb"><Link to="/dashboard" className="font-medium text-gray-500 hover:text-gray-950">Dashboard</Link><ChevronRight className="h-3 w-3 text-gray-300" aria-hidden="true" /><span className="font-medium text-gray-900" aria-current="page">{currentPage}</span></div>
          {children}
        </main>
      </div>
    </div>
  );
}
