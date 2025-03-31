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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AddWidgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (widget: {
    type: string;
    title: string;
    config: {
      dataSources: string[];
      metric: string;
      groupBy: string[];
      chartType: 'kpi' | 'line' | 'bar' | 'pie' | 'table' | 'scatter' | 'bubble' | 'heatmap';
    };
  }) => void;
  initialData?: {
    type?: string;
    title: string;
    config?: {
      dataSources: string[];
      metric: string;
      groupBy: string[];
      chartType: 'kpi' | 'line' | 'bar' | 'pie' | 'table' | 'scatter' | 'bubble' | 'heatmap';
    };
  };
}

interface BaseDataPoint {
  name: string;
  value: number;
}

interface TimeSeriesDataPoint extends BaseDataPoint {
  date: string;
  value2: number;
  size: number;
}

interface ScatterDataPoint extends BaseDataPoint {
  value2: number;
  size: number;
}

interface HeatmapDataPoint extends BaseDataPoint {
  day: number;
  time: number;
}

type DataPoint = TimeSeriesDataPoint | ScatterDataPoint | HeatmapDataPoint | BaseDataPoint;

const DATA_SOURCES = [
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'meta-ads', label: 'META Ads' },
  { value: 'linkedin-ads', label: 'LinkedIn Ads' },
  { value: 'mailchimp', label: 'Mailchimp' },
  { value: 'netcore', label: 'Netcore' }
];

const METRICS = [
  { value: 'impressions', label: 'Impressions' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'ctr', label: 'CTR' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'cost', label: 'Cost' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'roas', label: 'ROAS' }
];

const GROUP_BY_OPTIONS = [
  { value: 'campaign', label: 'Campaign' },
  { value: 'ad_group', label: 'Ad Group' },
  { value: 'ad_name', label: 'Ad Name' },
  { value: 'platform', label: 'Platform' },
  { value: 'date', label: 'Date' },
  { value: 'device', label: 'Device' },
  { value: 'geography', label: 'Geography' },
  { value: 'channel', label: 'Channel' }
];

const CHART_TYPES = [
  { value: "kpi", label: "KPI" },
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "table", label: "Table" },
  { value: "scatter", label: "Scatter" },
  { value: "bubble", label: "Bubble" },
  { value: "heatmap", label: "Heatmap" },
] as const;

type ChartType = typeof CHART_TYPES[number]['value'];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function getPreviewData(metric: string, chartType: ChartType): DataPoint[] {
  const data: DataPoint[] = [];
  const now = new Date();

  switch (chartType) {
    case 'scatter':
    case 'bubble':
      // Generate scattered points with correlation
      const values = [100, 150, 200, 180, 250];
      values.forEach((value, i) => {
        data.push({
          name: `Point ${i + 1}`,
          value: value,
          value2: Math.floor(value * 0.8),
          size: value / 2,
        } as ScatterDataPoint);
      });
      break;

    case 'heatmap':
      // Generate heatmap data for weekdays and times
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const times = ['9AM', '12PM', '3PM', '6PM'];
      weekdays.forEach((day, dayIndex) => {
        times.forEach((time, timeIndex) => {
          data.push({
            name: `${day} ${time}`,
            value: Math.floor(Math.random() * 1000),
            day: dayIndex,
            time: timeIndex,
          } as HeatmapDataPoint);
        });
      });
      break;

    case 'pie':
      // Generate categorical data
      const categories = ['Social', 'Search', 'Direct', 'Email', 'Other'];
      categories.forEach(category => {
        data.push({
          name: category,
          value: Math.floor(Math.random() * 1000) + 100,
        } as BaseDataPoint);
      });
      break;

    default:
      // Time series data with realistic trends
      const baseValues = [100, 150, 200, 180, 250];
      baseValues.forEach((baseValue, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (baseValues.length - 1 - i));
        data.push({
          name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: date.toISOString(),
          value: baseValue,
          value2: Math.floor(baseValue * 0.8),
          size: baseValue / 2,
        } as TimeSeriesDataPoint);
      });
  }

  return data;
}

// Add this type guard function before renderPreview
function isHeatmapDataPoint(point: DataPoint): point is HeatmapDataPoint {
  return 'day' in point && 'time' in point;
}

export default function AddWidgetModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AddWidgetModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialData?.title || "");
  const [dataSource, setDataSource] = useState(initialData?.config?.dataSources[0] || DATA_SOURCES[0].value);
  const [metric, setMetric] = useState(initialData?.config?.metric || METRICS[0].value);
  const [groupBy, setGroupBy] = useState<string[]>(initialData?.config?.groupBy || [GROUP_BY_OPTIONS[0].value]);
  const [chartType, setChartType] = useState<ChartType>(initialData?.config?.chartType || "kpi");
  const [previewData, setPreviewData] = useState<DataPoint[]>([]);

  // Reset state when modal opens
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

  // Update preview data when metric or chart type changes
  useEffect(() => {
    setPreviewData(getPreviewData(metric, chartType));
  }, [metric, chartType]);

  const handleSubmit = () => {
    onSubmit({
      type: 'widget',
      title,
      config: {
        dataSources: [dataSource],
        metric,
        groupBy,
        chartType,
      },
    });
    onOpenChange(false);
  };

  const isValid = title && dataSource && metric && groupBy.length > 0 && chartType;

  const handleChartTypeChange = (type: ChartType) => {
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
                        setGroupBy(groupBy.filter((o: string) => o !== option.value));
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
                    onClick={() => {
                      console.log("Button clicked:", type.value);
                      handleChartTypeChange(type.value);
                    }}
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
                <CardTitle className="text-sm font-medium">Preview</CardTitle>
                <CardDescription className="text-xs">
                  Live preview of how your widget will look
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[250px]">
                  {renderPreview(chartType, previewData)}
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

function renderPreview(chartType: ChartType, data: DataPoint[]): React.ReactNode {
  const chartHeight = 250;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          {payload[0].payload.date ? (
            <p className="text-sm font-medium">{format(new Date(payload[0].payload.date), 'MMM d, yyyy')}</p>
          ) : (
            <p className="text-sm font-medium">{label}</p>
          )}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  switch (chartType) {
    case "kpi":
      const kpiValue = data.length > 0 ? data[data.length - 1].value : 0;
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{kpiValue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-2">Current Value</div>
          </div>
        </div>
      );

    case "scatter":
    case "bubble":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="value" 
              name="Primary"
              label={{ value: "Primary Metric", position: "bottom", offset: 20 }}
              type="number"
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <YAxis 
              dataKey="value2" 
              name="Secondary"
              label={{ value: "Secondary Metric", angle: -90, position: "left", offset: 10 }}
              type="number"
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            {chartType === "bubble" && (
              <ZAxis 
                dataKey="size" 
                range={[50, 200]} 
                name="Size"
              />
            )}
            <RechartsTooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="text-sm font-medium">Point {payload[0].payload.name}</p>
                      <p className="text-sm">Primary: {payload[0].value}</p>
                      <p className="text-sm">Secondary: {payload[1].value}</p>
                      {chartType === "bubble" && (
                        <p className="text-sm">Size: {payload[0].payload.size}</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              name="Values" 
              data={data} 
              fill="#8884d8"
            />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "heatmap":
      const maxValue = Math.max(...data.map(d => d.value));
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const times = ['9AM', '12PM', '3PM', '6PM'];
      
      return (
        <div className="h-full p-4">
          <div className="grid grid-cols-[auto_repeat(4,1fr)] gap-1 h-full">
            {/* Time labels */}
            <div className="col-start-1 col-span-1" />
            {times.map((time) => (
              <div key={time} className="text-center text-xs font-medium">
                {time}
              </div>
            ))}
            
            {/* Heatmap grid */}
            {weekdays.map((day, dayIndex) => (
              <div key={day} className="contents">
                <div className="text-xs font-medium flex items-center">
                  {day}
                </div>
                {times.map((time, timeIndex) => {
                  const cellData = data.find(
                    d => isHeatmapDataPoint(d) && d.day === dayIndex && d.time === timeIndex
                  );
                  return (
                    <div
                      key={`${day}-${time}`}
                      className="relative aspect-square rounded overflow-hidden"
                      style={{
                        backgroundColor: `rgba(136, 132, 216, ${
                          cellData ? cellData.value / maxValue : 0
                        })`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-medium">
                        {cellData?.value.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );

    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, value, percent }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      );

    case "table":
      return (
        <div className="h-full overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-right p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{row.name}</td>
                  <td className="text-right p-2">{row.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
} 