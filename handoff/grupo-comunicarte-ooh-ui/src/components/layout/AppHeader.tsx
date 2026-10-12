import React from 'react';
import { Bell, ChevronDown, Menu, Download } from 'lucide-react';

interface AppHeaderProps {
  onToggleMobileSidebar: () => void;
  unreadNotificationsCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileSidebar,
  unreadNotificationsCount = 1,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Botón Móvil */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-900 text-sm">Grupo Comunicarte</span>
      </div>

      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">OOH Dashboard</span>
        <span>•</span>
        <span>UI Presentacional Verificada</span>
      </div>

      {/* Acciones de Cabecera: Exportar ZIP, Notificaciones y Saludo de Juan */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Enlace directo para descargar el paquete de exportación */}
        <a
          href="/grupo-comunicarte-ooh-ui.zip"
          download="grupo-comunicarte-ooh-ui.zip"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          title="Descargar paquete de exportación grupo-comunicarte-ooh-ui.zip"
        >
          <Download className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="hidden sm:inline">Exportar .ZIP</span>
        </a>

        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2563EB]" />
          )}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer text-slate-800 hover:text-slate-950 transition-colors">
          <span className="text-sm font-medium">Buenos días, Juan</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
