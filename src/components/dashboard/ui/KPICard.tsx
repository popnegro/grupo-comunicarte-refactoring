import React, { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  iconBgClass?: string;
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
  iconBgClass = 'bg-gray-100',
  statusBadge,
  footer,
  className = '',
}) => {
  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:border-gray-300 hover:shadow-xs ${className}`}
    >
      <div>
        {/* Top bar: Icon and Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-colors ${iconBgClass} ${iconColorClass}`}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          {statusBadge && <div className="shrink-0">{statusBadge}</div>}
        </div>

        {/* Title and Value */}
        <div className="mt-4">
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
            {title}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-gray-500">{unit}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer information */}
      {footer && (
        <div className="mt-3.5 border-t border-gray-100 pt-3 text-xs text-gray-600">
          {footer}
        </div>
      )}
    </article>
  );
};
