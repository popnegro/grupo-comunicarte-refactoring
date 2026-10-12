import React, { useState } from 'react';
import { Search, Download, MoreVertical, Plus, SlidersHorizontal, Layers, DollarSign } from 'lucide-react';
import { MediaKitRequestItem } from '../../types/mediaKits';
import { StatusBadge } from '../ui/StatusBadge';
import { ViewTabs } from '../ui/ViewTabs';
import { Pagination } from '../ui/Pagination';
import { EmptyState, IntegrationNotice } from '../shared/StateNotice';

interface MediaKitsTableProps {
  items: MediaKitRequestItem[];
  onRequestClick: (item: MediaKitRequestItem) => void;
  onNewRequestClick: () => void;
  activeView: 'lista' | 'mapa';
  onViewChange: (view: 'lista' | 'mapa') => void;
}

export const MediaKitsTable: React.FC<MediaKitsTableProps> = ({
  items,
  onRequestClick,
  onNewRequestClick,
  activeView,
  onViewChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');
  const [campaignFilter, setCampaignFilter] = useState('Todas las campañas');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtrado reactivo en memoria local (UI presentacional)
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.campana.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mediaKit.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'Todos los estados' || item.estado === statusFilter;

    const matchesCampaign =
      campaignFilter === 'Todas las campañas' || item.campana === campaignFilter;

    return matchesSearch && matchesStatus && matchesCampaign;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda, Filtros y Botón "+ Nueva solicitud" */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, campaña, código o nombre del kit..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-colors"
            />
          </div>

          {/* Selector de Estados */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 cursor-pointer min-w-[150px]"
            aria-label="Filtrar por estado"
          >
            <option value="Todos los estados">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En revisión">En revisión</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
          </select>

          {/* Selector de Campañas */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 cursor-pointer min-w-[150px]"
            aria-label="Filtrar por campaña"
          >
            <option value="Todas las campañas">Todas las campañas</option>
            <option value="Lanzamiento Verano">Lanzamiento Verano</option>
            <option value="Branding Corporativo">Branding Corporativo</option>
            <option value="Colección Primavera">Colección Primavera</option>
            <option value="Campaña Institucional">Campaña Institucional</option>
            <option value="Feria Rural">Feria Rural</option>
            <option value="Vida Sana">Vida Sana</option>
            <option value="Admisiones 2026">Admisiones 2026</option>
            <option value="Nuevos Modelos">Nuevos Modelos</option>
            <option value="Destinos 2025">Destinos 2025</option>
          </select>
        </div>

        {/* CTA "+ Nueva solicitud" */}
        <button
          type="button"
          onClick={onNewRequestClick}
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva solicitud</span>
        </button>
      </div>

      {/* Tabs Lista / Mapa */}
      <ViewTabs activeView={activeView} onChange={onViewChange} />

      {activeView === 'mapa' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <IntegrationNotice message="La vista geográfica de solicitudes requiere conectar la capa de clientes y puntos de distribución de Leaflet del repositorio principal." />
          <div className="h-96 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
            <SlidersHorizontal className="w-8 h-8 mb-2 text-slate-400" />
            <p className="font-semibold text-slate-700">Mapa de Distribución de Media Kits</p>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Visualización geolocalizada de solicitudes por zona y anunciante.
            </p>
            <button
              type="button"
              onClick={() => onViewChange('lista')}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
            >
              Volver a vista Lista
            </button>
          </div>
        </div>
      ) : (
        /* Tarjeta de Tabla */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Barra de cabecera con conteo y botón Exportar */}
          <div className="py-3 px-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500">
                {filteredItems.length} solicitudes
              </span>
              {selectedIds.length > 0 && (
                <span className="text-xs bg-blue-50 text-[#2563EB] font-medium px-2 py-0.5 rounded">
                  {selectedIds.length} seleccionadas
                </span>
              )}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar</span>
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              title="No se encontraron solicitudes"
              description="No hay solicitudes de media kit que coincidan con los filtros aplicados."
              onClearFilters={() => {
                setSearchTerm('');
                setStatusFilter('Todos los estados');
                setCampaignFilter('Todas las campañas');
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 pl-6 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length > 0 &&
                          selectedIds.length === filteredItems.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold">ID</th>
                    <th className="py-3 px-4 font-semibold">Cliente</th>
                    <th className="py-3 px-4 font-semibold">Campaña</th>
                    <th className="py-3 px-4 font-semibold">Media Kit</th>
                    <th className="py-3 px-4 font-semibold">Propuesta Comercial</th>
                    <th className="py-3 px-4 font-semibold">Fecha solicitud</th>
                    <th className="py-3 px-4 font-semibold">Estado</th>
                    <th className="py-3 px-4 pr-6 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredItems.slice(0, pageSize).map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const supportCount = item.soportes?.length ?? 0;
                    const hasAmount = item.monto?.valor !== undefined;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSelected ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 pl-6">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item.id)}
                            className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => onRequestClick(item)}
                            className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer font-mono"
                          >
                            {item.id}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{item.cliente}</div>
                          {item.clienteEmail && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              {item.clienteEmail}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">
                          <div>{item.campana}</div>
                          {item.campanaTipo && (
                            <span className="text-[11px] text-slate-400">
                              {item.campanaTipo}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">
                          <div>{item.mediaKit}</div>
                          {item.mediaKitDetalle && (
                            <span className="text-[11px] text-slate-400">
                              {item.mediaKitDetalle}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>
                                {supportCount > 0 ? (
                                  `${supportCount} ${supportCount === 1 ? 'soporte' : 'soportes'}`
                                ) : (
                                  <span className="text-slate-400 font-normal italic">Sin soportes</span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-mono">
                              <DollarSign className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>
                                {hasAmount ? (
                                  <>
                                    ${item.monto?.valor?.toLocaleString('es-AR')}{' '}
                                    <span className="text-slate-400 text-[10px]">{item.monto?.moneda}</span>
                                  </>
                                ) : (
                                  <span className="text-slate-400 italic">Por definir</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">
                          {item.fechaSolicitud}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={item.estado} />
                        </td>
                        <td className="py-3.5 px-4 pr-6 text-right">
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuId(
                                  activeMenuId === item.id ? null : item.id
                                )
                              }
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Más opciones"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {activeMenuId === item.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 text-xs text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onRequestClick(item);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer text-left"
                                >
                                  Ver detalle
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(null)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer text-left"
                                >
                                  Descargar PDF
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={1}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
};
