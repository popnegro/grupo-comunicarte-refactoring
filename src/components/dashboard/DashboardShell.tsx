import { BarChart3, ExternalLink, LogOut, FileText, MonitorSmartphone, Layers, MapPin, Bell, ChevronRight } from 'lucide-react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, ReactNode } from 'react';
import { getStoredLeads, subscribeToLeads } from '../../lib/dashboard-store';

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const navigate = useNavigate();
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    const leads = getStoredLeads();
    const pending = leads.filter((l) => l.status === 'nuevo').length;
    setNewLeadsCount(pending);

    const unsubscribe = subscribeToLeads((updatedLeads) => {
      const p = updatedLeads.filter((l) => l.status === 'nuevo').length;
      setNewLeadsCount(p);
    });

    return () => unsubscribe();
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all duration-200 whitespace-nowrap ${
      isActive
        ? 'bg-gray-950 text-white shadow-md shadow-gray-950/10'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950'
    }`;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-gray-900 flex flex-col font-sans selection:bg-gray-950 selection:text-white">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="flex h-[68px] items-center justify-between px-4 md:px-6 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5" title="Ir al Dashboard">
              <img src="/brand/brand-dark.svg" alt="Grupo Comunicarte" className="h-6 w-auto" />
            </Link>
            <div className="hidden h-5 w-px bg-gray-200 sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Portal Admin
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/inventario"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
              title="Abrir mapa de inventario público"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden md:inline">Mapa Público</span>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </Link>

            <Link
              to="/dashboard/solicitudes"
              className="relative rounded-xl p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
              title={`${newLeadsCount} solicitudes nuevas`}
              aria-label="Solicitudes nuevas"
            >
              <Bell className="h-4 w-4" />
              {newLeadsCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </Link>

            <div className="hidden items-center gap-2 border-l border-gray-200 pl-3 lg:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-950 text-xs font-black text-white">GC</div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-bold text-gray-950">Administrador</span>
                <span className="text-[10px] text-gray-400">Centro de Operaciones</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto">
        <aside className="w-full shrink-0 border-b border-black/10 bg-white p-3 md:border-b-0 md:border-r md:p-4 lg:w-64 lg:p-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center justify-between px-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Menú de Control</p>
                <span className="text-[10px] font-bold text-gray-400">PMV 1.0</span>
              </div>
              <nav aria-label="Navegación principal del panel" className="flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
                <NavLink to="/dashboard" end className={navClass}>
                  {({ isActive }) => (
                    <>
                      <BarChart3 className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-700'}`} />
                      <span>Resumen Ejecutivo</span>
                      {isActive && <ChevronRight className="ml-auto hidden h-3.5 w-3.5 text-gray-500 md:block" />}
                    </>
                  )}
                </NavLink>

                <NavLink to="/dashboard/soportes" className={navClass}>
                  {({ isActive }) => (
                    <>
                      <MonitorSmartphone className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-700'}`} />
                      <span>Gestión de Soportes</span>
                      {isActive && <ChevronRight className="ml-auto hidden h-3.5 w-3.5 text-gray-500 md:block" />}
                    </>
                  )}
                </NavLink>

                <NavLink to="/dashboard/solicitudes" className={navClass}>
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-700'}`} />
                        <span>Solicitudes</span>
                      </div>
                      {newLeadsCount > 0 && (
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isActive ? 'bg-emerald-400 text-gray-950' : 'bg-emerald-100 text-emerald-800'}`}>
                          {newLeadsCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </nav>
            </div>

            <div className="hidden border-t border-gray-100 pt-5 md:block">
              <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Accesos Rápidos</p>
              <div className="space-y-1">
                <Link to="/inventario" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950">
                  <Layers className="h-4 w-4 text-gray-400" />
                  <span>Explorador de Mapa</span>
                </Link>
                <Link to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-950">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <span>Portal Institucional</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden border-t border-gray-100 pt-5 md:block">
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]" />
              <div className="text-[11px] leading-tight text-gray-600">
                <span className="block font-bold text-gray-950">Sistema Operativo</span>
                <span className="text-gray-400">Servidores Conectados</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
