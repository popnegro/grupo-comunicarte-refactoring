import { Plaza, TipoSoporte, Disponibilidad } from '../../types';
import { cn } from '../../lib/utils';
import { MapPin, MonitorPlay, PanelTop, AlignLeft, Search, X, CheckCircle2, Lock } from 'lucide-react';
import { ReactNode } from 'react';
import { Input } from '../ui/Input';
import { buttonStyles } from '../ui/Button';
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
  onOpenMediakit: () => void;
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
  onOpenMediakit
}: MapFilterPanelProps) {
  const { selectedCount } = useSelection();

  return (
    <div className="p-6 flex flex-col h-full bg-white">
    
      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar por nombre, ubicación o tipo..."
          aria-label="Buscar soportes"
          className="pl-10 pr-9"
        />
        {searchText && (
          <button
            onClick={() => setSearchText('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-8 overflow-y-auto">
        {/* Plaza Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Plaza</h3>
          <div className="flex flex-col gap-2">
            <FilterButton
              active={selectedPlaza === 'todos'}
              onClick={() => setSelectedPlaza('todos')}
              label="Todas las Plazas"
              icon={<MapPin className="w-4 h-4" />}
            />
            <FilterButton
              active={selectedPlaza === 'mendoza'}
              onClick={() => setSelectedPlaza('mendoza')}
              label="Mendoza"
            />
            <FilterButton
              active={selectedPlaza === 'buenos-aires'}
              onClick={() => setSelectedPlaza('buenos-aires')}
              label="Buenos Aires"
            />
          </div>
        </div>

        {/* Tipo de Soporte Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Tipo de Soporte</h3>
          <div className="flex flex-col gap-2">
            <FilterButton
              active={selectedTipo === 'todos'}
              onClick={() => setSelectedTipo('todos')}
              label="Todos los Soportes"
              icon={<AlignLeft className="w-4 h-4" />}
            />
            <FilterButton
              active={selectedTipo === 'tradicional'}
              onClick={() => setSelectedTipo('tradicional')}
              label="Tradicionales"
              icon={<PanelTop className="w-4 h-4" />}
            />
            <FilterButton
              active={selectedTipo === 'led'}
              onClick={() => setSelectedTipo('led')}
              label="Pantallas LED"
              icon={<MonitorPlay className="w-4 h-4" />}
            />
            <FilterButton
              active={selectedTipo === 'led_movil'}
              onClick={() => setSelectedTipo('led_movil')}
              label="LED Móvil"
              icon={<MonitorPlay className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Disponibilidad Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Disponibilidad</h3>
          <div className="flex flex-col gap-2">
            <FilterButton
              active={selectedDisponibilidad === 'todos'}
              onClick={() => setSelectedDisponibilidad('todos')}
              label="Todos"
            />
            <FilterButton
              active={selectedDisponibilidad === 'disponible'}
              onClick={() => setSelectedDisponibilidad('disponible')}
              label="Disponibles"
              icon={<CheckCircle2 className="w-4 h-4" />}
            />
            <FilterButton
              active={selectedDisponibilidad === 'reservado'}
              onClick={() => setSelectedDisponibilidad('reservado')}
              label="Reservados"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 space-y-3">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">Resultados</span>
          <span className="bg-black text-white px-2.5 py-0.5 rounded-full text-xs font-bold">{resultsCount}</span>
        </div>

        <button
          onClick={onOpenMediakit}
          className={buttonStyles({ className: 'w-full', variant: selectedCount > 0 ? 'default' : 'outline' })}
        >
          {selectedCount > 0 ? `Solicitar Media Kit (${selectedCount})` : 'Solicitar Media Kit'}
        </button>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left",
        active
          ? "bg-black text-white shadow-sm"
          : "bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
      )}
    >
      {icon && <span className={cn("shrink-0", active ? "text-white" : "text-gray-400")}>{icon}</span>}
      {!icon && <span className="w-4"></span>}
      {label}
    </button>
  );
}
