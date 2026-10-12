import React from 'react';
import { List, Map } from 'lucide-react';

interface ViewTabsProps {
  activeView: 'lista' | 'mapa';
  onChange: (view: 'lista' | 'mapa') => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({ activeView, onChange }) => {
  return (
    <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
      <button
        type="button"
        onClick={() => onChange('lista')}
        className={`inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
          activeView === 'lista'
            ? 'text-[#2563EB]'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <List className="w-4 h-4" />
        <span>Lista</span>
        {activeView === 'lista' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange('mapa')}
        className={`inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
          activeView === 'mapa'
            ? 'text-[#2563EB]'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Map className="w-4 h-4" />
        <span>Mapa</span>
        {activeView === 'mapa' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
        )}
      </button>
    </div>
  );
};
