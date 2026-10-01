import React from 'react';
import { Map, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ViewMode = 'mapa' | 'catalogo';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  className,
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Modo de visualización del inventario"
      className={cn(
        'inline-flex items-center p-1 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-sm select-none',
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'mapa'}
        onClick={() => onViewModeChange('mapa')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all min-h-[36px] sm:min-h-[38px] active:scale-[0.98]',
          viewMode === 'mapa'
            ? 'bg-gray-950 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100/70'
        )}
      >
        <Map className={cn('w-3.5 h-3.5', viewMode === 'mapa' ? 'text-emerald-400' : 'text-gray-500')} aria-hidden="true" />
        <span>Mapa</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'catalogo'}
        onClick={() => onViewModeChange('catalogo')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all min-h-[36px] sm:min-h-[38px] active:scale-[0.98]',
          viewMode === 'catalogo'
            ? 'bg-gray-950 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100/70'
        )}
      >
        <LayoutGrid className={cn('w-3.5 h-3.5', viewMode === 'catalogo' ? 'text-emerald-400' : 'text-gray-500')} aria-hidden="true" />
        <span>Catálogo</span>
      </button>
    </div>
  );
};
