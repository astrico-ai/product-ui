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
  const [chartTitle, setChartTitle] = useState("");
  const [selectedFields, setSelectedFields] = useState({
    xAxis: "",
    yAxis: [], // Changed to array for multi-select
    groupBy: "",
    chartType: "bar"
  });
  const [filters, setFilters] = useState([]);
  const [calculatedFields, setCalculatedFields] = useState([]);
  const [isCalculatedFieldModalOpen, setIsCalculatedFieldModalOpen] = useState(false);
  const [formatting, setFormatting] = useState({
    valueFormat: 'auto',
    decimalPrecision: 2
  });
  const [isFormattingExpanded, setIsFormattingExpanded] = useState(false);

  const datasets = {
    salesforce: {
      name: "Salesforce",
      dimensions: [
        { id: "lead_source", name: "Lead Source", type: "text" },
        { id: "region", name: "Region", type: "text" },
        { id: "industry", name: "Industry", type: "text" },
        { id: "created_date", name: "Created Date", type: "date" },
        { id: "stage", name: "Stage", type: "text" }
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
        { id: "keyword", name: "Keyword", type: "text" }
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

  // Color palette for multiple metrics
  const metricColors = [
    '#3551F3', '#A5B4FC', '#60A5FA', '#93C5FD', '#DBEAFE'
  ];

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
    if (!selectedFields.xAxis || !selectedFields.yAxis || selectedFields.yAxis.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Select X-Axis and Y-Axis to preview chart</p>
          </div>
        </div>
      );
    }

    // Generate mock data for multiple metrics
    const selectedMetrics = selectedFields.yAxis;
    const mockData = [
      { name: "Q1", values: [240, 180, 320, 280, 150] },
      { name: "Q2", values: [300, 220, 280, 350, 200] },
      { name: "Q3", values: [200, 160, 240, 190, 180] },
      { name: "Q4", values: [400, 350, 380, 420, 300] }
    ];

    switch (selectedFields.chartType) {
      case "bar":
        const maxValue = Math.max(...mockData.flatMap(d => d.values));
        const yAxisTicks = Array.from({ length: 6 }, (_, i) => Math.round((maxValue / 5) * i));
        
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
              <svg width="100%" height="100%" viewBox="0 0 600 320" className="overflow-visible">
                {/* Chart area background */}
                <rect x="80" y="20" width="480" height="240" fill="#fafafa" stroke="none" />
                
                {/* Y-axis */}
                <line x1="80" y1="20" x2="80" y2="260" stroke="#d1d5db" strokeWidth="1" />
                {/* X-axis */}
                <line x1="80" y1="260" x2="560" y2="260" stroke="#d1d5db" strokeWidth="1" />
                
                {/* Y-axis labels and grid lines */}
                {yAxisTicks.map((tick, i) => (
                  <g key={i}>
                    <line x1="75" y1={260 - (i * 40)} x2="80" y2={260 - (i * 40)} stroke="#9ca3af" strokeWidth="1" />
                    <text x="70" y={260 - (i * 40) + 4} textAnchor="end" className="fill-gray-600" style={{ fontSize: '12px', fontFamily: 'system-ui' }}>
                      {formatValue(tick)}
                    </text>
                    {/* Grid lines */}
                    {i > 0 && <line x1="80" y1={260 - (i * 40)} x2="560" y2={260 - (i * 40)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />}
                  </g>
                ))}
                
                {/* Bars */}
                {mockData.map((d, i) => {
                  const barGroupX = 120 + (i * 100);
                  const barWidth = selectedMetrics.length === 1 ? 40 : 18;
                  const barSpacing = 2;
                  
                  return (
                    <g key={i}>
                      {selectedMetrics.map((metricId, metricIndex) => {
                        const barHeight = Math.max(2, (d.values[metricIndex] / maxValue) * 240);
                        const barX = barGroupX + (metricIndex * (barWidth + barSpacing)) - ((selectedMetrics.length * (barWidth + barSpacing) - barSpacing) / 2);
                        
                        return (
                          <g key={metricId}>
                            <rect
                              x={barX}
                              y={260 - barHeight}
                              width={barWidth}
                              height={barHeight}
                              fill={metricColors[metricIndex]}
                              className="hover:opacity-80 cursor-pointer transition-opacity"
                              rx="2"
                            />
                            {/* Value label on hover */}
                            <text
                              x={barX + barWidth / 2}
                              y={260 - barHeight - 8}
                              textAnchor="middle"
                              className="fill-gray-700 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                              style={{ fontSize: '11px', fontWeight: '500', fontFamily: 'system-ui' }}
                            >
                              {formatValue(d.values[metricIndex])}
                            </text>
                          </g>
                        );
                      })}
                      {/* X-axis labels */}
                      <text
                        x={barGroupX}
                        y={280}
                        textAnchor="middle"
                        className="fill-gray-700"
                        style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'system-ui' }}
                      >
                        {d.name}
                      </text>
                    </g>
                  );
                })}
                
                {/* Axis labels */}
                <text x="40" y="140" textAnchor="middle" className="fill-gray-600" transform="rotate(-90 40 140)" style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'system-ui' }}>
                  {selectedMetrics.map(metricId => {
                    const metric = currentDataset.metrics.find(m => m.id === metricId);
                    return metric?.name;
                  }).join(', ')}
                </text>
                <text x="320" y="310" textAnchor="middle" className="fill-gray-600" style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'system-ui' }}>
                  {selectedFields.xAxis ? currentDataset.dimensions.find(d => d.id === selectedFields.xAxis)?.name : 'Category'}
                </text>
              </svg>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-6 justify-center p-4 bg-gray-50 border-t border-gray-200">
              {selectedMetrics.map((metricId, index) => {
                const metric = currentDataset.metrics.find(m => m.id === metricId);
                return (
                  <div key={metricId} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: metricColors[index] }}
                    ></div>
                    <span className="text-sm text-gray-700 font-medium">{metric?.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case "line":
        const lineMaxValue = Math.max(...mockData.flatMap(d => d.values));
        const lineYAxisTicks = Array.from({ length: 6 }, (_, i) => Math.round((lineMaxValue / 5) * i));
        
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
              <svg width="100%" height="100%" viewBox="0 0 600 320" className="overflow-visible">
                {/* Chart area background */}
                <rect x="80" y="20" width="480" height="240" fill="#fafafa" stroke="none" />
                
                {/* Y-axis */}
                <line x1="80" y1="20" x2="80" y2="260" stroke="#d1d5db" strokeWidth="1" />
                {/* X-axis */}
                <line x1="80" y1="260" x2="560" y2="260" stroke="#d1d5db" strokeWidth="1" />
                
                {/* Y-axis labels and grid lines */}
                {lineYAxisTicks.map((tick, i) => (
                  <g key={i}>
                    <line x1="75" y1={260 - (i * 40)} x2="80" y2={260 - (i * 40)} stroke="#9ca3af" strokeWidth="1" />
                    <text x="70" y={260 - (i * 40) + 4} textAnchor="end" className="fill-gray-600" style={{ fontSize: '12px', fontFamily: 'system-ui' }}>
                      {formatValue(tick)}
                    </text>
                    {/* Grid lines */}
                    {i > 0 && <line x1="80" y1={260 - (i * 40)} x2="560" y2={260 - (i * 40)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />}
                  </g>
                ))}
                
                {/* Lines and data points */}
                {selectedMetrics.map((metricId, metricIndex) => {
                  const points = mockData.map((d, i) => {
                    const x = 120 + (i * 120);
                    const y = 260 - (d.values[metricIndex] / lineMaxValue) * 240;
                    return `${x},${y}`;
                  }).join(' ');
                  
                  return (
                    <g key={metricId}>
                      <polyline
                        points={points}
                        fill="none"
                        stroke={metricColors[metricIndex]}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {mockData.map((d, i) => {
                        const x = 120 + (i * 120);
                        const y = 260 - (d.values[metricIndex] / lineMaxValue) * 240;
                        
                        return (
                          <g key={i}>
                            <circle
                              cx={x}
                              cy={y}
                              r="5"
                              fill="white"
                              stroke={metricColors[metricIndex]}
                              strokeWidth="3"
                              className="hover:r-7 transition-all cursor-pointer"
                            />
                            <text
                              x={x}
                              y={y - 15}
                              textAnchor="middle"
                              className="fill-gray-700 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                              style={{ fontSize: '11px', fontWeight: '500', fontFamily: 'system-ui' }}
                            >
                              {formatValue(d.values[metricIndex])}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
                
                {/* X-axis labels */}
                {mockData.map((d, i) => (
                  <text
                    key={i}
                    x={120 + (i * 120)}
                    y={280}
                    textAnchor="middle"
                    className="fill-gray-700"
                    style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'system-ui' }}
                  >
                    {d.name}
                  </text>
                ))}
                
                {/* Axis labels */}
                <text x="40" y="140" textAnchor="middle" className="fill-gray-600" transform="rotate(-90 40 140)" style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'system-ui' }}>
                  {selectedMetrics.map(metricId => {
                    const metric = currentDataset.metrics.find(m => m.id === metricId);
                    return metric?.name;
                  }).join(', ')}
                </text>
                <text x="320" y="310" textAnchor="middle" className="fill-gray-600" style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'system-ui' }}>
                  {selectedFields.xAxis ? currentDataset.dimensions.find(d => d.id === selectedFields.xAxis)?.name : 'Category'}
                </text>
              </svg>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-6 justify-center p-4 bg-gray-50 border-t border-gray-200">
              {selectedMetrics.map((metricId, index) => {
                const metric = currentDataset.metrics.find(m => m.id === metricId);
                return (
                  <div key={metricId} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-1 rounded-full"
                      style={{ backgroundColor: metricColors[index] }}
                    ></div>
                    <span className="text-sm text-gray-700 font-medium">{metric?.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case "pie":
        if (selectedMetrics.length > 1) {
          return (
            <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">🥧</div>
                <p className="text-sm">Pie charts only support one metric</p>
                <p className="text-xs text-gray-400 mt-1">Please select only one Y-axis field</p>
              </div>
            </div>
          );
        }
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-200">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="#3551F3" />
                <circle cx="100" cy="100" r="80" fill="#A5B4FC" strokeDasharray="125.6 502.4" strokeDashoffset="0" stroke="#60A5FA" strokeWidth="80" fillOpacity="0" />
                <circle cx="100" cy="100" r="80" fill="#60A5FA" strokeDasharray="94.2 502.4" strokeDashoffset="-125.6" stroke="#93C5FD" strokeWidth="80" fillOpacity="0" />
              </svg>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-6 justify-center p-4 bg-gray-50 border-t border-gray-200">
              {selectedMetrics.map((metricId, index) => {
                const metric = currentDataset.metrics.find(m => m.id === metricId);
                return (
                  <div key={metricId} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: metricColors[index] }}
                    ></div>
                    <span className="text-sm text-gray-700 font-medium">{metric?.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case "table":
        return (
          <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-auto h-full">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {selectedFields.xAxis ? currentDataset.dimensions.find(d => d.id === selectedFields.xAxis)?.name : 'Period'}
                    </th>
                    {selectedMetrics.map((metricId) => {
                      const metric = currentDataset.metrics.find(m => m.id === metricId);
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
                      {selectedMetrics.map((metricId, metricIndex) => (
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
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Create Chart Manually</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#3551F3] hover:bg-[#2B41D9] text-white rounded-lg transition-colors"
              disabled={!chartTitle || !selectedFields.xAxis || !selectedFields.yAxis || selectedFields.yAxis.length === 0}
            >
              Save Chart
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Dataset:</label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(datasets).map(([key, dataset]) => (
                <option key={key} value={key}>{dataset.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-sm font-medium text-gray-700">Chart Title:</label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="Enter chart title..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Data Fields */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Data</h2>
            <button
              onClick={() => setIsCalculatedFieldModalOpen(true)}
              className="w-full mb-3 px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Create New Field
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search fields..."
                className="w-full px-3 py-2 pl-8 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="absolute left-2 top-2.5 text-gray-400">🔍</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

        {/* Center Panel - Drag & Drop Configuration */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-sm font-semibold text-gray-900">Build Your Chart</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Chart Type Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Chart Type</h3>
              <div className="grid grid-cols-2 gap-2">
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
                    className={`p-3 rounded-lg border-2 transition-all text-xs font-medium flex flex-col items-center gap-2 ${
                      selectedFields.chartType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* X-Axis */}
            <DropZone
              title="X-Axis"
              subtitle="Drag dimensions here"
              fields={selectedFields.xAxis ? [selectedFields.xAxis] : []}
              onDrop={(fieldId) => setSelectedFields(prev => ({ ...prev, xAxis: fieldId }))}
              onRemove={() => setSelectedFields(prev => ({ ...prev, xAxis: "" }))}
              acceptTypes={['dimension']}
              maxFields={1}
            />

            {/* Y-Axis */}
            <DropZone
              title="Y-Axis"
              subtitle="Drag measures here"
              fields={selectedFields.yAxis}
              onDrop={(fieldId) => handleFieldSelect(fieldId, 'yAxis')}
              onRemove={(fieldId) => handleFieldSelect(fieldId, 'yAxis')}
              acceptTypes={['measure']}
              maxFields={selectedFields.chartType === 'pie' ? 1 : 5}
              colors={metricColors}
            />

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                <button
                  onClick={addFilter}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
                >
                  + Add
                </button>
              </div>
              {filters.length === 0 ? (
                <p className="text-xs text-gray-500">No filters applied</p>
              ) : (
                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(index, 'field', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="">Field...</option>
                        {allFields.map((field) => (
                          <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeFilter(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formatting */}
            <div className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => setIsFormattingExpanded(!isFormattingExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-sm font-medium text-gray-700">Formatting</h3>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFormattingExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isFormattingExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="space-y-3 pt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Value Format
                      </label>
                      <select
                        value={formatting.valueFormat}
                        onChange={(e) => setFormatting(prev => ({ ...prev, valueFormat: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value={0}>0 digits</option>
                          <option value={1}>1 digit</option>
                          <option value={2}>2 digits</option>
                          <option value={3}>3 digits</option>
                        </select>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Preview:</strong> {formatValue(12345.67)} • {formatValue(1234567.89)} • {formatValue(123.45)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Chart Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
            <p className="text-xs text-gray-500 mt-1">
              {chartTitle || "Untitled Chart"} • {chartTypes.find(t => t.value === selectedFields.chartType)?.label}
            </p>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {renderMockChart()}
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

  const getFieldIcon = () => {
    if (isCalculated) {
      return '🧮'; // Calculator icon for calculated fields
    }
    switch (type) {
      case 'dimension':
        return '🏷️';
      case 'measure':
        return '#️⃣';
      default:
        return '📊';
    }
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
        <span className="text-sm">{getFieldIcon()}</span>
        <div className="flex flex-col">
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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
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