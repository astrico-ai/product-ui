import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Table as TableIcon,
  LayoutDashboard,
  Database,
  Calendar,
  Filter,
  ChevronRight,
  ScatterChart as ScatterChartIcon,
  Circle as BubbleChartIcon,
  Grid as HeatmapIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  ZAxis,
  Scatter,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { regularDashboardConfig, marketingDashboardConfig } from "@/config/dashboardConfig";

const CHART_TYPES = [
  { value: "kpi", label: "KPI" },
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "table", label: "Table" },
  { value: "scatter", label: "Scatter" },
  { value: "bubble", label: "Bubble" },
  { value: "heatmap", label: "Heatmap" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white p-2 border rounded-lg shadow-lg">
      <p className="text-sm font-medium">
        {payload[0].payload.date
          ? format(new Date(payload[0].payload.date), "MMM d, yyyy")
          : label}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function getPreviewData(type) {
  const baseData = Array.from({ length: 5 }, (_, i) => ({
    name: format(new Date(2024, 0, i + 1), "MMM d"),
    date: new Date(2024, 0, i + 1).toISOString(),
    value: Math.floor(Math.random() * 100) + 50,
    value2: Math.floor(Math.random() * 80) + 30,
  }));

  switch (type) {
    case "line":
    case "bar":
      return baseData;
    case "scatter":
    case "bubble":
      return baseData.map((d) => ({
        ...d,
        size: Math.floor(Math.random() * 400) + 100,
      }));
    case "heatmap":
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const times = ["9AM", "12PM", "3PM", "6PM"];
      return days.flatMap((day) =>
        times.map((time) => ({
          day,
          time,
          value: Math.floor(Math.random() * 100),
        }))
      );
    case "pie":
      return [
        { name: "Category A", value: 30 },
        { name: "Category B", value: 25 },
        { name: "Category C", value: 20 },
        { name: "Category D", value: 15 },
        { name: "Category E", value: 10 },
      ];
    default:
      return baseData;
  }
}

function renderPreview(type) {
  const data = getPreviewData(type);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  switch (type) {
    case "kpi":
      const kpiValue = Math.floor(Math.random() * 10000);
      const trend = Math.floor(Math.random() * 100) - 50;
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {kpiValue.toLocaleString()}
            </div>
            <div className={cn(
              "text-sm mt-2 flex items-center justify-center gap-1",
              trend > 0 ? "text-green-600" : "text-red-600"
            )}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last period
            </div>
          </div>
        </div>
      );

    case "line":
      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3551F3"
              strokeWidth={2}
              dot={false}
              name="Primary"
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke="#00C49F"
              strokeWidth={2}
              dot={false}
              name="Secondary"
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3551F3" radius={[4, 4, 0, 0]} name="Primary" />
            <Bar dataKey="value2" fill="#00C49F" radius={[4, 4, 0, 0]} name="Secondary" />
          </BarChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="value" name="Primary" />
            <YAxis type="number" dataKey="value2" name="Secondary" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter name="Values" data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "bubble":
      return (
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ZAxis dataKey="size" range={[50, 500]} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter
              data={data}
              name="Values"
              fill="#8884d8"
            />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "heatmap":
      const uniqueDays = [...new Set(data.map((d) => d.day))];
      const uniqueTimes = [...new Set(data.map((d) => d.time))];
      const cellSize = Math.min(200 / uniqueDays.length, 200 / uniqueTimes.length);

      return (
        <div className="w-full h-[200px] flex items-center justify-center">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `auto repeat(${uniqueDays.length}, ${cellSize}px)`,
              gap: "2px",
            }}
          >
            {/* Time labels */}
            <div /> {/* Empty corner cell */}
            {uniqueDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium">
                {day}
              </div>
            ))}

            {/* Data grid */}
            {uniqueTimes.map((time) => (
              <div key={time} className="contents">
                <div className="text-right text-sm font-medium pr-2">{time}</div>
                {uniqueDays.map((day) => {
                  const cellData = data.find(
                    (d) => d.day === day && d.time === time
                  );
                  const intensity = cellData ? cellData.value / 100 : 0;
                  return (
                    <div
                      key={`${day}-${time}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: `rgba(136, 132, 216, ${intensity})`,
                      }}
                      className="rounded-sm"
                      title={`${day} ${time}: ${cellData?.value ?? 0}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function AddWidgetModal({ open, onOpenChange, onSubmit, initialData, dashboardType = 'regular' }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialData?.title || "");
  const config = dashboardType === 'marketing' ? marketingDashboardConfig : regularDashboardConfig;
  
  // Use config values instead of hardcoded constants
  const DATA_SOURCES = config.dataSources;
  const METRICS = config.metrics;
  const GROUP_BY_OPTIONS = config.groupByOptions;
  const [dataSource, setDataSource] = useState(initialData?.config?.dataSources[0] || DATA_SOURCES[0].value);
  const [metric, setMetric] = useState(initialData?.config?.metric || METRICS[0].value);
  const [groupBy, setGroupBy] = useState(initialData?.config?.groupBy || [GROUP_BY_OPTIONS[0].value]);
  const [chartType, setChartType] = useState(initialData?.config?.chartType || "kpi");
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (open) {
      if (!initialData) {
        setTitle("");
        setDataSource(DATA_SOURCES[0].value);
        setMetric(METRICS[0].value);
        setGroupBy([GROUP_BY_OPTIONS[0].value]);
        setChartType("kpi");
      } else if (initialData.config?.chartType) {
        setChartType(initialData.config.chartType);
      }
      setStep(1);
    }
  }, [open, initialData]);

  useEffect(() => {
    setPreviewData(getPreviewData(chartType));
  }, [chartType]);

  const handleSubmit = () => {
    const data = getPreviewData(chartType);
    onSubmit({
      type: chartType,
      title,
      config: {
        dataSources: [dataSource],
        metric,
        groupBy,
        chartType,
      },
      data: data,
    });
    onOpenChange(false);
  };

  const isValid = title && dataSource && metric && groupBy.length > 0 && chartType;

  const handleChartTypeChange = (type) => {
    console.log("Changing chart type to:", type);
    setChartType(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle>
            {initialData ? "Edit Widget" : "Add New Widget"}
          </DialogTitle>
          <DialogDescription>
            Create a widget to visualize your data. Configure the data source, metrics, and visualization type.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Configuration */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter widget title"
              />
            </div>

            <div className="space-y-2">
              <Label>Data Source</Label>
              <Select value={dataSource} onValueChange={setDataSource}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                        {source.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metric</Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRICS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                        {m.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Group By</Label>
              <div className="flex flex-wrap gap-1.5">
                {GROUP_BY_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={groupBy.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer text-xs py-1"
                    onClick={() => {
                      if (groupBy.includes(option.value)) {
                        setGroupBy(groupBy.filter(o => o !== option.value));
                      } else {
                        setGroupBy([...groupBy, option.value]);
                      }
                    }}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chart Type</Label>
              <div 
                key="chart-type-grid"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
              >
                {CHART_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-24 flex flex-col items-center justify-center gap-2 relative",
                      chartType === type.value && "border-primary"
                    )}
                    onClick={() => handleChartTypeChange(type.value)}
                  >
                    <div className="pointer-events-none">
                      {type.value === "kpi" && <LayoutDashboard className="h-8 w-8" />}
                      {type.value === "line" && <LineChartIcon className="h-8 w-8" />}
                      {type.value === "bar" && <BarChartIcon className="h-8 w-8" />}
                      {type.value === "pie" && <PieChartIcon className="h-8 w-8" />}
                      {type.value === "table" && <TableIcon className="h-8 w-8" />}
                      {type.value === "scatter" && <ScatterChartIcon className="h-8 w-8" />}
                      {type.value === "bubble" && <BubbleChartIcon className="h-8 w-8" />}
                      {type.value === "heatmap" && <HeatmapIcon className="h-8 w-8" />}
                      <span>{type.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="col-span-12 lg:col-span-7">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title || 'Preview'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[250px]">
                  {renderPreview(chartType)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {initialData ? "Save Changes" : "Add Widget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 