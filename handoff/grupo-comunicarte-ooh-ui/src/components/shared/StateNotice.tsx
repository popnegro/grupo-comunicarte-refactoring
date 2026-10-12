import React from 'react';
import { SearchX, Info, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No se encontraron registros',
  description = 'Intenta ajustar los criterios de búsqueda o los filtros seleccionados.',
  onClearFilters,
}) => {
  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1">{description}</p>
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={`skel-row-${rIdx}`} className="flex items-center gap-4 py-2 border-b border-slate-100">
          <div className="w-4 h-4 bg-slate-200 rounded" />
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div
              key={`skel-col-${cIdx}`}
              className="h-4 bg-slate-200 rounded flex-1"
              style={{ maxWidth: cIdx === 0 ? '70px' : cIdx === 1 ? '160px' : '100px' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const IntegrationNotice: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 my-2">
      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Modo Presentacional (Fases 2 y 3)</p>
        <p className="mt-0.5 text-amber-700">{message}</p>
      </div>
    </div>
  );
};
