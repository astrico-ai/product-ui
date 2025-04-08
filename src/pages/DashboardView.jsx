import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, ChevronLeft, ChevronRight, Presentation, LayoutDashboard, MessageCircle, Share2 } from "lucide-react";
import AddWidgetModal from "@/components/dashboard/AddWidgetModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MainLayout } from "@/components/MainLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDashboard, updateDashboard } from "@/utils/dashboardStorage";
import { cn } from "@/lib/utils";

// Lazy load ApexCharts
const Chart = lazy(() => import('react-apexcharts'));

export default function DashboardView() {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loadingWidgets, setLoadingWidgets] = useState({});

  // Handle presentation navigation
  const handleNextSlide = () => {
    if (dashboard?.widgets && currentSlideIndex < dashboard.widgets.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleKeyPress = (event) => {
    if (!isPresentationMode) return;
    
    if (event.key === 'ArrowRight' || event.key === 'Space') {
      handleNextSlide();
    } else if (event.key === 'ArrowLeft') {
      handlePrevSlide();
    } else if (event.key === 'Escape') {
      setIsPresentationMode(false);
      setCurrentSlideIndex(0);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPresentationMode, currentSlideIndex]);

  // Reset slide index when exiting presentation mode
  useEffect(() => {
    if (!isPresentationMode) {
      setCurrentSlideIndex(0);
    }
  }, [isPresentationMode]);

  useEffect(() => {
    const loadedDashboard = getDashboard(id);
    setDashboard(loadedDashboard);
  }, [id]);

  const handleWidgetSubmit = (widgetData) => {
    if (!dashboard) return;

    let updatedWidgets;
    if (widgetData.id) {
      // Update existing widget
      updatedWidgets = dashboard.widgets.map(w =>
        w.id === widgetData.id ? { ...widgetData, position: w.position } : w
      );
    } else {
      // Add new widget
      const maxPosition = Math.max(...(dashboard.widgets || []).map(w => w.position), -1);
      const newWidget = {
        ...widgetData,
        id: Date.now().toString(),
        position: maxPosition + 1
      };
      updatedWidgets = [...(dashboard.widgets || []), newWidget];
    }

    // Update local state
    const updatedDashboard = {
      ...dashboard,
      widgets: updatedWidgets
    };
    setDashboard(updatedDashboard);

    // Save to local storage
    updateDashboard(id, updatedDashboard);
  };

  const handleDeleteWidget = (widgetId) => {
    if (!dashboard) return;

    const updatedWidgets = (dashboard.widgets || [])
      .filter(w => w.id !== widgetId)
      .map((w, index) => ({ ...w, position: index }));

    // Update local state
    const updatedDashboard = {
      ...dashboard,
      widgets: updatedWidgets
    };
    setDashboard(updatedDashboard);

    // Save to local storage
    updateDashboard(id, updatedDashboard);
  };

  const renderWidget = (widget) => {
    if (!widget) return null;

    const renderChart = () => {
      switch (widget.type) {
        case "kpi":
          let value;
          let trend;
          
          // Determine value based on widget title
          if (widget.title === "Total Leads") {
            value = Math.floor(Math.random() * (500 - 100 + 1)) + 100; // Random between 100-500
            trend = 12.5;
          } else if (widget.title === "Total Live Agents") {
            const maxValue = value || 400; // Use previous value or 400 if undefined
            value = Math.floor(Math.random() * (maxValue - 50 + 1)) + 50; // Random but less than first card
            trend = 8.3;
          } else {
            // For third card: between 30-75 and less than first card
            const firstCardValue = value || 500; // Use first card value or max possible value
            const maxAllowed = Math.min(75, firstCardValue); // Take the smaller of 75 or first card value
            const minValue = 30;
            value = Math.floor(Math.random() * (maxAllowed - minValue + 1)) + minValue;
            trend = -2.8;
          }
          
          return (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {value.toLocaleString()}
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

        case "scatter":
          const scatterData = widget.data || [
            [10, 41], [25, 65], [40, 35],
            [55, 78], [70, 52], [85, 84],
            [30, 45], [45, 58], [60, 72],
            [75, 39], [90, 63], [15, 87]
          ];

          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={{
                    chart: {
                      type: 'scatter',
                      toolbar: {
                        show: false
                      }
                    },
                    markers: {
                      size: 10,
                      colors: ['#3551F3'],
                      strokeWidth: 0
                    },
                    grid: {
                      show: true,
                      borderColor: '#f1f1f1',
                      xaxis: {
                        lines: {
                          show: true
                        }
                      }
                    },
                    xaxis: {
                      type: 'numeric',
                      min: 0,
                      max: 100,
                      tickAmount: 5
                    },
                    yaxis: {
                      min: 0,
                      max: 100,
                      tickAmount: 5
                    }
                  }}
                  series={[{
                    name: "Sample",
                    data: scatterData
                  }]}
                  type="scatter"
                  height={350}
                />
              </Suspense>
            </div>
          );

        case "bubble":
          const bubbleData = widget.data || [
            [25, 45, 50], [50, 70, 80], [75, 35, 30],
            [40, 60, 100], [65, 25, 70], [30, 80, 40]
          ];

          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={{
                    chart: {
                      type: 'bubble',
                      toolbar: {
                        show: false
                      }
                    },
                    grid: {
                      show: true,
                      borderColor: '#f1f1f1',
                      xaxis: {
                        lines: {
                          show: true
                        }
                      }
                    },
                    fill: {
                      opacity: 0.8,
                      colors: ['#3551F3']
                    },
                    xaxis: {
                      min: 0,
                      max: 100,
                      tickAmount: 5
                    },
                    yaxis: {
                      min: 0,
                      max: 100,
                      tickAmount: 5
                    }
                  }}
                  series={[{
                    name: 'Products',
                    data: bubbleData
                  }]}
                  type="bubble"
                  height={350}
                />
              </Suspense>
            </div>
          );

        case "heatmap":
          const generateHeatmapData = () => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return days.map(day => ({
              name: day,
              data: Array.from({ length: 24 }, (_, hour) => {
                const baseValue = hour < 12 ? (hour * 8) : ((24 - hour) * 8);
                const variation = Math.floor(Math.random() * 30);
                return Math.min(100, Math.max(0, baseValue + variation));
              })
            }));
          };

          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={{
                    chart: {
                      type: 'heatmap',
                      toolbar: {
                        show: false
                      }
                    },
                    dataLabels: {
                      enabled: false
                    },
                    colors: ["#3551F3"],
                    plotOptions: {
                      heatmap: {
                        shadeIntensity: 0.5,
                        colorScale: {
                          ranges: [
                            { from: 0, to: 20, color: '#E5E7FF', name: 'Low' },
                            { from: 21, to: 50, color: '#B3B9FF', name: 'Medium' },
                            { from: 51, to: 80, color: '#7C85F7', name: 'High' },
                            { from: 81, to: 100, color: '#3551F3', name: 'Very High' }
                          ]
                        }
                      }
                    },
                    xaxis: {
                      type: 'category',
                      categories: Array.from({ length: 24 }, (_, i) => 
                        `${String(i).padStart(2, '0')}:00`
                      )
                    }
                  }}
                  series={widget.data || generateHeatmapData()}
                  type="heatmap"
                  height={350}
                />
              </Suspense>
            </div>
          );

        case "table":
          const tableData = [
            { 
              id: 1, 
              name: "Rajesh Kumar", 
              value: 7500000, 
              change: 12.5,
              target: 8500000,
              achievement: 88.2
            },
            { 
              id: 2, 
              name: "Priya Patel", 
              value: 9200000, 
              change: -5.2,
              target: 8000000,
              achievement: 115.0
            },
            { 
              id: 3, 
              name: "Suresh Reddy", 
              value: 6800000, 
              change: 8.4,
              target: 7500000,
              achievement: 90.7
            },
            { 
              id: 4, 
              name: "Meera Sharma", 
              value: 5500000, 
              change: -2.8,
              target: 7000000,
              achievement: 78.6
            },
            { 
              id: 5, 
              name: "Arun Verma", 
              value: 9800000, 
              change: 15.7,
              target: 9000000,
              achievement: 108.9
            },
            { 
              id: 6, 
              name: "Deepak Kumar", 
              value: 8200000, 
              change: 10.3,
              target: 8500000,
              achievement: 96.5
            },
            { 
              id: 7, 
              name: "Anita Desai", 
              value: 7100000, 
              change: -3.5,
              target: 7500000,
              achievement: 94.7
            },
            { 
              id: 8, 
              name: "Vikram Singh", 
              value: 6500000, 
              change: 7.8,
              target: 7000000,
              achievement: 92.9
            }
          ];

          return (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Collection Source</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">Collected Amount</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">Target</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">Achievement %</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">MoM Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => (
                      <tr key={`row-${row.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{row.name}</td>
                        <td className="px-4 py-2 text-right text-gray-900">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(row.value)}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-900">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(row.target)}
                        </td>
                        <td className={`px-4 py-2 text-right ${
                          row.achievement >= 100 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {row.achievement}%
                        </td>
                        <td className={`px-4 py-2 text-right ${
                          row.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {row.change >= 0 ? '+' : ''}{row.change}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );

        case "line":
          const lineData = [
            {
              month: "Oct'24",
              Ramesh: 1100000,
              Ankur: 1500000,
              Gaurav: 1600000,
              Rahul: 1300000,
              Roshan: 1800000
            },
            {
              month: "Nov'24",
              Ramesh: 800000,
              Ankur: 1500000,
              Gaurav: 1800000,
              Rahul: 500000,
              Roshan: 700000
            },
            {
              month: "Dec'24",
              Ramesh: 1700000,
              Ankur: 1200000,
              Gaurav: 1000000,
              Rahul: 1500000,
              Roshan: 1600000
            },
            {
              month: "Jan'25",
              Ramesh: 1900000,
              Ankur: 900000,
              Gaurav: 600000,
              Rahul: 1500000,
              Roshan: 1100000
            },
            {
              month: "Feb'25",
              Ramesh: 1500000,
              Ankur: 800000,
              Gaurav: 1600000,
              Rahul: 1900000,
              Roshan: 800000
            }
          ];

          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={{
                    chart: {
                      type: 'line',
                      toolbar: {
                        show: false
                      }
                    },
                    stroke: {
                      width: 2,
                      curve: 'smooth'
                    },
                    xaxis: {
                      categories: lineData.map(d => d.month)
                    },
                    yaxis: {
                      labels: {
                        formatter: (value) => {
                          return new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(value);
                        }
                      }
                    }
                  }}
                  series={[
                    {
                      name: 'Ramesh',
                      data: lineData.map(d => d.Ramesh)
                    },
                    {
                      name: 'Ankur',
                      data: lineData.map(d => d.Ankur)
                    },
                    {
                      name: 'Gaurav',
                      data: lineData.map(d => d.Gaurav)
                    },
                    {
                      name: 'Rahul',
                      data: lineData.map(d => d.Rahul)
                    },
                    {
                      name: 'Roshan',
                      data: lineData.map(d => d.Roshan)
                    }
                  ]}
                  type="line"
                  height={350}
                />
              </Suspense>
            </div>
          );

        case "pie":
          const pieData = [
            { type: 'Rural Vehicle Finance', amount: 48000000 },
            { type: 'Business Loan', amount: 27000000 },
            { type: 'Two Wheeler Loan', amount: 13000000 },
            { type: 'Loan against Property', amount: 34000000 },
            { type: 'Pre Owned Car Loan', amount: 23000000 }
          ];

          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={{
                    chart: {
                      type: 'pie'
                    },
                    labels: pieData.map(d => d.type),
                    tooltip: {
                      y: {
                        formatter: (value) => {
                          return new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(value);
                        }
                      }
                    }
                  }}
                  series={pieData.map(d => d.amount)}
                  type="pie"
                  height={350}
                />
              </Suspense>
            </div>
          );

        case "bar":
          const barData = [
            { agent: 'Amit Sharma', amount: 600000 },
            { agent: 'Priya Iyer', amount: 1400000 },
            { agent: 'Rahul Verma', amount: 1300000 },
            { agent: 'Sneha Nair', amount: 1400000 },
            { agent: 'Vikram Singh', amount: 900000 }
          ];

          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={{
                    chart: {
                      type: 'bar',
                      toolbar: {
                        show: false
                      }
                    },
                    plotOptions: {
                      bar: {
                        horizontal: false,
                        columnWidth: '55%',
                        endingShape: 'rounded'
                      },
                    },
                    xaxis: {
                      categories: barData.map(d => d.agent),
                      labels: {
                        rotate: -45,
                        style: {
                          fontSize: '12px'
                        }
                      }
                    },
                    yaxis: {
                      labels: {
                        formatter: (value) => {
                          return new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(value);
                        }
                      }
                    }
                  }}
                  series={[{
                    name: 'Overdue Amount (>1 Year)',
                    data: barData.map(d => d.amount)
                  }]}
                  type="bar"
                  height={350}
                />
              </Suspense>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{widget.title}</h3>
            <p className="text-sm text-gray-500">{widget.description}</p>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50 mr-1">
              <MessageCircle className="h-4 w-4 text-gray-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleDeleteWidget(widget.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {renderChart()}
      </div>
    );
  };

  if (!dashboard) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3551F3] mx-auto"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {isPresentationMode ? (
        <div className="fixed inset-0 bg-gray-900 z-50">
          <div className="absolute top-4 right-4 flex items-center gap-2 text-white">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setIsPresentationMode(false)}
            >
              <ChevronLeft className="h-4 w-4" />
              Exit
            </Button>
          </div>
          <div className="h-full flex items-center justify-center p-12">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 disabled:opacity-50"
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="w-full max-w-4xl">
              {dashboard?.widgets && dashboard.widgets[currentSlideIndex] && (
                <div className="transform scale-125">
                  {renderWidget(dashboard.widgets[currentSlideIndex])}
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                {currentSlideIndex + 1} / {dashboard?.widgets?.length || 0}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 disabled:opacity-50"
              onClick={handleNextSlide}
              disabled={!dashboard?.widgets || currentSlideIndex === dashboard.widgets.length - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#3551F3]/10 flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-[#3551F3]" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{dashboard.name}</h1>
                  <p className="text-sm text-gray-500">
                    {dashboard.settings?.visibility === 'public' ? 'Public Dashboard' : 'Private Dashboard'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsPresentationMode(!isPresentationMode)}
              >
                <Presentation className="h-4 w-4" />
                {isPresentationMode ? 'Exit Presentation' : 'Present'}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                onClick={() => setIsAddWidgetModalOpen(true)}
                className="bg-[#3551F3] hover:bg-[#2B41D9] text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Widget
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {(!dashboard.widgets || dashboard.widgets.length === 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12">
              <div className="max-w-md mx-auto text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#3551F3]/10 flex items-center justify-center mx-auto mb-6">
                  <LayoutDashboard className="h-6 w-6 text-[#3551F3]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No widgets yet</h2>
                <p className="text-gray-500 mb-6">
                  Start building your dashboard by adding widgets. You can add various types of visualizations to track your metrics.
                </p>
                <Button 
                  onClick={() => setIsAddWidgetModalOpen(true)}
                  className="bg-[#3551F3] hover:bg-[#2B41D9] text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Widget
                </Button>
              </div>
            </div>
          )}

          {/* Widgets Grid */}
          {dashboard.widgets && dashboard.widgets.length > 0 && (
            <div className="space-y-6">
              {/* KPI Widgets */}
              {dashboard.widgets.some(w => w.type === 'kpi') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboard.widgets
                    .filter(w => w.type === 'kpi')
                    .sort((a, b) => a.position - b.position)
                    .map((widget) => (
                      <div key={widget.id}>
                        {renderWidget(widget)}
                      </div>
                    ))}
                </div>
              )}
              
              {/* Other Widgets */}
              {dashboard.widgets.some(w => w.type !== 'kpi') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dashboard.widgets
                    .filter(w => w.type !== 'kpi')
                    .sort((a, b) => a.position - b.position)
                    .map((widget) => (
                      <div key={widget.id}>
                        {renderWidget(widget)}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        onClose={setIsAddWidgetModalOpen}
        onSubmit={handleWidgetSubmit}
        dashboardType="regular"
        initialData={null}
      />
    </MainLayout>
  );
} 