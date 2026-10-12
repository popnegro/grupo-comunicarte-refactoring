import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: OverlayProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <section role="dialog" aria-modal="true" aria-labelledby="dashboard-dialog-title" className={cn('relative z-10 w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl', className)}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 id="dashboard-dialog-title" className="text-base font-semibold text-gray-950">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950/20"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

export function Sheet({ open, onClose, title, children, className }: OverlayProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
      <section role="dialog" aria-modal="true" aria-labelledby="dashboard-sheet-title" className={cn('absolute inset-y-0 right-0 z-10 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-xl', className)}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 id="dashboard-sheet-title" className="text-base font-semibold text-gray-950">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950/20"><X className="h-4 w-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </section>
    </div>
  );
}
