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

export function MapFilterPanel({ selectedPlaza, setSelectedPlaza, selectedTipo, setSelectedTipo, selectedDisponibilidad, setSelectedDisponibilidad, searchText, setSearchText, resultsCount, viewMode, onViewModeChange }: MapFilterPanelProps) {
  const { selectedCount } = useSelection();

  return (
    <div className="flex h-full flex-col bg-white p-4 sm:p-5">
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Buscar soporte o ubicación..." aria-label="Buscar soportes" className="h-10 rounded-lg bg-gray-50 pl-10 pr-9 text-sm focus:bg-white" />
        {searchText && <button type="button" onClick={() => setSearchText('')} aria-label="Limpiar búsqueda" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-950"><X className="h-3.5 w-3.5" /></button>}
      </div>

      <div className="space-y-5 overflow-y-auto pr-1">
        <FilterGroup title="Plaza">
          <FilterButton active={selectedPlaza === 'todos'} onClick={() => setSelectedPlaza('todos')} label="Todas las plazas" icon={<MapPin className="h-4 w-4" />} />
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
      </div>

      <div className="mt-auto hidden border-t border-gray-100 pt-4 md:block">
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">Vista</div>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} className="w-full justify-center" />
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">{selectedCount > 0 ? `${selectedCount} seleccionados` : 'Resultados'}</span>
          <span className="text-sm font-semibold text-gray-950">{resultsCount}</span>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div className="space-y-2"><h3 className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">{title}</h3><div className="space-y-1">{children}</div></div>;
}

function FilterButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn('group flex min-h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20', active ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950')}>{icon && <span className={cn('shrink-0', active ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-700')}>{icon}</span>}{!icon && <span className="w-4 shrink-0" />}{label}</button>;
}
