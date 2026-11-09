import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[12px] border border-[#9C6B84] bg-white px-3.5 py-2 text-sm font-medium text-brand-text shadow-2xs transition-all placeholder:text-[#6B5560]/70 focus-visible:outline-none focus-visible:border-[#2F6FA8] focus-visible:ring-2 focus-visible:ring-[#2F6FA8]/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

