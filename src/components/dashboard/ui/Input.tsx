import React, { forwardRef } from 'react';
import { cn } from './cn';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-950 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-950/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
        className,
      )}
      {...props}
    />
  );
});
