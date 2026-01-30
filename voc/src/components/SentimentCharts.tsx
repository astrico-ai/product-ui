import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sentimentData } from "@/data/mockData"

interface ChartData {
  name: string
  value: number
  color: string
}

interface SentimentChartProps {
  title: string
  data: ChartData[]
  centerLabel?: string
}

function SentimentChart({ title, data, centerLabel }: SentimentChartProps) {
  return (
    <div className="flex flex-col">
      <h4 className="text-sm font-medium text-foreground mb-4">{title}</h4>
      <div className="relative h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={58}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ChartData
                  return (
                    <div className="bg-foreground text-background text-xs rounded-md px-2.5 py-1.5 shadow-lg">
                      <span className="font-medium">{item.name}:</span> {item.value}%
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold text-foreground">{centerLabel}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SentimentCharts() {
  const [filter, setFilter] = useState("all")

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Sentiment Analysis</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customer feedback breakdown
            </p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-8">
          <SentimentChart
            title="Overall"
            data={sentimentData.overall}
            centerLabel="45%"
          />
          <SentimentChart
            title="By Channel"
            data={sentimentData.distribution}
          />
          <SentimentChart
            title="30-Day Trend"
            data={sentimentData.trend}
          />
        </div>
      </CardContent>
    </Card>
  )
}
