import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, ChevronLeft, ChevronRight, Presentation, LayoutDashboard, MessageCircle, Share2, ArrowRight, X, ChevronDown, ThumbsUp, ThumbsDown, BarChart, LineChart, PieChart, Table, GripVertical } from "lucide-react";
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
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import React from "react";

// Lazy load ApexCharts
const Chart = lazy(() => import('react-apexcharts'));

export default function DashboardView() {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loadingWidgets, setLoadingWidgets] = useState({});
  const [tableData, setTableData] = useState([]);
  const [addWidgetStep, setAddWidgetStep] = useState(null); // null | 'select' | 'manual' | 'ai'

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

  useEffect(() => {
    if (dashboard?.widgets) {
      const tableWidget = dashboard.widgets.find(w => w.type === 'table' && w.csvData);
      if (tableWidget?.csvData) {
        Papa.parse(tableWidget.csvData, {
          header: true,
          complete: (results) => {
            setTableData(results.data);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      }
    }
  }, [dashboard?.widgets]);

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
          // If no CSV data is provided, fall back to default data
          const displayData = tableData.length > 0 ? tableData : [
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
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {Object.keys(displayData[0] || {}).map((header) => (
                        <th key={header} className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                          {header.charAt(0).toUpperCase() + header.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {displayData.map((row, index) => (
                      <tr key={row.id || `row-${index}`} className="hover:bg-gray-50 transition-colors">
                        {Object.entries(row).map(([key, value]) => (
                          <td 
                            key={key} 
                            className={cn(
                              "px-6 py-4 whitespace-nowrap",
                              key === 'change' || key === 'achievement' 
                                ? Number(value) >= 0 ? 'text-green-600' : 'text-red-600'
                                : 'text-gray-900',
                              key === 'value' || key === 'target' ? 'text-right' : ''
                            )}
                          >
                            {key === 'value' || key === 'target'
                              ? new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: 'INR',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                }).format(value)
                              : key === 'change' || key === 'achievement'
                                ? `${Number(value) >= 0 ? '+' : ''}${value}%`
                                : value
                            }
                          </td>
                        ))}
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
                onClick={() => setAddWidgetStep('select')}
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
                      <div 
                        key={widget.id} 
                        className={cn(
                          widget.type === 'table' ? 'md:col-span-2' : ''
                        )}
                      >
                        {renderWidget(widget)}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Widget Selection Modal */}
      <Dialog open={addWidgetStep === 'select'} onOpenChange={open => setAddWidgetStep(open ? 'select' : null)}>
        <DialogContent className="max-w-lg p-0 bg-gradient-to-br from-white/90 to-slate-50/90 rounded-2xl shadow-2xl border-0">
          <DialogHeader className="px-8 pt-8 pb-2">
            <DialogTitle className="text-2xl font-semibold text-gray-900 mb-1">Add Widget</DialogTitle>
            <DialogDescription className="text-base text-gray-500">Select how you want to create your widget.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 px-8 pb-8 pt-2">
            {/* AI Option */}
            <button
              className="w-full flex items-center gap-5 p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/60 transition-all group focus:outline-none focus:ring-2 focus:ring-primary/20"
              onClick={() => setAddWidgetStep('ai')}
            >
              <span className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-purple-100/80 to-blue-100/80 shadow-inner border border-white/60 group-hover:scale-105 transition-transform">
                {/* Brain SVG icon */}
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#a78bfa" d="M7.5 3A3.5 3.5 0 0 0 4 6.5V7a3.5 3.5 0 0 0-2 3.15V13a3.5 3.5 0 0 0 2 3.15V17a3.5 3.5 0 0 0 3.5 3.5h1.25A2.25 2.25 0 0 0 12 22a2.25 2.25 0 0 0 2.25-2.25V19.5h.25A2.25 2.25 0 0 0 16.75 22a2.25 2.25 0 0 0 2.25-2.25V20.5A3.5 3.5 0 0 0 22 17v-1.85A3.5 3.5 0 0 0 24 13V10.15A3.5 3.5 0 0 0 22 7V6.5A3.5 3.5 0 0 0 18.5 3h-11Z"/></svg>
              </span>
              <div className="flex-1 text-left">
                <div className="text-lg font-semibold text-gray-900 mb-1">Create with AI</div>
                <div className="text-sm text-gray-500">Just type what you want to see and we'll build the chart for you.</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>
            {/* Manual Option */}
            <button
              className="w-full flex items-center gap-5 p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/60 transition-all group focus:outline-none focus:ring-2 focus:ring-primary/20"
              onClick={() => setAddWidgetStep('manual')}
            >
              <span className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-slate-100/80 to-gray-100/80 shadow-inner border border-white/60 group-hover:scale-105 transition-transform">
                {/* Wrench/Hammer SVG icon */}
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#64748b" d="M21.7 20.3a1 1 0 0 1-1.4 0l-6.6-6.6a1 1 0 0 1 0-1.4l1.3-1.3-2.6-2.6-1.3 1.3a1 1 0 0 1-1.4 0l-6.6-6.6a1 1 0 0 1 0-1.4l2.3-2.3a1 1 0 0 1 1.4 0l6.6 6.6a1 1 0 0 1 0 1.4l-1.3 1.3 2.6 2.6 1.3-1.3a1 1 0 0 1 1.4 0l6.6 6.6a1 1 0 0 1 0 1.4l-2.3 2.3Z"/></svg>
              </span>
              <div className="flex-1 text-left">
                <div className="text-lg font-semibold text-gray-900 mb-1">Create Manually</div>
                <div className="text-sm text-gray-500">Use the chart builder to select fields and design your chart from scratch.</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chart Builder - Right Sliding Panel */}
      {addWidgetStep === 'ai' && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setAddWidgetStep(null)}
          />
          {/* Sliding Panel */}
          <div className="fixed right-0 top-0 h-full w-2/5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
            <AIChartBuilder onClose={() => setAddWidgetStep(null)} onEditManually={() => console.log('Edit Manually')} onAddToDashboard={() => console.log('Add to Dashboard')} />
          </div>
        </>
      )}
      {/* Manual Chart Builder - Full Screen */}
      {addWidgetStep === 'manual' && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <ManualChartBuilder onClose={() => setAddWidgetStep(null)} onSave={handleWidgetSubmit} />
        </div>
      )}
    </MainLayout>
  );
} 

// --- AIChartBuilder Component ---

function AIChartBuilder({ onClose, onEditManually, onAddToDashboard }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
  const inputRef = useRef(null);

  const examplePrompts = [
    "Show sales by region for last quarter",
    "Compare leads across campaigns",
    "Trend of cost per click over time"
  ];

  const chartTypes = [
    { value: "bar", label: "Bar Chart", icon: BarChart },
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "table", label: "Table", icon: Table }
  ];

  // Mock chart data
  const chartData = [
    { type: "Search", cpc: 2.15 },
    { type: "Display", cpc: 1.32 },
    { type: "Social", cpc: 1.98 },
    { type: "Video", cpc: 2.45 }
  ];

  const handleExample = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);
    setShowChart(false);
    setTimeout(() => {
      setLoading(false);
      setShowChart(true);
    }, 2000);
  };

  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    setShowChartTypeMenu(false);
  };

  const handleFeedback = (type) => {
    console.log(`User ${type === 'like' ? 'liked' : 'disliked'} chart`);
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <div className="w-full h-48 flex items-end gap-4 px-4 pb-4">
            {chartData.map((d) => (
              <div key={d.type} className="flex flex-col items-center flex-1">
                <div
                  className="w-8 rounded-t-lg bg-gradient-to-t from-[#3551F3] to-[#A5B4FC] shadow-sm transition-all"
                  style={{ height: `${d.cpc * 35 + 25}px` }}
                ></div>
                <span className="mt-2 text-gray-700 text-xs font-medium">{d.type}</span>
                <span className="text-xs text-gray-400">₹{d.cpc.toFixed(2)}</span>
              </div>
            ))}
          </div>
        );
      
      case "line":
        return (
          <div className="w-full h-48 flex items-center justify-center relative px-4">
            <svg width="100%" height="100%" viewBox="0 0 300 150">
              <polyline
                points="50,120 100,85 150,95 200,70 250,60"
                fill="none"
                stroke="#3551F3"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {chartData.map((d, i) => (
                <circle
                  key={d.type}
                  cx={50 + i * 50}
                  cy={120 - d.cpc * 25}
                  r="4"
                  fill="#3551F3"
                />
              ))}
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-500">
              {chartData.map((d) => (
                <span key={d.type}>{d.type}</span>
              ))}
            </div>
          </div>
        );
      
      case "pie":
        return (
          <div className="w-full h-48 flex items-center justify-center">
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="#3551F3" />
                <circle cx="60" cy="60" r="50" fill="#A5B4FC" strokeDasharray="78.5 314" strokeDashoffset="0" stroke="#60A5FA" strokeWidth="50" fillOpacity="0" />
                <circle cx="60" cy="60" r="50" fill="#60A5FA" strokeDasharray="47.1 314" strokeDashoffset="-78.5" stroke="#93C5FD" strokeWidth="50" fillOpacity="0" />
                <circle cx="60" cy="60" r="50" fill="#93C5FD" strokeDasharray="62.8 314" strokeDashoffset="-125.6" stroke="#DBEAFE" strokeWidth="50" fillOpacity="0" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">CPC Data</span>
              </div>
            </div>
          </div>
        );
      
      case "table":
        return (
          <div className="w-full h-48 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Campaign Type</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">CPC</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d) => (
                  <tr key={d.type} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-900">{d.type}</td>
                    <td className="px-3 py-2 text-right text-gray-900">₹{d.cpc.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Create with AI</h2>
          <p className="text-sm text-gray-500 mt-1">Describe what you want to visualize and let AI do the rest.</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <form onSubmit={handleGenerate} className="space-y-4">
          <textarea
            ref={inputRef}
            className="w-full min-h-[60px] max-h-32 p-4 rounded-xl border border-gray-200 bg-white shadow-sm text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            placeholder="What would you like to visualize?"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          
          {/* Example Prompts */}
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((ex) => (
              <button
                type="button"
                key={ex}
                className="px-3 py-2 rounded-full bg-gray-100 hover:bg-primary/10 text-gray-700 text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                onClick={() => handleExample(ex)}
                disabled={loading}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#3551F3] hover:bg-[#2B41D9] text-white text-base font-semibold shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                Generating…
              </span>
            ) : (
              "Generate Chart"
            )}
          </button>
        </form>

        {/* Chart Preview */}
        {showChart && !loading && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative">
              {/* Chart Type Switcher */}
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <button
                    onClick={() => setShowChartTypeMenu(!showChartTypeMenu)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-600 transition-colors"
                  >
                    {React.createElement(chartTypes.find(t => t.value === chartType)?.icon, { className: "w-3 h-3" })}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showChartTypeMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                      {chartTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleChartTypeChange(type.value)}
                          className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 ${
                            chartType === type.value ? 'bg-primary/5 text-primary' : 'text-gray-700'
                          }`}
                        >
                          {React.createElement(type.icon, { className: "w-3 h-3" })}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4 pr-16">
                <h3 className="text-lg font-semibold text-gray-900">Cost per Click by Campaign Type</h3>
                <p className="text-gray-500 text-sm">{chartTypes.find(t => t.value === chartType)?.label} preview (mocked)</p>
              </div>
              
              {/* Chart Content */}
              {renderChart()}
              
              {/* Axes labels - only show for bar and line charts */}
              {(chartType === "bar" || chartType === "line") && (
                <div className="flex justify-between mt-2 px-4">
                  <span className="text-xs text-gray-500">Campaign Type</span>
                  <span className="text-xs text-gray-500">CPC</span>
                </div>
              )}

              {/* Feedback Buttons */}
              <div className="flex justify-start gap-3 mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleFeedback('like')}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-green-50 border border-gray-200 hover:border-green-200 text-xs font-medium text-gray-600 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFeedback('dislike')}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                onClick={onEditManually}
                type="button"
              >
                Edit Manually
              </button>
              <button
                className="flex-1 py-2 px-4 rounded-xl bg-[#3551F3] hover:bg-[#2B41D9] text-white font-semibold shadow-md transition-all"
                onClick={onAddToDashboard}
                type="button"
              >
                Add to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3551F3]"></span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Calculated Field Modal Component ---
function CalculatedFieldModal({ isOpen, onClose, onSubmit, availableFields, dataset }) {
  const [fieldName, setFieldName] = useState("");
  const [formula, setFormula] = useState("");
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const formulaRef = useRef(null);

  const allFieldNames = [...dataset.dimensions, ...dataset.metrics].map(f => f.name);

  const handleFormulaChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setFormula(value);
    setCursorPosition(position);
    
    // Find the current word being typed
    const beforeCursor = value.substring(0, position);
    const afterCursor = value.substring(position);
    
    // Find the start of the current word (after space, operator, or parenthesis)
    const wordStart = Math.max(
      beforeCursor.lastIndexOf(' '),
      beforeCursor.lastIndexOf('+'),
      beforeCursor.lastIndexOf('-'),
      beforeCursor.lastIndexOf('*'),
      beforeCursor.lastIndexOf('/'),
      beforeCursor.lastIndexOf('('),
      beforeCursor.lastIndexOf(')')
    ) + 1;
    
    const currentWord = beforeCursor.substring(wordStart);
    
    if (currentWord.length > 0) {
      // Filter field names that match the current word
      const matchingFields = allFieldNames.filter(name =>
        name.toLowerCase().includes(currentWord.toLowerCase())
      );
      
      if (matchingFields.length > 0) {
        setSuggestions(matchingFields);
        setShowSuggestions(true);
        setSelectedSuggestion(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        insertSuggestion(suggestions[selectedSuggestion]);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const insertSuggestion = (fieldName) => {
    const beforeCursor = formula.substring(0, cursorPosition);
    const afterCursor = formula.substring(cursorPosition);
    
    // Find the start of the current word
    const wordStart = Math.max(
      beforeCursor.lastIndexOf(' '),
      beforeCursor.lastIndexOf('+'),
      beforeCursor.lastIndexOf('-'),
      beforeCursor.lastIndexOf('*'),
      beforeCursor.lastIndexOf('/'),
      beforeCursor.lastIndexOf('('),
      beforeCursor.lastIndexOf(')')
    ) + 1;
    
    const beforeWord = beforeCursor.substring(0, wordStart);
    const newFormula = beforeWord + fieldName + afterCursor;
    const newCursorPosition = beforeWord.length + fieldName.length;
    
    setFormula(newFormula);
    setShowSuggestions(false);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (!fieldName.trim()) {
      newErrors.fieldName = "Field name is required";
    }
    
    if (!formula.trim()) {
      newErrors.formula = "Formula is required";
    } else {
      // Basic validation - check if referenced fields exist
      const fieldNames = [...dataset.dimensions, ...dataset.metrics].map(f => f.name);
      const formulaWords = formula.split(/[\s+\-*/()]+/).filter(word => word.trim());
      
      const invalidFields = formulaWords.filter(word => 
        isNaN(word) && // Not a number
        !['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'].includes(word.toUpperCase()) && // Not a function
        !fieldNames.includes(word) // Not a valid field name
      );
      
      if (invalidFields.length > 0) {
        newErrors.formula = `Unknown fields: ${invalidFields.join(', ')}`;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit the calculated field
    onSubmit({ name: fieldName, formula });
    
    // Reset form
    setFieldName("");
    setFormula("");
    setErrors({});
  };

  const handleClose = () => {
    setFieldName("");
    setFormula("");
    setErrors({});
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Calculated Field</DialogTitle>
          <DialogDescription>
            Create a new calculated field using a formula with existing fields.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Name
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., CTR, Conversion Rate"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.fieldName ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.fieldName && (
              <p className="mt-1 text-xs text-red-600">{errors.fieldName}</p>
            )}
          </div>

          {/* Formula */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula
            </label>
            <textarea
              ref={formulaRef}
              value={formula}
              onChange={handleFormulaChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Clicks / Impressions * 100"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.formula ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => insertSuggestion(suggestion)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                      index === selectedSuggestion ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-xs">
                      {dataset.dimensions.find(f => f.name === suggestion) ? '🏷️' : '#️⃣'}
                    </span>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {errors.formula && (
              <p className="mt-1 text-xs text-red-600">{errors.formula}</p>
            )}
          </div>



          {/* Formula Examples */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula Examples
            </label>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• <code className="bg-gray-100 px-1 rounded">Clicks / Impressions * 100</code> - Click-through rate</div>
              <div>• <code className="bg-gray-100 px-1 rounded">Deal Value / Lead Count</code> - Average deal size</div>
              <div>• <code className="bg-gray-100 px-1 rounded">Cost / Clicks</code> - Cost per click</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3551F3] hover:bg-[#2B41D9] text-white rounded-lg transition-colors"
            >
              Create Field
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 

// --- ManualChartBuilder Component ---
function ManualChartBuilder({ onClose, onSave }) {
  const [selectedDataset, setSelectedDataset] = useState("salesforce");
  const [chartTitle, setChartTitle] = useState("Untitled");
  const [selectedFields, setSelectedFields] = useState({
    xAxis: "",
    yAxis: [], // Changed to array for multi-select
    groupBy: "",
    chartType: "bar"
  });
  const [filters, setFilters] = useState([]);
  const [calculatedFields, setCalculatedFields] = useState([]);
  const [isCalculatedFieldModalOpen, setIsCalculatedFieldModalOpen] = useState(false);
  const [isTitleEditModalOpen, setIsTitleEditModalOpen] = useState(false);
  const [formatting, setFormatting] = useState({
    valueFormat: 'auto',
    decimalPrecision: 2,
    xAxisLabel: '',
    yAxisLabel: '',
    legendPosition: 'bottom'
  });
  const [customColors, setCustomColors] = useState({});
  const [isFormattingExpanded, setIsFormattingExpanded] = useState(false);

  const datasets = {
    salesforce: {
      name: "Salesforce",
      dimensions: [
        { id: "lead_source", name: "Lead Source", type: "text" },
        { id: "region", name: "Region", type: "text" },
        { id: "industry", name: "Industry", type: "text" },
        { id: "created_date", name: "Created Date", type: "date" },
        { id: "stage", name: "Stage", type: "text" },
        { id: "is_qualified", name: "Is Qualified", type: "boolean" }
      ],
      metrics: [
        { id: "lead_count", name: "Lead Count", type: "number" },
        { id: "conversion_rate", name: "Conversion Rate", type: "percentage" },
        { id: "deal_value", name: "Deal Value", type: "currency" },
        { id: "pipeline_value", name: "Pipeline Value", type: "currency" }
      ]
    },
    googleads: {
      name: "Google Ads",
      dimensions: [
        { id: "campaign_name", name: "Campaign Name", type: "text" },
        { id: "ad_group", name: "Ad Group", type: "text" },
        { id: "device", name: "Device", type: "text" },
        { id: "date", name: "Date", type: "date" },
        { id: "keyword", name: "Keyword", type: "text" },
        { id: "is_mobile", name: "Is Mobile", type: "boolean" }
      ],
      metrics: [
        { id: "impressions", name: "Impressions", type: "number" },
        { id: "clicks", name: "Clicks", type: "number" },
        { id: "ctr", name: "Click-through Rate", type: "percentage" },
        { id: "cost", name: "Cost", type: "currency" },
        { id: "cpc", name: "Cost per Click", type: "currency" }
      ]
    }
  };

  const chartTypes = [
    { value: "bar", label: "Bar Chart", icon: BarChart },
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "table", label: "Table", icon: Table }
  ];

  const currentDataset = datasets[selectedDataset];
  const allFields = [...currentDataset.dimensions, ...currentDataset.metrics, ...calculatedFields];

  const handleFieldSelect = (fieldId, configType) => {
    if (configType === 'yAxis') {
      // Handle multi-select for Y-axis
      setSelectedFields(prev => {
        const currentYAxis = prev.yAxis || [];
        const isSelected = currentYAxis.includes(fieldId);
        
        if (isSelected) {
          // Remove if already selected
          return {
            ...prev,
            yAxis: currentYAxis.filter(id => id !== fieldId)
          };
        } else {
          // Add if not selected (limit based on chart type)
          const maxMetrics = prev.chartType === 'pie' ? 1 : 5; // Pie charts only support 1 metric
          if (currentYAxis.length < maxMetrics) {
            return {
              ...prev,
              yAxis: [...currentYAxis, fieldId]
            };
          }
        }
        return prev;
      });
    } else {
      setSelectedFields(prev => ({
        ...prev,
        [configType]: fieldId
      }));
    }
  };

  const addFilter = () => {
    setFilters(prev => [...prev, { field: "", operator: "equals", value: "" }]);
  };

  const updateFilter = (index, key, value) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, [key]: value } : filter
    ));
  };

  const removeFilter = (index) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateCalculatedField = (fieldData) => {
    const newField = {
      id: `calc_${Date.now()}`,
      name: fieldData.name,
      formula: fieldData.formula,
      type: "calculated",
      isCalculated: true
    };
    setCalculatedFields(prev => [...prev, newField]);
    setIsCalculatedFieldModalOpen(false);
  };

  const handleSave = () => {
    const chartData = {
      type: selectedFields.chartType,
      title: chartTitle || "Untitled Chart",
      config: {
        dataset: selectedDataset,
        xAxis: selectedFields.xAxis,
        yAxis: selectedFields.yAxis,
        groupBy: selectedFields.groupBy,
        filters: filters
      }
    };
    onSave(chartData);
    onClose();
  };

  // Chart type support for multiple metrics
  const supportsMultipleMetrics = (chartType) => {
    return ['bar', 'line', 'table'].includes(chartType);
  };

  // New, more professional color palette
  const professionalColors = [
    '#4C6EF5', '#228BE6', '#15AABF', '#12B886', '#40C057', '#82C91E',
    '#FAB005', '#FD7E14', '#FF6B6B', '#F06595', '#CC5DE8', '#845EF7',
  ];

  // Get legend categories based on current chart configuration
  const getLegendCategories = () => {
    const categories = [];
    
    if (selectedFields.chartType === 'pie') {
      // For pie charts, categories are based on X-axis field values
      if (selectedFields.xAxis) {
        // Mock data based on the selected field
        const field = allFields.find(f => f.id === selectedFields.xAxis);
        if (field) {
          switch (field.id) {
            case 'lead_source':
              categories.push('Organic Search', 'Paid Search', 'Social Media', 'Email', 'Direct');
              break;
            case 'region':
              categories.push('North America', 'Europe', 'Asia Pacific', 'Latin America');
              break;
            case 'industry':
              categories.push('Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail');
              break;
            case 'stage':
              categories.push('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won');
              break;
            case 'campaign_name':
              categories.push('Summer Sale', 'Black Friday', 'Product Launch', 'Brand Awareness');
              break;
            case 'device':
              categories.push('Desktop', 'Mobile', 'Tablet');
              break;
            default:
              categories.push('Category A', 'Category B', 'Category C', 'Category D');
          }
        }
      }
    } else if (selectedFields.yAxis.length > 1) {
      // For multi-metric charts, categories are the metric names
      selectedFields.yAxis.forEach(fieldId => {
        const field = allFields.find(f => f.id === fieldId);
        if (field) {
          categories.push(field.name);
        }
      });
    } else if (selectedFields.xAxis) {
      // For single metric charts with grouping, categories are X-axis values
      const field = allFields.find(f => f.id === selectedFields.xAxis);
      if (field) {
        switch (field.id) {
          case 'lead_source':
            categories.push('Organic Search', 'Paid Search', 'Social Media', 'Email');
            break;
          case 'region':
            categories.push('North America', 'Europe', 'Asia Pacific', 'Latin America');
            break;
          case 'industry':
            categories.push('Technology', 'Healthcare', 'Finance', 'Manufacturing');
            break;
          case 'campaign_name':
            categories.push('Summer Sale', 'Black Friday', 'Product Launch');
            break;
          case 'device':
            categories.push('Desktop', 'Mobile', 'Tablet');
            break;
          default:
            categories.push('Series 1', 'Series 2', 'Series 3');
        }
      }
    }
    
    return categories;
  };

  // Get color for a category (custom or default)
  const getCategoryColor = (category, index) => {
    return customColors[category] || professionalColors[index % professionalColors.length];
  };

  // Update custom color for a category
  const updateCategoryColor = (category, color) => {
    setCustomColors(prev => ({
      ...prev,
      [category]: color
    }));
  };

  // Number formatting function
  const formatValue = (value, format = formatting.valueFormat, precision = formatting.decimalPrecision) => {
    if (typeof value !== 'number' || isNaN(value)) return value;
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(precision)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
      case 'compact':
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toFixed(precision);
      case 'decimal':
        return value.toFixed(precision);
      case 'auto':
      default:
        // Auto-detect best format based on value
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toLocaleString('en-IN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: precision
        });
    }
  };

  const renderMockChart = () => {
    const [activeBar, setActiveBar] = useState(null);
    const [activeSlice, setActiveSlice] = useState(null);

    if (!selectedFields.xAxis || !selectedFields.yAxis || selectedFields.yAxis.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="text-5xl mb-3">📈</div>
            <h3 className="text-lg font-medium text-gray-700">Chart Preview</h3>
            <p className="text-sm text-gray-500">Select fields for X and Y axes to build your chart.</p>
          </div>
        </div>
      );
    }

    const legendCategories = getLegendCategories();
    const mockData = [
      { name: "Q1", values: [290, 210, 180, 150, 100] },
      { name: "Q2", values: [350, 260, 200, 180, 120] },
      { name: "Q3", values: [240, 190, 150, 120, 90] },
      { name: "Q4", values: [420, 400, 320, 280, 200] }
    ];

    const chartMargins = { top: 20, right: 20, bottom: 50, left: 60 };
    const chartWidth = 500;
    const chartHeight = 280;
    const boundedWidth = chartWidth - chartMargins.left - chartMargins.right;
    const boundedHeight = chartHeight - chartMargins.top - chartMargins.bottom;

    const yMax = Math.max(...mockData.flatMap(d => d.values.slice(0, selectedFields.yAxis.length)));
    const yTicks = Array.from({ length: 5 }, (_, i) => Math.ceil((yMax / 4) * i / 10) * 10);
    
    // --- SVG Components ---
    const Grid = () => (
      <>
        {/* Y-axis grid lines */}
        {yTicks.map((tick, i) => (
          (i > 0) && <line
            key={`grid-${i}`}
            x1={chartMargins.left}
            y1={chartMargins.top + boundedHeight - (tick / yMax) * boundedHeight}
            x2={chartMargins.left + boundedWidth}
            y2={chartMargins.top + boundedHeight - (tick / yMax) * boundedHeight}
            stroke="#e9ecef"
            strokeWidth="1"
          />
        ))}
      </>
    );

    const Axes = () => (
      <>
        {/* Y-axis */}
        <path d={`M ${chartMargins.left} ${chartMargins.top} L ${chartMargins.left} ${chartMargins.top + boundedHeight}`} stroke="#adb5bd" strokeWidth="1" />
        {yTicks.map((tick, i) => (
          <g key={`y-tick-${i}`} transform={`translate(${chartMargins.left - 8}, ${chartMargins.top + boundedHeight - (tick / yMax) * boundedHeight})`}>
            <text textAnchor="end" alignmentBaseline="middle" className="fill-gray-600" style={{ fontSize: '11px' }}>
              {formatValue(tick, 'compact')}
            </text>
          </g>
        ))}
        {/* X-axis */}
        <path d={`M ${chartMargins.left} ${chartMargins.top + boundedHeight} L ${chartMargins.left + boundedWidth} ${chartMargins.top + boundedHeight}`} stroke="#adb5bd" strokeWidth="1" />
        {mockData.map((d, i) => (
          <g key={`x-tick-${i}`} transform={`translate(${chartMargins.left + ((i + 0.5) * boundedWidth / mockData.length)}, ${chartMargins.top + boundedHeight + 18})`}>
            <text textAnchor="middle" alignmentBaseline="middle" className="fill-gray-700" style={{ fontSize: '12px', fontWeight: '500' }}>
              {d.name}
            </text>
          </g>
        ))}
        {/* Axis Labels */}
        <text transform={`translate(${chartMargins.left / 3}, ${chartMargins.top + boundedHeight / 2}) rotate(-90)`} textAnchor="middle" className="fill-gray-800" style={{ fontSize: '12px', fontWeight: '500' }}>
          {formatting.yAxisLabel || selectedFields.yAxis.map(id => allFields.find(f => f.id === id)?.name).join(', ')}
        </text>
        <text transform={`translate(${chartMargins.left + boundedWidth / 2}, ${chartHeight - 10})`} textAnchor="middle" className="fill-gray-800" style={{ fontSize: '12px', fontWeight: '500' }}>
          {formatting.xAxisLabel || allFields.find(f => f.id === selectedFields.xAxis)?.name}
        </text>
      </>
    );

    const Tooltip = ({ content }) => {
        if (!content) return null;
        const { x, y, category, value, color } = content;
        return (
          <g transform={`translate(${x}, ${y})`}>
            <rect x="-45" y="-35" width="90" height="30" rx="4" fill="rgba(33, 37, 41, 0.85)" stroke="#fff" strokeWidth="1"/>
            <text x="0" y="-20" textAnchor="middle" fill="#fff" style={{ fontSize: '11px', fontWeight: 'bold' }}>
              {category}
            </text>
            <text x="0" y="-7" textAnchor="middle" fill={color} style={{ fontSize: '10px', fontWeight: '500' }}>
              {formatValue(value)}
            </text>
          </g>
        );
      };

    const renderBarChart = () => {
      const groupWidth = boundedWidth / mockData.length;
      const numMetrics = selectedFields.yAxis.length;
      const barPadding = 0.2;
      const barWidth = groupWidth * (1 - barPadding) / numMetrics;

      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible font-sans">
          <Grid />
          {mockData.map((d, i) => {
            const groupX = chartMargins.left + i * groupWidth;
            return (
              <g key={`group-${i}`} transform={`translate(${groupX}, 0)`}>
                {selectedFields.yAxis.map((metricId, j) => {
                  const metric = allFields.find(f => f.id === metricId);
                  const barHeight = (d.values[j] / yMax) * boundedHeight;
                  const x = (groupWidth * barPadding / 2) + j * barWidth;
                  const y = chartMargins.top + boundedHeight - barHeight;
                  const color = getCategoryColor(metric.name, j);

                  return (
                    <g key={metricId}>
                      <defs>
                        <linearGradient id={`gradient-${j}`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                          <stop offset="100%" stopColor={color} stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth - 1}
                        height={barHeight}
                        fill={`url(#gradient-${j})`}
                        rx="2"
                        onMouseEnter={() => setActiveBar({ group: d.name, category: metric.name, value: d.values[j], color, x: groupX + x + barWidth/2, y: y-5 })}
                        onMouseLeave={() => setActiveBar(null)}
                        style={{ transition: 'all 0.2s ease-in-out', filter: activeBar && activeBar.category === metric.name && activeBar.group === d.name ? 'brightness(1.1)' : 'brightness(1)' }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
          <Axes />
          <Tooltip content={activeBar} />
        </svg>
      );
    };

    const renderLineChart = () => {
      const xScale = (index) => chartMargins.left + (index + 0.5) * (boundedWidth / mockData.length);
      const yScale = (value) => chartMargins.top + boundedHeight - (value / yMax) * boundedHeight;

      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible font-sans">
          <Grid />
          {selectedFields.yAxis.map((metricId, j) => {
            const metric = allFields.find(f => f.id === metricId);
            const color = getCategoryColor(metric.name, j);
            const pathData = mockData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.values[j])}`).join(' ');

            return (
              <g key={metricId}>
                <path d={pathData} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {mockData.map((d, i) => (
                  <g key={`dot-${i}`}>
                    <circle cx={xScale(i)} cy={yScale(d.values[j])} r="8" fill={color} fillOpacity="0"
                      onMouseEnter={() => setActiveBar({ group: d.name, category: metric.name, value: d.values[j], color, x: xScale(i), y: yScale(d.values[j]) - 10 })}
                      onMouseLeave={() => setActiveBar(null)}
                    />
                    <circle cx={xScale(i)} cy={yScale(d.values[j])} r="4" fill="#fff" stroke={color} strokeWidth="2" className="pointer-events-none" />
                  </g>
                ))}
              </g>
            );
          })}
          <Axes />
          <Tooltip content={activeBar} />
        </svg>
      );
    };

    const renderPieChart = () => {
      if (selectedFields.yAxis.length > 1) {
          return (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🥧</div>
                <p>Pie charts support only one metric.</p>
              </div>
            </div>
          );
      }
      const pieData = mockData.map((d, i) => ({ name: d.name, value: d.values[0] }));
      const total = pieData.reduce((sum, item) => sum + item.value, 0);

      const PieSlice = ({ data, index, startAngle, endAngle }) => {
          const color = getCategoryColor(data.name, index);
          const radius = 100;
          const innerRadius = 60;
          
          const isActive = activeSlice === index;
          const currentRadius = isActive ? radius * 1.05 : radius;

          const x1 = Math.cos(startAngle) * currentRadius;
          const y1 = Math.sin(startAngle) * currentRadius;
          const x2 = Math.cos(endAngle) * currentRadius;
          const y2 = Math.sin(endAngle) * currentRadius;
          
          const ix1 = Math.cos(startAngle) * innerRadius;
          const iy1 = Math.sin(startAngle) * innerRadius;
          const ix2 = Math.cos(endAngle) * innerRadius;
          const iy2 = Math.sin(endAngle) * innerRadius;

          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

          const pathData = `M ${x1} ${y1} A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`;
          
          return (
            <path d={pathData} fill={color} stroke="#fff" strokeWidth="2"
              onMouseEnter={() => setActiveSlice(index)}
              onMouseLeave={() => setActiveSlice(null)}
              style={{ transition: 'all 0.2s ease-in-out', transform: isActive ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center' }}
            />
          );
      };

      let accumulatedAngle = -Math.PI / 2;
      
      return (
          <div className="h-full w-full flex items-center justify-center">
              <svg viewBox="-120 -120 240 240">
                  {pieData.map((d, i) => {
                      const angle = (d.value / total) * 2 * Math.PI;
                      const slice = <PieSlice key={i} data={d} index={i} startAngle={accumulatedAngle} endAngle={accumulatedAngle + angle} />;
                      accumulatedAngle += angle;
                      return slice;
                  })}
                  {activeSlice !== null && (
                    <g className="pointer-events-none">
                        <text textAnchor="middle" dy="-5" style={{ fontSize: '1.2em', fontWeight: 'bold', fill: '#343a40' }}>{formatValue(pieData[activeSlice].value)}</text>
                        <text textAnchor="middle" dy="12" fill={getCategoryColor(pieData[activeSlice].name, activeSlice)} style={{ fontSize: '0.9em', fontWeight: '500' }}>{pieData[activeSlice].name}</text>
                    </g>
                  )}
              </svg>
          </div>
      );
    };

    const renderTable = () => {
        return (
          <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-auto h-full">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {selectedFields.xAxis ? allFields.find(d => d.id === selectedFields.xAxis)?.name : 'Period'}
                    </th>
                    {selectedFields.yAxis.map((metricId) => {
                      const metric = allFields.find(m => m.id === metricId);
                      return (
                        <th key={metricId} className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {metric?.name}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockData.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.name}</td>
                      {selectedFields.yAxis.map((metricId, metricIndex) => (
                        <td key={metricId} className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          <span className="font-medium">{formatValue(d.values[metricIndex])}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      };
      
    const ChartContainer = ({ children }) => (
      <div className="h-full flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        {formatting.legendPosition !== 'hidden' && legendCategories.length > 0 && (
          <div className={`flex flex-wrap gap-x-4 gap-y-2 p-3 bg-gray-50/50 border-t border-gray-200 ${
            formatting.legendPosition === 'left' ? 'justify-start' :
            formatting.legendPosition === 'right' ? 'justify-end' :
            'justify-center'
          }`}>
            {legendCategories.map((category, index) => (
              <div key={category} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: getCategoryColor(category, index) }}></div>
                <span className="text-xs text-gray-700 font-medium">{category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
    
    switch (selectedFields.chartType) {
      case "bar": return <ChartContainer>{renderBarChart()}</ChartContainer>;
      case "line": return <ChartContainer>{renderLineChart()}</ChartContainer>;
      case "pie": return <ChartContainer>{renderPieChart()}</ChartContainer>;
      case "table": return renderTable();
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-lg font-medium text-gray-900">Create Chart Manually</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-[#3551F3] hover:bg-[#2B41D9] text-white rounded-md transition-colors"
              disabled={!chartTitle || !selectedFields.xAxis || !selectedFields.yAxis || selectedFields.yAxis.length === 0}
            >
              Save Chart
            </button>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Data Fields */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            {/* Dataset */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs font-medium text-gray-700">Dataset:</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(datasets).map(([key, dataset]) => (
                  <option key={key} value={key}>{dataset.name}</option>
                ))}
              </select>
            </div>
            <h2 className="text-xs font-semibold text-gray-900 mb-2">Data</h2>
            <button
              onClick={() => setIsCalculatedFieldModalOpen(true)}
              className="w-full mb-2 px-2 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Create New Field
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search fields..."
                className="w-full px-2 py-1.5 pl-7 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <div className="absolute left-2 top-2 text-gray-400">🔍</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Dimensions */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Dimensions</h3>
              <div className="space-y-1">
                {currentDataset.dimensions.map((field) => (
                  <DraggableField
                    key={field.id}
                    field={field}
                    type="dimension"
                  />
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Measures</h3>
              <div className="space-y-1">
                {currentDataset.metrics.map((field) => (
                  <DraggableField
                    key={field.id}
                    field={field}
                    type="measure"
                  />
                ))}
                {calculatedFields.map((field) => (
                  <DraggableField
                    key={field.id}
                    field={field}
                    type="measure"
                    isCalculated={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>



        {/* Right Panel - Chart Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Chart Configuration - X Axis, Y Axis, Filters */}
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="space-y-2">
              {/* X Axis */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-4-4v8" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">X Axis</span>
                </div>
                <div 
                  className="flex-1 flex items-center gap-1 min-h-[24px] px-2 py-1 border border-dashed border-gray-300 rounded bg-gray-50 text-xs"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    const data = e.dataTransfer.getData('text/plain');
                    if (data) {
                      try {
                        const { field, type } = JSON.parse(data);
                        if (type === 'dimension') {
                          setSelectedFields(prev => ({ ...prev, xAxis: field.id }));
                        }
                      } catch (error) {
                        // Invalid data
                      }
                    }
                  }}
                >
                  {selectedFields.xAxis ? (
                    <div className="flex items-center gap-1 px-1 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                      <span className="font-medium text-xs">{(() => {
                        const field = [...currentDataset.dimensions, ...currentDataset.metrics].find(f => f.id === selectedFields.xAxis);
                        return field ? field.name : selectedFields.xAxis;
                      })()}</span>
                      <button
                        onClick={() => setSelectedFields(prev => ({ ...prev, xAxis: "" }))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500">Drop field here</span>
                  )}
                </div>
              </div>

              {/* Y Axis */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Y Axis</span>
                </div>
                <div 
                  className="flex-1 flex items-center gap-1 min-h-[24px] px-2 py-1 border border-dashed border-gray-300 rounded bg-gray-50 text-xs"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    const data = e.dataTransfer.getData('text/plain');
                    if (data) {
                      try {
                        const { field, type } = JSON.parse(data);
                        if (type === 'measure') {
                          handleFieldSelect(field.id, 'yAxis');
                        }
                      } catch (error) {
                        // Invalid data
                      }
                    }
                  }}
                >
                  {selectedFields.yAxis.length > 0 ? (
                    selectedFields.yAxis.map((fieldId, index) => {
                      const field = [...currentDataset.dimensions, ...currentDataset.metrics, ...calculatedFields].find(f => f.id === fieldId);
                      return (
                        <div key={fieldId} className="flex items-center gap-1 px-1 py-0.5 bg-green-100 text-green-800 rounded border border-green-200">
                          {professionalColors.length > 0 && (
                            <div 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: getCategoryColor(
                                selectedFields.yAxis.length > 1 
                                  ? (field ? field.name : fieldId)
                                  : 'Metric',
                                index
                              ) }}
                            ></div>
                          )}
                          <span className="font-medium text-xs">{field ? field.name : fieldId}</span>
                          <button
                            onClick={() => handleFieldSelect(fieldId, 'yAxis')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-gray-500">Drop field here</span>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Filters</span>
                </div>
                <div 
                  className="flex-1 flex items-center gap-1 min-h-[24px] px-2 py-1 border border-dashed border-gray-300 rounded bg-gray-50 text-xs"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    const data = e.dataTransfer.getData('text/plain');
                    if (data) {
                      try {
                        const { field } = JSON.parse(data);
                        const newFilter = { field: field.id, operator: 'equals', value: '' };
                        setFilters(prev => [...prev, newFilter]);
                      } catch (error) {
                        // Invalid data
                      }
                    }
                  }}
                >
                  {filters.length > 0 ? (
                    filters.map((filter, index) => {
                      const field = allFields.find(f => f.id === filter.field);
                      return (
                        <div key={index} className="flex items-center gap-1 px-1 py-0.5 bg-purple-100 text-purple-800 rounded border border-purple-200">
                          <span className="font-medium text-xs">{field ? field.name : 'Unknown Field'}</span>
                          <button
                            onClick={() => removeFilter(index)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-gray-500">Drop field here</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Chart Preview */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Chart Title */}
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {chartTitle || "Untitled"}
                </h2>
                <button
                  onClick={() => setIsTitleEditModalOpen(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              {renderMockChart()}
            </div>
            
            {/* Chart Type and Formatting Sidebar */}
            <div className="w-64 border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-3">
                {/* Chart Type Selector */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Chart Type</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {chartTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          const newChartType = type.value;
                          setSelectedFields(prev => {
                            if (newChartType === 'pie' && prev.yAxis.length > 1) {
                              return {
                                ...prev,
                                chartType: newChartType,
                                yAxis: [prev.yAxis[0]]
                              };
                            }
                            return {
                              ...prev,
                              chartType: newChartType
                            };
                          });
                        }}
                        className={`p-2 rounded-md border-2 transition-all text-xs font-medium flex flex-col items-center gap-1 ${
                          selectedFields.chartType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <type.icon className="w-3 h-3" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formatting */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => setIsFormattingExpanded(!isFormattingExpanded)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-xs font-medium text-gray-700">Formatting</h3>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isFormattingExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isFormattingExpanded && (
                    <div className="px-3 pb-3 border-t border-gray-100">
                      <div className="space-y-2 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Value Format
                          </label>
                          <select
                            value={formatting.valueFormat}
                            onChange={(e) => setFormatting(prev => ({ ...prev, valueFormat: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                          >
                            <option value="auto">Auto</option>
                            <option value="percentage">Percentage (%)</option>
                            <option value="currency">Currency (₹)</option>
                            <option value="compact">Compact (1.2K, 3M)</option>
                            <option value="decimal">Decimal Precision</option>
                          </select>
                        </div>
                        {formatting.valueFormat === 'decimal' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Decimal Places
                            </label>
                            <select
                              value={formatting.decimalPrecision}
                              onChange={(e) => setFormatting(prev => ({ ...prev, decimalPrecision: parseInt(e.target.value) }))}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                            >
                              <option value={0}>0 digits</option>
                              <option value={1}>1 digit</option>
                              <option value={2}>2 digits</option>
                              <option value={3}>3 digits</option>
                            </select>
                          </div>
                        )}
                        
                        {/* Axis Labels */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            X-Axis Label
                          </label>
                          <input
                            type="text"
                            value={formatting.xAxisLabel}
                            onChange={(e) => setFormatting(prev => ({ ...prev, xAxisLabel: e.target.value }))}
                            placeholder="Auto-generated"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Y-Axis Label
                          </label>
                          <input
                            type="text"
                            value={formatting.yAxisLabel}
                            onChange={(e) => setFormatting(prev => ({ ...prev, yAxisLabel: e.target.value }))}
                            placeholder="Auto-generated"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        
                        {/* Legend Position */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Legend Position
                          </label>
                          <select
                            value={formatting.legendPosition}
                            onChange={(e) => setFormatting(prev => ({ ...prev, legendPosition: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                          >
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="hidden">Hidden</option>
                          </select>
                        </div>

                        {/* Color Customization */}
                        {(() => {
                          const categories = getLegendCategories();
                          if (categories.length === 0) return null;
                          
                          return (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                Colors
                              </label>
                              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-gray-50 p-2">
                                <div className="space-y-2">
                                  {categories.map((category, index) => (
                                    <div key={category} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-100">
                                      {/* Category Name */}
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs text-gray-700 truncate block" title={category}>
                                          {category}
                                        </span>
                                      </div>
                                      
                                      {/* Color Picker */}
                                      <input
                                        type="color"
                                        value={getCategoryColor(category, index)}
                                        onChange={(e) => updateCategoryColor(category, e.target.value)}
                                        className="w-6 h-6 rounded border border-gray-300 cursor-pointer flex-shrink-0"
                                        title={`Color for ${category}`}
                                      />
                                      
                                      {/* Hex Input */}
                                      <input
                                        type="text"
                                        value={getCategoryColor(category, index)}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                            updateCategoryColor(category, value);
                                          }
                                        }}
                                        className="w-16 px-1 py-1 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 flex-shrink-0"
                                        placeholder="#000000"
                                        maxLength={7}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                        
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded text-center">
                          <strong>Preview:</strong><br />
                          {formatValue(12345.67)} • {formatValue(1234567.89)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Field Modal */}
      <CalculatedFieldModal
        isOpen={isCalculatedFieldModalOpen}
        onClose={() => setIsCalculatedFieldModalOpen(false)}
        onSubmit={handleCreateCalculatedField}
        availableFields={allFields}
        dataset={currentDataset}
      />
      
      {/* Title Edit Modal */}
      <TitleEditModal
        isOpen={isTitleEditModalOpen}
        onClose={() => setIsTitleEditModalOpen(false)}
        title={chartTitle}
        onSave={setChartTitle}
      />
    </div>
  );
}

// --- Title Edit Modal Component ---
function TitleEditModal({ isOpen, onClose, title, onSave }) {
  const [editedTitle, setEditedTitle] = useState(title || "");
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");

  useEffect(() => {
    if (isOpen) {
      setEditedTitle(title || "");
    }
  }, [isOpen, title]);

  const handleSave = () => {
    onSave(editedTitle);
    onClose();
  };

  const handleReset = () => {
    setEditedTitle("");
    setFontSize("16");
    setFontFamily("Arial");
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setTextAlign("left");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Title</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formatting Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm w-16"
            >
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`px-2 py-1 border rounded text-sm font-bold ${
                isBold ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              B
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`px-2 py-1 border rounded text-sm italic ${
                isItalic ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              I
            </button>
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              className={`px-2 py-1 border rounded text-sm underline ${
                isUnderline ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              U
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <button
              onClick={() => setTextAlign('left')}
              className={`px-2 py-1 border rounded text-sm ${
                textAlign === 'left' ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              ⬅
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`px-2 py-1 border rounded text-sm ${
                textAlign === 'center' ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              ↔
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`px-2 py-1 border rounded text-sm ${
                textAlign === 'right' ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              ➡
            </button>
          </div>
        </div>

        {/* Text Input */}
        <div className="p-4">
          <textarea
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              textAlign: textAlign
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Draggable Field Component ---
function DraggableField({ field, type, isCalculated = false }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({ field, type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getFieldTypeIndicator = () => {
    if (isCalculated) {
      return { text: 'fx', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    
    // Get field type from field metadata
    const fieldType = field.type;
    
    if (type === 'dimension') {
      switch (fieldType) {
        case 'text':
          return { text: 'Abc', color: 'bg-blue-50 text-blue-600 border-blue-200' };
        case 'date':
          return { text: 'Date', color: 'bg-green-50 text-green-600 border-green-200' };
        case 'boolean':
          return { text: 'T/F', color: 'bg-amber-50 text-amber-600 border-amber-200' };
        default:
          return { text: 'Abc', color: 'bg-blue-50 text-blue-600 border-blue-200' };
      }
    } else if (type === 'measure') {
      switch (fieldType) {
        case 'number':
          return { text: '#', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
        case 'percentage':
          return { text: '%', color: 'bg-orange-50 text-orange-600 border-orange-200' };
        case 'currency':
          return { text: '$', color: 'bg-teal-50 text-teal-600 border-teal-200' };
        default:
          return { text: '#', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      }
    }
    
    return { text: '', color: 'bg-gray-50 text-gray-600 border-gray-200' };
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group flex items-center gap-2 px-3 py-2 text-xs bg-white border rounded-lg cursor-grab hover:bg-gray-50 hover:border-gray-300 transition-all ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${
        isCalculated ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 flex-1">
        {(() => {
          const typeIndicator = getFieldTypeIndicator();
          return (
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono border ${typeIndicator.color}`}>
              {typeIndicator.text}
            </span>
          );
        })()}
        <div className="flex flex-col flex-1">
          <span className={`font-medium truncate ${isCalculated ? 'text-purple-700' : 'text-gray-700'}`}>
            {field.name}
          </span>
          {isCalculated && (
            <span className="text-xs text-purple-500 truncate">
              {field.formula}
            </span>
          )}
        </div>
      </div>
      <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// --- Drop Zone Component ---
function DropZone({ title, subtitle, fields, onDrop, onRemove, acceptTypes, maxFields = 5, colors = [] }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedType, setDraggedType] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      try {
        const { type } = JSON.parse(data);
        if (acceptTypes.includes(type)) {
          setIsDragOver(true);
          setDraggedType(type);
        }
      } catch (error) {
        // Invalid data
      }
    }
  };

  const handleDragLeave = (e) => {
    // Only reset if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDraggedType(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggedType(null);

    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      try {
        const { field, type } = JSON.parse(data);
        if (acceptTypes.includes(type) && fields.length < maxFields) {
          onDrop(field.id);
        }
      } catch (error) {
        // Invalid data
      }
    }
  };

  const getFieldData = (fieldId) => {
    // This is a simplified lookup - in a real app, you'd have a proper data structure
    const baseFields = [
      // Dimensions
      { id: "lead_source", name: "Lead Source", type: "text" },
      { id: "region", name: "Region", type: "text" },
      { id: "industry", name: "Industry", type: "text" },
      { id: "created_date", name: "Created Date", type: "date" },
      { id: "stage", name: "Stage", type: "text" },
      { id: "campaign_name", name: "Campaign Name", type: "text" },
      { id: "ad_group", name: "Ad Group", type: "text" },
      { id: "device", name: "Device", type: "text" },
      { id: "date", name: "Date", type: "date" },
      { id: "keyword", name: "Keyword", type: "text" },
      // Metrics
      { id: "lead_count", name: "Lead Count", type: "number" },
      { id: "conversion_rate", name: "Conversion Rate", type: "percentage" },
      { id: "deal_value", name: "Deal Value", type: "currency" },
      { id: "pipeline_value", name: "Pipeline Value", type: "currency" },
      { id: "impressions", name: "Impressions", type: "number" },
      { id: "clicks", name: "Clicks", type: "number" },
      { id: "ctr", name: "Click-through Rate", type: "percentage" },
      { id: "cost", name: "Cost", type: "currency" },
      { id: "cpc", name: "Cost per Click", type: "currency" }
    ];
    
    // Include calculated fields from the parent component
    const allFieldsWithCalculated = [...baseFields];
    
    return allFieldsWithCalculated.find(f => f.id === fieldId);
  };

  const canAcceptDrop = isDragOver && draggedType && acceptTypes.includes(draggedType) && fields.length < maxFields;

  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-xs text-gray-400">
          {fields.length}/{maxFields}
        </div>
      </div>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[60px] border-2 border-dashed rounded-lg p-3 transition-all ${
          canAcceptDrop
            ? 'border-blue-400 bg-blue-50'
            : isDragOver
            ? 'border-red-400 bg-red-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        {fields.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-500">
            {canAcceptDrop ? (
              <span className="text-blue-600">Drop here</span>
            ) : isDragOver ? (
              <span className="text-red-600">Cannot drop here</span>
            ) : (
              <span>Drag fields here</span>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((fieldId, index) => {
              const fieldData = getFieldData(fieldId);
              if (!fieldData) return null;
              
              return (
                <div
                  key={fieldId}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                >
                  {colors.length > 0 && (
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: colors[index] || colors[0] }}
                    ></div>
                  )}
                  <span className="flex-1 font-medium text-gray-700">{fieldData.name}</span>
                  <button
                    onClick={() => onRemove(fieldId)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 