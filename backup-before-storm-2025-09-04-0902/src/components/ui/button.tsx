import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px] forced-colors:border forced-colors:border-solid",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        // LMRSST compliance variants
        compliant: "bg-success text-success-foreground hover:bg-success/90 before:content-['✓'] before:mr-2",
        "non-compliant": "bg-destructive text-destructive-foreground hover:bg-destructive/90 before:content-['⚠'] before:mr-2",
        pending: "bg-warning text-warning-foreground hover:bg-warning/90 before:content-['●'] before:mr-2",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-[44px]",
        sm: "h-9 rounded-md px-3 min-w-[44px]",
        lg: "h-11 rounded-md px-8 min-w-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  // WCAG compliance props
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-controls'?: string
  complianceLevel?: 'compliant' | 'non-compliant' | 'pending'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, complianceLevel, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const effectiveVariant = complianceLevel || variant
    
    return (
      <Comp
        className={cn(buttonVariants({ variant: effectiveVariant, size, className }))}
        ref={ref}
        role={asChild ? undefined : "button"}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
