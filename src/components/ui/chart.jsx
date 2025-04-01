import * as React from "react"
import { cn } from "@/lib/utils"

const Chart = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full h-full min-h-[200px]", className)}
    {...props}
  />
))
Chart.displayName = "Chart"

export { Chart } 