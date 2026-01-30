import { useState } from "react"
import { Home, MessageSquare, Globe, Briefcase, Clock, BarChart3, ChevronRight, Search, AlertTriangle, Truck, Package, DollarSign, ArrowLeft } from "lucide-react"
import { SearchBar } from "@/components/SearchBar"
import { TrendingConcerns } from "@/components/TrendingConcerns"
import { MetricsBar } from "@/components/MetricsBar"
import { RevenueRisk } from "@/components/RevenueRisk"
import { SentimentCharts } from "@/components/SentimentCharts"
import { IssuesList } from "@/components/IssuesList"
import { ConcernStoryboard } from "@/components/ConcernStoryboard"
import { FeedbackList } from "@/components/FeedbackList"
import { InsightsBoard } from "@/components/InsightsBoard"
import { cn } from "@/lib/utils"

type NavPage = "home" | "concerns" | "metrics" | "revenue" | "channels" | "work" | "history" | "analytics"

interface ConcernOption {
  id: string
  label: string
  conversations: number
  revenueImpact: string
  trend: string
  icon: typeof Truck
  color: string
  bgColor: string
}

const concernOptions: ConcernOption[] = [
  {
    id: "delivery",
    label: "Delivery Delays",
    conversations: 423,
    revenueImpact: "₹28.4L",
    trend: "+34%",
    icon: Truck,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "packaging",
    label: "Packaging Damage",
    conversations: 312,
    revenueImpact: "₹22.1L",
    trend: "+18%",
    icon: Package,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "pricing",
    label: "Competitor Pricing",
    conversations: 124,
    revenueImpact: "₹15.6L",
    trend: "+52%",
    icon: DollarSign,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
]

const navItems: { icon: typeof Home; label: string; page: NavPage }[] = [
  { icon: Home, label: "Home", page: "home" },
  { icon: AlertTriangle, label: "Concerns", page: "concerns" },
  { icon: BarChart3, label: "Key Metrics", page: "metrics" },
  { icon: DollarSign, label: "Revenue Risk", page: "revenue" },
  { icon: Globe, label: "Channels", page: "channels" },
  { icon: Briefcase, label: "Work", page: "work" },
  { icon: Clock, label: "History", page: "history" },
  { icon: MessageSquare, label: "Analytics", page: "analytics" },
]

function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>("home")
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null)

  const getPageTitle = () => {
    switch (currentPage) {
      case "home": return "Dashboard"
      case "concerns": return selectedConcern ? concernOptions.find(c => c.id === selectedConcern)?.label || "Concern Analysis" : "Concern Analysis"
      default: return navItems.find(n => n.page === currentPage)?.label || "Dashboard"
    }
  }

  const handleNavClick = (page: NavPage) => {
    setCurrentPage(page)
    if (page !== "concerns") {
      setSelectedConcern(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left Sidebar - Icon Only */}
      <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-white border-r border-border/40 flex flex-col z-50">
        {/* Toggle Button */}
        <div className="h-14 flex items-center justify-center">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                title={item.label}
                onClick={() => handleNavClick(item.page)}
                className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-150 ${
                  currentPage === item.page
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <item.icon className="h-5 w-5" strokeWidth={currentPage === item.page ? 2.5 : 1.75} />
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[72px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-14 bg-white/80 backdrop-blur-sm border-b border-border/60 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-foreground">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-muted-foreground text-sm cursor-pointer hover:bg-muted transition-colors">
              <Search className="h-4 w-4" />
              <span className="text-[13px]">Search...</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-background rounded border border-border/60">⌘K</kbd>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {currentPage === "home" && (
            <>
              {/* Page Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">Good morning, Rahul</h2>
                <p className="text-muted-foreground text-[15px] mt-1">
                  Here's what your customer data is telling you
                </p>
              </div>

              {/* Search Section */}
              <section className="mb-8">
                <SearchBar />
              </section>

              {/* Trending Concerns */}
              <section className="mb-8">
                <TrendingConcerns />
              </section>

              {/* Customer Feedback */}
              <section className="mb-8">
                <FeedbackList />
              </section>

              {/* Insights Board */}
              <section className="mb-8">
                <InsightsBoard />
              </section>

              {/* Analytics Grid */}
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SentimentCharts />
                <IssuesList />
              </section>
            </>
          )}

          {currentPage === "concerns" && !selectedConcern && (
            <>
              {/* Page Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">Concern Analysis</h2>
                <p className="text-muted-foreground text-[15px] mt-1">
                  Select a concern to see detailed analysis and market impact
                </p>
              </div>

              {/* Concern Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {concernOptions.map((concern) => {
                  const Icon = concern.icon
                  return (
                    <button
                      key={concern.id}
                      onClick={() => setSelectedConcern(concern.id)}
                      className="group bg-white border border-border/60 rounded-xl p-5 text-left hover:shadow-lg hover:border-border hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className={cn("p-3 rounded-xl w-fit mb-4", concern.bgColor)}>
                        <Icon className={cn("h-6 w-6", concern.color)} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-[15px] font-semibold text-foreground mb-1">{concern.label}</h3>
                      <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-3">
                        <span>{concern.conversations} mentions</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-red-500 font-medium">{concern.trend}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-red-600">{concern.revenueImpact} at risk</span>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {currentPage === "concerns" && selectedConcern && (
            <>
              {/* Back button and Header */}
              <div className="mb-6">
                <button
                  onClick={() => setSelectedConcern(null)}
                  className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to concerns
                </button>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                  {concernOptions.find(c => c.id === selectedConcern)?.label}
                </h2>
                <p className="text-muted-foreground text-[15px] mt-1">
                  Deep dive into this concern and its market impact
                </p>
              </div>

              {/* Concern Storyboard */}
              <ConcernStoryboard />
            </>
          )}

          {currentPage === "metrics" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">Key Metrics</h2>
                <p className="text-muted-foreground text-[15px] mt-1">
                  Performance overview and KPIs for your team
                </p>
              </div>
              <MetricsBar />
            </>
          )}

          {currentPage === "revenue" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">Revenue at Risk</h2>
                <p className="text-muted-foreground text-[15px] mt-1">
                  Identify and address revenue threats from customer issues
                </p>
              </div>
              <RevenueRisk />
            </>
          )}

          {currentPage !== "home" && currentPage !== "concerns" && currentPage !== "metrics" && currentPage !== "revenue" && (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                  {navItems.find(n => n.page === currentPage)?.icon && (
                    <span className="h-8 w-8 text-muted-foreground">
                      {(() => {
                        const Icon = navItems.find(n => n.page === currentPage)?.icon
                        return Icon ? <Icon className="h-8 w-8" /> : null
                      })()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{getPageTitle()}</h3>
                <p className="text-muted-foreground text-sm">Coming soon</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
