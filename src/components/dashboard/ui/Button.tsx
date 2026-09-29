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
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          primary: 'border-black bg-black text-white hover:bg-gray-800',
          secondary: 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50',
          ghost: 'border-transparent bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-950',
          danger: 'border-red-200 bg-white text-red-700 hover:bg-red-50',
        }[variant],
        {
          sm: 'min-h-9 rounded-md px-4 text-xs',
          md: 'min-h-10 px-5',
          lg: 'min-h-12 rounded-lg px-6 text-sm',
        }[size],
        className,
      )}
      {...props}
    />
  );
});
