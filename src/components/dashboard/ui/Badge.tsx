import React from 'react';
import { cn } from './cn';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export function Badge({ variant = 'default', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        {
          default: 'border-gray-200 bg-gray-50 text-gray-700',
          success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
          warning: 'border-amber-200 bg-amber-50 text-amber-800',
          danger: 'border-red-200 bg-red-50 text-red-700',
          info: 'border-blue-200 bg-blue-50 text-blue-800',
        }[variant],
        className,
      )}
      {...props}
    />
  );
}
