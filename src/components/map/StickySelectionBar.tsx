import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSelection } from '../../context/SelectionContext';
import { ArrowRight, Layers, Trash2 } from 'lucide-react';
import { Plaza, InventoryItem } from '../../types';

interface StickySelectionBarProps {
  onOpenMediakit: () => void;
  currentPlaza?: Plaza | 'todos';
  inventoryItems: InventoryItem[];
}

export function StickySelectionBar({ onOpenMediakit, currentPlaza, inventoryItems }: StickySelectionBarProps) {
  const { selectedCount, clearSelection, getSelectedItems } = useSelection();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const selectedItems = useMemo(() => getSelectedItems(inventoryItems), [getSelectedItems, inventoryItems, selectedCount]);
  const mzaCount = selectedItems.filter((i) => i.ciudad === 'mendoza').length;
  const bueCount = selectedItems.filter((i) => i.ciudad === 'buenos-aires').length;

  useEffect(() => {
    if (selectedCount === 0) {
      setIsFooterVisible(false);
      return;
    }

    const footer = document.getElementById('site-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.01 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [selectedCount]);

  let plazaHint = '';
  if (mzaCount > 0 && bueCount > 0) plazaHint = `Mendoza (${mzaCount}) + Bs. As. (${bueCount})`;
  else if (mzaCount > 0 && currentPlaza === 'buenos-aires') plazaHint = `Tienes ${mzaCount} de Mendoza en tu selección`;
  else if (bueCount > 0 && currentPlaza === 'mendoza') plazaHint = `Tienes ${bueCount} de Bs. As. en tu selección`;

  return (
    <AnimatePresence>
      {selectedCount > 0 && !isFooterVisible && (
        <motion.div
          key="sticky-selection-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 sm:bottom-4 md:bottom-6 z-[900] flex justify-center px-3 sm:px-4 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
          role="region"
          aria-label="Barra de selección de soportes"
        >
          <div className="pointer-events-auto w-full max-w-lg md:max-w-xl bg-gray-950/95 text-white rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-2xl border border-gray-800/90 flex items-center justify-between gap-2.5 sm:gap-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0" aria-live="polite">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Layers className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="bg-emerald-400 text-gray-950 text-xs font-black px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                    {selectedCount}
                  </span>
                  <span className="text-xs sm:text-sm font-bold truncate text-gray-100">
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

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={clearSelection}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95"
                title="Vaciar selección"
                aria-label="Vaciar selección"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenMediakit}
                className="bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 shadow-md whitespace-nowrap min-h-[40px]"
              >
                <span>Solicitar Media Kit</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
