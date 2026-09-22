import { Search, SlidersHorizontal } from 'lucide-react';
import { Plaza, TipoSoporte, Disponibilidad } from '../../types';
import { Input } from '../ui/Input';
import { ViewModeToggle, ViewMode } from './ViewModeToggle';

type DisponibilidadFilter = Disponibilidad | 'todos';

interface InventoryToolbarProps {
  selectedPlaza: Plaza | 'todos';
  setSelectedPlaza: (value: Plaza | 'todos') => void;
  selectedTipo: TipoSoporte | 'todos';
  setSelectedTipo: (value: TipoSoporte | 'todos') => void;
  selectedDisponibilidad: DisponibilidadFilter;
  setSelectedDisponibilidad: (value: DisponibilidadFilter) => void;
  searchText: string;
  setSearchText: (value: string) => void;
  resultsCount: number;
  selectedCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function InventoryToolbar({
  selectedPlaza,
  setSelectedPlaza,
  selectedTipo,
  setSelectedTipo,
  selectedDisponibilidad,
  setSelectedDisponibilidad,
  searchText,
  setSearchText,
  resultsCount,
  selectedCount,
  viewMode,
  onViewModeChange,
}: InventoryToolbarProps) {
  return (
    <div className="hidden shrink-0 border-b border-gray-200 bg-white px-4 py-3 md:flex md:items-center md:gap-2 lg:px-5">
      <div className="relative min-w-[220px] flex-1 lg:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <Input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Buscar soporte o ubicación..."
          aria-label="Buscar soportes"
          className="h-9 rounded-lg bg-gray-50 pl-9 text-xs focus:bg-white"
        />
      </div>

      <select
        value={selectedPlaza}
        onChange={(event) => setSelectedPlaza(event.target.value as Plaza | 'todos')}
        aria-label="Filtrar por plaza"
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-400"
      >
        <option value="todos">Todas las plazas</option>
        <option value="mendoza">Mendoza</option>
        <option value="buenos-aires">Buenos Aires</option>
      </select>

      <select
        value={selectedTipo}
        onChange={(event) => setSelectedTipo(event.target.value as TipoSoporte | 'todos')}
        aria-label="Filtrar por tipo de soporte"
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-400"
      >
        <option value="todos">Todos los tipos</option>
        <option value="tradicional">Tradicionales</option>
        <option value="led">Pantallas LED</option>
        <option value="led_movil">LED Móvil</option>
      </select>

      <select
        value={selectedDisponibilidad}
        onChange={(event) => setSelectedDisponibilidad(event.target.value as DisponibilidadFilter)}
        aria-label="Filtrar por disponibilidad"
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-400"
      >
        <option value="todos">Toda disponibilidad</option>
        <option value="disponible">Disponibles</option>
        <option value="reservado">Reservados</option>
      </select>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-gray-500 lg:flex">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          {selectedCount > 0 ? `${selectedCount} seleccionados` : `${resultsCount} resultados`}
        </span>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
    </div>
  );
}