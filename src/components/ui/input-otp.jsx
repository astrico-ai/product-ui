import * as React from "react"
import { OTPInput } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef(({ className, ...props }, ref) => (
  <OTPInput ref={ref} containerClassName={cn("flex items-center gap-2", className)} {...props} />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef(({ char, hasFakeCaret, isActive, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-10 w-10 rounded-md text-sm ring-offset-background transition-all duration-100",
        "border border-input bg-background",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        isActive && "ring-2 ring-ring ring-offset-2",
        className
      )}
      {...props}
    >
      {char ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {char}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Dot className="h-4 w-4 fill-current opacity-20" />
        </div>
      )}
      {hasFakeCaret && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret bg-foreground duration-500" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot className="h-4 w-4 fill-current opacity-20" />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } 