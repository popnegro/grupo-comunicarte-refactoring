import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  EyeOff,
  Sparkles,
  Send,
  MessageSquare,
  Check,
} from 'lucide-react';

export type StatusType =
  | 'disponible'
  | 'reservado'
  | 'REQUEST'
  | 'IN PROGRESS'
  | 'DONE'
  | 'nuevo'
  | 'contactado'
  | 'enviado'
  | 'quoted'
  | 'cerrado'
  | 'active'
  | 'archived'
  | 'draft'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
  showIcon = true,
}) => {
  const normalizedStatus = String(status || '').toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent: React.ComponentType<{ className?: string }> | null = null;
  let displayLabel = label || status;

  switch (normalizedStatus) {
    case 'DISPONIBLE':
    case 'DONE':
    case 'ACTIVE':
    case 'ACTIVO':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/90';
      IconComponent = CheckCircle2;
      if (!label) {
        displayLabel = normalizedStatus === 'DONE' ? 'Completado' : 'Disponible';
      }
      break;

    case 'RESERVADO':
    case 'IN PROGRESS':
    case 'PENDING':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/90';
      IconComponent = Clock;
      if (!label) {
        displayLabel = normalizedStatus === 'IN PROGRESS' ? 'En proceso' : 'Reservado';
      }
      break;

    case 'REQUEST':
    case 'NUEVO':
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200/90';
      IconComponent = Sparkles;
      if (!label) displayLabel = 'Nuevo';
      break;

    case 'CONTACTADO':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/90';
      IconComponent = MessageSquare;
      if (!label) displayLabel = 'Contactado';
      break;

    case 'ENVIADO':
    case 'QUOTED':
      colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200/90';
      IconComponent = Send;
      if (!label) displayLabel = 'Cotizado';
      break;

    case 'CERRADO':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      IconComponent = Check;
      if (!label) displayLabel = 'Cerrado';
      break;

    case 'ARCHIVED':
    case 'INACTIVE':
    case 'INACTIVO':
      colorClasses = 'bg-gray-100 text-gray-600 border-gray-200';
      IconComponent = EyeOff;
      if (!label) displayLabel = 'Inactivo';
      break;

    case 'ERROR':
    case 'REJECTED':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      IconComponent = AlertCircle;
      if (!label) displayLabel = 'Error';
      break;

    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      displayLabel = label || status;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1 font-semibold'
      : 'text-xs px-2.5 py-1 gap-1.5 font-bold';

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-normal whitespace-nowrap transition-colors select-none ${sizeClasses} ${colorClasses} ${className}`}
    >
      {showIcon && IconComponent && (
        <IconComponent className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
