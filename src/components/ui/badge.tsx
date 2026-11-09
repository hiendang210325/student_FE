import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold whitespace-nowrap select-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 rounded-[10px]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-[10px]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 rounded-[10px]",
        outline: "text-foreground rounded-[10px]",
        // Lớp Văn chị Vân brand pastel variants with 10-12px radius, strictly no rounded-full
        studying:
          "border-transparent bg-[#DCEBFA] text-[#1F4E79] rounded-[10px]",
        reserved:
          "border-transparent bg-[#FFE0EB] text-[#A61E4D] rounded-[10px]",
        leave:
          "border-transparent bg-[#EFE9ED] text-[#6B5560] rounded-[10px]",
        classChip:
          "border-transparent bg-[#E9F3FF] text-[#1F4E79] rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

