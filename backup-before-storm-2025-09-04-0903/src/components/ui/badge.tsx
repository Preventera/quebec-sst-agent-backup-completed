import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 forced-colors:border forced-colors:border-solid",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // LMRSST compliance badges with icons for accessibility
        compliant: "border-transparent bg-success text-success-foreground before:content-['✓'] before:mr-1",
        "non-compliant": "border-transparent bg-destructive text-destructive-foreground before:content-['⚠'] before:mr-1",
        warning: "border-transparent bg-orange-500 text-white before:content-['⚠'] before:mr-1",
        pending: "border-transparent bg-warning text-warning-foreground before:content-['●'] before:mr-1",
        "art-101": "border-transparent bg-blue-600 text-white before:content-['§'] before:mr-1",
        "art-90": "border-transparent bg-purple-600 text-white before:content-['§'] before:mr-1",
        "art-123": "border-transparent bg-orange-600 text-white before:content-['§'] before:mr-1",
        "art-27": "border-transparent bg-green-600 text-white before:content-['§'] before:mr-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  // WCAG compliance props
  'aria-label'?: string
  complianceStatus?: 'compliant' | 'non-compliant' | 'pending' | 'warning'
  legalReference?: 'art-101' | 'art-90' | 'art-123' | 'art-27'
}

function Badge({ className, variant, complianceStatus, legalReference, ...props }: BadgeProps) {
  const effectiveVariant = complianceStatus || legalReference || variant
  
  return (
    <div 
      className={cn(badgeVariants({ variant: effectiveVariant }), className)} 
      role="status"
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
