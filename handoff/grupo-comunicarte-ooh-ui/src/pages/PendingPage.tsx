import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { DashboardRoute } from '../components/layout/AppSidebar';

interface PendingPageProps {
  routeName: DashboardRoute;
  onNavigateToInventory: () => void;
}

export const PendingPage: React.FC<PendingPageProps> = ({
  routeName,
  onNavigateToInventory,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-xl mx-auto my-12 text-center space-y-4 shadow-xs">
      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <h2 className="text-lg font-bold text-slate-900 capitalize">
        Módulo: {routeName.replace('-', ' ')}
      </h2>

      <p className="text-sm text-slate-500 leading-relaxed">
        Esta sección se encuentra en pausa según la autorización de las Fases 2 y 3.
        Para evitar inventar modelos de datos o contratos no autorizados, este módulo
        será diseñado e implementado una vez inspeccionado el código fuente real del
        repositorio <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">popnegro/grupo-comunicarte-refactoring</code>.
      </p>

      <div className="pt-2">
        <button
          type="button"
          onClick={onNavigateToInventory}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Inventario</span>
        </button>
      </div>
    </div>
  );
};
