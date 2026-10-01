import React, { forwardRef } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950/20 disabled:pointer-events-none disabled:opacity-50',
        {
          primary: 'border-gray-950 bg-gray-950 text-white hover:bg-gray-800',
          secondary: 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300',
          ghost: 'border-transparent bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-950',
          danger: 'border-red-200 bg-white text-red-700 hover:bg-red-50',
        }[variant],
        {
          sm: 'px-3 text-xs',
          md: 'px-3.5',
          lg: 'px-4',
        }[size],
        className,
      )}
      {...props}
    />
  );
});
