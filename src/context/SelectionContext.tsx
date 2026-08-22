import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef, ReactNode } from 'react';
import { InventoryItem, getDisponibilidad } from '../types';
import { fixedLocations, mobileRoutes } from '../data/inventory';

const STORAGE_KEY = 'grupocomunicarte:selected-supports';

export interface SelectionToastData {
  id: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SelectionContextValue {
  selectedIds: Set<string>;
  selectedCount: number;
  toast: SelectionToastData | null;
  showToast: (message: string, action?: { label: string; onClick: () => void }, durationMs?: number) => void;
  hideToast: () => void;
  isSelected: (id: string) => boolean;
  toggleSelect: (item: InventoryItem) => void;
  removeSelected: (id: string, itemName?: string) => void;
  clearSelection: () => void;
  getSelectedItems: (allItems: InventoryItem[]) => InventoryItem[];
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

/**
 * Safely reads and validates stored selection IDs from sessionStorage.
 * Discards any IDs that do not exist in inventory or are currently 'reservado'.
 */
function getInitialSelectedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const allInventory = [...fixedLocations, ...mobileRoutes];
      const validIdMap = new Map<string, boolean>();
      for (const item of allInventory) {
        validIdMap.set(item.canonical_id, getDisponibilidad(item) !== 'reservado');
      }
      const sanitizedIds = parsed.filter(
        (id): id is string => typeof id === 'string' && validIdMap.get(id) === true
      );
      return new Set(sanitizedIds);
    }
  } catch {
    // Fail silently and clear corrupted data
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return new Set();
}

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(getInitialSelectedIds);
  const [toast, setToast] = useState<SelectionToastData | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((
    message: string,
    action?: { label: string; onClick: () => void },
    durationMs: number = 2500
  ) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToast({ id, message, action });

    toastTimeoutRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, durationMs);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (selectedIds.size === 0) {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } else {
        const serialized = JSON.stringify(Array.from(selectedIds));
        window.sessionStorage.setItem(STORAGE_KEY, serialized);
      }
    } catch {
      // Fail silently if quota exceeded or storage disabled
    }
  }, [selectedIds]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggleSelect = useCallback((item: InventoryItem) => {
    // CRITICAL: Reservado items are strictly blocked from selection
    if (getDisponibilidad(item) === 'reservado') return;

    const currentlySelected = selectedIds.has(item.canonical_id);

    if (currentlySelected) {
      // Removing
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.canonical_id);
        return next;
      });
      showToast('Soporte eliminado del Media Kit', {
        label: 'Deshacer',
        onClick: () => {
          setSelectedIds((prev) => new Set(prev).add(item.canonical_id));
          showToast('Soporte añadido al Media Kit');
        },
      }, 2500);
    } else {
      // Adding
      setSelectedIds((prev) => new Set(prev).add(item.canonical_id));
      showToast('Soporte añadido al Media Kit', {
        label: 'Deshacer',
        onClick: () => {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(item.canonical_id);
            return next;
          });
          showToast('Soporte eliminado del Media Kit');
        },
      }, 2500);
    }
  }, [selectedIds, showToast]);

  const removeSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast('Soporte eliminado del Media Kit', {
      label: 'Deshacer',
      onClick: () => {
        setSelectedIds((prev) => new Set(prev).add(id));
        showToast('Soporte añadido al Media Kit');
      },
    }, 2500);
  }, [showToast]);

  const clearSelection = useCallback(() => {
    const previous = Array.from(selectedIds);
    if (previous.length === 0) return;

    setSelectedIds(new Set());
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    showToast('Selección vaciada', {
      label: 'Deshacer',
      onClick: () => {
        setSelectedIds(new Set(previous));
        showToast(`${previous.length} ${previous.length === 1 ? 'soporte restaurado' : 'soportes restaurados'}`);
      },
    }, 3000);
  }, [selectedIds, showToast]);

  const getSelectedItems = useCallback(
    (allItems: InventoryItem[]) => allItems.filter((item) => selectedIds.has(item.canonical_id)),
    [selectedIds]
  );

  const value = useMemo<SelectionContextValue>(() => ({
    selectedIds,
    selectedCount: selectedIds.size,
    toast,
    showToast,
    hideToast,
    isSelected,
    toggleSelect,
    removeSelected,
    clearSelection,
    getSelectedItems,
  }), [selectedIds, toast, showToast, hideToast, isSelected, toggleSelect, removeSelected, clearSelection, getSelectedItems]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within a SelectionProvider');
  return ctx;
}

