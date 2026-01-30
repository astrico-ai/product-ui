import { useState } from "react"
import { TrendingUp, TrendingDown, MessageSquare, AlertTriangle, DollarSign, UserX, AlertCircle, ThumbsUp, RefreshCw, ChevronDown, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Metric {
  label: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  trendPositive: boolean
  icon: React.ElementType
  iconColor: string
  iconBg: string
  description?: string
}

const timeFilters = ["3M", "6M", "1Y", "Custom"]

const dsrOptions = [
  { id: "all", name: "All DSRs" },
  { id: "dsr1", name: "Amit Sharma" },
  { id: "dsr2", name: "Priya Patel" },
  { id: "dsr3", name: "Rajesh Kumar" },
  { id: "dsr4", name: "Sneha Gupta" },
  { id: "dsr5", name: "Vikram Singh" },
]

// Data varies by time period
const metricsByPeriod = {
  "3M": {
    primary: [
      { label: "Total Feedback", value: "3,214", change: "+8%", trend: "up" as const, trendPositive: true },
      { label: "Total Complaints", value: "712", change: "+5%", trend: "up" as const, trendPositive: false },
      { label: "Revenue at Risk", value: "₹24.6L", change: "+₹3.2L", trend: "up" as const, trendPositive: false },
      { label: "Churn Risk", value: "198", change: "+12", trend: "up" as const, trendPositive: false },
    ],
    secondary: [
      { label: "Top Issue", value: "Delivery", change: "98 cases", trend: "up" as const, trendPositive: false },
      { label: "Negative Sentiment", value: "462", change: "+9%", trend: "up" as const, trendPositive: false },
      { label: "Avg Happiness Score", value: "7.2", change: "+0.3", trend: "up" as const, trendPositive: true },
      { label: "Repeat Issues", value: "78", change: "-3%", trend: "down" as const, trendPositive: true },
    ],
  },
  "6M": {
    primary: [
      { label: "Total Feedback", value: "12,847", change: "+12%", trend: "up" as const, trendPositive: true },
      { label: "Total Complaints", value: "2,847", change: "+8%", trend: "up" as const, trendPositive: false },
      { label: "Revenue at Risk", value: "₹98.4L", change: "+₹14.8L", trend: "up" as const, trendPositive: false },
      { label: "Churn Risk", value: "847", change: "+23", trend: "up" as const, trendPositive: false },
    ],
    secondary: [
      { label: "Top Issue", value: "Delivery", change: "423 cases", trend: "up" as const, trendPositive: false },
      { label: "Negative Sentiment", value: "1,847", change: "+12%", trend: "up" as const, trendPositive: false },
      { label: "Avg Happiness Score", value: "7.4", change: "+0.6", trend: "up" as const, trendPositive: true },
      { label: "Repeat Issues", value: "312", change: "-5%", trend: "down" as const, trendPositive: true },
    ],
  },
  "1Y": {
    primary: [
      { label: "Total Feedback", value: "28,493", change: "+18%", trend: "up" as const, trendPositive: true },
      { label: "Total Complaints", value: "6,284", change: "+11%", trend: "up" as const, trendPositive: false },
      { label: "Revenue at Risk", value: "₹2.1Cr", change: "+₹32L", trend: "up" as const, trendPositive: false },
      { label: "Churn Risk", value: "1,847", change: "+156", trend: "up" as const, trendPositive: false },
    ],
    secondary: [
      { label: "Top Issue", value: "Quality", change: "892 cases", trend: "up" as const, trendPositive: false },
      { label: "Negative Sentiment", value: "4,128", change: "+15%", trend: "up" as const, trendPositive: false },
      { label: "Avg Happiness Score", value: "7.1", change: "+0.4", trend: "up" as const, trendPositive: true },
      { label: "Repeat Issues", value: "687", change: "-8%", trend: "down" as const, trendPositive: true },
    ],
  },
}

const metricIcons = {
  "Total Feedback": { icon: MessageSquare, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
  "Total Complaints": { icon: AlertTriangle, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
  "Revenue at Risk": { icon: DollarSign, iconColor: "text-red-600", iconBg: "bg-red-50" },
  "Churn Risk": { icon: UserX, iconColor: "text-rose-600", iconBg: "bg-rose-50" },
  "Top Issue": { icon: AlertCircle, iconColor: "text-orange-600", iconBg: "bg-orange-50" },
  "Negative Sentiment": { icon: AlertCircle, iconColor: "text-red-600", iconBg: "bg-red-50" },
  "Avg Happiness Score": { icon: ThumbsUp, iconColor: "text-green-600", iconBg: "bg-green-50" },
  "Repeat Issues": { icon: RefreshCw, iconColor: "text-violet-600", iconBg: "bg-violet-50" },
}

const metricDescriptions: Record<string, string> = {
  "Total Feedback": "vs last period",
  "Total Complaints": "vs last period",
  "Revenue at Risk": "from complaints",
  "Churn Risk": "customers flagged",
  "Top Issue": "most reported",
  "Negative Sentiment": "flagged this period",
  "Avg Happiness Score": "out of 10",
  "Repeat Issues": "vs last period",
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon

  return (
    <div className="group bg-white border border-border/60 rounded-xl p-5 hover:shadow-md hover:border-border transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-lg", metric.iconBg)}>
          <Icon className={cn("h-5 w-5", metric.iconColor)} strokeWidth={1.75} />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            metric.trendPositive
              ? "text-emerald-700 bg-emerald-50"
              : "text-red-700 bg-red-50"
          )}
        >
          {metric.trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {metric.change}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[13px] text-muted-foreground font-medium">{metric.label}</p>
        <p className="text-2xl font-semibold text-foreground mt-0.5 tracking-tight">
          {metric.value}
        </p>
        {metric.description && (
          <p className="text-[11px] text-muted-foreground mt-1">{metric.description}</p>
        )}
      </div>
    </div>
  )
}

export function MetricsBar() {
  const [expanded, setExpanded] = useState(false)
  const [selectedTime, setSelectedTime] = useState("6M")
  const [selectedDsr, setSelectedDsr] = useState("all")
  const [dsrDropdownOpen, setDsrDropdownOpen] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const selectedDsrName = dsrOptions.find(d => d.id === selectedDsr)?.name || "All DSRs"

  // Get current period data (use 6M data for Custom)
  const currentPeriod = selectedTime === "Custom" ? "6M" : selectedTime
  const periodData = metricsByPeriod[currentPeriod as keyof typeof metricsByPeriod]

  // Build metrics with icons
  const primaryMetrics: Metric[] = periodData.primary.map(m => ({
    ...m,
    ...metricIcons[m.label as keyof typeof metricIcons],
    description: metricDescriptions[m.label],
  }))

  const secondaryMetrics: Metric[] = periodData.secondary.map(m => ({
    ...m,
    ...metricIcons[m.label as keyof typeof metricIcons],
    description: metricDescriptions[m.label],
  }))

  const handleTimeSelect = (filter: string) => {
    if (filter === "Custom") {
      setShowDatePicker(!showDatePicker)
      setSelectedTime(filter)
    } else {
      setSelectedTime(filter)
      setShowDatePicker(false)
    }
  }

  const formatDateRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      const end = new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      return `${start} - ${end}`
    }
    return "Custom"
  }

  return (
    <div className="bg-white border border-border/60 rounded-2xl p-6">
      {/* Section Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Key Metrics</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">Performance overview for your team</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Period Filter */}
          <div className="relative flex items-center bg-muted/50 rounded-lg p-1">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleTimeSelect(filter)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-medium rounded-md transition-all duration-150",
                  selectedTime === filter
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter === "Custom" ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {selectedTime === "Custom" && startDate && endDate ? formatDateRange() : filter}
                  </span>
                ) : (
                  filter
                )}
              </button>
            ))}

            {/* Date Picker Popover */}
            {showDatePicker && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDatePicker(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white border border-border/60 rounded-xl shadow-lg p-4 z-20 min-w-[280px]">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-[13px] bg-muted/30 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-[13px] bg-muted/30 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:bg-white transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="w-full mt-2 px-3 py-2 text-[12px] font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* DSR Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDsrDropdownOpen(!dsrDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg text-[12px] font-medium text-foreground transition-colors min-w-[140px]"
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 text-left truncate">{selectedDsrName}</span>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                dsrDropdownOpen && "rotate-180"
              )} />
            </button>

            {dsrDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDsrDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border/60 rounded-lg shadow-lg py-1 z-20">
                  {dsrOptions.map((dsr) => (
                    <button
                      key={dsr.id}
                      onClick={() => {
                        setSelectedDsr(dsr.id)
                        setDsrDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-[13px] transition-colors",
                        selectedDsr === dsr.id
                          ? "bg-muted/70 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {dsr.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {primaryMetrics.map((metric, index) => (
          <MetricCard key={`primary-${index}`} metric={metric} />
        ))}
        {secondaryMetrics.map((metric, index) => (
          <div
            key={`secondary-${index}`}
            className={cn(
              "transition-all duration-300 ease-in-out",
              expanded ? "opacity-100 translate-y-0" : "hidden"
            )}
          >
            <MetricCard metric={metric} />
          </div>
        ))}
      </div>

      {/* Expand/Collapse Toggle */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
          <span>{expanded ? "Show less" : "Show 4 more metrics"}</span>
        </button>
      </div>
    </div>
  )
}
