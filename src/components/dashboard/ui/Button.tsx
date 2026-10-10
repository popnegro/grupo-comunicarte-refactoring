import React, { forwardRef } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Dashboard button aligned with public primary (black) language. */
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gray-950 text-white hover:bg-gray-800 focus-visible:ring-black/20',
  secondary: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-black/20',
  ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 focus-visible:ring-black/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/30',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-5 text-sm rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
