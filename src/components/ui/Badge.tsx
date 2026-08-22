import * as React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
  base: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
  variants: {
    variant: {
      default: "border-transparent bg-black text-white hover:bg-gray-800",
      secondary: "border-gray-200/80 bg-gray-100 text-gray-800 hover:bg-gray-200",
      destructive: "border-red-200 bg-red-50 text-red-700",
      outline: "border-gray-200 bg-white text-gray-800",
      
      // Semantic UI Variants for Map, Inventory & Dashboard
      neutral: "border-gray-200 bg-gray-50 text-gray-700",
      red: "border-red-200 bg-red-50 text-red-700",
      dark: "border-transparent bg-gray-900 text-white",
      green: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
      success: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
      amber: "border-amber-200/80 bg-amber-50 text-amber-800",
      warning: "border-amber-200/80 bg-amber-50 text-amber-800",
      blue: "border-blue-200/80 bg-blue-50 text-blue-800",
      info: "border-blue-200/80 bg-blue-50 text-blue-800",
    },
  }
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: keyof typeof badgeVariants.variants.variant;
}

export function badgeStyles({ variant = "default", className }: { variant?: keyof typeof badgeVariants.variants.variant, className?: string } = {}) {
  return cn(badgeVariants.base, badgeVariants.variants.variant[variant], className)
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={badgeStyles({ variant, className })} {...props} />
  )
}

export { Badge }

