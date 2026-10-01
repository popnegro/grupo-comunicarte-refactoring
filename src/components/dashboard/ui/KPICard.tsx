import React, { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from './cn';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  statusBadge?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColorClass = 'text-gray-700',
  statusBadge: _statusBadge,
  footer,
  className = '',
}) => (
  <Card className={cn('flex min-h-36 flex-col justify-between p-5 shadow-none', className)}>
    <div>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-700" aria-hidden="true">
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </div>
      <div className="mt-4">
        <span className="block text-xs font-medium text-gray-500">{title}</span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-gray-950">{value}</span>
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
      </div>
    </div>
    {footer && <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-600">{footer}</div>}
  </Card>
);
