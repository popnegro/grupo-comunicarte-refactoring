import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  variants: {
    variant: {
      default: "bg-black text-white hover:bg-gray-800 shadow-sm",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      outline: "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      ghost: "hover:bg-gray-100 text-gray-700 hover:text-gray-900",
      link: "text-black underline-offset-4 hover:underline",
      dark: "bg-gray-900 text-white hover:bg-black shadow-sm",
    },
    size: {
      default: "h-11 px-6 py-2",
      sm: "h-9 rounded-md px-4",
      lg: "h-14 rounded-xl px-8 text-base",
      icon: "h-10 w-10",
    },
  }
}

export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: keyof typeof buttonVariants.variants.variant;
  size?: keyof typeof buttonVariants.variants.size;
}

export function buttonStyles({ 
  variant = "default", 
  size = "default", 
  className 
}: { 
  variant?: keyof typeof buttonVariants.variants.variant, 
  size?: keyof typeof buttonVariants.variants.size, 
  className?: string 
} = {}) {
  return cn(buttonVariants.base, buttonVariants.variants.variant[variant], buttonVariants.variants.size[size], className)
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={buttonStyles({ variant: variant as any, size: size as any, className })}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
