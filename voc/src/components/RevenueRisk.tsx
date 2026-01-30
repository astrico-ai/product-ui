import { useState } from "react"
import { TrendingUp, Truck, Package, Droplets, CreditCard, Target, Monitor, GraduationCap, Megaphone, ChevronRight, AlertTriangle, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskFactor {
  id: string
  label: string
  amount: string
  amountNum: number
  percentage: number
  customers: number
  trend: string
  trendDirection: "up" | "down"
  icon: React.ElementType
  color: string
  bgColor: string
  priority: "critical" | "high" | "medium" | "low"
}

const riskFactors: RiskFactor[] = [
  {
    id: "delivery",
    label: "Delivery Delays",
    amount: "₹28.4L",
    amountNum: 2840000,
    percentage: 29,
    customers: 423,
    trend: "+8%",
    trendDirection: "up",
    icon: Truck,
    color: "text-red-600",
    bgColor: "bg-red-500",
    priority: "critical",
  },
  {
    id: "packaging",
    label: "Packaging Issues",
    amount: "₹22.1L",
    amountNum: 2210000,
    percentage: 22,
    customers: 312,
    trend: "+12%",
    trendDirection: "up",
    icon: Package,
    color: "text-red-500",
    bgColor: "bg-red-400",
    priority: "critical",
  },
  {
    id: "spill",
    label: "Product Spill",
    amount: "₹16.8L",
    amountNum: 1680000,
    percentage: 17,
    customers: 198,
    trend: "+5%",
    trendDirection: "up",
    icon: Droplets,
    color: "text-amber-600",
    bgColor: "bg-amber-400",
    priority: "high",
  },
  {
    id: "billing",
    label: "Billing Issues",
    amount: "₹10.2L",
    amountNum: 1020000,
    percentage: 10,
    customers: 156,
    trend: "-3%",
    trendDirection: "down",
    icon: CreditCard,
    color: "text-slate-600",
    bgColor: "bg-slate-400",
    priority: "medium",
  },
  {
    id: "competitor",
    label: "Competitor Advantage",
    amount: "₹8.4L",
    amountNum: 840000,
    percentage: 9,
    customers: 124,
    trend: "+2%",
    trendDirection: "up",
    icon: Target,
    color: "text-slate-600",
    bgColor: "bg-slate-300",
    priority: "medium",
  },
  {
    id: "system",
    label: "System Issues",
    amount: "₹5.8L",
    amountNum: 580000,
    percentage: 6,
    customers: 87,
    trend: "-8%",
    trendDirection: "down",
    icon: Monitor,
    color: "text-slate-600",
    bgColor: "bg-slate-300",
    priority: "low",
  },
  {
    id: "training",
    label: "Training Issues",
    amount: "₹4.2L",
    amountNum: 420000,
    percentage: 4,
    customers: 62,
    trend: "-2%",
    trendDirection: "down",
    icon: GraduationCap,
    color: "text-slate-600",
    bgColor: "bg-slate-200",
    priority: "low",
  },
  {
    id: "marketing",
    label: "Marketing Issues",
    amount: "₹2.5L",
    amountNum: 250000,
    percentage: 3,
    customers: 38,
    trend: "+1%",
    trendDirection: "up",
    icon: Megaphone,
    color: "text-slate-600",
    bgColor: "bg-slate-200",
    priority: "low",
  },
]

const totalRiskNum = 9840000
const totalRisk = "₹98.4L"
const totalCustomers = 1400
const revenuePercentage = 12.4 // percentage of monthly revenue at risk
const monthlyChange = "+₹8.2L"
const criticalCount = riskFactors.filter(f => f.priority === "critical").length

const priorityConfig = {
  critical: { label: "Critical", color: "bg-red-500 text-white", dot: "bg-red-500" },
  high: { label: "High", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  medium: { label: "Medium", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  low: { label: "Low", color: "bg-slate-50 text-slate-500", dot: "bg-slate-300" },
}

export function RevenueRisk() {
  const [hoveredFactor, setHoveredFactor] = useState<string | null>(null)
  const maxAmount = Math.max(...riskFactors.map(f => f.amountNum))

  return (
    <div className="bg-white border border-border/60 rounded-2xl overflow-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-50 to-white p-6 border-b border-border/40">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Main metric */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">Revenue at Risk</h3>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground tracking-tight">{totalRisk}</span>
              <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                <ArrowUpRight className="h-4 w-4" />
                <span>{monthlyChange} this month</span>
              </div>
            </div>

            <p className="text-[13px] text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{revenuePercentage}%</span> of monthly revenue across <span className="font-medium text-foreground">{totalCustomers.toLocaleString()}</span> customers
            </p>
          </div>

          {/* Right: Quick stats */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-3 bg-white rounded-xl border border-border/60 shadow-sm min-w-[120px]">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</p>
            </div>
            <div className="px-4 py-3 bg-white rounded-xl border border-border/60 shadow-sm min-w-[120px]">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Avg per Customer</p>
              <p className="text-2xl font-bold text-foreground mt-1">₹7,028</p>
            </div>
            <div className="px-4 py-3 bg-white rounded-xl border border-border/60 shadow-sm min-w-[120px]">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Recoverable</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">₹60.5L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Bar Visualization */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-medium text-muted-foreground">Risk Distribution</span>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="text-muted-foreground">Medium/Low</span>
            </div>
          </div>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden flex bg-muted/20">
          {riskFactors.map((factor, index) => (
            <div
              key={factor.id}
              className={cn(
                "h-full transition-all duration-300 cursor-pointer relative group",
                factor.bgColor,
                hoveredFactor && hoveredFactor !== factor.id ? "opacity-40" : "opacity-100",
                index === 0 && "rounded-l-full",
                index === riskFactors.length - 1 && "rounded-r-full"
              )}
              style={{ width: `${factor.percentage}%` }}
              onMouseEnter={() => setHoveredFactor(factor.id)}
              onMouseLeave={() => setHoveredFactor(null)}
            >
              {/* Tooltip */}
              {hoveredFactor === factor.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-foreground text-background text-[11px] rounded-md whitespace-nowrap z-10 shadow-lg">
                  <span className="font-medium">{factor.label}</span>: {factor.amount} ({factor.percentage}%)
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors List */}
      <div className="px-6 pb-4">
        <div className="divide-y divide-border/40">
          {riskFactors.map((factor, index) => {
            const Icon = factor.icon
            const barWidth = (factor.amountNum / totalRiskNum) * 100
            const config = priorityConfig[factor.priority]

            return (
              <div
                key={factor.id}
                className={cn(
                  "group flex items-center gap-4 py-4 transition-all duration-200 cursor-pointer",
                  hoveredFactor === factor.id && "bg-muted/30 -mx-3 px-3 rounded-lg"
                )}
                onMouseEnter={() => setHoveredFactor(factor.id)}
                onMouseLeave={() => setHoveredFactor(null)}
              >
                {/* Rank */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                  factor.priority === "critical" ? "bg-red-100 text-red-600" :
                  factor.priority === "high" ? "bg-amber-100 text-amber-600" :
                  "bg-slate-100 text-slate-500"
                )}>
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={cn(
                  "p-2.5 rounded-xl",
                  factor.priority === "critical" ? "bg-red-50" :
                  factor.priority === "high" ? "bg-amber-50" :
                  "bg-slate-50"
                )}>
                  <Icon className={cn("h-4 w-4", factor.color)} strokeWidth={1.75} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-foreground">{factor.label}</span>
                    {(factor.priority === "critical" || factor.priority === "high") && (
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        config.color
                      )}>
                        {config.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Progress bar */}
                    <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden max-w-[200px]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          factor.priority === "critical" ? "bg-red-400" :
                          factor.priority === "high" ? "bg-amber-400" :
                          "bg-slate-300"
                        )}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{factor.customers} customers</span>
                  </div>
                </div>

                {/* Trend */}
                <div
                  className={cn(
                    "flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-md",
                    factor.trendDirection === "up"
                      ? "text-red-600 bg-red-50"
                      : "text-emerald-600 bg-emerald-50"
                  )}
                >
                  <TrendingUp className={cn("h-3.5 w-3.5", factor.trendDirection === "down" && "rotate-180")} />
                  {factor.trend}
                </div>

                {/* Amount */}
                <div className="text-right min-w-[80px]">
                  <p className={cn(
                    "text-[15px] font-bold",
                    factor.priority === "critical" ? "text-red-600" :
                    factor.priority === "high" ? "text-amber-600" :
                    "text-foreground"
                  )}>
                    {factor.amount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{factor.percentage}% of total</p>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600 rotate-180" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">
                Potential Recovery: <span className="text-emerald-600 font-bold">₹60.5L</span>
              </p>
              <p className="text-[11px] text-muted-foreground">By addressing top 3 critical issues</p>
            </div>
          </div>
          <button className="px-4 py-2 text-[12px] font-semibold bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-2">
            View Action Plan
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
