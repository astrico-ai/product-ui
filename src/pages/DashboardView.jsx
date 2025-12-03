import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, ChevronLeft, ChevronRight, Presentation, LayoutDashboard, MessageCircle, Share2, Download, ArrowRight, X, ChevronDown, ThumbsUp, ThumbsDown, BarChart, LineChart, PieChart, Table, GripVertical, Brush, X as LucideX } from "lucide-react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import AddWidgetModal from "@/components/dashboard/AddWidgetModal";
import ManualChartBuilder from "@/components/dashboard/ManualChartBuilder";
import AIChartModal from "@/components/dashboard/AIChartModal";
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

import React from "react";
import AlertModal from "@/components/dashboard/AlertModal";
import ShareDashboardModal from "@/components/dashboard/ShareDashboardModal";

// Lazy load ApexCharts
const Chart = lazy(() => import('react-apexcharts'));

// DATA SOURCE FLAG - Change between "Marketing" and "Motul"
const DATA_SOURCE = "Motul";

export default function DashboardView() {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loadingWidgets, setLoadingWidgets] = useState({});
  const [tableData, setTableData] = useState([]);
  const [addWidgetStep, setAddWidgetStep] = useState(null); // null | 'manual'
  const [alertModalWidget, setAlertModalWidget] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Filter state
  const [selectedDate, setSelectedDate] = useState('25-26');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  // Log the current DATA_SOURCE flag
  console.log('🚀 DashboardView loaded - DATA_SOURCE:', DATA_SOURCE);

  const handleAiSearch = (e) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) return;
    setIsAiModalOpen(true);
  };

  const handleAddAiChartToDashboard = () => {
    // TODO: Add chart to dashboard
    console.log('Adding AI chart to dashboard');
    setAiSearchQuery('');
  };

  const handleExportPDF = () => {
    console.log('Exporting dashboard as PDF');
    // TODO: Implement PDF export
  };

  const handleExportPPT = () => {
    console.log('Exporting dashboard as PPT');
    // TODO: Implement PPT export
  };

  const handleExportImage = () => {
    console.log('Exporting dashboard as Image');
    // TODO: Implement Image export
  };

  // Handle presentation navigation
  // Get widgets to render (default Motul widgets or dashboard widgets)
  const getWidgetsToRender = () => {
    if (DATA_SOURCE === "Motul") {
      return [
        {
          id: "motul-widget-1",
          type: "kpi",
          title: "Total Leads",
          description: "",
          position: 0
        },
        {
          id: "motul-widget-2",
          type: "kpi",
          title: "Total Cost",
          description: "",
          position: 1
        },
        {
          id: "motul-widget-3",
          type: "kpi",
          title: "Conversion Rate",
          description: "",
          position: 2
        },
        {
          id: "motul-widget-4",
          type: "table",
          title: "Primary Segment Wise Sales",
          description: "",
          position: 3
        },
        {
          id: "motul-widget-5",
          type: "combo",
          title: "Outlets Billed & Invoices by Region",
          description: "",
          position: 4
        },
        {
          id: "motul-widget-6",
          type: "pie",
          title: "Sales Revenue by Region",
          description: "",
          position: 5
        }
      ];
    }
    return dashboard?.widgets || [];
  };

  const handleNextSlide = () => {
    const widgets = getWidgetsToRender();
    if (widgets && currentSlideIndex < widgets.length - 1) {
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

    // Hide non-KPI, non-table, non-combo, and non-pie charts for Motul
    if (DATA_SOURCE === "Motul" && widget.type !== "kpi" && widget.type !== "table" && widget.type !== "combo" && widget.type !== "pie") {
      return null;
    }

    console.log('📊 Rendering widget:', { type: widget.type, title: widget.title, dataSource: DATA_SOURCE });

    const renderChart = () => {
      switch (widget.type) {
        case "combo":
          console.log('📊 Combo chart - DATA_SOURCE:', DATA_SOURCE);

          // Data organized by month with regions
          const comboData = DATA_SOURCE === "Marketing" ? [] : [

            {
              month: "July 2025",
              "East Region - Outlets": 4320,
              "North Region - Outlets": 7253,
              "South Region-1 - Outlets": 4126,
              "South Region-2 - Outlets": 3126,
              "West Region - Outlets": 6243,
              "East Region - Invoices": 7143,
              "North Region - Invoices": 9021,
              "South Region-1 - Invoices": 9370,
              "South Region-2 - Invoices": 4962,
              "West Region - Invoices": 9010
            },
            {
              month: "August 2025",
              "East Region - Outlets": 5182,
              "North Region - Outlets": 7422,
              "South Region-1 - Outlets": 4271,
              "South Region-2 - Outlets": 3506,
              "West Region - Outlets": 6821,
              "East Region - Invoices": 9921,
              "North Region - Invoices": 10430,
              "South Region-1 - Invoices": 10017,
              "South Region-2 - Invoices": 5967,
              "West Region - Invoices": 11589
            },
            {
              month: "September 2025",
              "East Region - Outlets": 5879,
              "North Region - Outlets": 8153,
              "South Region-1 - Outlets": 4590,
              "South Region-2 - Outlets": 4194,
              "West Region - Outlets": 7623,
              "East Region - Invoices": 10340,
              "North Region - Invoices": 11710,
              "South Region-1 - Invoices": 9666,
              "South Region-2 - Invoices": 7130,
              "West Region - Invoices": 14231
            }
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
                        columnWidth: '60%'
                      }
                    },
                    xaxis: {
                      categories: comboData.map(d => d.month)
                    },
                    yaxis: [
                      {
                        title: {
                          text: 'Outlets Billed',
                          style: {
                            fontSize: '12px'
                          }
                        },
                        labels: {
                          formatter: (value) => value.toLocaleString()
                        }
                      },
                      {
                        opposite: true,
                        title: {
                          text: 'Number of Invoices',
                          style: {
                            fontSize: '12px'
                          }
                        },
                        labels: {
                          formatter: (value) => value.toLocaleString()
                        }
                      }
                    ],
                    stroke: {
                      width: [0, 0, 0, 0, 0, 3, 3, 3, 3, 3],
                      curve: 'smooth'
                    },
                    tooltip: {
                      enabled: false
                    },
                    legend: {
                      show: false
                    }
                  }}
                  series={[
                    {
                      name: 'East Region',
                      data: comboData.map(d => d["East Region - Outlets"]),
                      type: 'bar'
                    },
                    {
                      name: 'North Region',
                      data: comboData.map(d => d["North Region - Outlets"]),
                      type: 'bar'
                    },
                    {
                      name: 'South Region-1',
                      data: comboData.map(d => d["South Region-1 - Outlets"]),
                      type: 'bar'
                    },
                    {
                      name: 'South Region-2',
                      data: comboData.map(d => d["South Region-2 - Outlets"]),
                      type: 'bar'
                    },
                    {
                      name: 'West Region',
                      data: comboData.map(d => d["West Region - Outlets"]),
                      type: 'bar'
                    },
                    {
                      name: '',
                      data: comboData.map(d => d["East Region - Invoices"]),
                      type: 'line'
                    },
                    {
                      name: '',
                      data: comboData.map(d => d["North Region - Invoices"]),
                      type: 'line'
                    },
                    {
                      name: '',
                      data: comboData.map(d => d["South Region-1 - Invoices"]),
                      type: 'line'
                    },
                    {
                      name: '',
                      data: comboData.map(d => d["South Region-2 - Invoices"]),
                      type: 'line'
                    },
                    {
                      name: '',
                      data: comboData.map(d => d["West Region - Invoices"]),
                      type: 'line'
                    }
                  ]}
                  height={400}
                />
              </Suspense>

              {/* Custom Horizontal Legend */}
              <div className="flex justify-center gap-8 mt-6 flex-wrap">
                {[
                  { name: 'East Region', color: '#3B82F6' },
                  { name: 'North Region', color: '#10B981' },
                  { name: 'South Region-1', color: '#F59E0B' },
                  { name: 'South Region-2', color: '#EF4444' },
                  { name: 'West Region', color: '#8B5CF6' }
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );

        case "kpi":
          let displayValue;
          let trend;

          // Determine value based on widget title and data source
          if (DATA_SOURCE === "Motul") {
            // Map Marketing KPI titles to Motul values
            if (widget.title === "Total Leads" || widget.title === "Sale for the Day") {
              trend = 5.2;
              displayValue = "128.92";
            } else if (widget.title === "Total Cost" || widget.title === "MTD") {
              trend = 8.7;
              displayValue = "3,245.46";
            } else if (widget.title === "Conversion Rate" || widget.title === "YTD") {
              trend = 12.3;
              displayValue = "9,279.07";
            } else {
              // For other Motul KPI cards
              const otherValue = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
              trend = Math.random() > 0.5 ? 6.5 : -4.2;
              displayValue = otherValue.toLocaleString();
            }
          } else {
            // Marketing data
            if (widget.title === "Total Leads") {
              trend = 12.5;
              displayValue = "12,349";
            } else if (widget.title === "Total Cost") {
              trend = 8.3;
              displayValue = "₹15 Cr";
            } else if (widget.title === "Conversion Rate") {
              trend = -2.8;
              displayValue = "35%";
            } else {
              // For other KPI cards
              const otherValue = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
              trend = Math.random() > 0.5 ? 5.2 : -3.1;
              displayValue = otherValue.toLocaleString();
            }
          }
          
          return (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {displayValue}
                </div>
                {DATA_SOURCE !== "Motul" && (
                  <div className={cn(
                    "text-sm mt-2 flex items-center justify-center gap-1",
                    trend > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last period
                  </div>
                )}
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
          console.log('📋 Table chart - DATA_SOURCE:', DATA_SOURCE);
          // If no CSV data is provided, fall back to default data
          const defaultMarketingData = [
            {
              id: 1,
              campaign: "Google Search Campaign",
              spend: 4500000,
              ctr: 12.5,
              conversions: 850,
              roas: 4.2
            },
            {
              id: 2,
              campaign: "Facebook Brand Campaign",
              spend: 3200000,
              ctr: 8.7,
              conversions: 640,
              roas: 3.8
            },
            {
              id: 3,
              campaign: "LinkedIn B2B Campaign",
              spend: 2800000,
              ctr: 6.4,
              conversions: 420,
              roas: 3.2
            },
            {
              id: 4,
              campaign: "Email Newsletter",
              spend: 1500000,
              ctr: 15.8,
              conversions: 320,
              roas: 5.6
            },
            {
              id: 5,
              campaign: "YouTube Video Ads",
              spend: 3800000,
              ctr: 9.7,
              conversions: 760,
              roas: 4.1
            },
            {
              id: 6,
              campaign: "Instagram Stories",
              spend: 2200000,
              ctr: 11.3,
              conversions: 440,
              roas: 3.9
            },
            {
              id: 7,
              campaign: "Content Marketing",
              spend: 1800000,
              ctr: 7.5,
              conversions: 280,
              roas: 3.4
            },
            {
              id: 8,
              campaign: "Retargeting Campaign",
              spend: 2600000,
              ctr: 14.8,
              conversions: 520,
              roas: 4.7
            }
          ];

          const defaultMotulData = [
            {
              id: 1,
              region: "East Region",
              "Sale for the Day": 21358.7,
              "MTD": 629931.41,
              "YTD": 1793836.17
            },
            {
              id: 2,
              region: "India Yamaha",
              "Sale for the Day": 15449.6,
              "MTD": 150351.6,
              "YTD": 460185.6
            },
            {
              id: 3,
              region: "North Region",
              "Sale for the Day": 24874.3,
              "MTD": 782716.42,
              "YTD": 2140121.17
            },
            {
              id: 4,
              region: "South Region - 1",
              "Sale for the Day": 25330.04,
              "MTD": 407762.4,
              "YTD": 1238276.9
            },
            {
              id: 5,
              region: "South Region - 2",
              "Sale for the Day": 16336.8,
              "MTD": 460574.74,
              "YTD": 1308954.64
            },
            {
              id: 6,
              region: "West Region",
              "Sale for the Day": 30665.5,
              "MTD": 784674.47,
              "YTD": 2202840.72
            }
          ];

          const displayData = tableData.length > 0 ? tableData : (DATA_SOURCE === "Marketing" ? defaultMarketingData : defaultMotulData);
          console.log('📋 Table data:', { source: DATA_SOURCE, dataLength: displayData.length, firstRow: displayData[0] });

          return (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#3551F3] border-b border-gray-200">
                      {Object.keys(displayData[0] || {}).filter(header => header !== 'id').map((header) => (
                        <th key={header} className="px-6 py-4 text-left font-bold text-white uppercase tracking-wider">
                          {header.charAt(0).toUpperCase() + header.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {displayData.map((row, index) => (
                      <tr key={row.id || `row-${index}`} className="hover:bg-gray-50 transition-colors">
                        {Object.entries(row).filter(([key]) => key !== 'id').map(([key, value]) => (
                          <td 
                            key={key} 
                            className={cn(
                              "px-6 py-4 whitespace-nowrap",
                              key === 'ctr' || key === 'roas' 
                                ? Number(value) >= 4 ? 'text-green-600' : Number(value) >= 2 ? 'text-yellow-600' : 'text-red-600'
                                : 'text-gray-900',
                              key === 'spend' ? 'text-right' : ''
                            )}
                          >
                            {key === 'spend'
                              ? new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: 'INR',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                }).format(value)
                              : key === 'ctr'
                                ? `${value}%`
                              : key === 'roas'
                                ? `${value}x`
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
          console.log('📈 Line chart - DATA_SOURCE:', DATA_SOURCE);
          const lineData = DATA_SOURCE === "Marketing" ? [
            {
              month: "Oct'24",
              "Google Ads": 2200000,
              "Facebook Ads": 1800000,
              "LinkedIn Ads": 1400000,
              "Email Marketing": 900000,
              "Content Marketing": 1100000
            },
            {
              month: "Nov'24",
              "Google Ads": 2500000,
              "Facebook Ads": 2100000,
              "LinkedIn Ads": 1600000,
              "Email Marketing": 1200000,
              "Content Marketing": 1300000
            },
            {
              month: "Dec'24",
              "Google Ads": 2800000,
              "Facebook Ads": 2300000,
              "LinkedIn Ads": 1800000,
              "Email Marketing": 1400000,
              "Content Marketing": 1500000
            },
            {
              month: "Jan'25",
              "Google Ads": 3100000,
              "Facebook Ads": 2600000,
              "LinkedIn Ads": 2000000,
              "Email Marketing": 1600000,
              "Content Marketing": 1700000
            },
            {
              month: "Feb'25",
              "Google Ads": 2900000,
              "Facebook Ads": 2400000,
              "LinkedIn Ads": 1900000,
              "Email Marketing": 1500000,
              "Content Marketing": 1600000
            }
          ] : (console.log('📈 Using Motul line data'), [
            {
              month: "Oct'24",
              "Engine Oil": 1500000,
              "Motor Oil": 1200000,
              "Transmission Fluid": 800000,
              "Coolant": 600000,
              "Additives": 700000
            },
            {
              month: "Nov'24",
              "Engine Oil": 1700000,
              "Motor Oil": 1400000,
              "Transmission Fluid": 900000,
              "Coolant": 750000,
              "Additives": 850000
            },
            {
              month: "Dec'24",
              "Engine Oil": 1900000,
              "Motor Oil": 1600000,
              "Transmission Fluid": 1050000,
              "Coolant": 900000,
              "Additives": 1000000
            },
            {
              month: "Jan'25",
              "Engine Oil": 2100000,
              "Motor Oil": 1800000,
              "Transmission Fluid": 1200000,
              "Coolant": 1050000,
              "Additives": 1150000
            },
            {
              month: "Feb'25",
              "Engine Oil": 1950000,
              "Motor Oil": 1700000,
              "Transmission Fluid": 1100000,
              "Coolant": 950000,
              "Additives": 1050000
            }
          ]);
          console.log('📈 Line chart data loaded:', { source: DATA_SOURCE, months: lineData.map(d => d.month) });

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
                  series={DATA_SOURCE === "Marketing" ? [
                    {
                      name: 'Google Ads',
                      data: lineData.map(d => d["Google Ads"])
                    },
                    {
                      name: 'Facebook Ads',
                      data: lineData.map(d => d["Facebook Ads"])
                    },
                    {
                      name: 'LinkedIn Ads',
                      data: lineData.map(d => d["LinkedIn Ads"])
                    },
                    {
                      name: 'Email Marketing',
                      data: lineData.map(d => d["Email Marketing"])
                    },
                    {
                      name: 'Content Marketing',
                      data: lineData.map(d => d["Content Marketing"])
                    }
                  ] : [
                    {
                      name: 'Engine Oil',
                      data: lineData.map(d => d["Engine Oil"])
                    },
                    {
                      name: 'Motor Oil',
                      data: lineData.map(d => d["Motor Oil"])
                    },
                    {
                      name: 'Transmission Fluid',
                      data: lineData.map(d => d["Transmission Fluid"])
                    },
                    {
                      name: 'Coolant',
                      data: lineData.map(d => d["Coolant"])
                    },
                    {
                      name: 'Additives',
                      data: lineData.map(d => d["Additives"])
                    }
                  ]}
                  type="line"
                  height={350}
                />
              </Suspense>
            </div>
          );

        case "pie":
          console.log('🥧 Pie chart - DATA_SOURCE:', DATA_SOURCE);
          const pieData = DATA_SOURCE === "Marketing" ? [
            { type: 'Google Ads', amount: 48000000 },
            { type: 'Facebook Ads', amount: 27000000 },
            { type: 'LinkedIn Ads', amount: 13000000 },
            { type: 'Email Marketing', amount: 34000000 },
            { type: 'Content Marketing', amount: 23000000 }
          ] : [
            { type: 'West Region', amount: 649705485.42 },
            { type: 'North Region', amount: 643123733.72 },
            { type: 'East Region', amount: 598346948.12 },
            { type: 'South Region - 2', amount: 424667042.98 },
            { type: 'South Region - 1', amount: 391846712.34 },
            { type: 'Export', amount: 129117649.19 },
            { type: 'India Yamaha', amount: 109501448.7 }
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
                    legend: {
                      position: 'bottom'
                    },
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
                  height={400}
                />
              </Suspense>
            </div>
          );

        case "bar":
          console.log('📊 Bar chart - DATA_SOURCE:', DATA_SOURCE);
          const barData = DATA_SOURCE === "Marketing" ? [
            { channel: 'Google Ads', amount: 4500000 },
            { channel: 'Facebook Ads', amount: 3200000 },
            { channel: 'LinkedIn Ads', amount: 2800000 },
            { channel: 'Email Marketing', amount: 3800000 },
            { channel: 'Content Marketing', amount: 2200000 }
          ] : [
            { channel: 'Engine Oil', amount: 0 },
            { channel: 'Motor Oil', amount: 0 },
            { channel: 'Transmission Fluid', amount: 0 },
            { channel: 'Coolant', amount: 0 },
            { channel: 'Additives', amount: 0 }
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
                      categories: barData.map(d => DATA_SOURCE === "Marketing" ? d.channel : d.product || d.channel),
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
                    name: DATA_SOURCE === "Marketing" ? 'Marketing Spend' : 'Product Spend',
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
            <h3 className="font-medium text-gray-900">
              {DATA_SOURCE === "Motul" && widget.type === "kpi" ? (
                widget.title === "Total Leads" ? "Sale for the Day" :
                widget.title === "Total Cost" ? "MTD" :
                widget.title === "Conversion Rate" ? "YTD" :
                widget.title
              ) : widget.type === "table" && DATA_SOURCE === "Motul" ? "Primary Segment Wise Sales" : widget.title}
            </h3>
            {!((widget.type === "table" || widget.type === "kpi") && DATA_SOURCE === "Motul") && (
              <p className="text-sm text-gray-500">{widget.description}</p>
            )}
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50 mr-1">
              <MessageCircle className="h-4 w-4 text-gray-500" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-gray-50 mr-1"
              onClick={() => setAlertModalWidget(widget)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.0196 2.91016C8.7096 2.91016 6.0196 5.60016 6.0196 8.91016V11.8002C6.0196 12.4102 5.7596 13.3402 5.4496 13.8602L4.2996 15.7702C3.5896 16.9502 4.0796 18.2602 5.3796 18.7002C9.6896 20.1402 14.3396 20.1402 18.6496 18.7002C19.8596 18.3002 20.3896 16.8702 19.7296 15.7702L18.5796 13.8602C18.2796 13.3402 18.0196 12.4102 18.0196 11.8002V8.91016C18.0196 5.61016 15.3196 2.91016 12.0196 2.91016Z" stroke="#6B7280" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/>
                <path d="M13.8699 3.19994C13.5599 3.10994 13.2399 3.03994 12.9099 2.99994C11.9499 2.87994 11.0299 2.94994 10.1699 3.19994C10.4599 2.45994 11.1799 1.93994 12.0199 1.93994C12.8599 1.93994 13.5799 2.45994 13.8699 3.19994Z" stroke="#6B7280" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.0195 19.0601C15.0195 20.7101 13.6695 22.0601 12.0195 22.0601C11.1995 22.0601 10.4395 21.7201 9.89953 21.1801C9.35953 20.6401 9.01953 19.8801 9.01953 19.0601" stroke="#6B7280" strokeWidth="1.5" strokeMiterlimit="10"/>
              </svg>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Manage Alerts</DropdownMenuItem>
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

  // Use default Motul widgets or stored widgets
  const widgetsToRender = getWidgetsToRender();

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
              {widgetsToRender && widgetsToRender[currentSlideIndex] && (
                <div className="transform scale-125">
                  {renderWidget(widgetsToRender[currentSlideIndex])}
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                {currentSlideIndex + 1} / {widgetsToRender?.length || 0}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 disabled:opacity-50"
              onClick={handleNextSlide}
              disabled={!widgetsToRender || currentSlideIndex === widgetsToRender.length - 1}
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
                size="icon"
                className="h-10 w-10"
                onClick={() => setIsPresentationMode(!isPresentationMode)}
              >
                <Presentation className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      PDF
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPPT}>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 9L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 9L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      PPT
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportImage}>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                        <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Image
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={() => setAddWidgetStep('manual')}
                className="bg-[#3551F3] hover:bg-[#2B41D9] text-white gap-2 h-10"
              >
                <Plus className="h-4 w-4" />
                Add Widget
              </Button>
            </div>
          </div>

          {/* AI Search Bar */}
          <form onSubmit={handleAiSearch} className="mb-8">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    <path d="M19 15L19.74 17.74L22.5 18.5L19.74 19.26L19 22L18.26 19.26L15.5 18.5L18.26 17.74L19 15Z" fill="currentColor"/>
                    <path d="M5 6L5.5 7.5L7 8L5.5 8.5L5 10L4.5 8.5L3 8L4.5 7.5L5 6Z" fill="currentColor"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  placeholder="Ask a question like 'Sales Revenue by Region'"
                  className="w-full h-10 px-12 rounded-lg shadow-sm bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]/40"
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 bg-[#3551F3] hover:bg-[#2B41D9] text-white rounded-lg flex-shrink-0"
              >
                <FaWandMagicSparkles className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* FY Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">FY</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]/40 bg-white"
                >
                  <option>25-26</option>
                </select>
              </div>

              {/* Segment Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Segment</label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]/40 bg-white"
                >
                  <option>All</option>
                  <option>MCO</option>
                  <option>Care & Additives</option>
                  <option>Specialities</option>
                  <option>PCMO</option>
                  <option>3WO</option>
                  <option>HDDO</option>
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]/40 bg-white"
                >
                  <option>All</option>
                  <option>EAST REGION</option>
                  <option>NORTH REGION</option>
                  <option>SOUTH REGION-1</option>
                  <option>SOUTH REGION-2</option>
                  <option>WEST REGION</option>
                  <option>INDIA YAMAHA</option>
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]/40 bg-white"
                >
                  <option>All</option>
                  <option>DELHI NCR</option>
                  <option>GUJARAT</option>
                  <option>ODISHA</option>
                  <option>SOUTH TAMILNADU</option>
                  <option>UTTAR PRADESH (WEST)</option>
                  <option>WEST BENGAL</option>
                  <option>UTTAR PRADESH (EAST)</option>
                  <option>KARNATAKA</option>
                  <option>WEST MAHARASHTRA</option>
                  <option>PUNJAB</option>
                  <option>MUMBAI METRO</option>
                  <option>VIDARBHA</option>
                  <option>CHANDIGARH</option>
                  <option>KERALA</option>
                  <option>BIHAR</option>
                  <option>HARYANA</option>
                  <option>JHARKHAND</option>
                  <option>NORTH TAMILNADU</option>
                  <option>Nepal</option>
                  <option>NORTH EAST</option>
                  <option>GOA</option>
                  <option>MADHYA PRADESH</option>
                  <option>RAJASTHAN</option>
                  <option>ANDHRA PRADESH</option>
                  <option>TELANGANA</option>
                  <option>HIMACHAL PRADESH</option>
                  <option>UTTARAKHAND</option>
                </select>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {(!widgetsToRender || widgetsToRender.length === 0) && (
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
                  onClick={() => setAddWidgetStep('manual')}
                  className="bg-[#3551F3] hover:bg-[#2B41D9] text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Widget
                </Button>
              </div>
            </div>
          )}

          {/* Widgets Grid */}
          {widgetsToRender && widgetsToRender.length > 0 && (
            <div className="space-y-6">
              {/* KPI Widgets */}
              {widgetsToRender.some(w => w.type === 'kpi') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {widgetsToRender
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
              {widgetsToRender.some(w => w.type !== 'kpi') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {widgetsToRender
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




      {/* Manual Chart Builder - Full Screen */}
      {addWidgetStep === 'manual' && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <ManualChartBuilder onClose={() => setAddWidgetStep(null)} onSave={handleWidgetSubmit} />
        </div>
      )}
      <AlertModal 
        isOpen={alertModalWidget !== null}
        onClose={() => setAlertModalWidget(null)}
        widgetTitle={alertModalWidget?.title}
      />
      <ShareDashboardModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* AI Chart Modal */}
      <AIChartModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        searchQuery={aiSearchQuery}
        onAddToDashboard={() => {
          // TODO: Add chart to dashboard
          console.log('Adding chart to dashboard');
          setAiSearchQuery('');
        }}
      />
    </MainLayout>
  );
}
