import React from 'react';

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return <div role="status" aria-live="polite" className="flex min-h-24 items-center justify-center px-4 text-sm text-gray-500">{label}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-5 py-8 text-center">
      <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'No se pudo cargar la información', description, action }: { title?: string; description?: string; action?: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50/50 px-5 py-4">
      <h3 className="text-sm font-semibold text-red-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-red-800/80">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
