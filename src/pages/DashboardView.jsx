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
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedSKU, setSelectedSKU] = useState('All');
  const [selectedOutletType, setSelectedOutletType] = useState('All');
  const [selectedSegment, setSelectedSegment] = useState('All');

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
          type: "pivot-table",
          title: "Secondary Sales (Distributor- Wise)",
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
          title: "Sales Revenue by Segment",
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

  // State for expanded rows in pivot table
  const [pivotExpandedRows, setPivotExpandedRows] = useState(new Set());

  const renderWidget = (widget) => {
    if (!widget) return null;

    // Hide non-KPI, non-table, non-combo, non-pie, and non-pivot-table charts for Motul
    if (DATA_SOURCE === "Motul" && widget.type !== "kpi" && widget.type !== "table" && widget.type !== "combo" && widget.type !== "pie" && widget.type !== "pivot-table") {
      return null;
    }

    console.log('📊 Rendering widget:', { type: widget.type, title: widget.title, dataSource: DATA_SOURCE });

    // Define distributor data for Motul dashboard (used by both combo and pivot-table)
    const distributorData = [
      { code: 'C002579', name: 'VARDHAMAN DISTRIBUTORS - Pune_Area', jul_sales: 17027.25, jul_invoices: 390, jul_customers: 247, aug_sales: 30318.81, aug_invoices: 191, aug_customers: 115, sep_sales: 46222.67, sep_invoices: 692, sep_customers: 275 },
      { code: 'C002747', name: 'Bhawani Enterprise - Chembur_Area', jul_sales: 67055.1, jul_invoices: 254, jul_customers: 183, aug_sales: 121533.68, aug_invoices: 476, aug_customers: 226, sep_sales: 68142.17, sep_invoices: 448, sep_customers: 226 },
      { code: 'C002748', name: 'Venkatesh Oil Trading - Sangli_Area', jul_sales: 6550.99, jul_invoices: 152, jul_customers: 143, aug_sales: 9549.92, aug_invoices: 175, aug_customers: 132, sep_sales: 17372.78, sep_invoices: 158, sep_customers: 105 },
      { code: 'C002749', name: 'Banga Tyres - Narayangaon_Area', jul_sales: 9765.25, jul_invoices: 142, jul_customers: 94, aug_sales: 8472.57, aug_invoices: 167, aug_customers: 100, sep_sales: 8767.1, sep_invoices: 134, sep_customers: 97 },
      { code: 'C002751', name: 'Ambika Auto Agency - Pune_Area', jul_sales: 15003.85, jul_invoices: 343, jul_customers: 224, aug_sales: 18516.71, aug_invoices: 295, aug_customers: 173, sep_sales: 27890.48, sep_invoices: 528, sep_customers: 276 },
      { code: 'C002761', name: 'Popular Distributor_Area', jul_sales: 15636.53, jul_invoices: 237, jul_customers: 218, aug_sales: 27733.53, aug_invoices: 517, aug_customers: 225, sep_sales: 20991.66, sep_invoices: 613, sep_customers: 244 },
      { code: 'C002765', name: 'Arpan Traders_Area', jul_sales: 18209.91, jul_invoices: 261, jul_customers: 158, aug_sales: 15794.83, aug_invoices: 267, aug_customers: 182, sep_sales: 20171.07, sep_invoices: 303, sep_customers: 193 },
      { code: 'C002771', name: 'PANKAJ TRADING COMPANY - Kolhapur_Area', jul_sales: 18806.58, jul_invoices: 313, jul_customers: 253, aug_sales: 26995.3, aug_invoices: 563, aug_customers: 257, sep_sales: 20888.82, sep_invoices: 457, sep_customers: 262 },
      { code: 'C002774', name: 'Ujjwal Enterprises - Virar_Area', jul_sales: 12473.4, jul_invoices: 168, jul_customers: 79, aug_sales: 13675.64, aug_invoices: 213, aug_customers: 81, sep_sales: 15378.84, sep_invoices: 172, sep_customers: 101 },
      { code: 'C002794', name: 'Autofield (India) - Nagpur_Area', jul_sales: 20864.45, jul_invoices: 300, jul_customers: 183, aug_sales: 16857.97, aug_invoices: 305, aug_customers: 184, sep_sales: 25833.72, sep_invoices: 398, sep_customers: 255 },
      { code: 'C002833', name: 'Central Automobiles - Nagpur_Area', jul_sales: 6237.61, jul_invoices: 166, jul_customers: 88, aug_sales: 4848.17, aug_invoices: 158, aug_customers: 84, sep_sales: 6958.21, sep_invoices: 179, sep_customers: 88 },
      { code: 'C002835', name: 'Kadam Enterprises - Baramati', jul_sales: 4312.95, jul_invoices: 113, jul_customers: 80, aug_sales: 5980.3, aug_invoices: 98, aug_customers: 53, sep_sales: 7467.93, sep_invoices: 146, sep_customers: 71 },
      { code: 'C002845', name: 'D S Enterprises - Ambadi_Area', jul_sales: 13168.03, jul_invoices: 167, jul_customers: 91, aug_sales: 11457.7, aug_invoices: 168, aug_customers: 99, sep_sales: 13184.35, sep_invoices: 185, sep_customers: 101 },
      { code: 'C002857', name: 'Shri Agency - Thane_Area', jul_sales: 21948.21, jul_invoices: 164, jul_customers: 123, aug_sales: 23218.3, aug_invoices: 236, aug_customers: 135, sep_sales: 23594.87, sep_invoices: 286, sep_customers: 137 },
      { code: 'C002862', name: 'Trident Automotive LLP - Borivali West_Area', jul_sales: 79647.84, jul_invoices: 317, jul_customers: 292, aug_sales: 111375.15, aug_invoices: 777, aug_customers: 322, sep_sales: 109891.99, sep_invoices: 549, sep_customers: 310 },
      { code: 'C002863', name: 'Shree Motors - Akola_Area', jul_sales: 3033.5, jul_invoices: 61, jul_customers: 46, aug_sales: 5156.56, aug_invoices: 93, aug_customers: 76, sep_sales: 7754.78, sep_invoices: 131, sep_customers: 100 },
      { code: 'C002864', name: 'Adyant Automotives LLP - Jalna_Area', jul_sales: 105.4, jul_invoices: 4, jul_customers: 4, aug_sales: 0, aug_invoices: 0, aug_customers: 0, sep_sales: 0, sep_invoices: 0, sep_customers: 0 },
      { code: 'C002866', name: 'Baba Enterprises - New Panvel_Area', jul_sales: 6713.11, jul_invoices: 185, jul_customers: 124, aug_sales: 21527.07, aug_invoices: 275, aug_customers: 157, sep_sales: 20533.68, sep_invoices: 435, sep_customers: 160 },
      { code: 'C003149', name: 'Shree Maruti Enterprises - Gondia (Dealer A/c)_Area', jul_sales: 4020.5, jul_invoices: 60, jul_customers: 50, aug_sales: 4733.8, aug_invoices: 94, aug_customers: 87, sep_sales: 6561.6, sep_invoices: 110, sep_customers: 89 },
      { code: 'C003287', name: 'CHAVAN DISTRIBUTORS_Area', jul_sales: 5096.35, jul_invoices: 156, jul_customers: 77, aug_sales: 4701.15, aug_invoices: 144, aug_customers: 82, sep_sales: 9127.23, sep_invoices: 273, sep_customers: 131 },
      { code: 'C003301', name: 'K.S. SALES CORPORATION_Area', jul_sales: 8696.37, jul_invoices: 188, jul_customers: 89, aug_sales: 9519.07, aug_invoices: 213, aug_customers: 88, sep_sales: 8195.97, sep_invoices: 209, sep_customers: 85 },
      { code: 'C003318', name: 'ELITE ENTERPRISES_Area', jul_sales: 622.4, jul_invoices: 5, jul_customers: 5, aug_sales: 686.38, aug_invoices: 20, aug_customers: 12, sep_sales: 3505.3, sep_invoices: 37, sep_customers: 32 },
      { code: 'C003481', name: 'ADVITA OIL TRADING – SATARA_Area', jul_sales: 3550.69, jul_invoices: 74, jul_customers: 40, aug_sales: 3232.61, aug_invoices: 76, aug_customers: 43, sep_sales: 15137.25, sep_invoices: 118, sep_customers: 86 },
      { code: 'C003506', name: 'LAXMI NARAYAN ENTERPRISE – SAWANTWADI_Area', jul_sales: 2469.54, jul_invoices: 123, jul_customers: 64, aug_sales: 2840.52, aug_invoices: 98, aug_customers: 54, sep_sales: 4671.57, sep_invoices: 176, sep_customers: 75 },
      { code: 'C003518', name: 'RAJKAMAL TRADING COMPANY - PIMPRI_Area', jul_sales: 12401.36, jul_invoices: 190, jul_customers: 137, aug_sales: 16193.84, aug_invoices: 271, aug_customers: 142, sep_sales: 21392.25, sep_invoices: 334, sep_customers: 154 },
      { code: 'C003548', name: 'RAMAK ENTERPRISES – AHMEDNAGAR', jul_sales: 9094.01, jul_invoices: 162, jul_customers: 127, aug_sales: 11464.98, aug_invoices: 173, aug_customers: 128, sep_sales: 9702.67, sep_invoices: 135, sep_customers: 86 },
      { code: 'C003579', name: 'Shivraj Enterprises – Aurangabad', jul_sales: 4807, jul_invoices: 103, jul_customers: 66, aug_sales: 6083.63, aug_invoices: 215, aug_customers: 140, sep_sales: 7894.73, sep_invoices: 190, sep_customers: 136 },
      { code: 'C003602', name: 'Mahalaxmi Trading Company- Chandrapur_Area', jul_sales: 4397.52, jul_invoices: 145, jul_customers: 92, aug_sales: 6174.44, aug_invoices: 142, aug_customers: 97, sep_sales: 4042.96, sep_invoices: 83, sep_customers: 72 },
      { code: 'C003683', name: 'Warsi Distributors – Dahanu_Aera', jul_sales: 862.8, jul_invoices: 20, jul_customers: 20, aug_sales: 5990.29, aug_invoices: 65, aug_customers: 37, sep_sales: 3707.84, sep_invoices: 122, sep_customers: 50 },
      { code: 'C003721', name: 'Dhenu Autolines LLP – Jalna_Area', jul_sales: 1469.65, jul_invoices: 33, jul_customers: 29, aug_sales: 2036.05, aug_invoices: 54, aug_customers: 42, sep_sales: 1170.1, sep_invoices: 20, sep_customers: 16 },
      { code: 'C003660', name: 'Gayatri Motors - Nanded', jul_sales: 0, jul_invoices: 0, jul_customers: 0, aug_sales: 0, aug_invoices: 0, aug_customers: 0, sep_sales: 5643.25, sep_invoices: 83, sep_customers: 70 }
    ];

    // Calculate totals for East Region (used by both combo and pivot-table)
    let jul_sales_total = 0, jul_invoices_total = 0, jul_customers_total = 0;
    let aug_sales_total = 0, aug_invoices_total = 0, aug_customers_total = 0;
    let sep_sales_total = 0, sep_invoices_total = 0, sep_customers_total = 0;

    distributorData.forEach(dist => {
      jul_sales_total += dist.jul_sales;
      jul_customers_total += dist.jul_customers;
      jul_invoices_total += dist.jul_invoices;
      aug_sales_total += dist.aug_sales;
      aug_customers_total += dist.aug_customers;
      aug_invoices_total += dist.aug_invoices;
      sep_sales_total += dist.sep_sales;
      sep_customers_total += dist.sep_customers;
      sep_invoices_total += dist.sep_invoices;
    });

    const renderChart = () => {
      switch (widget.type) {
        case "combo":
          console.log('📊 Combo chart - DATA_SOURCE:', DATA_SOURCE);

          // Data organized by month - Outlets Billed = No. of Customers, Invoices = No. of Invoices
          const comboData = DATA_SOURCE === "Marketing" ? [] : [

            {
              month: "July 2025",
              "East Region - Outlets": jul_customers_total,
              "East Region - Invoices": jul_invoices_total
            },
            {
              month: "August 2025",
              "East Region - Outlets": aug_customers_total,
              "East Region - Invoices": aug_invoices_total
            },
            {
              month: "September 2025",
              "East Region - Outlets": sep_customers_total,
              "East Region - Invoices": sep_invoices_total
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
                      width: [0, 3],
                      curve: 'smooth',
                      colors: ['#3B82F6', '#EF4444']
                    },
                    colors: ['#3B82F6', '#EF4444'],
                    dataLabels: {
                      enabled: false
                    },
                    tooltip: {
                      enabled: true,
                      shared: true,
                      intersect: false,
                      y: {
                        formatter: (value) => {
                          if (value !== undefined) {
                            return value.toLocaleString('en-IN');
                          }
                          return value;
                        }
                      }
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
                      name: '',
                      data: comboData.map(d => d["East Region - Invoices"]),
                      type: 'line'
                    }
                  ]}
                  height={400}
                />
              </Suspense>

              {/* Custom Horizontal Legend */}
              <div className="flex justify-center gap-8 mt-6 flex-wrap">
                {[
                  { name: 'East Region', color: '#3B82F6' }
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
              displayValue = (138591).toLocaleString('en-IN');
            } else if (widget.title === "Total Cost" || widget.title === "MTD") {
              trend = 8.7;
              displayValue = (561798).toLocaleString('en-IN');
            } else if (widget.title === "Conversion Rate" || widget.title === "YTD") {
              trend = 12.3;
              displayValue = (1502515).toLocaleString('en-IN');
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
            { type: '3WO', amount: 80949133.79 },
            { type: 'Care & Additives', amount: 10427134.05 },
            { type: 'HDDO', amount: 9713267.67 },
            { type: 'MCO', amount: 228007434.4 },
            { type: 'PCMO', amount: 61438229.16 },
            { type: 'Specialities', amount: 5106814.1 }
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
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
                    dataLabels: {
                      enabled: false
                    },
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

        case "pivot-table":
          console.log('🔄 Pivot table - DATA_SOURCE:', DATA_SOURCE);

          // Format value function for pivot table
          const formatPivotValue = (value, columnKey) => {
            if (!value || value === 0) return '';
            const roundedValue = Math.round(value);
            return roundedValue.toLocaleString('en-IN');
          };

          // Distributor data structure
          const distributorData = [
            { code: 'C002579', name: 'VARDHAMAN DISTRIBUTORS - Pune_Area', jul_sales: 17027.25, jul_invoices: 390, jul_customers: 247, aug_sales: 30318.81, aug_invoices: 191, aug_customers: 115, sep_sales: 46222.67, sep_invoices: 692, sep_customers: 275 },
            { code: 'C002747', name: 'Bhawani Enterprise - Chembur_Area', jul_sales: 67055.1, jul_invoices: 254, jul_customers: 183, aug_sales: 121533.68, aug_invoices: 476, aug_customers: 226, sep_sales: 68142.17, sep_invoices: 448, sep_customers: 226 },
            { code: 'C002748', name: 'Venkatesh Oil Trading - Sangli_Area', jul_sales: 6550.99, jul_invoices: 152, jul_customers: 143, aug_sales: 9549.92, aug_invoices: 175, aug_customers: 132, sep_sales: 17372.78, sep_invoices: 158, sep_customers: 105 },
            { code: 'C002749', name: 'Banga Tyres - Narayangaon_Area', jul_sales: 9765.25, jul_invoices: 142, jul_customers: 94, aug_sales: 8472.57, aug_invoices: 167, aug_customers: 100, sep_sales: 8767.1, sep_invoices: 134, sep_customers: 97 },
            { code: 'C002751', name: 'Ambika Auto Agency - Pune_Area', jul_sales: 15003.85, jul_invoices: 343, jul_customers: 224, aug_sales: 18516.71, aug_invoices: 295, aug_customers: 173, sep_sales: 27890.48, sep_invoices: 528, sep_customers: 276 },
            { code: 'C002761', name: 'Popular Distributor_Area', jul_sales: 15636.53, jul_invoices: 237, jul_customers: 218, aug_sales: 27733.53, aug_invoices: 517, aug_customers: 225, sep_sales: 20991.66, sep_invoices: 613, sep_customers: 244 },
            { code: 'C002765', name: 'Arpan Traders_Area', jul_sales: 18209.91, jul_invoices: 261, jul_customers: 158, aug_sales: 15794.83, aug_invoices: 267, aug_customers: 182, sep_sales: 20171.07, sep_invoices: 303, sep_customers: 193 },
            { code: 'C002771', name: 'PANKAJ TRADING COMPANY - Kolhapur_Area', jul_sales: 18806.58, jul_invoices: 313, jul_customers: 253, aug_sales: 26995.3, aug_invoices: 563, aug_customers: 257, sep_sales: 20888.82, sep_invoices: 457, sep_customers: 262 },
            { code: 'C002774', name: 'Ujjwal Enterprises - Virar_Area', jul_sales: 12473.4, jul_invoices: 168, jul_customers: 79, aug_sales: 13675.64, aug_invoices: 213, aug_customers: 81, sep_sales: 15378.84, sep_invoices: 172, sep_customers: 101 },
            { code: 'C002794', name: 'Autofield (India) - Nagpur_Area', jul_sales: 20864.45, jul_invoices: 300, jul_customers: 183, aug_sales: 16857.97, aug_invoices: 305, aug_customers: 184, sep_sales: 25833.72, sep_invoices: 398, sep_customers: 255 },
            { code: 'C002833', name: 'Central Automobiles - Nagpur_Area', jul_sales: 6237.61, jul_invoices: 166, jul_customers: 88, aug_sales: 4848.17, aug_invoices: 158, aug_customers: 84, sep_sales: 6958.21, sep_invoices: 179, sep_customers: 88 },
            { code: 'C002835', name: 'Kadam Enterprises - Baramati', jul_sales: 4312.95, jul_invoices: 113, jul_customers: 80, aug_sales: 5980.3, aug_invoices: 98, aug_customers: 53, sep_sales: 7467.93, sep_invoices: 146, sep_customers: 71 },
            { code: 'C002845', name: 'D S Enterprises - Ambadi_Area', jul_sales: 13168.03, jul_invoices: 167, jul_customers: 91, aug_sales: 11457.7, aug_invoices: 168, aug_customers: 99, sep_sales: 13184.35, sep_invoices: 185, sep_customers: 101 },
            { code: 'C002857', name: 'Shri Agency - Thane_Area', jul_sales: 21948.21, jul_invoices: 164, jul_customers: 123, aug_sales: 23218.3, aug_invoices: 236, aug_customers: 135, sep_sales: 23594.87, sep_invoices: 286, sep_customers: 137 },
            { code: 'C002862', name: 'Trident Automotive LLP - Borivali West_Area', jul_sales: 79647.84, jul_invoices: 317, jul_customers: 292, aug_sales: 111375.15, aug_invoices: 777, aug_customers: 322, sep_sales: 109891.99, sep_invoices: 549, sep_customers: 310 },
            { code: 'C002863', name: 'Shree Motors - Akola_Area', jul_sales: 3033.5, jul_invoices: 61, jul_customers: 46, aug_sales: 5156.56, aug_invoices: 93, aug_customers: 76, sep_sales: 7754.78, sep_invoices: 131, sep_customers: 100 },
            { code: 'C002864', name: 'Adyant Automotives LLP - Jalna_Area', jul_sales: 105.4, jul_invoices: 4, jul_customers: 4, aug_sales: 0, aug_invoices: 0, aug_customers: 0, sep_sales: 0, sep_invoices: 0, sep_customers: 0 },
            { code: 'C002866', name: 'Baba Enterprises - New Panvel_Area', jul_sales: 6713.11, jul_invoices: 185, jul_customers: 124, aug_sales: 21527.07, aug_invoices: 275, aug_customers: 157, sep_sales: 20533.68, sep_invoices: 435, sep_customers: 160 },
            { code: 'C003149', name: 'Shree Maruti Enterprises - Gondia (Dealer A/c)_Area', jul_sales: 4020.5, jul_invoices: 60, jul_customers: 50, aug_sales: 4733.8, aug_invoices: 94, aug_customers: 87, sep_sales: 6561.6, sep_invoices: 110, sep_customers: 89 },
            { code: 'C003287', name: 'CHAVAN DISTRIBUTORS_Area', jul_sales: 5096.35, jul_invoices: 156, jul_customers: 77, aug_sales: 4701.15, aug_invoices: 144, aug_customers: 82, sep_sales: 9127.23, sep_invoices: 273, sep_customers: 131 },
            { code: 'C003301', name: 'K.S. SALES CORPORATION_Area', jul_sales: 8696.37, jul_invoices: 188, jul_customers: 89, aug_sales: 9519.07, aug_invoices: 213, aug_customers: 88, sep_sales: 8195.97, sep_invoices: 209, sep_customers: 85 },
            { code: 'C003318', name: 'ELITE ENTERPRISES_Area', jul_sales: 622.4, jul_invoices: 5, jul_customers: 5, aug_sales: 686.38, aug_invoices: 20, aug_customers: 12, sep_sales: 3505.3, sep_invoices: 37, sep_customers: 32 },
            { code: 'C003481', name: 'ADVITA OIL TRADING – SATARA_Area', jul_sales: 3550.69, jul_invoices: 74, jul_customers: 40, aug_sales: 3232.61, aug_invoices: 76, aug_customers: 43, sep_sales: 15137.25, sep_invoices: 118, sep_customers: 86 },
            { code: 'C003506', name: 'LAXMI NARAYAN ENTERPRISE – SAWANTWADI_Area', jul_sales: 2469.54, jul_invoices: 123, jul_customers: 64, aug_sales: 2840.52, aug_invoices: 98, aug_customers: 54, sep_sales: 4671.57, sep_invoices: 176, sep_customers: 75 },
            { code: 'C003518', name: 'RAJKAMAL TRADING COMPANY - PIMPRI_Area', jul_sales: 12401.36, jul_invoices: 190, jul_customers: 137, aug_sales: 16193.84, aug_invoices: 271, aug_customers: 142, sep_sales: 21392.25, sep_invoices: 334, sep_customers: 154 },
            { code: 'C003548', name: 'RAMAK ENTERPRISES – AHMEDNAGAR', jul_sales: 9094.01, jul_invoices: 162, jul_customers: 127, aug_sales: 11464.98, aug_invoices: 173, aug_customers: 128, sep_sales: 9702.67, sep_invoices: 135, sep_customers: 86 },
            { code: 'C003579', name: 'Shivraj Enterprises – Aurangabad', jul_sales: 4807, jul_invoices: 103, jul_customers: 66, aug_sales: 6083.63, aug_invoices: 215, aug_customers: 140, sep_sales: 7894.73, sep_invoices: 190, sep_customers: 136 },
            { code: 'C003602', name: 'Mahalaxmi Trading Company- Chandrapur_Area', jul_sales: 4397.52, jul_invoices: 145, jul_customers: 92, aug_sales: 6174.44, aug_invoices: 142, aug_customers: 97, sep_sales: 4042.96, sep_invoices: 83, sep_customers: 72 },
            { code: 'C003683', name: 'Warsi Distributors – Dahanu_Aera', jul_sales: 862.8, jul_invoices: 20, jul_customers: 20, aug_sales: 5990.29, aug_invoices: 65, aug_customers: 37, sep_sales: 3707.84, sep_invoices: 122, sep_customers: 50 },
            { code: 'C003721', name: 'Dhenu Autolines LLP – Jalna_Area', jul_sales: 1469.65, jul_invoices: 33, jul_customers: 29, aug_sales: 2036.05, aug_invoices: 54, aug_customers: 42, sep_sales: 1170.1, sep_invoices: 20, sep_customers: 16 },
            { code: 'C003660', name: 'Gayatri Motors - Nanded', jul_sales: 0, jul_invoices: 0, jul_customers: 0, aug_sales: 0, aug_invoices: 0, aug_customers: 0, sep_sales: 5643.25, sep_invoices: 83, sep_customers: 70 }
          ];

          // Build pivot table structure: Region > State > Distributor Code > Distributor Name
          const pivotTableData = {
            rows: [
              {
                id: "east-region",
                label: "East Region",
                isParent: true,
                data: {
                  "JUL-Sales": jul_sales_total,
                  "JUL-Invoices": jul_invoices_total,
                  "JUL-Customers": jul_customers_total,
                  "AUG-Sales": aug_sales_total,
                  "AUG-Invoices": aug_invoices_total,
                  "AUG-Customers": aug_customers_total,
                  "SEP-Sales": sep_sales_total,
                  "SEP-Invoices": sep_invoices_total,
                  "SEP-Customers": sep_customers_total
                },
                children: [
                  {
                    id: "maharashtra",
                    label: "Maharashtra",
                    isParent: true,
                    data: {
                      "JUL-Sales": jul_sales_total,
                      "JUL-Invoices": jul_invoices_total,
                      "JUL-Customers": jul_customers_total,
                      "AUG-Sales": aug_sales_total,
                      "AUG-Invoices": aug_invoices_total,
                      "AUG-Customers": aug_customers_total,
                      "SEP-Sales": sep_sales_total,
                      "SEP-Invoices": sep_invoices_total,
                      "SEP-Customers": sep_customers_total
                    },
                    children: distributorData.map(dist => ({
                      id: dist.code,
                      label: dist.code,
                      isParent: true,
                      data: {
                        "JUL-Sales": dist.jul_sales,
                        "JUL-Invoices": dist.jul_invoices,
                        "JUL-Customers": dist.jul_customers,
                        "AUG-Sales": dist.aug_sales,
                        "AUG-Invoices": dist.aug_invoices,
                        "AUG-Customers": dist.aug_customers,
                        "SEP-Sales": dist.sep_sales,
                        "SEP-Invoices": dist.sep_invoices,
                        "SEP-Customers": dist.sep_customers
                      },
                      children: [
                        {
                          id: `${dist.code}-name`,
                          label: dist.name,
                          isParent: false,
                          data: {
                            "JUL-Sales": dist.jul_sales,
                            "JUL-Invoices": dist.jul_invoices,
                            "JUL-Customers": dist.jul_customers,
                            "AUG-Sales": dist.aug_sales,
                            "AUG-Invoices": dist.aug_invoices,
                            "AUG-Customers": dist.aug_customers,
                            "SEP-Sales": dist.sep_sales,
                            "SEP-Invoices": dist.sep_invoices,
                            "SEP-Customers": dist.sep_customers
                          }
                        }
                      ]
                    }))
                  }
                ]
              }
            ],
            columnGroups: [
              {
                label: "Jul'25",
                columns: [
                  { key: "JUL-Sales", label: "Sale in Ltrs" },
                  { key: "JUL-Invoices", label: "No. of Invoices" },
                  { key: "JUL-Customers", label: "No. of Customers" }
                ]
              },
              {
                label: "Aug'25",
                columns: [
                  { key: "AUG-Sales", label: "Sale in Ltrs" },
                  { key: "AUG-Invoices", label: "No. of Invoices" },
                  { key: "AUG-Customers", label: "No. of Customers" }
                ]
              },
              {
                label: "Sep'25",
                columns: [
                  { key: "SEP-Sales", label: "Sale in Ltrs" },
                  { key: "SEP-Invoices", label: "No. of Invoices" },
                  { key: "SEP-Customers", label: "No. of Customers" }
                ]
              }
            ],
            totals: {
              "JUL-Sales": jul_sales_total,
              "JUL-Invoices": jul_invoices_total,
              "JUL-Customers": jul_customers_total,
              "AUG-Sales": aug_sales_total,
              "AUG-Invoices": aug_invoices_total,
              "AUG-Customers": aug_customers_total,
              "SEP-Sales": sep_sales_total,
              "SEP-Invoices": sep_invoices_total,
              "SEP-Customers": sep_customers_total
            }
          };

          // Render row recursively
          const renderPivotRow = (row, level = 0) => {
            const isExpanded = pivotExpandedRows.has(row.id);
            const isParentRow = row.isParent;
            const isRegionOrState = level < 2;

            return [
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-4 py-3 border-r border-gray-200"
                    style={{ paddingLeft: `${level * 20 + 16}px`, minWidth: '150px' }}>
                  <div className="flex items-center gap-2">
                    {isParentRow && (
                      <button
                        onClick={() => togglePivotRow(row.id)}
                        className="text-gray-600"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    )}
                    {!isParentRow && <span className="w-4"></span>}
                    <span className={isRegionOrState ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                      {row.label}
                    </span>
                  </div>
                </td>
                {pivotTableData.columnGroups.map(group =>
                  group.columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-right border-r border-gray-200 ${isRegionOrState ? 'font-bold' : ''}`}>
                      {formatPivotValue(row.data[col.key], col.key)}
                    </td>
                  ))
                )}
              </tr>,
              isExpanded && row.children ? row.children.map(child => renderPivotRow(child, level + 1)) : null
            ].flat().filter(Boolean);
          };

          // Toggle function for expanding/collapsing rows
          const togglePivotRow = (rowId) => {
            setPivotExpandedRows(prev => {
              const newSet = new Set(prev);
              if (newSet.has(rowId)) {
                newSet.delete(rowId);
              } else {
                newSet.add(rowId);
              }
              return newSet;
            });
          };

          return (
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  {/* Month headers row */}
                  <tr className="bg-[#3551F3] border-b border-white">
                    <th className="sticky left-0 bg-[#3551F3] text-white px-4 py-3 font-semibold text-left border-r border-white"
                        style={{ minWidth: '150px' }}>
                      Month
                    </th>
                    {pivotTableData.columnGroups.map(group => (
                      <th key={group.label} colSpan={group.columns.length}
                          className="text-white px-4 py-3 text-center font-semibold text-sm border-r border-white">
                        {group.label}
                      </th>
                    ))}
                  </tr>
                  {/* Metric headers row */}
                  <tr className="bg-[#3551F3]">
                    <th className="sticky left-0 bg-[#3551F3] text-white px-4 py-3 font-semibold text-left border-r border-white"
                        style={{ minWidth: '150px' }}>
                      Region
                    </th>
                    {pivotTableData.columnGroups.map(group =>
                      group.columns.map(col => (
                        <th key={col.key} className="text-white px-4 py-3 text-xs font-medium border-r border-white whitespace-nowrap text-center">
                          {col.label}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pivotTableData.rows.flatMap(row => renderPivotRow(row, 0))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#3551F3] border-t-2 border-white font-semibold">
                    <td className="sticky left-0 bg-[#3551F3] px-4 py-3 text-white" style={{ minWidth: '150px' }}>
                      Total
                    </td>
                    {pivotTableData.columnGroups.map(group =>
                      group.columns.map(col => (
                        <td key={col.key} className="px-4 py-3 text-right border-r border-white text-white">
                          {formatPivotValue(pivotTableData.totals[col.key], col.key)}
                        </td>
                      ))
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
              {DATA_SOURCE === "Motul" && widget.type === "kpi" ? (
                widget.title === "Total Leads" ? "Sale for the Day" :
                widget.title === "Total Cost" ? "MTD" :
                widget.title === "Conversion Rate" ? "YTD" :
                widget.title
              ) : widget.type === "table" && DATA_SOURCE === "Motul" ? "Primary Segment Wise Sales" :
              widget.type === "pivot-table" ? "Secondary Sales (Distributor- Wise)" :
              widget.title}
            </h3>
            {!((widget.type === "table" || widget.type === "kpi" || widget.type === "pivot-table") && DATA_SOURCE === "Motul") && (
              <p className="text-xs text-gray-500">{widget.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
              <MessageCircle className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
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
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
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
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

              {/* Brand Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]/40 bg-white"
                >
                  <option>All</option>
                  <option>100%</option>
                  <option>Mineral</option>
                  <option>Other</option>
                  <option>Synthetic</option>
                  <option>Technosynthese</option>
                </select>
              </div>

              {/* SKU Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">SKU</label>
                <select
                  value={selectedSKU}
                  onChange={(e) => setSelectedSKU(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]/40 bg-white"
                >
                  <option>All</option>
                  <option>8100 X-CLEAN 5W30 PLUS (12 X 1 LTR)</option>
                  <option>8000 PERFOMAX 5W40 (20 X 1 LTR)</option>
                  <option>8000 PERFOMAX 5W30 (6 X 3 LTR)</option>
                  <option>8000 SUV 5W30 (4 X 3.5 LTR)</option>
                  <option>4100 ECOMILE 5W30 (6 X 3 LTR)</option>
                  <option>ECO-TEC PLUS 5W30 (1 X 210 LTR)</option>
                  <option>8000 PERFOMAX 5W40 (4 X 3.5 LTR)</option>
                  <option>8000 PERFOMAX 5W40 (4 X 4 LTR)</option>
                  <option>8100 X - CESS 5W40 (4 X 4 LTR)</option>
                  <option>8100 X - MAX 0W40 (4 X 4 Ltr)</option>
                  <option>8100 X - CESS 5W40 - 1 LTR</option>
                  <option>8000 SUV 5W30 (4 X 5 LTR)</option>
                  <option>4100 ECOMILE 5W30 (4 X 4 LTR)</option>
                  <option>4100 ECOMILE 5W30 (4 X 3.5 LTR)</option>
                  <option>4000 PROTEC 15W40 (1 X 7 LTR)</option>
                  <option>MULTI DCTF (12 X 1 LTR)</option>
                  <option>HIGH-TORQUE DCTF 12X1L D38</option>
                  <option>AUTO COOL LONGLIFE PREMIUM (20 X 1 LTR)</option>
                  <option>8000 PERFOMAX 0W20 (20 X 500 ml) NO CPN</option>
                  <option>8000 SUV 5W30 (20 X 1 LTR) NO CPN</option>
                  <option>4100 ECOMILE 5W30 (1 X 210 LTR)</option>
                  <option>TEKMA MULTI 15W40 ( 4 X 5 LTR)</option>
                  <option>8000 PERFOMAX 0W20 (4 X 3.5 LTR)</option>
                  <option>IRIX LONG LIFE GREASE-RED GEL (4 X 3 KG)</option>
                  <option>TEKMA MEGA POWER 15W-40 (1 X 15 LTR + 500 gm)</option>
                  <option>7100 4T 10W50 (12 X 1.5 LTR) IND</option>
                  <option>4100 ECOFLEET 5W30 (4 X 4.5 LTR)</option>
                  <option>4000 PROTEC 10W30 (6 X 3 LTR)</option>
                  <option>C1 CHAIN CLEAN - (20 X 150 ML) IND</option>
                  <option>C2 CHAIN LUBE ROAD - (20 X 150 ML) IND</option>
                  <option>CHAIN CLEAN - (12 X 400 ML) IND</option>
                  <option>CHAIN LUBE ROAD - (12 X 400 ML) IND</option>
                  <option>C1-C2 CHAIN MAINTENANCE KIT - (10 X 300 ML)</option>
                  <option>ENGINE FLUSH ( 12 X 250 ML)</option>
                  <option>PETROL SYSTEM CLEAN PLUS (24 x 50 ML)</option>
                  <option>ENGINE FLUSH ( 24 X 50 ML)</option>
                  <option>LEATHER CLEAN & SHINE (48 X 100 ML)</option>
                  <option>E5 SHINE & GO (12 X 250 ML)</option>
                  <option>M2 HELMET INTERIOR CLEAN (48 X 100 ML)</option>
                  <option>M1 HELMET & VISOR CLEAN (48 X 100 ML)</option>
                  <option>3100 GOLD 4T 15W50 SN (6 X 2.5 LTR) PROMO_MRP OFF</option>
                  <option>GEAR MEGA 80W90 (20 X 1 LTR) - NO CPN</option>
                  <option>GEAR MEGA UTTO (4 X 5 LTR) - PROMO</option>
                  <option>8000 PERFOMAX 5W30 (4 X 3.5 + 0.5 LTR) COMBI</option>
                  <option>3100 GOLD 4T 20W50 SN (20 X 1.2 LTR) PROMO_MRP OFF</option>
                  <option>RUN 4T 20W40 (20 X 1 LTR)</option>
                  <option>3000 4T PLUS 20W40 SN (20 X 900 ML ) PROMO</option>
                  <option>3000 4T PLUS 15W50 SN (6 X 2.5 LTR) PROMO</option>
                  <option>5100 4T 10W30 (12 X 1 LTR) IND</option>
                  <option>GLASS CLEAN (12 X 500 ML)</option>
                  <option>THROTTEL BODY CLEAN (12 X 400 ML)</option>
                  <option>SCOOTER GEAR 80W90 (40 X 120 ML)</option>
                  <option>RUN 4T 20W40 (20 X 0.9 LTR)</option>
                  <option>SCOOTER LE 4T 10W30 (20 X 800 ML) - SPPR</option>
                  <option>3000 4T PLUS 10W30 SN (20 X 1 LTR) PROMO - SCH CARD</option>
                  <option>3000 4T PLUS 10W30 SN (20 X 1.2 LTR) PROMO - SCH CARD</option>
                  <option>3000 4T PLUS 15W50 SN (6 X 2.5 LTR) PROMO - SCH CARD</option>
                  <option>4100 ECOMILE 5W30 (4 X 5 LTR)</option>
                  <option>X-TEC PLUS 5W40 (4 X 3.5 LTR) - PROMO</option>
                  <option>X-TEC PLUS 5W40 (4 X 4 LTR)</option>
                  <option>8000 PERFOMAX 5W30 (4 X 3.5 LTR)</option>
                  <option>4100 ECOMILE 5W30 (1 X 50 LTR)</option>
                  <option>SCOOTER EXPERT LE 4T 10W30 (20 X 800 ML) - PR</option>
                  <option>5100 4T 10W40 (12 X 1LTR) IND</option>
                  <option>5100 4T 15W50 (12 X 1LTR) IND</option>
                  <option>7100 4T 10W40 (12 X 1LTR) IND</option>
                  <option>7100 4T 10W50 (12 X 1 LTR) IND</option>
                  <option>7100 4T 20W50 (12 X 1.25 LTR) IND</option>
                  <option>7100 4T 20W50 (12 X 1.5 LTR) IND</option>
                  <option>7100 4T 20W50 (12 X 1LTR) IND</option>
                  <option>SCOOTER EXPERT LE 4T 5W30 (20 X 600 ML)</option>
                  <option>3100 GOLD 4T 10W40 SN (20 X 1 LTR) PROMO_MRP OFF</option>
                  <option>3000 4T PLUS 20W40 SN (20 X 900 ML ) PROMO - SCH CARD</option>
                  <option>3000 4T PLUS 10W30 SN (1 X 50 LTR)</option>
                  <option>3100 GOLD 4T 20W50 SN (20 X 1 LTR) PROMO_MRP OFF</option>
                  <option>THROTTLE BODY CLEAN (48 X 100ML) - NO CPN</option>
                  <option>EZ LUBE - (60 X 50 ML)</option>
                  <option>3000 4T PLUS 10W30 SN (20 X 0.9 LTR) PROMO</option>
                  <option>3100 GOLD 4T 10W30 SL (20 X 900 ML) PROMO</option>
                  <option>SCOOTER POWER LE 4T 5W40 ( 20 X 800ml)</option>
                  <option>3100 GOLD 4T 10W30 SN (20 X 900 ML) PROMO_MRP OFF</option>
                  <option>3000 4T PLUS 10W30 SN (20 X 1.2 LTR) PROMO</option>
                  <option>3100 GOLD 4T 10W30 SL (20 X 1 LTR) PROMO</option>
                  <option>CNG EXPERT 15W50 SN (20 X1 LTR)</option>
                  <option>CNGPP 20W50 SN (10 X1 LTR) - POUCH - BAJAJ RE 83020435</option>
                  <option>SCOOTER LE 4T 10W30 (20 X 800 ML) - GEAR COMBI</option>
                  <option>3000 4T PLUS 10W30 SN (20 X 0.9 LTR) PROMO - SCH CARD</option>
                  <option>GEAR MEGA 80W90 (4 X 5 LTR)</option>
                  <option>3000 4T PLUS 10W30 SN (20 X 1 LTR) PROMO</option>
                  <option>PETROL SYSTEM CLEAN PLUS (12 x 200 ML)</option>
                  <option>3000 4T PLUS 20W40 SN (20 X 1 LTR) PROMO - SCH CARD</option>
                  <option>INUGEL EXPERT (20 X 1 LTR)</option>
                  <option>EZ LUBE - (12 X 400 ML)</option>
                  <option>RUN 4T 20W50 (20 X 1 LTR)</option>
                  <option>300V 4T 10W40 1 LTR</option>
                  <option>RAT REPELLENT (48 X 200 ML)</option>
                  <option>TEKMA MULTI 15W40 ( 6 X 3 LTR)</option>
                  <option>MOTOMIX 2T 0.5 LTR</option>
                  <option>8000 PERFOMAX 5W40 (1 X 50 LTR)</option>
                  <option>IRIX LONG LIFE GREASE-RED GEL (20 X 500 GMS)</option>
                  <option>GEAR MEGA 80W90 (6 X 2.5 LTR)</option>
                  <option>4000 PROTEC 20W50 (6 X 3 LTR) NO CPN</option>
                  <option>GEAR MEGA 85W140 (1 X 12 LTR)</option>
                  <option>BRAKE CLEAN - (12 X 400 ML)</option>
                  <option>TEKMA MULTI 15W40 ( 1 X 7.5 LTR)</option>
                  <option>3000 4T PLUS 15W50 SN (1 X 50 LTR)</option>
                  <option>3000 4T PLUS 10W40 SN (20 X 1 LTR) PROMO</option>
                  <option>3100 GOLD 4T 15W50 (12 X 1.7 LTR)_MRP OFF</option>
                  <option>3000 4T PLUS 20W40 SN (1 X 50 LTR)</option>
                  <option>3000 4T PLUS 10W30 SN (1 X 210 LTR)</option>
                  <option>FORK OIL EXPERT (40 X 0.175 LTR)</option>
                  <option>7100 4T 10W30 (12 X 1 LTR) IND</option>
                  <option>4000 PROTEC 15W40 (20 X 1 LTR) NO CPN</option>
                  <option>DIESEL SYSTEM CLEAN PLUS (12 x 200 ML)</option>
                  <option>300V 4T 15W50 FL 1 LTR</option>
                  <option>TEKMA MEGA POWER 15W-40 (1 X 11 LTR)</option>
                  <option>TEKMA MEGA FLEET ULD 15W40 CK-4 - (1 X 15 LTR + 500 gm)</option>
                  <option>3000 4T PLUS 15W50 SN (20 X 1 LTR) PROMO - SCH CARD</option>
                  <option>3000 4T PLUS 15W50 SN (1 X 210 LTR)</option>
                  <option>3000 4T PLUS 20W40 SN (20 X 1 LTR) PROMO</option>
                  <option>3100 GOLD 4T 10W30 SN (20 X 1 LTR) PROMO_MRP OFF</option>
                  <option>AGRI PLUS 15W40 (1 X 7.5 LTR)</option>
                  <option>TEKMA MULTI 15W40 ( 6 X 3 LTR) - NP</option>
                  <option>CNGPP 20W50 SN (6 X 2.1 LTR) - POUCH - BAJAJ RE 83020564</option>
                  <option>3100 GOLD 4T 15W50 SN (6 X 2.5 LTR) PROMO</option>
                  <option>3000 4T PLUS 10W40 SN (20 X 1 LTR) PROMO - SCH CARD</option>
                  <option>3100 GOLD 4T 10W40 SN (20 X 1 LTR) PROMO</option>
                  <option>7100 4T 10W50 (12 X 1.5 + 0.1 LTR) COMBI</option>
                  <option>AGRI TURBO 20W40 (1 X 8.5 LTR)</option>
                  <option>DOT 4 BRAKE FLUID (40 X 100 ML)</option>
                  <option>MOTYLGEAR 75W90 (20 X 1 LTR) IND</option>
                  <option>TEKMA MEGA TURBO 15W-40 (1 X 6 LTR)</option>
                  <option>AGRI TURBO 20W40 (1 X 7.5 LTR)</option>
                  <option>AGRI SUPER 15W40 (1 X 10 LTR)</option>
                  <option>AGRI TURBO 15W40 (1 X 7.5 LTR)</option>
                  <option>AGRI TURBO 20W40 (1 X 10 LTR)</option>
                  <option>3000 4T PLUS 20W40 SN (1 X 210 LTR)</option>
                  <option>TEKMA MEGA TURBO 15W-40 (6 X 3 LTR)</option>
                  <option>4000 PROTEC 15W40 (4 X 3.5 LTR)</option>
                  <option>CNGPP 20W50 (20x0.5 LTR) - BAJAJ RE</option>
                  <option>CNGPP 20W50 SN (20 X 0.5 LTR) - BAJAJ RE</option>
                  <option>MOTYLGEAR 75W90 (6 X 2.5 LTR) IND</option>
                  <option>TEKMA MEGA POWER 15W-40 (1 X 15 LTR)</option>
                  <option>4100 ECOMILE 5W30 (1 X 7 LTR)</option>
                  <option>TEKMA MEGA POWER 15W-40 (1 X 18 LTR)</option>
                  <option>IRIX MULTI SERVICE AP3 (60 X 200 GMS)</option>
                  <option>IRIX MULTI SERVICE AP3 (60 X 100 GMS)</option>
                  <option>SCOOTER LE 4T 10W40 (20 X 800 ML) - SPPR</option>
                  <option>7100 4T 15W50 (6 X 2.5 L)</option>
                  <option>3100 GOLD 4T 20W50 SN (20 X 1 LTR) PROMO</option>
                  <option>7100 4T 20W50 (12 X 1.5 + 0.1 LTR) COMBI</option>
                  <option>3000 4T PLUS 15W50 SN (20 X 1 LTR) PROMO</option>
                  <option>MOTOCOOL EXPERT 1 LTR</option>
                  <option>TEKMA MEGA POWER 15W-40 (1 X 50 LTR)</option>
                  <option>7100 4T 10W30 (12 X 1 + 0.1 LTR) COMBI</option>
                  <option>GEAR MEGA UTTO (1 X 20 LTR) - PROMO</option>
                  <option>TEKMA MEGA POWER 15W-40 (1 X 7.5 LTR)</option>
                  <option>TEKMA MULTI 15W40 ( 1 X 10 LTR)</option>
                  <option>CHAIN CARE KIT (24 X 300 ML) - NO CPN</option>
                  <option>SYSTEM KEEP CLEAN - GASOLINE - (12 X 300 ML)</option>
                  <option>DASHBOARD AND CAR SHINE (12 X 500 ML)</option>
                  <option>3000 4T PLUS 20W40 SN (20 X 1.2 LTR) PROMO - SCH CARD</option>
                  <option>3100 GOLD 4T 20W50 SN (20 X 1.2 LTR) PROMO</option>
                  <option>FRONT FORK OIL 350 ML</option>
                  <option>CAR & BIKE SHAMPOO (12 X 1 LTR)</option>
                  <option>MULTI CVTF 1 LTR</option>
                  <option>C5 CHAIN PASTE (12 X 150 ML)</option>
                  <option>EZ LUBE (36 X 75 ML)</option>
                  <option>TEKMA MEGA FLEET LD 15W40 - ( 1 X 11 LTR + 500 gm)</option>
                  <option>4100 ECOMILE 5W30 (20 X 1 LTR) NO CPN</option>
                  <option>IRIX LONG LIFE GREASE-RED GEL (1 X 5 KG)</option>
                  <option>GEAR MEGA 80W90 (1 X 7 LTR)</option>
                  <option>3000 4T PLUS 15W50 SN (6 X 2.5 + 0.075 LTR) COMBI</option>
                  <option>RUN 4T 20W50 (1 X 50 LTR)</option>
                  <option>TEKMA MEGA POWER 15W-40 (1 X 11 LTR + 500 gm)</option>
                  <option>TEKMA MEGA POWER 15W-40 (1 X 18 LTR + 500 gm)</option>
                  <option>ATF VI ( 12 X 1 LTR)</option>
                  <option>AGRI SUPER 15W40 (1 X 8.5 LTR)</option>
                  <option>TEKMA MEGA FLEET LD 15W40 - 7.5 LTR</option>
                  <option>8000 PERFOMAX 5W40 (4 X 4 + 0.5 LTR) COMBI</option>
                  <option>AGRI SUPER 15W40 (1 X 7.5 LTR)</option>
                  <option>7100 4T 10W50 (12 X 1 + 0.1 LTR) COMBI</option>
                  <option>FORK OIL GOLD 10W (20 X 500 ml)</option>
                  <option>GEAR MEGA UTTO (20 X 1 LTR)</option>
                  <option>IRIX MULTI SERVICE AP3 (20 X 500 GMS)</option>
                  <option>Tekma Optima Fleet Plus 15W40 (1 X 7 LTR)</option>
                  <option>TEKMA MEGA TURBO 15W-40 (12 X 2 LTR)</option>
                  <option>TEKMA MEGA POWER 15W-40 (20 X 1 LTR)</option>
                  <option>TEKMA MULTI 15W40 ( 1 X 15 LTR)</option>
                  <option>3000 4T PLUS 20W40 SN (20 X 1.2 LTR) PROMO</option>
                  <option>4000 PROTEC 15W40 (4 X 5 LTR)</option>
                  <option>TEKMA TURBO 15W40 CH-4 (6 X 3 LTR)</option>
                  <option>4000 PROTEC 20W50 (20 X 1 LTR) NO CPN</option>
                  <option>3100 GOLD 4T 15W50 SN (6 X 2.5 + 0.1 LTR) COMBI</option>
                  <option>4000 PROTEC 10W30 (1 X 210 LTR)</option>
                  <option>AGRI PLUS 20W40 (1 X 7.5 LTR)</option>
                  <option>ELECTRICAL CONTACT CLEANER (12 X 400 ml) - NO CPN</option>
                  <option>TEKMA MULTI 15W40 ( 20 X 1 LTR)</option>
                  <option>TYRE REPAIR - 300 ML</option>
                  <option>TEKMA CNG 15W40 CF-4 - (6 X 3 LTR)</option>
                  <option>TEKMA MULTI 15W40 ( 1 X 210 LTR)</option>
                  <option>C1 CHAIN CLEAN - (12 X 150 ML)</option>
                  <option>Tekma Optima Fleet 15W40 (1 X 11 LTR)</option>
                  <option>TEKMA OPTIMA FLEET 15W40 (1 X 15 LTR + 500 gm)</option>
                  <option>TEKMA MEGA TURBO 15W-40 (20 X 1 LTR)</option>
                  <option>DS AGRI TURBO 15W40 CH-4 (1 X 7.5 LTR)</option>
                  <option>4100 POWER 10W40 (1 X 210 LTR)</option>
                  <option>3100 Gold 4T 15W50 (12 X 1.7 LTR)</option>
                  <option>ECO-TEC PLUS 5W30 (6 X 3 LTR)</option>
                  <option>4000 PROTEC 10W30 (4 X 4 LTR)</option>
                  <option>4000 PROTEC 10W30 (4 X 3.5 LTR)</option>
                  <option>7100 4T 10W40 (12 X 1LTR) IND - CONSUMER PRO</option>
                  <option>TEKMA MULTI 15W40 ( 1 X 50 LTR)</option>
                  <option>5100 4T 10W30 (12 X 1 + 0.1 LTR) COMBI</option>
                  <option>TEKMA MULTI 20W40 ( 20 X 1 LTR)</option>
                  <option>AGRI PLUS 15W40 (20 X 1 LTR)</option>
                  <option>RUN 4T 20W40 (1 X 50 LTR)</option>
                  <option>7100 4T 20W50 (12 X 1+ 0.1 LTR) COMBI</option>
                  <option>GEAR MEGA 85W140 (20 X 1 LTR) - NO CPN</option>
                  <option>TEKMA TURBO 15W40 CH-4 (1 X 10 LTR)</option>
                  <option>300V COMPETITION 5W40 10X2L</option>
                  <option>IRIX LONG LIFE GREASE-RED GEL (12 X 1 KG)</option>
                  <option>TEKMA MEGA FLEET ULD 15W40 CK-4 - 210 LTR (M)</option>
                  <option>SYSTEM KEEP CLEAN - DIESEL - (12 X 300 ML)</option>
                  <option>IRIX LONG LIFE GREASE-RED GEL (1 X 7 KG)</option>
                  <option>SMART SHINE SPONGE (160 X 1 EA)</option>
                  <option>3000 4T PLUS 10W40 SN (1 X 210 LTR)</option>
                  <option>300V POWER 5W30 ( 10 X 2 LTR)</option>
                  <option>8000 PERFOMAX 5W40 (1 X 210 LTR)</option>
                  <option>TEKMA MEGA TURBO 15W-40 (1 X 10 LTR)</option>
                  <option>4000 PROTEC 20W50 (1 X 210 LTR)</option>
                  <option>3100 GOLD 4T 5W30 (20 X 900 ML)</option>
                  <option>7100 4T 10W40 (12 X 1 + 0.1 LTR) COMBI</option>
                  <option>CHAIN LUBE ROAD - 400 ML</option>
                  <option>C1-C2 CHAIN MAINTENANCE KIT - (6 X 800 ML)</option>
                  <option>TEKMA TURBO 15W40 CH-4 (1 X 6 LTR)</option>
                  <option>IRIX LONG LIFE GREASE-RED GEL (6 X 2 KG)</option>
                  <option>FORK OIL FL L/M 7.5W (6 X 1 LTR)</option>
                  <option>ALL GEAR EP 80W90 (6 X 2.5 LTR)</option>
                  <option>TEKMA OPTIMA FLEET PLUS 15W40 (1 X 11 LTR + 500 gm)</option>
                  <option>GEAR MEGA UTTO (1 X 50 LTR)</option>
                  <option>TEKMA TURBO 15W40 CH-4 (20 X 500 ML)</option>
                  <option>TEKMA TURBO 15W40 CH-4 (1 X 15 LTR)</option>
                  <option>4100 ECOMILE 5W30 (4 X 4.5 LTR)</option>
                  <option>800 2T FL ROAD RACING - 1 LTR</option>
                  <option>8000 PERFOMAX 5W30 (20 X 500 ml) NO CPN</option>
                  <option>4100 POWER 10W40 (4 X 3.5 LTR) PROMO</option>
                  <option>SCOOTER EXPERT LE 4T 5W30 (20 X 800 ML)</option>
                  <option>TEKMA MULTI 20W40 ( 1 X 10 LTR)</option>
                  <option>HD 85W140 5 LTR</option>
                  <option>GEAR MEGA 85W140 (4 X 5 LTR)</option>
                  <option>TEKMA MEGA FLEET ULD 15W40 CK-4 - (6 X 3 LTR)</option>
                  <option>5100 4T 15W50 (12 X 1.5 LTR) IND</option>
                  <option>8100 X-CLEAN GEN2 5W40 (4 X 5 LTR)</option>
                  <option>E5 SHINE & GO (12 X 400ML)</option>
                  <option>5100 4T 15W50 (12 X 1 + 0.1 LTR) COMBI</option>
                  <option>8000 PERFOMAX 5W40 (4 X 3.5 + 0.5 LTR) COMBI</option>
                  <option>TRH 97 UTTO (4 X 5 LTR)</option>
                  <option>ALL GEAR EP 80W90 (20 X 1 LTR)</option>
                  <option>CNG EXPERT 15W50 SN (1 X 210 LTR)</option>
                  <option>5100 4T 10W40 (12 X 1 + 0.1 LTR) COMBI</option>
                  <option>8100 X-CLEAN GEN2 5W40 (4 X 4 LTR) IND</option>
                  <option>X-TEC PLUS 5W40 (12 X 1 LTR) - NP</option>
                  <option>GEAR MEGA 80W90 (1 X 20 LTR) - NO CPN</option>
                  <option>TEKMA TURBO 15W40 CH-4 (6 X 3 LTR) - MRP OFF</option>
                  <option>4000 PROTEC 15W40 (1 X 210 LTR)</option>
                  <option>4100 ECOMILE 10W40 (4 X 3.5 LTR)</option>
                  <option>ENGINE CARE KIT - ( 48 X 100 ML)</option>
                  <option>FORK OIL EXP M/H 15W 1 LTR</option>
                  <option>8100 X - MAX 0W40 (12 X 1 Ltr)</option>
                  <option>TEKMA TURBO 15W40 CH-4 (20 X 1 LTR)</option>
                  <option>Tekma Optima Fleet 15W40 (1 X 18 LTR)</option>
                  <option>300V SQUARE 4T 10W50 FL ( 12 X 1 LTR)</option>
                  <option>TEKMA MULTI 20W40 ( 1 X 7.5 LTR)</option>
                  <option>MULTI ATF 1 LTR</option>
                  <option>8100 X-CLEAN GEN2 5W40 (12 X 1 LTR)</option>
                  <option>8100 X-CLEAN GEN2 5W40 (12 X 1 LTR) IND</option>
                  <option>AGRI PLUS 20W40 (20 X 1 LTR)</option>
                  <option>SCRATCH REMOVER - ( 12 X 100 ML)</option>
                  <option>2000 MULTI POWER 20W50 (6 X 3 LTR)</option>
                  <option>SCOOTER LE 4T 10W30 (12 X [800 ml+Gr Oil 120 ml])-COMBI</option>
                  <option>8000 PERFOMAX 0W20 (6 X 3 LTR)</option>
                  <option>DAMAGE CONTAIMNATED OIL</option>
                  <option>Leather Care Kit (24 X 200 ML)</option>
                  <option>8000 SUV 5W30 (1 X 210 LTR)</option>
                  <option>ENGINE CLEAN MOTO - ( 12 X 200 ML )</option>
                  <option>GEAR 300 75W90 - 1 LTR</option>
                  <option>4100 POWER SAE 5W30 SN - (4 X 4.5 LTR)</option>
                  <option>GEAR COMPETITION 75W140 12X1L D38</option>
                  <option>ATF III (20 X 1 LTR)</option>
                  <option>RBF 660 FACTORY LINE 12X0.500L</option>
                </select>
              </div>

              {/* Outlet Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Outlet Type</label>
                <select
                  value={selectedOutletType}
                  onChange={(e) => setSelectedOutletType(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]/40 bg-white"
                >
                  <option>All</option>
                  <option>Fleet Accounts</option>
                  <option>Franchisee WS</option>
                  <option>HDDO Point</option>
                  <option>Independent Workshops (IWS)</option>
                  <option>Institutional Account</option>
                  <option>Lube Shop</option>
                  <option>MCD</option>
                  <option>Motul Garage - MCO</option>
                  <option>Motul Garage - PCMO</option>
                  <option>Motul Rural Distributor</option>
                  <option>Others</option>
                  <option>PCMO Premium Club</option>
                  <option>Spares and Accessories Shop</option>
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
                          (widget.type === 'table' || widget.type === 'pivot-table') ? 'md:col-span-2' : ''
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
