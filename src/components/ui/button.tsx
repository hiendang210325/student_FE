import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6FA8]/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-raspberry text-white shadow-sm hover:bg-[#be265d]",
        raspberry:
          "bg-brand-raspberry text-white shadow-sm hover:bg-[#be265d]",
        blueAction:
          "bg-brand-blueAction text-white shadow-sm hover:bg-[#255784]",
        outlineBlue:
          "border border-[#2F6FA8] text-[#2F6FA8] bg-transparent hover:bg-[#E9F3FF]",
        deletePermanent:
          "text-[#B02525] bg-transparent hover:bg-[#FFF0F0]",
        destructive:
          "bg-[#B02525] text-white shadow-sm hover:bg-[#961f1f]",
        outline:
          "border border-[#9C6B84] text-brand-text bg-white shadow-xs hover:bg-slate-50",
        secondary:
          "bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DBEAFE]",
        ghost:
          "text-[#6B5560] hover:bg-[#FFF6F9] hover:text-brand-text",
        link:
          "text-brand-raspberry underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-8 rounded-[10px] px-3 text-xs",
        lg: "h-12 rounded-[12px] px-6 text-base",
        icon: "h-9 w-9 rounded-[10px]",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

