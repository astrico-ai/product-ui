import React, { useState, useEffect, useRef } from "react";
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
  MessageCircle,
  MoreVertical,
  Map,
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
import { regularDashboardConfig, marketingDashboardConfig, insuranceDashboardConfig } from "@/config/dashboardConfig";
import { Map as LucideMap } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";

const INDIA_TOPO_JSON = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@dc5d493/topojson/india.json";

const CHART_TYPES = [
  { value: "kpi", label: "KPI" },
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "table", label: "Table" },
  { value: "scatter", label: "Scatter" },
  { value: "bubble", label: "Bubble" },
  { value: "heatmap", label: "Heatmap" },
  { value: "map", label: "Map" },
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

const getPreviewData = (type, dashboardType) => {
  switch (type) {
    case "kpi":
      return {
        title: "Total Premium Collection",
        value: 125000000,
        change: 12.5,
        sparkline: [
          { value: 95000000 },
          { value: 102000000 },
          { value: 108000000 },
          { value: 115000000 },
          { value: 120000000 },
          { value: 125000000 },
        ]
      };

    case "line":
      return {
        title: "Premium Collection Trend",
        data: [
          { date: "2024-01-01", value: 85000000 },
          { date: "2024-02-01", value: 92000000 },
          { date: "2024-03-01", value: 98000000 },
          { date: "2024-04-01", value: 105000000 },
          { date: "2024-05-01", value: 115000000 },
          { date: "2024-06-01", value: 125000000 },
        ]
      };

    case "bar":
      return {
        title: "Claims by Insurance Type",
        data: [
          { name: "Health", value: 450 },
          { name: "Motor", value: 380 },
          { name: "Property", value: 230 },
          { name: "Life", value: 190 },
          { name: "Travel", value: 120 },
        ]
      };

    case "pie":
      if (dashboardType === 'mining') {
        return {
          title: "Total Taxable Value by Channel",
          data: [
            { name: "Spares and Accessories Shop", value: 251149073.6 },
            { name: "Lube Shop", value: 101564396.8 },
            { name: "Motul Rural Distributor", value: 85420882.6 },
            { name: "Independent Workshops (IWS)", value: 75593589.4 },
            { name: "PCMO Premium Club", value: 38475754.8 },
            { name: "Motul Garage - PCMO", value: 30482495.78 },
            { name: "Motul Garage - MCO", value: 30150311.68 }
          ]
        };
      }
      return {
        title: "Premium Distribution",
        data: [
          { name: "Health Insurance", value: 35 },
          { name: "Motor Insurance", value: 25 },
          { name: "Property Insurance", value: 20 },
          { name: "Life Insurance", value: 15 },
          { name: "Travel Insurance", value: 5 },
        ]
      };

    case "scatter":
      return {
        title: "Risk Assessment",
        data: [
          { x: 25, y: 85000, z: 20, name: "Policy A" },
          { x: 45, y: 125000, z: 30, name: "Policy B" },
          { x: 35, y: 95000, z: 25, name: "Policy C" },
          { x: 55, y: 150000, z: 35, name: "Policy D" },
          { x: 65, y: 180000, z: 40, name: "Policy E" },
        ]
      };

    case "bubble":
      return {
        title: "Policy Value vs Claims",
        data: [
          { x: 75000, y: 12, z: 50, name: "Region A" },
          { x: 125000, y: 18, z: 80, name: "Region B" },
          { x: 95000, y: 15, z: 65, name: "Region C" },
          { x: 150000, y: 22, z: 90, name: "Region D" },
          { x: 180000, y: 25, z: 100, name: "Region E" },
        ]
      };

    case "heatmap":
      return {
        title: "Claims Intensity by Region & Type",
        data: [
          { region: "North", type: "Health", value: 85 },
          { region: "North", type: "Motor", value: 65 },
          { region: "South", type: "Health", value: 75 },
          { region: "South", type: "Motor", value: 55 },
          { region: "East", type: "Health", value: 90 },
          { region: "East", type: "Motor", value: 70 },
          { region: "West", type: "Health", value: 80 },
          { region: "West", type: "Motor", value: 60 },
        ]
      };

    case "table":
      return {
        title: "Recent Claims",
        data: [
          { id: "CLM001", type: "Health", amount: 85000, status: "Approved", date: "2024-04-01" },
          { id: "CLM002", type: "Motor", amount: 45000, status: "Pending", date: "2024-04-02" },
          { id: "CLM003", type: "Property", amount: 125000, status: "Under Review", date: "2024-04-03" },
          { id: "CLM004", type: "Life", amount: 500000, status: "Approved", date: "2024-04-04" },
          { id: "CLM005", type: "Travel", amount: 25000, status: "Rejected", date: "2024-04-05" },
        ]
      };

    case "map":
      return {
        title: "Insurance Sales by District",
        data: [
          { id: "519", district: "Mumbai", state: "Maharashtra", value: 48500 },
          { id: "520", district: "Pune", state: "Maharashtra", value: 45200 },
          { id: "474", district: "Ahmedabad", state: "Gujarat", value: 47800 },
          { id: "475", district: "Surat", state: "Gujarat", value: 44600 },
          { id: "575", district: "Bangalore", state: "Karnataka", value: 42300 }
        ]
      };

    default:
      return null;
  }
};

export default function AddWidgetModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  dashboardType = "regular"
}) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialData?.title || "");
  const [csvData, setCsvData] = useState(null);
  const fileInputRef = useRef(null);
  const config = dashboardType === 'marketing' 
    ? marketingDashboardConfig 
    : dashboardType === 'insurance'
      ? insuranceDashboardConfig
      : dashboardType === 'mining'
        ? {
            ...regularDashboardConfig,
            metrics: [
              { value: "product_performance", label: "Product wise Performance" },
              { value: "monthly_growth", label: "Monthly Sales Growth" },
              { value: "sales_contribution", label: "Contribution to Sales" },
              { value: "lost_customers", label: "Lost Customers" }
            ]
          }
        : regularDashboardConfig;
  
  // Use config values instead of hardcoded constants
  const DATA_SOURCES = config.dataSources;
  const METRICS = config.metrics;
  const GROUP_BY_OPTIONS = config.groupByOptions;
  const [dataSource, setDataSource] = useState(initialData?.config?.dataSource || DATA_SOURCES[0].value);
  const [metric, setMetric] = useState(initialData?.config?.metric || METRICS[0].value);
  const [groupBy, setGroupBy] = useState(initialData?.config?.groupBy || [GROUP_BY_OPTIONS[0].value]);
  const [chartType, setChartType] = useState(initialData?.config?.chartType || "kpi");
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, initialData]);

  useEffect(() => {
    setPreviewData(getPreviewData(chartType, dashboardType));
  }, [chartType, dashboardType]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    let data = getPreviewData(chartType, dashboardType);
    
    // If it's a table widget, use CSV data if available, otherwise use preview data
    if (chartType === 'table') {
      data = csvData ? { csvData } : data;
    }
    
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
      csvData: chartType === 'table' && csvData ? csvData : undefined,
    });
    onClose(false);
  };

  const isValid = title && dataSource && metric && groupBy.length > 0 && chartType;

  const handleChartTypeChange = (type) => {
    console.log("Changing chart type to:", type);
    setChartType(type);
  };

  function renderPreview(type) {
    const data = getPreviewData(type, dashboardType);
    if (!data) return null;

    switch (type) {
      case "kpi":
        return (
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-gray-900">{data.title || "Total Impressions"}</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-8 mb-4">
                <div className="text-[2.75rem] leading-none font-semibold text-gray-900">
                  {(data?.value || 0).toLocaleString()}
                </div>
                {data?.change != null && (
                  <div className={cn(
                    "text-sm mt-2",
                    data.change > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    ↑ {Math.abs(data.change).toFixed(1)}% vs last period
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), "MMM")}
              />
              <YAxis 
                tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3551F3" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3551F3">
                {data.data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => {
                  if (dashboardType === 'mining') {
                    const total = data.data.reduce((sum, item) => sum + item.value, 0);
                    const percentage = ((entry.value / total) * 100).toFixed(2);
                    return `${percentage}%`;
                  }
                  return entry.name;
                }}
              >
                {data.data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value) => {
                  if (dashboardType === 'mining') {
                    return ['₹' + value.toLocaleString(), 'Total Taxable Value'];
                  }
                  return [value, 'Value'];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x" 
                name="Age" 
                unit=" yrs"
              />
              <YAxis 
                dataKey="y" 
                name="Premium" 
                tickFormatter={(value) => `₹${(value / 1000)}K`}
              />
              <ZAxis 
                dataKey="z" 
                range={[50, 400]} 
                name="Risk Score"
              />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={data.data} fill="#3551F3" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "bubble":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x" 
                name="Premium" 
                tickFormatter={(value) => `₹${(value / 1000)}K`}
              />
              <YAxis 
                dataKey="y" 
                name="Claims" 
                unit=" claims"
              />
              <ZAxis 
                dataKey="z" 
                range={[50, 400]} 
                name="Risk Level"
              />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={data.data} fill="#3551F3" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "heatmap":
        return (
          <div style={{ height: "200px", width: "100%" }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 400,
                center: [78.9629, 22.5937]
              }}
              style={{
                width: "100%",
                height: "100%"
              }}
            >
              <Geographies geography={INDIA_TOPO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const districtCode = geo.properties.dt_code;
                    const districtData = data.data.find(d => d.region === districtCode);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={districtData ? COLORS[districtData.value % COLORS.length] : "#EEE"}
                        stroke="#FFF"
                        strokeWidth={0.5}
                        style={{
                          default: {
                            outline: "none"
                          },
                          hover: {
                            fill: "#666",
                            outline: "none"
                          },
                          pressed: {
                            outline: "none"
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
        );

      case "table":
        return (
          <div className="h-[200px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{row.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        {
                          "bg-green-100 text-green-800": row.status === "Approved",
                          "bg-yellow-100 text-yellow-800": row.status === "Pending" || row.status === "Under Review",
                          "bg-red-100 text-red-800": row.status === "Rejected"
                        }
                      )}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(row.date), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "map":
        const colorScale = scaleQuantile()
          .domain(data.data.map(d => d.value))
          .range([
            "#ffedea",
            "#ffcec5",
            "#ffad9f",
            "#ff8a75",
            "#ff5533",
            "#e2492d",
            "#be3d26",
            "#9a311f",
            "#782618"
          ]);

        return (
          <div style={{ height: "200px", width: "100%" }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 400,
                center: [78.9629, 22.5937]
              }}
              style={{
                width: "100%",
                height: "100%"
              }}
            >
              <Geographies geography={INDIA_TOPO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const districtCode = geo.properties.dt_code;
                    const districtData = data.data.find(d => d.id === districtCode);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={districtData ? colorScale(districtData.value) : "#EEE"}
                        stroke="#FFF"
                        strokeWidth={0.5}
                        style={{
                          default: {
                            outline: "none"
                          },
                          hover: {
                            fill: "#666",
                            outline: "none"
                          },
                          pressed: {
                            outline: "none"
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataSource">Data Source</Label>
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

            {/* Add CSV upload for table widget type */}
            {chartType === 'table' && (
              <div className="space-y-2">
                <Label>CSV Data</Label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload CSV
                  </Button>
                  {csvData && (
                    <p className="text-sm text-green-600">CSV file loaded successfully</p>
                  )}
                </div>
              </div>
            )}

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
                      {type.value === "map" && <Map className="h-8 w-8" />}
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
            onClick={() => onClose(false)}
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