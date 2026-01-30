import { useState } from "react"
import { Lightbulb, TrendingUp, TrendingDown, Minus, Zap, ArrowRight, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { cn } from "@/lib/utils"

type InsightType = "positive" | "no-impact" | "negative" | "emerging"

interface Insight {
  id: string
  title: string
  segment: string
  region: string
  type: InsightType
  action: string
  outcome: string
  timeframe: string
  narrative: string
  actionMetric: { label: string; value: string; direction: "up" | "down" | "flat" }
  outcomeMetric: { label: string; value: string; direction: "up" | "down" | "flat" }
  chartData: { month: string; action: number; outcome: number }[]
}

const insights: Insight[] = [
  {
    id: "south-painters-dsr",
    title: "DSR Meetings → Volume Growth",
    segment: "Painters",
    region: "South India",
    type: "positive",
    action: "20% increase in sales rep meetings over 3 months",
    outcome: "5% volume increase in South region",
    timeframe: "Oct – Dec 2024",
    narrative: "Increased DSR engagement with painters in the South has directly translated into higher order volumes. The correlation is strongest in Tier 2 cities where face-to-face interactions remain the primary purchase driver.",
    actionMetric: { label: "DSR Meetings", value: "+20%", direction: "up" },
    outcomeMetric: { label: "Volume", value: "+5%", direction: "up" },
    chartData: [
      { month: "Jul", action: 40, outcome: 50 },
      { month: "Aug", action: 42, outcome: 50 },
      { month: "Sep", action: 44, outcome: 51 },
      { month: "Oct", action: 48, outcome: 52 },
      { month: "Nov", action: 53, outcome: 53 },
      { month: "Dec", action: 58, outcome: 55 },
    ],
  },
  {
    id: "maha-advocates",
    title: "Advocate Growth ≠ Business Impact",
    segment: "Advocates",
    region: "Maharashtra",
    type: "no-impact",
    action: "50% increase in brand advocates",
    outcome: "No substantial business volume change",
    timeframe: "Sep – Dec 2024",
    narrative: "Despite a sharp rise in brand advocates across Maharashtra, there has been no measurable uplift in order value or repeat purchase rates. Advocacy may be driven by loyalty programs rather than genuine purchase intent.",
    actionMetric: { label: "Advocates", value: "+50%", direction: "up" },
    outcomeMetric: { label: "Business Volume", value: "+0.3%", direction: "flat" },
    chartData: [
      { month: "Jul", action: 30, outcome: 48 },
      { month: "Aug", action: 35, outcome: 47 },
      { month: "Sep", action: 42, outcome: 49 },
      { month: "Oct", action: 50, outcome: 48 },
      { month: "Nov", action: 58, outcome: 48 },
      { month: "Dec", action: 65, outcome: 49 },
    ],
  },
  {
    id: "north-delivery",
    title: "Delivery Complaints → Order Value Drop",
    segment: "Dealers",
    region: "North India",
    type: "negative",
    action: "34% rise in delivery delay complaints",
    outcome: "8% decline in average order value",
    timeframe: "Oct – Dec 2024",
    narrative: "Persistent delivery issues in the North are eroding dealer confidence. Affected dealers are placing smaller, more frequent orders — or splitting orders across suppliers to hedge against delays.",
    actionMetric: { label: "Complaints", value: "+34%", direction: "up" },
    outcomeMetric: { label: "Avg Order Value", value: "-8%", direction: "down" },
    chartData: [
      { month: "Jul", action: 25, outcome: 60 },
      { month: "Aug", action: 28, outcome: 58 },
      { month: "Sep", action: 32, outcome: 57 },
      { month: "Oct", action: 40, outcome: 55 },
      { month: "Nov", action: 48, outcome: 52 },
      { month: "Dec", action: 55, outcome: 50 },
    ],
  },
  {
    id: "west-digital",
    title: "App Adoption → Repeat Orders (Early Signal)",
    segment: "Retailers",
    region: "West India",
    type: "emerging",
    action: "40% increase in app-based ordering",
    outcome: "Early signs of 3% repeat order increase",
    timeframe: "Nov – Dec 2024",
    narrative: "Retailers in the West who adopted the ordering app are showing early signs of higher repeat purchase rates. The signal is still forming — needs another quarter to confirm, but directionally encouraging.",
    actionMetric: { label: "App Orders", value: "+40%", direction: "up" },
    outcomeMetric: { label: "Repeat Orders", value: "+3%", direction: "up" },
    chartData: [
      { month: "Jul", action: 10, outcome: 44 },
      { month: "Aug", action: 14, outcome: 44 },
      { month: "Sep", action: 18, outcome: 45 },
      { month: "Oct", action: 25, outcome: 45 },
      { month: "Nov", action: 35, outcome: 46 },
      { month: "Dec", action: 50, outcome: 47 },
    ],
  },
]

const typeConfig: Record<InsightType, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  chartActionColor: string
  chartOutcomeColor: string
  icon: typeof TrendingUp
}> = {
  positive: {
    label: "Positive Correlation",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-l-emerald-500",
    chartActionColor: "#10b981",
    chartOutcomeColor: "#059669",
    icon: TrendingUp,
  },
  "no-impact": {
    label: "No Impact",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-l-slate-400",
    chartActionColor: "#6b7280",
    chartOutcomeColor: "#94a3b8",
    icon: Minus,
  },
  negative: {
    label: "Watch",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-500",
    chartActionColor: "#ef4444",
    chartOutcomeColor: "#f97316",
    icon: TrendingDown,
  },
  emerging: {
    label: "Emerging Signal",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-500",
    chartActionColor: "#3b82f6",
    chartOutcomeColor: "#6366f1",
    icon: Zap,
  },
}

function InsightCard({ insight }: { insight: Insight }) {
  const config = typeConfig[insight.type]
  const TypeIcon = config.icon

  return (
    <div className={cn(
      "bg-white border border-border/60 rounded-2xl overflow-hidden border-l-4",
      config.borderColor
    )}>
      <div className="p-6">
        {/* Top Row: Tag + Segment/Region + Timeframe */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold", config.bgColor, config.color)}>
              <TypeIcon className="h-3 w-3" />
              {config.label}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/60 rounded-md text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" />
              {insight.segment}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/60 rounded-md text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {insight.region}
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">{insight.timeframe}</span>
        </div>

        {/* Title */}
        <h4 className="text-[16px] font-semibold text-foreground mb-4">{insight.title}</h4>

        {/* Main content: Chart left, Metrics + Narrative right */}
        <div className="flex gap-6">
          {/* Chart */}
          <div className="flex-1 min-w-0">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insight.chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id={`grad-action-${insight.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={config.chartActionColor} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={config.chartActionColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id={`grad-outcome-${insight.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={config.chartOutcomeColor} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={config.chartOutcomeColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-foreground text-background text-[10px] rounded-md px-2.5 py-1.5 shadow-lg">
                            <p className="font-medium mb-0.5">{label}</p>
                            <p>{insight.actionMetric.label}: {payload[0].value}</p>
                            <p>{insight.outcomeMetric.label}: {payload[1].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="action"
                    stroke={config.chartActionColor}
                    fill={`url(#grad-action-${insight.id})`}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="outcome"
                    stroke={config.chartOutcomeColor}
                    fill={`url(#grad-outcome-${insight.id})`}
                    strokeWidth={2}
                    strokeDasharray={insight.type === "emerging" ? "4 4" : undefined}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 rounded-full" style={{ backgroundColor: config.chartActionColor }} />
                <span className="text-[10px] text-muted-foreground">{insight.actionMetric.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-0.5 w-4 rounded-full"
                  style={{
                    backgroundColor: config.chartOutcomeColor,
                    ...(insight.type === "emerging" ? { backgroundImage: `repeating-linear-gradient(90deg, ${config.chartOutcomeColor} 0, ${config.chartOutcomeColor} 3px, transparent 3px, transparent 6px)`, backgroundColor: 'transparent' } : {})
                  }}
                />
                <span className="text-[10px] text-muted-foreground">{insight.outcomeMetric.label}</span>
              </div>
            </div>
          </div>

          {/* Right side: Metrics + Narrative */}
          <div className="w-[320px] shrink-0">
            {/* Metrics Row */}
            <div className="flex items-stretch gap-3 mb-4">
              <div className="flex-1 bg-slate-50/80 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Action</p>
                <span className="text-[18px] font-bold text-foreground">
                  {insight.actionMetric.value}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{insight.action}</p>
              </div>

              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </div>

              <div className="flex-1 bg-slate-50/80 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Outcome</p>
                <span className={cn(
                  "text-[18px] font-bold",
                  insight.outcomeMetric.direction === "up" ? "text-emerald-600" :
                  insight.outcomeMetric.direction === "down" ? "text-red-600" :
                  "text-slate-500"
                )}>
                  {insight.outcomeMetric.value}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{insight.outcome}</p>
              </div>
            </div>

            {/* Narrative */}
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {insight.narrative}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InsightsBoard() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < insights.length - 1

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg border border-amber-200/60">
            <Lightbulb className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Insights Board</h3>
            <p className="text-[12px] text-muted-foreground">How feedback actions are translating to business outcomes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Page Indicator */}
          <span className="text-[12px] text-muted-foreground">
            {currentIndex + 1} / {insights.length}
          </span>

          {/* Nav Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex(i => i - 1)}
              disabled={!hasPrev}
              className={cn(
                "p-1.5 rounded-lg border border-border/60 transition-colors",
                hasPrev ? "text-foreground hover:bg-muted/70" : "text-slate-300 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              disabled={!hasNext}
              className={cn(
                "p-1.5 rounded-lg border border-border/60 transition-colors",
                hasNext ? "text-foreground hover:bg-muted/70" : "text-slate-300 cursor-not-allowed"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Single Card */}
      <InsightCard insight={insights[currentIndex]} />
    </div>
  )
}
