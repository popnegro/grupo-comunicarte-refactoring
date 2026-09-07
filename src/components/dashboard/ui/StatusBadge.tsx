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

  let colorClasses = 'border-gray-200 bg-gray-50 text-gray-600';
  let IconComponent: React.ComponentType<{ className?: string }> | null = null;
  let displayLabel = label || status;

  switch (normalizedStatus) {
    case 'DISPONIBLE':
    case 'DONE':
    case 'ACTIVE':
    case 'ACTIVO':
      colorClasses = 'border-emerald-200 bg-emerald-50 text-emerald-700';
      IconComponent = CheckCircle2;
      if (!label) displayLabel = normalizedStatus === 'DONE' ? 'Completado' : 'Disponible';
      break;

    case 'RESERVADO':
    case 'IN PROGRESS':
    case 'PENDING':
      colorClasses = 'border-amber-200 bg-amber-50 text-amber-700';
      IconComponent = Clock;
      if (!label) displayLabel = normalizedStatus === 'IN PROGRESS' ? 'En proceso' : 'Reservado';
      break;

    case 'REQUEST':
    case 'NUEVO':
      colorClasses = 'border-blue-200 bg-blue-50 text-blue-700';
      IconComponent = Sparkles;
      if (!label) displayLabel = 'Nuevo';
      break;

    case 'CONTACTADO':
      colorClasses = 'border-amber-200 bg-amber-50 text-amber-700';
      IconComponent = MessageSquare;
      if (!label) displayLabel = 'Contactado';
      break;

    case 'ENVIADO':
    case 'QUOTED':
      colorClasses = 'border-indigo-200 bg-indigo-50 text-indigo-700';
      IconComponent = Send;
      if (!label) displayLabel = 'Cotizado';
      break;

    case 'CERRADO':
      colorClasses = 'border-gray-200 bg-gray-50 text-gray-600';
      IconComponent = Check;
      if (!label) displayLabel = 'Cerrado';
      break;

    case 'ARCHIVED':
    case 'INACTIVE':
    case 'INACTIVO':
      colorClasses = 'border-gray-200 bg-gray-50 text-gray-500';
      IconComponent = EyeOff;
      if (!label) displayLabel = 'Inactivo';
      break;

    case 'ERROR':
    case 'REJECTED':
      colorClasses = 'border-red-200 bg-red-50 text-red-700';
      IconComponent = AlertCircle;
      if (!label) displayLabel = 'Error';
      break;

    default:
      colorClasses = 'border-gray-200 bg-gray-50 text-gray-600';
      displayLabel = label || status;
      break;
  }

  const sizeClasses = size === 'sm'
    ? 'gap-1 px-1.5 py-0.5 text-[10px] font-medium'
    : 'gap-1.5 px-2 py-0.5 text-[11px] font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border tracking-normal whitespace-nowrap transition-colors select-none ${sizeClasses} ${colorClasses} ${className}`}>
      {showIcon && IconComponent && (
        <IconComponent className={size === 'sm' ? 'h-2.5 w-2.5 shrink-0' : 'h-3 w-3 shrink-0'} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
