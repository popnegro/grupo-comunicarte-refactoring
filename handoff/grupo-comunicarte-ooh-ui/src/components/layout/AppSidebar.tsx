import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  FileText,
  Users,
  Megaphone,
  BarChart2,
  Settings,
  HelpCircle,
  BookOpen,
  LogOut,
  ChevronsLeft,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';

export type DashboardRoute =
  | 'dashboard'
  | 'inventario'
  | 'solicitudes-media-kits'
  | 'propuestas'
  | 'clientes'
  | 'campanas'
  | 'reportes'
  | 'configuracion'
  | 'ayuda'
  | 'documentacion';

interface AppSidebarProps {
  currentRoute: DashboardRoute;
  onRouteChange: (route: DashboardRoute) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentRoute,
  onRouteChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const principalNav = [
    { id: 'dashboard' as DashboardRoute, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventario' as DashboardRoute, label: 'Inventario', icon: MapPin },
    { id: 'solicitudes-media-kits' as DashboardRoute, label: 'Solicitudes Media Kits', icon: ClipboardList },
    { id: 'propuestas' as DashboardRoute, label: 'Propuestas', icon: FileText },
  ];

  const gestionNav = [
    { id: 'clientes' as DashboardRoute, label: 'Clientes', icon: Users },
    { id: 'campanas' as DashboardRoute, label: 'Campañas', icon: Megaphone },
    { id: 'reportes' as DashboardRoute, label: 'Reportes', icon: BarChart2 },
    { id: 'configuracion' as DashboardRoute, label: 'Configuración', icon: Settings },
  ];

  const soporteNav = [
    { id: 'ayuda' as DashboardRoute, label: 'Ayuda', icon: HelpCircle },
    { id: 'documentacion' as DashboardRoute, label: 'Documentación', icon: BookOpen },
    { id: 'logout' as any, label: 'Cerrar sesión', icon: LogOut },
  ];

  const handleNavClick = (routeId: DashboardRoute) => {
    if (routeId === ('logout' as any)) return;
    onRouteChange(routeId);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop para dispositivos móviles */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-200 flex flex-col justify-between ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Cabecera y Perfil */}
        <div className="flex flex-col">
          {/* Logo Brand */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs tracking-tight shrink-0">
                GC
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-slate-900 text-sm tracking-tight truncate">
                  Grupo Comunicarte
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors hidden lg:block cursor-pointer"
              title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              <ChevronsLeft
                className={`w-4 h-4 transition-transform duration-200 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Tarjeta de Usuario Juan Díaz */}
          <div className="p-3 mx-2 mt-2">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs shrink-0">
                JD
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800 truncate">Juan Díaz</p>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">Administrador</p>
                </div>
              )}
            </div>
          </div>

          {/* Menú de Navegación Vertical */}
          <div className="px-3 py-2 space-y-6 overflow-y-auto max-h-[calc(100vh-230px)]">
            {/* PRINCIPAL */}
            <div>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Principal
                </p>
              )}
              <div className="space-y-0.5">
                {principalNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EFF6FF] text-[#2563EB]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-slate-500'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GESTIÓN */}
            <div>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Gestión
                </p>
              )}
              <div className="space-y-0.5">
                {gestionNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EFF6FF] text-[#2563EB]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-slate-500'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SOPORTE */}
            <div>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Soporte
                </p>
              )}
              <div className="space-y-0.5">
                {soporteNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EFF6FF] text-[#2563EB]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Sidebar: Versión */}
        {!isCollapsed && (
          <div className="p-4 m-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700">Versión 1.0.0</p>
              <p className="text-[11px] text-slate-400 truncate">Grupo Comunicarte</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
