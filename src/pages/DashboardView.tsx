import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { 
  Plus, 
  MoreVertical, 
  MessageSquare, 
  ArrowLeft, 
  Presentation, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Pencil, 
  Trash2, 
  Maximize2,
  Share2,
  LayoutDashboard,
  Clock,
  Users,
  Settings,
  Grid,
  Columns,
  Minimize2,
  Download,
  Loader2,
} from "lucide-react";
import AddWidgetModal from "@/components/dashboard/AddWidgetModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MainLayout } from "@/components/MainLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  getDashboards,
  getDashboardById,
  updateDashboardWidgets,
  type Dashboard,
} from "@/utils/dashboardStorage";
import { cn } from "@/lib/utils";
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
  Scatter,
  ZAxis,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface Widget {
  id: string;
  type: string;
  title: string;
  position: number;
  config: {
    dataSources: string[];
    metric: string;
    groupBy: string[];
    chartType: 'kpi' | 'line' | 'bar' | 'pie' | 'table' | 'scatter' | 'bubble' | 'heatmap';
  };
}

interface DashboardData extends Dashboard {
  id: string;
  name: string;
  owner: string;
  lastUpdatedAt: string;
  isPublic: boolean;
  widgets: Widget[];
}

type MetricData = Array<{
  date: string;
  value: number;
  value2?: number;
  size?: number;
}>;

type SampleDataType = {
  [key: string]: MetricData;
};

function getWidgetData(config: Widget['config']): Promise<MetricData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sampleData: SampleDataType = {
        'impressions': [
          { date: '2024-01', value: 1000, value2: 800, size: 50 },
          { date: '2024-02', value: 1200, value2: 1000, size: 65 },
          { date: '2024-03', value: 1500, value2: 1300, size: 80 },
          { date: '2024-04', value: 1300, value2: 1100, size: 70 },
          { date: '2024-05', value: 1800, value2: 1600, size: 90 },
        ],
        'clicks': [
          { date: '2024-01', value: 100, value2: 80, size: 20 },
          { date: '2024-02', value: 150, value2: 120, size: 30 },
          { date: '2024-03', value: 200, value2: 180, size: 40 },
          { date: '2024-04', value: 180, value2: 150, size: 35 },
          { date: '2024-05', value: 250, value2: 220, size: 45 },
        ],
        'conversions': [
          { date: '2024-01', value: 20, value2: 15, size: 10 },
          { date: '2024-02', value: 25, value2: 20, size: 12 },
          { date: '2024-03', value: 35, value2: 30, size: 15 },
          { date: '2024-04', value: 30, value2: 25, size: 14 },
          { date: '2024-05', value: 40, value2: 35, size: 18 },
        ],
        'spend': [
          { date: '2024-01', value: 500, value2: 400, size: 30 },
          { date: '2024-02', value: 600, value2: 500, size: 35 },
          { date: '2024-03', value: 750, value2: 650, size: 40 },
          { date: '2024-04', value: 650, value2: 550, size: 38 },
          { date: '2024-05', value: 900, value2: 800, size: 45 },
        ],
      };

      resolve(sampleData[config.metric] || []);
    }, 1000);
  });
}

interface WidgetDimensions {
  columnSpan: 4 | 6;
  heightClass: string;
}

function calculateWidgetDimensions(widget: Widget): WidgetDimensions {
  switch (widget.config.chartType) {
    case 'kpi':
      return { 
        columnSpan: 4, 
        heightClass: 'h-[140px]' 
      };
    case 'scatter':
    case 'bubble':
    case 'heatmap':
    case 'line':
    case 'bar':
    case 'pie':
    case 'table':
      return { 
        columnSpan: 6, 
        heightClass: 'h-[350px]' 
      };
    default:
      return { 
        columnSpan: 4, 
        heightClass: 'h-[350px]' 
      };
  }
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent * 100).toFixed(0);

  return (
    <text
      x={x}
      y={y}
      fill={COLORS[index % COLORS.length]}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="500"
    >
      {`${name}: ${value} (${percentage}%)`}
    </text>
  );
};

const DashboardView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState("");
  const controlsTimerRef = useRef<NodeJS.Timeout>();
  const [maximizedWidget, setMaximizedWidget] = useState<Widget | null>(null);
  const [widgetData, setWidgetData] = useState<{ [key: string]: MetricData }>({});
  const [loadingWidgets, setLoadingWidgets] = useState<{ [key: string]: boolean }>({});

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsPresentationMode(true);
      setCurrentSlideIndex(0);
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  };

  const exitPresentation = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsPresentationMode(false);
    setCurrentSlideIndex(0);
  };

  const handleNextSlide = () => {
    if (!dashboard?.widgets) return;
    setCurrentSlideIndex((prev) => 
      prev === dashboard.widgets.length - 1 ? prev : prev + 1
    );
    showControlsTemporarily();
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => prev === 0 ? prev : prev - 1);
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setIsControlsVisible(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 2000);
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isPresentationMode) return;
    
    if (e.key === 'ArrowRight' || e.key === 'Space') {
      handleNextSlide();
    } else if (e.key === 'ArrowLeft') {
      handlePrevSlide();
    } else if (e.key === 'Escape') {
      exitPresentation();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isPresentationMode, dashboard?.widgets.length]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresentationMode(false);
        setCurrentSlideIndex(0);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (id) {
      const dashboardData = getDashboardById(id) as DashboardData | null;
      if (dashboardData) {
        setDashboard(dashboardData);
      }
    } else {
      const dashboards = getDashboards() as DashboardData[];
      if (dashboards.length > 0) {
        setDashboard(dashboards[0]);
      }
    }
  }, [id]);

  const handleWidgetSubmit = (widgetData: Omit<Widget, 'id' | 'position'>) => {
    if (!dashboard) return;

    if (editingWidget) {
      const updatedWidget = { ...widgetData, id: editingWidget.id, position: editingWidget.position };
      const updatedWidgets = dashboard.widgets.map(w =>
        w.id === editingWidget.id ? updatedWidget : w
      );
      const updated = updateDashboardWidgets(dashboard.id, updatedWidgets);
      if (updated) {
        setDashboard(updated as DashboardData);
      }
    } else {
      const newWidget = {
        ...widgetData,
        id: crypto.randomUUID(),
        position: dashboard.widgets.length
      };
      
      const updatedWidgets = [...dashboard.widgets, newWidget];
      const updated = updateDashboardWidgets(dashboard.id, updatedWidgets);
      if (updated) {
        setDashboard(updated as DashboardData);
      }
    }
    
    setIsAddWidgetModalOpen(false);
    setEditingWidget(null);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!dashboard) return;

    const updatedWidgets = dashboard.widgets
      .filter(w => w.id !== widgetId)
      .map((w, index) => ({ ...w, position: index }));
    
    const updated = updateDashboardWidgets(dashboard.id, updatedWidgets);
    if (updated) {
      setDashboard(updated as DashboardData);
    }
  };

  const handleRename = () => {
    setIsRenaming(true);
    setNewDashboardName(dashboard?.name || "");
  };

  const handleShare = () => {
    // Implement share functionality
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Dashboard URL copied to clipboard!");
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this dashboard?")) {
      // Implement delete functionality
      navigate('/dashboards');
    }
  };

  const handleExportWidget = (widget: Widget) => {
    const data = widgetData[widget.id] || [];
    
    // Convert data to CSV format
    const csvContent = [
      // Header row
      ['Date', widget.config.metric].join(','),
      // Data rows
      ...data.map(row => [
        format(new Date(row.date), 'MMMM yyyy'),
        row.value
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${widget.title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyy_MM_dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadWidgetData = async (widget: Widget) => {
    if (!loadingWidgets[widget.id]) {
      setLoadingWidgets(prev => ({ ...prev, [widget.id]: true }));
      try {
        const data = await getWidgetData(widget.config);
        setWidgetData(prev => ({ ...prev, [widget.id]: data }));
      } catch (error) {
        console.error('Error loading widget data:', error);
      } finally {
        setLoadingWidgets(prev => ({ ...prev, [widget.id]: false }));
      }
    }
  };

  useEffect(() => {
    if (dashboard?.widgets) {
      dashboard.widgets.forEach(widget => {
        loadWidgetData(widget);
      });
    }
  }, [dashboard?.widgets]);

  const LoadingSkeleton = ({ type }: { type: Widget['config']['chartType'] }) => {
    switch (type) {
      case 'kpi':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        );
      case 'table':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="h-full w-full flex items-center justify-center">
            <div className="h-[200px] w-full bg-slate-100 rounded-lg flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        );
    }
  };

  const renderWidget = (widget: Widget, isMaximized = false) => {
    const data = widgetData[widget.id] || [];
    const isLoading = loadingWidgets[widget.id];

    if (isLoading) {
      return <LoadingSkeleton type={widget.config.chartType} />;
    }

    const chartHeight = isMaximized ? '100%' : '100%';
    const chartWidth = isMaximized ? '100%' : '100%';

    switch (widget.config.chartType) {
      case 'kpi':
        const kpiValue = data.length > 0 ? data[data.length - 1].value : 0;
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className={cn(
              "text-3xl font-bold text-primary",
              isMaximized && "text-5xl"
            )}>
              {kpiValue.toLocaleString()}
            </div>
            <div className={cn(
              "text-sm text-muted-foreground mt-2",
              isMaximized && "text-base mt-4"
            )}>
              {widget.config.metric}
            </div>
          </div>
        );
      case 'line':
        return (
          <div style={{ width: chartWidth, height: chartHeight, minHeight: isMaximized ? 500 : 200 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8"
                  strokeWidth={isMaximized ? 2 : 1.5}
                  dot={{ r: isMaximized ? 5 : 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'bar':
        return (
          <div style={{ width: chartWidth, height: chartHeight, minHeight: isMaximized ? 500 : 200 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'pie':
        return (
          <div style={{ width: chartWidth, height: chartHeight, minHeight: isMaximized ? 500 : 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="date"
                  cx="50%"
                  cy="50%"
                  outerRadius={isMaximized ? "80%" : "70%"}
                  fill="#8884d8"
                  label={renderCustomizedLabel}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'table':
        return (
          <div className={cn(
            "overflow-auto",
            isMaximized ? "max-h-[calc(90vh-200px)]" : "max-h-[300px]"
          )}>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className={cn(
                    "text-left py-2",
                    isMaximized && "text-lg py-4"
                  )}>Date</th>
                  <th className={cn(
                    "text-right py-2",
                    isMaximized && "text-lg py-4"
                  )}>{widget.config.metric}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className={cn(
                      "py-2",
                      isMaximized && "text-base py-3"
                    )}>{format(new Date(item.date), 'MMMM yyyy')}</td>
                    <td className={cn(
                      "text-right py-2",
                      isMaximized && "text-base py-3"
                    )}>{item.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'scatter':
        return (
          <div style={{ width: chartWidth, height: chartHeight, minHeight: isMaximized ? 500 : 200 }}>
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="value" 
                  name={widget.config.metric}
                  label={{ value: widget.config.metric, position: 'bottom' }}
                />
                <YAxis 
                  dataKey="value2" 
                  name={`${widget.config.metric} (secondary)`}
                  label={{ value: `${widget.config.metric} (secondary)`, angle: -90, position: 'left' }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name={widget.config.metric}
                  data={data}
                  fill="#8884d8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );
      case 'bubble':
        return (
          <div style={{ width: chartWidth, height: chartHeight, minHeight: isMaximized ? 500 : 200 }}>
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="value" 
                  name={widget.config.metric}
                  label={{ value: widget.config.metric, position: 'bottom' }}
                />
                <YAxis 
                  dataKey="value2" 
                  name={`${widget.config.metric} (secondary)`}
                  label={{ value: `${widget.config.metric} (secondary)`, angle: -90, position: 'left' }}
                />
                <ZAxis 
                  dataKey="size" 
                  range={[50, 400]} 
                  name="Size"
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name={widget.config.metric}
                  data={data}
                  fill="#8884d8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );
      case 'heatmap':
        // Transform data for heatmap visualization
        const heatmapData = data.map((item, index) => ({
          name: format(new Date(item.date), 'MMM yyyy'),
          value: item.value,
          intensity: (item.value / Math.max(...data.map(d => d.value))) * 100
        }));

        return (
          <div style={{ width: chartWidth, height: chartHeight, minHeight: isMaximized ? 500 : 200 }}>
            <ResponsiveContainer>
              <div className="grid grid-cols-5 gap-2 h-full">
                {heatmapData.map((cell, index) => (
                  <div
                    key={index}
                    className="relative flex items-center justify-center rounded"
                    style={{
                      backgroundColor: `rgba(136, 132, 216, ${cell.intensity / 100})`,
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-sm font-medium">
                      <div>{cell.name}</div>
                      <div>{cell.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  if (!dashboard) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboards')}
                className="h-9 w-9 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                {isRenaming ? (
                  <input
                    type="text"
                    value={newDashboardName}
                    onChange={(e) => setNewDashboardName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsRenaming(false);
                      } else if (e.key === 'Escape') {
                        setIsRenaming(false);
                        setNewDashboardName(dashboard?.name || "");
                      }
                    }}
                    onBlur={() => {
                      setIsRenaming(false);
                      setNewDashboardName(dashboard?.name || "");
                    }}
                    className="text-2xl font-semibold bg-transparent border-b border-gray-300 focus:border-gray-600 focus:outline-none px-1"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold">{dashboard?.name || 'Dashboard'}</h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsRenaming(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Updated {format(new Date(dashboard?.lastUpdatedAt || ''), 'MMM d, yyyy')}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{dashboard?.owner}</span>
                  </div>
                  <span>•</span>
                  <Badge variant={dashboard?.isPublic ? "default" : "secondary"}>
                    {dashboard?.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={enterFullscreen}
                className="bg-white"
              >
                <Presentation className="h-4 w-4 mr-2" /> Present
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddWidgetModalOpen(true)}
                className="bg-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Widget
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="min-h-[600px] bg-slate-50/50 rounded-lg p-6">
            <div className="grid grid-cols-12 gap-6 auto-rows-auto">
              {dashboard?.widgets.map((widget) => {
                const dimensions = calculateWidgetDimensions(widget);
                return (
                  <motion.div 
                    key={widget.id} 
                    className={cn(
                      "bg-white rounded-lg border shadow-sm overflow-hidden",
                      dimensions.columnSpan === 4 ? "col-span-4" : "col-span-6",
                      dimensions.heightClass
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between p-4 border-b bg-card">
                      <h3 className="text-sm font-medium text-gray-700">{widget.title}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            // TODO: Implement chat functionality
                            alert("Chat functionality coming soon!");
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingWidget(widget);
                                setIsAddWidgetModalOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setMaximizedWidget(widget)}
                            >
                              <Maximize2 className="h-4 w-4 mr-2" />
                              Maximize
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportWidget(widget)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteWidget(widget.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-4 h-[calc(100%-4rem)]">
                      {renderWidget(widget)}
                    </div>
                  </motion.div>
                );
              })}
              {dashboard?.widgets.length === 0 && (
                <div className="col-span-12 h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                  <LayoutDashboard className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No widgets yet</h3>
                  <p className="text-sm mb-4">Add widgets to start building your dashboard</p>
                  <Button onClick={() => setIsAddWidgetModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Maximized Widget Modal */}
        {maximizedWidget && (
          <Dialog open={!!maximizedWidget} onOpenChange={() => setMaximizedWidget(null)}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b p-4">
                  <h2 className="text-xl font-semibold">{maximizedWidget.title}</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMaximizedWidget(null)}
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                  {renderWidget(maximizedWidget, true)}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Keep existing modals and presentation mode code */}
        <AddWidgetModal
          open={isAddWidgetModalOpen}
          onOpenChange={setIsAddWidgetModalOpen}
          initialData={editingWidget ? {
            type: 'widget',
            title: editingWidget.title,
            config: {
              dataSources: [editingWidget.config.dataSources[0]],
              metric: editingWidget.config.metric,
              groupBy: editingWidget.config.groupBy,
              chartType: editingWidget.config.chartType,
            }
          } : undefined}
          onSubmit={handleWidgetSubmit}
        />

        {/* Presentation Mode */}
        {isPresentationMode && (
          <div 
            className="fixed inset-0 bg-black z-[100] overflow-hidden"
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlideIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="w-full max-w-[1200px] h-full max-h-[800px] bg-white rounded-lg shadow-2xl overflow-hidden">
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between p-6 border-b bg-card">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {dashboard?.widgets[currentSlideIndex]?.title}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={exitPresentation}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex-1 p-8 bg-white">
                        {dashboard?.widgets[currentSlideIndex] && renderWidget(dashboard.widgets[currentSlideIndex])}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isControlsVisible ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
                {currentSlideIndex + 1} / {dashboard?.widgets.length}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 pointer-events-auto"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextSlide}
                disabled={!dashboard?.widgets || currentSlideIndex === dashboard.widgets.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 pointer-events-auto"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardView; 