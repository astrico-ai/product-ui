import { useState } from "react"
import { MapPin, RefreshCw, Layers, TrendingDown, ChevronRight, AlertCircle, Users, Building2, Repeat, ShoppingCart, Package, Clock, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

interface StoryData {
  concernId: string
  concernLabel: string

  // Block 1: Spread
  spread: {
    summary: string
    regions: { name: string; intensity: "high" | "medium" | "low" }[]
    channels: { name: string; percentage: number }[]
    customerTypes: { type: string; count: number }[]
  }

  // Block 2: Repetition
  repetition: {
    summary: string
    repeatAccounts: number
    totalAccounts: number
    avgMentionsPerAccount: number
    weekOverWeekChange: string
    topRepeaters: { name: string; mentions: number; trend: string }[]
  }

  // Block 3: Sub-issues
  subIssues: {
    summary: string
    issues: { label: string; mentions: number; example: string }[]
  }

  // Block 4: Behavior Change
  behaviorChange: {
    summary: string
    behaviors: {
      action: string
      percentage: number
      description: string
      icon: React.ElementType
    }[]
  }
}

// Story data for the top concern (Delivery Delays)
const storyData: StoryData = {
  concernId: "delivery",
  concernLabel: "Delivery Delays",

  spread: {
    summary: "Started in North India but now appearing across all major regions. Workshops and dealers are most affected.",
    regions: [
      { name: "North India", intensity: "high" },
      { name: "West India", intensity: "high" },
      { name: "South India", intensity: "medium" },
      { name: "East India", intensity: "low" },
    ],
    channels: [
      { name: "Direct", percentage: 58 },
      { name: "Distributor", percentage: 32 },
      { name: "Retail", percentage: 10 },
    ],
    customerTypes: [
      { type: "Workshops", count: 189 },
      { type: "Dealers", count: 134 },
      { type: "Retailers", count: 67 },
      { type: "Painters", count: 33 },
    ],
  },

  repetition: {
    summary: "The same accounts keep raising this issue. 67% of complaints come from customers who have mentioned this before.",
    repeatAccounts: 284,
    totalAccounts: 423,
    avgMentionsPerAccount: 2.4,
    weekOverWeekChange: "+18%",
    topRepeaters: [
      { name: "Balaji Auto Workshop", mentions: 8, trend: "Mentioned every week for 2 months" },
      { name: "Krishna Mechanics", mentions: 6, trend: "Getting more frequent" },
      { name: "Shah Motors", mentions: 5, trend: "Started 3 weeks ago" },
    ],
  },

  subIssues: {
    summary: "When customers say 'delivery delay', they mean different things. Here's what they're actually experiencing.",
    issues: [
      {
        label: "Order not arriving on promised date",
        mentions: 187,
        example: "Bola tha Friday tak aayega, Monday ho gaya abhi tak nahi aaya"
      },
      {
        label: "No tracking or status updates",
        mentions: 124,
        example: "Koi update nahi milta, phone karo toh pata nahi bolte hain"
      },
      {
        label: "Partial shipments without notice",
        mentions: 78,
        example: "Order 50 ka tha, 30 bheja bina bataye"
      },
      {
        label: "Wrong delivery location",
        mentions: 34,
        example: "Doosri branch pe bhej diya, yahan customer wait kar raha tha"
      },
    ],
  },

  behaviorChange: {
    summary: "Customers aren't just complaining — they're changing how they buy. These patterns show early signs of demand impact.",
    behaviors: [
      {
        action: "Ordering from competitors",
        percentage: 34,
        description: "1 in 3 affected customers have sourced from competitors at least once this month",
        icon: ShoppingCart,
      },
      {
        action: "Increasing safety stock",
        percentage: 28,
        description: "Ordering 15-20% more than needed to buffer against delays",
        icon: Package,
      },
      {
        action: "Delaying orders",
        percentage: 22,
        description: "Waiting longer to place orders, consolidating to reduce risk",
        icon: Clock,
      },
      {
        action: "Switching primary supplier",
        percentage: 12,
        description: "Have moved majority business to another supplier",
        icon: Truck,
      },
    ],
  },
}

const blockConfig = [
  {
    id: "spread",
    title: "Where it's showing up",
    icon: MapPin,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "repetition",
    title: "How it's persisting",
    icon: Repeat,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "subissues",
    title: "What's actually going wrong",
    icon: Layers,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    id: "behavior",
    title: "How customers are responding",
    icon: TrendingDown,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
]

export function ConcernStoryboard() {
  const [activeBlock, setActiveBlock] = useState<string | null>(null)

  return (
    <div className="bg-white border border-border/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2.5 py-1 bg-red-50 rounded-lg">
                <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">
                  Tracking: {storyData.concernLabel}
                </span>
              </div>
            </div>
            <h3 className="text-[17px] font-semibold text-foreground">
              How this issue is unfolding in the market
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-2xl">
              Understanding how delivery concerns spread across regions, persist over time, and begin affecting customer behavior
            </p>
          </div>

          <button className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-1.5">
            Change concern
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Block Navigation */}
        <div className="flex items-center gap-2 mt-5">
          {blockConfig.map((block, index) => (
            <div key={block.id} className="flex items-center">
              <button
                onClick={() => setActiveBlock(activeBlock === block.id ? null : block.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all",
                  activeBlock === block.id
                    ? `${block.bgColor} ${block.color}`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <block.icon className="h-3.5 w-3.5" />
                {block.title}
              </button>
              {index < blockConfig.length - 1 && (
                <ChevronRight className="h-4 w-4 text-slate-300 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Story Blocks */}
      <div className="divide-y divide-border/40">
        {/* Block 1: Spread */}
        <div className={cn(
          "p-6 transition-all duration-200",
          activeBlock && activeBlock !== "spread" && "opacity-50"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn("p-2.5 rounded-xl shrink-0", blockConfig[0].bgColor)}>
              <MapPin className={cn("h-5 w-5", blockConfig[0].color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[14px] font-semibold text-foreground">Where it's showing up</h4>
                <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Scope</span>
              </div>

              <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                {storyData.spread.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Regions */}
                <div className="bg-slate-50/70 rounded-xl p-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">By Region</p>
                  <div className="space-y-2">
                    {storyData.spread.regions.map((region) => (
                      <div key={region.name} className="flex items-center justify-between">
                        <span className="text-[12px] text-foreground">{region.name}</span>
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          region.intensity === "high" ? "bg-red-100 text-red-600" :
                          region.intensity === "medium" ? "bg-amber-100 text-amber-600" :
                          "bg-slate-100 text-slate-500"
                        )}>
                          {region.intensity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Channels */}
                <div className="bg-slate-50/70 rounded-xl p-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">By Channel</p>
                  <div className="space-y-2.5">
                    {storyData.spread.channels.map((channel) => (
                      <div key={channel.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-foreground">{channel.name}</span>
                          <span className="text-[11px] font-semibold text-foreground">{channel.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full transition-all duration-500"
                            style={{ width: `${channel.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Types */}
                <div className="bg-slate-50/70 rounded-xl p-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">By Customer Type</p>
                  <div className="space-y-2">
                    {storyData.spread.customerTypes.map((ct) => (
                      <div key={ct.type} className="flex items-center justify-between">
                        <span className="text-[12px] text-foreground">{ct.type}</span>
                        <span className="text-[12px] font-semibold text-foreground">{ct.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block 2: Repetition */}
        <div className={cn(
          "p-6 transition-all duration-200",
          activeBlock && activeBlock !== "repetition" && "opacity-50"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn("p-2.5 rounded-xl shrink-0", blockConfig[1].bgColor)}>
              <Repeat className={cn("h-5 w-5", blockConfig[1].color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[14px] font-semibold text-foreground">How it's persisting</h4>
                <span className="text-[11px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Momentum</span>
              </div>

              <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                {storyData.repetition.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Stats */}
                <div className="bg-slate-50/70 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">Repeat complainants</p>
                      <p className="text-2xl font-bold text-foreground">
                        {storyData.repetition.repeatAccounts}
                        <span className="text-[13px] font-normal text-muted-foreground ml-1">
                          / {storyData.repetition.totalAccounts}
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {Math.round((storyData.repetition.repeatAccounts / storyData.repetition.totalAccounts) * 100)}% of all accounts
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">Avg mentions per account</p>
                      <p className="text-2xl font-bold text-foreground">{storyData.repetition.avgMentionsPerAccount}</p>
                      <p className="text-[11px] text-amber-600 font-medium">{storyData.repetition.weekOverWeekChange} vs last week</p>
                    </div>
                  </div>
                </div>

                {/* Top Repeaters */}
                <div className="bg-slate-50/70 rounded-xl p-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Accounts raising this repeatedly</p>
                  <div className="space-y-3">
                    {storyData.repetition.topRepeaters.map((account) => (
                      <div key={account.name} className="flex items-start justify-between">
                        <div>
                          <p className="text-[12px] font-medium text-foreground">{account.name}</p>
                          <p className="text-[11px] text-muted-foreground">{account.trend}</p>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                          {account.mentions}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block 3: Sub-issues */}
        <div className={cn(
          "p-6 transition-all duration-200",
          activeBlock && activeBlock !== "subissues" && "opacity-50"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn("p-2.5 rounded-xl shrink-0", blockConfig[2].bgColor)}>
              <Layers className={cn("h-5 w-5", blockConfig[2].color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[14px] font-semibold text-foreground">What's actually going wrong</h4>
                <span className="text-[11px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-medium">Root causes</span>
              </div>

              <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                {storyData.subIssues.summary}
              </p>

              <div className="space-y-3">
                {storyData.subIssues.issues.map((issue, index) => (
                  <div key={index} className="bg-slate-50/70 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                          #{index + 1}
                        </span>
                        <span className="text-[13px] font-medium text-foreground">{issue.label}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground">{issue.mentions} mentions</span>
                    </div>
                    <div className="ml-8 pl-3 border-l-2 border-violet-200">
                      <p className="text-[12px] text-slate-500 italic">"{issue.example}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Block 4: Behavior Change */}
        <div className={cn(
          "p-6 transition-all duration-200",
          activeBlock && activeBlock !== "behavior" && "opacity-50"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn("p-2.5 rounded-xl shrink-0", blockConfig[3].bgColor)}>
              <TrendingDown className={cn("h-5 w-5", blockConfig[3].color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[14px] font-semibold text-foreground">How customers are responding</h4>
                <span className="text-[11px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">Business Impact</span>
              </div>

              <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                {storyData.behaviorChange.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {storyData.behaviorChange.behaviors.map((behavior, index) => {
                  const Icon = behavior.icon
                  return (
                    <div key={index} className="bg-slate-50/70 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg border border-border/60">
                          <Icon className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[13px] font-semibold text-foreground">{behavior.action}</span>
                            <span className="text-[15px] font-bold text-red-600">{behavior.percentage}%</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{behavior.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-border/40">
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Analysis based on <span className="font-medium text-foreground">423 conversations</span> from the last 30 days
          </p>
          <button className="px-4 py-2 text-[12px] font-semibold bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-2">
            See recommended actions
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
