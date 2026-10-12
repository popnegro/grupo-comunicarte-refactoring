import React from 'react';
import { SupportDisponibilidad, SupportEstadoOperativo } from '../../types/inventory';
import { MediaKitStatus } from '../../types/mediaKits';

export type AnyStatus =
  | SupportDisponibilidad
  | SupportEstadoOperativo
  | MediaKitStatus
  | string;

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let bgClasses = 'bg-slate-100 text-slate-700 border border-slate-200';
  let dotClasses = 'bg-slate-400';

  switch (status) {
    // Disponibilidad comercial OOH
    case 'Disponible':
    case 'Aprobada':
    case 'Activo':
    case 'Operativo':
      bgClasses = 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200/60';
      dotClasses = 'bg-[#22C55E]';
      break;

    case 'Reservado':
      bgClasses = 'bg-[#FEF3C7] text-[#92400E] border border-amber-200/80';
      dotClasses = 'bg-[#F59E0B]';
      break;

    // Estados de Solicitudes de Media Kits
    case 'Pendiente':
      bgClasses = 'bg-[#FEF3C7] text-[#B45309] border border-amber-200/60';
      dotClasses = 'bg-[#F59E0B]';
      break;

    case 'En revisión':
      bgClasses = 'bg-[#E0F2FE] text-[#0369A1] border border-sky-200/60';
      dotClasses = 'bg-[#0EA5E9]';
      break;

    case 'Mantenimiento':
      bgClasses = 'bg-[#F1F5F9] text-[#475569] border border-slate-300/70';
      dotClasses = 'bg-[#64748B]';
      break;

    case 'Inactivo':
    case 'Rechazada':
      bgClasses = 'bg-[#FEE2E2] text-[#B91C1C] border border-rose-200/60';
      dotClasses = 'bg-[#EF4444]';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight ${bgClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`} />
      <span>{status}</span>
    </span>
  );
};
