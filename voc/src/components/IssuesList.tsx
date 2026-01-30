import { useState, useMemo } from "react"
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { issuesData, type Issue } from "@/data/mockData"
import { cn } from "@/lib/utils"

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-emerald-500",
}

const categoryColors: Record<string, string> = {
  Logistics: "bg-blue-50 text-blue-700",
  Quality: "bg-purple-50 text-purple-700",
  Fulfillment: "bg-amber-50 text-amber-700",
  Support: "bg-rose-50 text-rose-700",
  Technology: "bg-cyan-50 text-cyan-700",
  Process: "bg-slate-100 text-slate-700",
  Pricing: "bg-green-50 text-green-700",
  Inventory: "bg-orange-50 text-orange-700",
  Billing: "bg-indigo-50 text-indigo-700",
  Content: "bg-pink-50 text-pink-700",
  Communication: "bg-teal-50 text-teal-700",
}

interface IssueRowProps {
  issue: Issue
  maxCount: number
}

function IssueRow({ issue, maxCount }: IssueRowProps) {
  const barWidth = (issue.count / maxCount) * 100

  return (
    <div className="group flex items-center gap-4 py-3 px-4 -mx-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "h-2 w-2 rounded-full shrink-0",
              severityColors[issue.severity]
            )}
          />
          <span className="text-sm font-medium text-foreground truncate">
            {issue.title}
          </span>
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded shrink-0",
              categoryColors[issue.category] || "bg-gray-100 text-gray-700"
            )}
          >
            {issue.category}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            issue.trendDir === "up" ? "text-red-600" : "text-emerald-600"
          )}
        >
          {issue.trendDir === "up" ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {issue.trend}
        </div>

        <div className="w-24 hidden md:block">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground/70 transition-all duration-300"
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>

        <div className="w-16 text-right">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {issue.count.toLocaleString()}
          </span>
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}

export function IssuesList() {
  const [sortBy, setSortBy] = useState("frequency")

  const sortedIssues = useMemo(() => {
    const sorted = [...issuesData]
    if (sortBy === "frequency") {
      sorted.sort((a, b) => b.count - a.count)
    } else if (sortBy === "severity") {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      sorted.sort(
        (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
      )
    } else if (sortBy === "trending") {
      sorted.sort((a, b) => {
        const aTrend = parseInt(a.trend.replace(/[^-\d]/g, ""))
        const bTrend = parseInt(b.trend.replace(/[^-\d]/g, ""))
        return bTrend - aTrend
      })
    }
    return sorted
  }, [sortBy])

  const maxCount = Math.max(...issuesData.map((i) => i.count))
  const totalReports = issuesData.reduce((acc, i) => acc + i.count, 0)

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Reported Issues</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalReports.toLocaleString()} total reports
            </p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frequency">Frequency</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex items-center gap-4 pb-3 mb-1 border-b text-xs font-medium text-muted-foreground">
          <div className="flex-1">Issue</div>
          <div className="w-12 text-center hidden sm:block">Trend</div>
          <div className="w-24 text-center hidden md:block">Volume</div>
          <div className="w-16 text-right">Reports</div>
          <div className="w-4" />
        </div>
        <ScrollArea className="h-[420px] -mx-4 px-4">
          <div className="divide-y divide-border/50">
            {sortedIssues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} maxCount={maxCount} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
