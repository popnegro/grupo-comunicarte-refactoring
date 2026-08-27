import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSelection } from '../../context/SelectionContext';
import { ArrowRight, Layers, Trash2 } from 'lucide-react';
import { fixedLocations, mobileRoutes } from '../../data/inventory';
import { Plaza, InventoryItem } from '../../types';

const allInventoryItems: InventoryItem[] = [...fixedLocations, ...mobileRoutes];

interface StickySelectionBarProps {
  onOpenMediakit: () => void;
  currentPlaza?: Plaza | 'todos';
}

export function StickySelectionBar({ onOpenMediakit, currentPlaza }: StickySelectionBarProps) {
  const { selectedCount, clearSelection, getSelectedItems } = useSelection();

  const selectedItems = useMemo(() => {
    return getSelectedItems(allInventoryItems);
  }, [getSelectedItems, selectedCount]);

  const mzaCount = selectedItems.filter((i) => i.ciudad === 'mendoza').length;
  const bueCount = selectedItems.filter((i) => i.ciudad === 'buenos-aires').length;

  let plazaHint = '';
  if (mzaCount > 0 && bueCount > 0) {
    plazaHint = `Mendoza (${mzaCount}) + Bs. As. (${bueCount})`;
  } else if (mzaCount > 0 && currentPlaza === 'buenos-aires') {
    plazaHint = `Tienes ${mzaCount} de Mendoza en tu selección`;
  } else if (bueCount > 0 && currentPlaza === 'mendoza') {
    plazaHint = `Tienes ${bueCount} de Bs. As. en tu selección`;
  }

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          key="sticky-selection-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[1100] w-full sm:w-[calc(100%-1.5rem)] max-w-lg md:max-w-xl pb-[env(safe-area-inset-bottom,0px)]"
          role="region"
          aria-label="Barra de selección de soportes"
        >
          <div className="bg-gray-900 text-white rounded-t-2xl sm:rounded-2xl p-2 sm:px-4 sm:py-3 shadow-2xl border border-gray-800 flex items-center justify-between gap-2 sm:gap-3 backdrop-blur-md">
            {/* Left Info */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="bg-white text-black text-[11px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                    {selectedCount}
                  </span>
                  <span className="text-[11px] sm:text-xs md:text-sm font-semibold truncate text-gray-200">
                    <span className="hidden sm:inline">
                      {selectedCount === 1 ? 'soporte seleccionado' : 'soportes seleccionados'}
                    </span>
                    <span className="sm:hidden">
                      {selectedCount === 1 ? 'seleccionado' : 'seleccionados'}
                    </span>
                  </span>
                </div>
                {plazaHint && (
                  <p className="text-[10px] text-gray-400 font-medium truncate max-w-[130px] sm:max-w-[240px] leading-tight mt-0.5">
                    {plazaHint}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={clearSelection}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Vaciar selección"
                aria-label="Vaciar selección"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenMediakit}
                className="bg-white text-black hover:bg-gray-100 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-1 sm:gap-1.5 transition-transform active:scale-95 shadow-sm whitespace-nowrap min-h-[36px]"
              >
                <span>Solicitar Media Kit</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
