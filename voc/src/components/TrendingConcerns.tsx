import { useState } from "react"
import { Truck, Package, DollarSign, Clock, ChevronRight, Quote, Sparkles, ThumbsDown, Heart, Star, Award, Repeat, TrendingUp, MessageCircle } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

interface Concern {
  id: string
  label: string
  conversations: number
  trend: string
  trendDirection: "up" | "down"
  icon: React.ElementType
  color: string
  bgColor: string
  revenueImpact: string
  impactNum: number
  customerQuote: string
  customerName: string
  customerRole: string
  urgency: "critical" | "high" | "monitor"
  urgencyLabel: string
}

interface Advocate {
  id: string
  label: string
  conversations: number
  trend: string
  trendDirection: "up" | "down"
  icon: React.ElementType
  color: string
  bgColor: string
  loyaltyScore: string
  customerQuote: string
  customerName: string
  customerRole: string
  sentiment: "champion" | "loyal" | "satisfied"
  sentimentLabel: string
}

const timeFilters = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
]

const concerns: Concern[] = [
  {
    id: "delivery",
    label: "Delivery Delays",
    conversations: 423,
    trend: "+34%",
    trendDirection: "up",
    icon: Truck,
    color: "text-red-600",
    bgColor: "bg-red-50",
    revenueImpact: "₹28.4L",
    impactNum: 2840000,
    customerQuote: "Iss mahine do baar doosri company se parts lene pade kyunki delivery time pe nahi aayi.",
    customerName: "Suresh Kumar",
    customerRole: "Balaji Auto Workshop",
    urgency: "critical",
    urgencyLabel: "Escalating",
  },
  {
    id: "packaging",
    label: "Packaging Damage",
    conversations: 312,
    trend: "+18%",
    trendDirection: "up",
    icon: Package,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    revenueImpact: "₹22.1L",
    impactNum: 2210000,
    customerQuote: "Tin dented aaya toh customer ne lene se mana kar diya.",
    customerName: "Ramesh Verma",
    customerRole: "Krishna Paint Store",
    urgency: "critical",
    urgencyLabel: "Rising",
  },
  {
    id: "pricing",
    label: "Competitor Pricing",
    conversations: 124,
    trend: "+52%",
    trendDirection: "up",
    icon: DollarSign,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    revenueImpact: "₹15.6L",
    impactNum: 1560000,
    customerQuote: "Saamne wali dukaan mein same maal 8% sasta mil raha hai.",
    customerName: "Amit Shah",
    customerRole: "Shah Motors Dealer",
    urgency: "high",
    urgencyLabel: "Fastest growing",
  },
  {
    id: "invoice",
    label: "Invoice Discrepancies",
    conversations: 89,
    trend: "-12%",
    trendDirection: "down",
    icon: Clock,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    revenueImpact: "₹4.2L",
    impactNum: 420000,
    customerQuote: "Billing team ab theek ho gayi hai. Ab jaldi solve kar dete hain.",
    customerName: "Vikram Yadav",
    customerRole: "City Workshop",
    urgency: "monitor",
    urgencyLabel: "Improving",
  },
  {
    id: "stock",
    label: "Stock Availability",
    conversations: 67,
    trend: "+8%",
    trendDirection: "up",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    revenueImpact: "₹3.8L",
    impactNum: 380000,
    customerQuote: "Premium shade out of stock tha, customer doosri dukaan chala gaya.",
    customerName: "Rajan Patel",
    customerRole: "Patel Color House",
    urgency: "high",
    urgencyLabel: "Trending",
  },
]

const advocates: Advocate[] = [
  {
    id: "quality",
    label: "Product Quality",
    conversations: 287,
    trend: "+12%",
    trendDirection: "up",
    icon: Star,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    loyaltyScore: "9.2/10",
    customerQuote: "Tumhara paint finish sabse best hai market mein.",
    customerName: "Deepak Painter",
    customerRole: "Sharma Paint House",
    sentiment: "champion",
    sentimentLabel: "Brand Champion",
  },
  {
    id: "support",
    label: "DSR Support",
    conversations: 198,
    trend: "+24%",
    trendDirection: "up",
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    loyaltyScore: "8.8/10",
    customerQuote: "Ravi bhai jab bhi phone karo, turant response dete hain.",
    customerName: "Manoj Sharma",
    customerRole: "City Auto Workshop",
    sentiment: "champion",
    sentimentLabel: "Loyal Customer",
  },
  {
    id: "range",
    label: "Product Range",
    conversations: 156,
    trend: "+8%",
    trendDirection: "up",
    icon: Award,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    loyaltyScore: "8.5/10",
    customerQuote: "Ek hi jagah se sab mil jaata hai. One stop shop ban gaye hum.",
    customerName: "Prakash Gupta",
    customerRole: "Gupta Hardware",
    sentiment: "loyal",
    sentimentLabel: "Satisfied",
  },
  {
    id: "consistency",
    label: "Consistent Supply",
    conversations: 134,
    trend: "+15%",
    trendDirection: "up",
    icon: Repeat,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    loyaltyScore: "8.3/10",
    customerQuote: "Pichle 2 saal mein kabhi stock out nahi hua.",
    customerName: "Anil Mechanic",
    customerRole: "Anil Auto Services",
    sentiment: "loyal",
    sentimentLabel: "Repeat Buyer",
  },
  {
    id: "pricing",
    label: "Competitive Pricing",
    conversations: 98,
    trend: "+6%",
    trendDirection: "up",
    icon: DollarSign,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    loyaltyScore: "8.1/10",
    customerQuote: "Rate thoda zyada hai lekin quality ke hisaab se sahi hai.",
    customerName: "Dinesh Trader",
    customerRole: "Dinesh Hardware",
    sentiment: "satisfied",
    sentimentLabel: "Value Buyer",
  },
]

const concernsRadarData = [
  { subject: "Delivery", value: 85, fullMark: 100 },
  { subject: "Packaging", value: 65, fullMark: 100 },
  { subject: "Pricing", value: 45, fullMark: 100 },
  { subject: "Invoice", value: 20, fullMark: 100 },
  { subject: "Stock", value: 35, fullMark: 100 },
]

const advocatesRadarData = [
  { subject: "Quality", value: 92, fullMark: 100 },
  { subject: "DSR", value: 88, fullMark: 100 },
  { subject: "Range", value: 85, fullMark: 100 },
  { subject: "Supply", value: 83, fullMark: 100 },
  { subject: "Pricing", value: 78, fullMark: 100 },
]

const totalImpact = concerns.reduce((sum, c) => sum + c.impactNum, 0)
const criticalCount = concerns.filter(c => c.urgency === "critical").length
const championCount = advocates.filter(a => a.sentiment === "champion").length

export function TrendingConcerns() {
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [activeTab, setActiveTab] = useState<"concerns" | "advocates">("concerns")

  const items = activeTab === "concerns" ? concerns : advocates

  return (
    <div className="bg-white border border-border/60 rounded-2xl overflow-hidden">
      {/* Compact Header */}
      <div className="px-5 py-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg border border-border/40">
              <Sparkles className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-foreground">Customer Voice</h3>
              <p className="text-[12px] text-muted-foreground">What customers are saying</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5">
              {activeTab === "concerns" ? (
                <>
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-md">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-[10px] font-medium text-red-700">{criticalCount} critical</span>
                  </div>
                  <div className="px-2 py-1 bg-slate-50 rounded-md">
                    <span className="text-[10px] font-medium text-slate-600">₹{(totalImpact / 100000).toFixed(1)}L risk</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-md">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-700">{championCount} champions</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center bg-muted/50 rounded-md p-0.5">
              {timeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedPeriod(filter.value)}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium rounded transition-all",
                    selectedPeriod === filter.value
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-3 p-0.5 bg-muted/40 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("concerns")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
              activeTab === "concerns"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThumbsDown className={cn("h-3.5 w-3.5", activeTab === "concerns" ? "text-red-500" : "")} />
            Concerns
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              activeTab === "concerns" ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"
            )}>
              {concerns.reduce((sum, c) => sum + c.conversations, 0)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("advocates")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
              activeTab === "advocates"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", activeTab === "advocates" ? "text-emerald-500" : "")} />
            Advocates
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              activeTab === "advocates" ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
            )}>
              {advocates.reduce((sum, a) => sum + a.conversations, 0)}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Left - List */}
        <div className="flex-1 min-w-0 divide-y divide-border/40">
          {items.map((item, index) => {
            const Icon = item.icon
            const isConcern = activeTab === "concerns"
            const concern = item as Concern
            const advocate = item as Advocate

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 cursor-pointer transition-colors",
                  index === 0 && (isConcern ? "bg-red-50/30" : "bg-emerald-50/30")
                )}
              >
                <div className={cn("p-2 rounded-lg", item.bgColor)}>
                  <Icon className={cn("h-4 w-4", item.color)} strokeWidth={1.75} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-foreground">{item.label}</span>
                    {isConcern && concern.urgency !== "monitor" && (
                      <span className={cn(
                        "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                        concern.urgency === "critical" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {concern.urgencyLabel}
                      </span>
                    )}
                    {isConcern && concern.urgency === "monitor" && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                        {concern.urgencyLabel}
                      </span>
                    )}
                    {!isConcern && (
                      <span className={cn(
                        "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                        advocate.sentiment === "champion" ? "bg-emerald-100 text-emerald-600" :
                        advocate.sentiment === "loyal" ? "bg-blue-100 text-blue-600" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {advocate.sentimentLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{item.conversations} mentions</span>
                    <span className="text-slate-300">•</span>
                    <span className={cn(
                      "font-medium",
                      isConcern
                        ? (item.trendDirection === "up" ? "text-red-500" : "text-emerald-500")
                        : "text-emerald-500"
                    )}>
                      {item.trend}
                    </span>
                    {isConcern && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>{concern.revenueImpact}</span>
                      </>
                    )}
                    {!isConcern && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>{advocate.loyaltyScore}</span>
                      </>
                    )}
                  </div>
                  {index === 0 && (
                    <div className="flex items-start gap-1.5 mt-2">
                      <Quote className={cn("h-3 w-3 shrink-0 mt-0.5", isConcern ? "text-red-300" : "text-emerald-300")} />
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-1">
                        "{item.customerQuote}" — <span className="font-medium">{item.customerName}</span>
                      </p>
                    </div>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            )
          })}
        </div>

        {/* Right - Chart */}
        <div className="w-[240px] shrink-0 border-l border-border/40 p-4 bg-slate-50/30 hidden lg:block">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {activeTab === "concerns" ? "Issue Distribution" : "Strength Areas"}
          </h4>

          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={activeTab === "concerns" ? concernsRadarData : advocatesRadarData}
                margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
              >
                <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#64748b', fontSize: 9, fontWeight: 500 }}
                  tickLine={false}
                />
                <Radar
                  name="Value"
                  dataKey="value"
                  stroke={activeTab === "concerns" ? "#ef4444" : "#10b981"}
                  fill={activeTab === "concerns" ? "#ef4444" : "#10b981"}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-foreground text-background text-[10px] rounded px-2 py-1 shadow-lg">
                          {data.subject}: {data.value}%
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Compact Legend */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            {(activeTab === "concerns" ? concernsRadarData : advocatesRadarData).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground truncate">{item.subject}</span>
                <span className={cn(
                  "font-semibold ml-1",
                  activeTab === "concerns" ? "text-red-600" : "text-emerald-600"
                )}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>

          <div className={cn(
            "mt-3 p-2 rounded-md text-[10px] leading-relaxed",
            activeTab === "concerns" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          )}>
            {activeTab === "concerns"
              ? "Delivery dominates at 85%"
              : "Quality leads at 92%"
            }
          </div>
        </div>
      </div>

      {/* Compact Footer */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MessageCircle className="h-3 w-3" />
          <span>Based on <span className="font-medium text-foreground">1,258</span> conversations</span>
        </div>
        <button className="text-[11px] font-medium text-foreground hover:text-foreground/80 transition-colors flex items-center gap-1">
          Explore all
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
