import { useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';

export interface DetailTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface DetailTabsProps {
  tabs: DetailTab[];
}

export function DetailTabs({ tabs }: DetailTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
      {/* Section nav */}
      <div role="tablist" aria-label="Detalle del soporte" className="flex border-b border-gray-100 bg-white">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "flex-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset relative",
                isActive ? "text-black" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="detail-tab-underline"
                  className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Fixed container, content swaps with a soft transition, no layout jump */}
      <div className="p-4 min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab?.id}
            role="tabpanel"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
