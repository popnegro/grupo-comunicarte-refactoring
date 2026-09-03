import { Plaza, TipoSoporte, Disponibilidad } from '../../types';
import { cn } from '../../lib/utils';
import { MapPin, MonitorPlay, PanelTop, AlignLeft, Search, X, CheckCircle2, Lock } from 'lucide-react';
import { ReactNode } from 'react';
import { Input } from '../ui/Input';
import { ViewModeToggle, ViewMode } from '../inventory/ViewModeToggle';
import { useSelection } from '../../context/SelectionContext';

type DisponibilidadFilter = Disponibilidad | 'todos';

interface MapFilterPanelProps {
  selectedPlaza: Plaza | 'todos';
  setSelectedPlaza: (p: Plaza | 'todos') => void;
  selectedTipo: TipoSoporte | 'todos';
  setSelectedTipo: (t: TipoSoporte | 'todos') => void;
  selectedDisponibilidad: DisponibilidadFilter;
  setSelectedDisponibilidad: (d: DisponibilidadFilter) => void;
  searchText: string;
  setSearchText: (s: string) => void;
  resultsCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function MapFilterPanel({
  selectedPlaza,
  setSelectedPlaza,
  selectedTipo,
  setSelectedTipo,
  selectedDisponibilidad,
  setSelectedDisponibilidad,
  searchText,
  setSearchText,
  resultsCount,
  viewMode,
  onViewModeChange,
}: MapFilterPanelProps) {
  const { selectedCount } = useSelection();

  return (
    <div className="flex h-full flex-col bg-white p-5 sm:p-6">

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar soporte o ubicación..."
          aria-label="Buscar soportes"
          className="h-11 rounded-2xl border-gray-200 bg-gray-50 pl-10 pr-9 text-xs font-medium focus:bg-white"
        />
        {searchText && (
          <button
            onClick={() => setSearchText('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-6 overflow-y-auto pr-1">
        <FilterGroup title="Plaza">
          <FilterButton active={selectedPlaza === 'todos'} onClick={() => setSelectedPlaza('todos')} label="Todas las Plazas" icon={<MapPin className="h-4 w-4" />} />
          <FilterButton active={selectedPlaza === 'mendoza'} onClick={() => setSelectedPlaza('mendoza')} label="Mendoza" />
          <FilterButton active={selectedPlaza === 'buenos-aires'} onClick={() => setSelectedPlaza('buenos-aires')} label="Buenos Aires" />
        </FilterGroup>

        <FilterGroup title="Tipo de soporte">
          <FilterButton active={selectedTipo === 'todos'} onClick={() => setSelectedTipo('todos')} label="Todos los soportes" icon={<AlignLeft className="h-4 w-4" />} />
          <FilterButton active={selectedTipo === 'tradicional'} onClick={() => setSelectedTipo('tradicional')} label="Tradicionales" icon={<PanelTop className="h-4 w-4" />} />
          <FilterButton active={selectedTipo === 'led'} onClick={() => setSelectedTipo('led')} label="Pantallas LED" icon={<MonitorPlay className="h-4 w-4" />} />
          <FilterButton active={selectedTipo === 'led_movil'} onClick={() => setSelectedTipo('led_movil')} label="LED Móvil" icon={<MonitorPlay className="h-4 w-4" />} />
        </FilterGroup>

        <FilterGroup title="Disponibilidad">
          <FilterButton active={selectedDisponibilidad === 'todos'} onClick={() => setSelectedDisponibilidad('todos')} label="Todos" />
          <FilterButton active={selectedDisponibilidad === 'disponible'} onClick={() => setSelectedDisponibilidad('disponible')} label="Disponibles" icon={<CheckCircle2 className="h-4 w-4" />} />
          <FilterButton active={selectedDisponibilidad === 'reservado'} onClick={() => setSelectedDisponibilidad('reservado')} label="Reservados" icon={<Lock className="h-4 w-4" />} />
        </FilterGroup>

        <div className="md:hidden">
          <FilterGroup title="Vista">
            <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} className="w-full justify-center" />
          </FilterGroup>
        </div>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
            {selectedCount > 0 ? `${selectedCount} seleccionados` : 'Resultados'}
          </span>
          <span className="text-sm font-black text-gray-950">{resultsCount}</span>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="px-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-gray-400">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition-all',
        active
          ? 'bg-gray-950 text-white'
          : 'border border-transparent bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-950'
      )}
    >
      {icon && <span className={cn('shrink-0', active ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-700')}>{icon}</span>}
      {!icon && <span className="w-4 shrink-0" />}
      {label}
    </button>
  );
}
