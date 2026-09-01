import React from 'react';
import { CheckCircle2, Clock, AlertCircle, EyeOff, Sparkles } from 'lucide-react';

export type StatusType =
  | 'disponible'
  | 'reservado'
  | 'REQUEST'
  | 'IN PROGRESS'
  | 'DONE'
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
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      IconComponent = CheckCircle2;
      if (!label) displayLabel = normalizedStatus === 'DONE' ? 'Completado' : 'Disponible';
      break;

    case 'RESERVADO':
    case 'IN PROGRESS':
    case 'PENDING':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      IconComponent = Clock;
      if (!label) displayLabel = normalizedStatus === 'IN PROGRESS' ? 'En proceso' : 'Reservado';
      break;

    case 'REQUEST':
    case 'NUEVO':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      IconComponent = Sparkles;
      if (!label) displayLabel = 'Nueva Solicitud';
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

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1 font-medium'
    : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide whitespace-nowrap transition-colors select-none ${sizeClasses} ${colorClasses} ${className}`}
    >
      {showIcon && IconComponent && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{displayLabel}</span>
    </span>
  );
};
