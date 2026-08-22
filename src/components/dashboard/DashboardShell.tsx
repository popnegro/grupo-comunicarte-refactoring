import { BarChart3, ExternalLink, LogOut, FileText, MonitorSmartphone, Layers, MapPin, Bell } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-gray-900 flex flex-col font-sans selection:bg-gray-900 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-[1600px] mx-auto w-full">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5" title="Ir al Dashboard">
              <img src="/brand/brand-dark.svg" alt="Grupo Comunicarte" className="h-6 w-auto" />
            </Link>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Portal Admin
            </span>
          </div>

          {/* Quick Context & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick link to public inventory map */}
            <Link
              to="/inventario"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:text-black hover:border-gray-300 transition-colors shadow-2xs"
              title="Abrir mapa de inventario público"
            >
              <MapPin className="h-3.5 w-3.5 text-gray-500" />
              <span className="hidden md:inline">Mapa Público</span>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </Link>

            {/* Notification Indicator */}
            <Link
              to="/dashboard/mediakits"
              className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title={`${newLeadsCount} solicitudes nuevas`}
              aria-label="Notificaciones de solicitudes"
            >
              <Bell className="h-4 w-4" />
              {newLeadsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
              )}
            </Link>

            {/* Admin Profile Pill */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-200 text-xs font-medium text-gray-600">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold">
                GC
              </div>
              <div className="text-left leading-tight">
                <span className="font-bold text-gray-900 block">Admin</span>
                <span className="text-[10px] text-gray-400">admin@grupocomunicarte.com</span>
              </div>
            </div>

            {/* Log out / Exit */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              title="Salir al sitio público"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-full shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-white p-3 md:w-64 md:p-4 lg:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                Menú de Control
              </p>
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <BarChart3 className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                      <span>Resumen Ejecutivo</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/dashboard/soportes"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <MonitorSmartphone className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                      <span>Gestión de Soportes</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/dashboard/mediakits"
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                        <span>Media Kits & Leads</span>
                      </div>
                      {newLeadsCount > 0 && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-emerald-500 text-black' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {newLeadsCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </nav>
            </div>

            {/* Secondary Group */}
            <div className="hidden md:block pt-4 border-t border-gray-100">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                Atajos de Plataforma
              </p>
              <div className="space-y-1">
                <Link
                  to="/inventario"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Layers className="h-4 w-4 text-gray-400" />
                  <span>Explorador de Mapa</span>
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <span>Portal Institucional</span>
                </Link>
              </div>
            </div>
          </div>

          {/* System status pill footer */}
          <div className="hidden md:block pt-4 border-t border-gray-100">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="text-[11px] text-gray-600 leading-tight">
                <span className="font-bold block text-gray-900">Sistema Activo</span>
                <span className="text-gray-400 text-[10px]">Versión 1.0 PMV</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
