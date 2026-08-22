import { AnimatePresence, motion } from 'motion/react';
import { useSelection } from '../../context/SelectionContext';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export function SelectionToast() {
  const { toast, hideToast, selectedCount } = useSelection();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: 24, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={cn(
            'fixed left-1/2 -translate-x-1/2 z-[1600] w-[calc(100%-1.5rem)] sm:w-auto max-w-md pointer-events-auto',
            selectedCount > 0
              ? 'bottom-[4.5rem] sm:bottom-20 md:bottom-24'
              : 'bottom-4 sm:bottom-6'
          )}
          role="status"
          aria-live="polite"
        >
          <div className="bg-gray-900 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border border-gray-800 flex items-center justify-between gap-3 backdrop-blur-md">
            <p className="text-xs sm:text-sm font-medium text-gray-200 truncate">
              {toast.message}
            </p>

            <div className="flex items-center gap-1.5 shrink-0">
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    hideToast();
                  }}
                  className="bg-white text-black hover:bg-gray-100 font-bold text-xs px-2.5 py-1 rounded-lg transition-transform active:scale-95 shadow-sm whitespace-nowrap"
                >
                  {toast.action.label}
                </button>
              )}

              <button
                type="button"
                onClick={hideToast}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                aria-label="Cerrar notificación"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
