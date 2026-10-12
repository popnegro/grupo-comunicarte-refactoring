import React, { useState } from 'react';
import {
  Search,
  Download,
  Pencil,
  MoreVertical,
  Plus,
  SlidersHorizontal,
  Star,
  Layers,
} from 'lucide-react';
import { SupportItem } from '../../types/inventory';
import { StatusBadge } from '../ui/StatusBadge';
import { TypeIcon } from '../ui/TypeIcon';
import { ViewTabs } from '../ui/ViewTabs';
import { Pagination } from '../ui/Pagination';
import { EmptyState, IntegrationNotice } from '../shared/StateNotice';

interface InventoryTableProps {
  items: SupportItem[];
  onEditSupport: (support: SupportItem) => void;
  onNewSupportClick: () => void;
  activeView: 'lista' | 'mapa';
  onViewChange: (view: 'lista' | 'mapa') => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onEditSupport,
  onNewSupportClick,
  activeView,
  onViewChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todas las tipologías');
  const [disponibilidadFilter, setDisponibilidadFilter] = useState('Toda disponibilidad');
  const [destacadoFilter, setDestacadoFilter] = useState('Todos');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtrado reactivo en memoria local (UI presentacional)
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.localidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.formato && item.formato.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === 'Todas las tipologías' || item.tipo === typeFilter;

    const matchesDisponibilidad =
      disponibilidadFilter === 'Toda disponibilidad' ||
      item.disponibilidad === disponibilidadFilter;

    const matchesDestacado =
      destacadoFilter === 'Todos' ||
      (destacadoFilter === 'Destacados' && item.destacado) ||
      (destacadoFilter === 'No destacados' && !item.destacado);

    return matchesSearch && matchesType && matchesDisponibilidad && matchesDestacado;
  });

  // Manejo de selección por checkboxes
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
      {/* Barra de Búsqueda, Filtros y Botón "+ Nuevo soporte" */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
          {/* Input de Búsqueda */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, dirección, formato, código..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-colors"
            />
          </div>

          {/* Selector de Tipologías Oficiales */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 cursor-pointer min-w-[170px]"
            aria-label="Filtrar por tipología"
          >
            <option value="Todas las tipologías">Todas las tipologías</option>
            <option value="Tradicional">Tradicional</option>
            <option value="LED móvil">LED móvil</option>
            <option value="Pantallas LED">Pantallas LED</option>
            <option value="Pendiente de mapeo">Pendiente de mapeo</option>
          </select>

          {/* Selector de Disponibilidad Comercial */}
          <select
            value={disponibilidadFilter}
            onChange={(e) => setDisponibilidadFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 cursor-pointer min-w-[160px]"
            aria-label="Filtrar por disponibilidad"
          >
            <option value="Toda disponibilidad">Toda disponibilidad</option>
            <option value="Disponible">Disponible</option>
            <option value="Reservado">Reservado</option>
          </select>

          {/* Selector de Destacado */}
          <select
            value={destacadoFilter}
            onChange={(e) => setDestacadoFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 cursor-pointer min-w-[140px]"
            aria-label="Filtrar por destacado"
          >
            <option value="Todos">Comercial: Todos</option>
            <option value="Destacados">★ Solo destacados</option>
            <option value="No destacados">No destacados</option>
          </select>
        </div>

        {/* CTA "+ Nuevo soporte" */}
        <button
          type="button"
          onClick={onNewSupportClick}
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo soporte</span>
        </button>
      </div>

      {/* Tabs Lista / Mapa */}
      <ViewTabs activeView={activeView} onChange={onViewChange} />

      {activeView === 'mapa' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <IntegrationNotice message="La vista de mapa requiere conectar la instancia de Leaflet / React Leaflet presente en el repositorio original popnegro/grupo-comunicarte-refactoring." />
          <div className="h-96 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
            <SlidersHorizontal className="w-8 h-8 mb-2 text-slate-400" />
            <p className="font-semibold text-slate-700">Contenedor de Mapa OOH Leaflet</p>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Las capas, clusters y marcadores geográficos se preservarán desde los módulos del repositorio real para evitar regresiones de tiles o coordenadas.
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
          {/* Barra de cabecera de la tabla con contador y botón Exportar */}
          <div className="py-3 px-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500">
                {filteredItems.length} soportes
              </span>
              {selectedIds.length > 0 && (
                <span className="text-xs bg-blue-50 text-[#2563EB] font-medium px-2 py-0.5 rounded">
                  {selectedIds.length} seleccionados
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
              title="No se encontraron soportes"
              description="No hay soportes que coincidan con la búsqueda o filtros seleccionados."
              onClearFilters={() => {
                setSearchTerm('');
                setTypeFilter('Todas las tipologías');
                setDisponibilidadFilter('Toda disponibilidad');
                setDestacadoFilter('Todos');
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
                    <th className="py-3 px-4 font-semibold">Nombre y Destacado</th>
                    <th className="py-3 px-4 font-semibold">Tipología</th>
                    <th className="py-3 px-4 font-semibold">Medidas / Caras</th>
                    <th className="py-3 px-4 font-semibold">Dirección</th>
                    <th className="py-3 px-4 font-semibold">Localidad</th>
                    <th className="py-3 px-4 font-semibold">Disponibilidad</th>
                    <th className="py-3 px-4 pr-6 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredItems.slice(0, pageSize).map((item) => {
                    const isSelected = selectedIds.includes(item.id);
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
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 font-mono">
                          {item.id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{item.nombre}</span>
                            {item.destacado && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-full"
                                title="Soporte comercialmente destacado"
                              >
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                <span>Destacado</span>
                              </span>
                            )}
                          </div>
                          {item.formato && (
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {item.formato}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <TypeIcon type={item.tipo} />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <div className="space-y-0.5">
                            {item.medidas ? (
                              <span className="font-medium text-slate-800">{item.medidas}</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                            {item.caras !== undefined && (
                              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                                <Layers className="w-3 h-3" />
                                <span>{item.caras} {item.caras === 1 ? 'cara' : 'caras'}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">
                          {item.direccion}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">
                          {item.localidad}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={item.disponibilidad} />
                        </td>
                        <td className="py-3.5 px-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditSupport(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Editar soporte"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <div className="relative">
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
                                      onEditSupport(item);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer text-left"
                                  >
                                    Ver detalles
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveMenuId(null)}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer text-left"
                                  >
                                    Duplicar
                                  </button>
                                </div>
                              )}
                            </div>
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
