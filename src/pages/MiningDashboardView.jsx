import { useState, useEffect, Suspense } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronLeft,
  Plus,
  Share2,
  Presentation,
  MoreVertical,
  MessageSquare,
  BarChart,
  LineChart,
  PieChart,
  Table,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MainLayout } from "@/components/MainLayout";
import Chart from "react-apexcharts";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { Tooltip as ReactTooltip } from "react-tooltip";
import AddWidgetModal from "@/components/dashboard/AddWidgetModal";

// Use mining dashboard storage
const STORAGE_KEY = 'mining_dashboards';

const COLOR_RANGE = [
  "#ffedea",
  "#ffcec5",
  "#ffad9f",
  "#ff8a75",
  "#ff5533",
  "#e2492d",
  "#be3d26",
  "#9a311f",
  "#782618"
];

const CHART_COLORS = {
  bar: ['#3551F3', '#7C3AED', '#059669', '#DC2626', '#D97706'],
  pie: ['#3551F3', '#7C3AED', '#059669', '#DC2626', '#D97706'],
  line: ['#3551F3', '#7C3AED', '#059669', '#DC2626']
};

const OUTLET_DATA = {
  labels: [
    'Spares and Accessories Shop',
    'Independent Workshops (IWS)',
    'Lube Shop',
    'Motul Garage - PCMO',
    'Motul Garage - MCO',
    'Motul Rural Distributor',
    'PCMO Premium Club',
  ],
  active: [11427, 5090, 3670, 1616, 1243, 611, 551],
  inactive: [24979, 12308, 8258, 4567, 1387, 720, 944]
};

const TAXABLE_VALUE_DATA = {
  labels: [
    'Spares and Accessories Shop',
    'Lube Shop',
    'Motul Rural Distributor',
    'Independent Workshops (IWS)',
    'PCMO Premium Club',
    'Motul Garage - PCMO',
    'Motul Garage - MCO'
  ],
  values: [
    251149073.6,
    101564396.8,
    85420882.6,
    75593589.4,
    38475754.8,
    30482495.78,
    30150311.68
  ]
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="text-sm font-medium text-gray-800">
        {label}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm text-gray-600" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) + '%' : entry.value}
        </p>
      ))}
    </div>
  );
}

const getMiningDashboard = (id) => {
  try {
    const dashboardsJson = localStorage.getItem(STORAGE_KEY);
    if (!dashboardsJson) return null;
    
    const dashboards = JSON.parse(dashboardsJson);
    if (!Array.isArray(dashboards)) return null;
    
    return dashboards.find(d => d?.id === id) || null;
  } catch (error) {
    console.error('Error getting dashboard:', error);
    return null;
  }
};

const updateMiningDashboard = (id, data) => {
  try {
    if (!id || !data) return null;
    
    const dashboardsJson = localStorage.getItem(STORAGE_KEY);
    const dashboards = dashboardsJson ? JSON.parse(dashboardsJson) : [];
    
    if (!Array.isArray(dashboards)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([data]));
      return data;
    }
    
    const index = dashboards.findIndex(d => d?.id === id);
    
    if (index !== -1) {
      dashboards[index] = {
        ...dashboards[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
    } else {
      dashboards.push({
        ...data,
        updatedAt: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
    return index !== -1 ? dashboards[index] : data;
  } catch (error) {
    console.error('Error updating dashboard:', error);
    return null;
  }
};

export default function MiningDashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loadingWidgets, setLoadingWidgets] = useState({});
  const [tooltipContent, setTooltipContent] = useState("");
  const [selectedMine, setSelectedMine] = useState(null);
  const [mapPosition, setMapPosition] = useState({ coordinates: [78.9629, 22.5937], zoom: 1 });

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
    try {
      const loadedDashboard = getMiningDashboard(id);
      if (!loadedDashboard) {
        // Initialize new dashboard if it doesn't exist
        const newDashboard = {
          id,
          name: "Dashboard",
          widgets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updateMiningDashboard(id, newDashboard);
        setDashboard(newDashboard);
      } else {
        // Ensure widgets array exists
        const dashboardWithWidgets = {
          ...loadedDashboard,
          widgets: loadedDashboard.widgets || []
        };
        setDashboard(dashboardWithWidgets);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Initialize with a default dashboard if there's an error
      const defaultDashboard = {
        id,
        name: "Dashboard",
        widgets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDashboard(defaultDashboard);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handleWidgetSubmit = (widgetData) => {
    if (!dashboard) return;

    // Handle Total Taxable Value pie chart
    if (widgetData.type === 'pie' && widgetData.title === 'Total Taxable Value by Channel') {
      const totalValue = TAXABLE_VALUE_DATA.values.reduce((a, b) => a + b, 0);
      const percentages = TAXABLE_VALUE_DATA.values.map(val => (val / totalValue) * 100);

      const taxableValueConfig = {
        series: percentages,
        options: {
          chart: {
            type: 'pie',
            height: 400,
            background: 'transparent'
          },
          labels: TAXABLE_VALUE_DATA.labels,
          colors: ['#3551F3', '#DC2626', '#059669', '#7C3AED', '#D97706', '#2563EB', '#9333EA'],
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '13px',
            fontWeight: '400',
            markers: {
              width: 12,
              height: 12,
              radius: 3
            },
            itemMargin: {
              horizontal: 15
            }
          },
          dataLabels: {
            enabled: true,
            formatter: function(val) {
              return val.toFixed(2) + '%';
            },
            style: {
              fontSize: '13px',
              fontWeight: '500',
              colors: ['#ffffff']
            },
            dropShadow: {
              enabled: true,
              color: '#000000',
              top: 0,
              left: 0,
              blur: 3,
              opacity: 0.3
            }
          },
          tooltip: {
            y: {
              formatter: function(val) {
                const originalValue = TAXABLE_VALUE_DATA.values[TAXABLE_VALUE_DATA.labels.indexOf(this.w.globals.labels[this.seriesIndex])];
                return '₹' + originalValue.toLocaleString();
              }
            }
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['#ffffff']
          },
          plotOptions: {
            pie: {
              donut: {
                size: '0%'
              },
              expandOnClick: false
            }
          }
        }
      };

      const newWidget = {
        id: Math.random().toString(36).substring(7),
        type: 'pie',
        title: widgetData.title,
        chartConfig: taxableValueConfig,
        config: { chartType: 'pie' },
        position: (dashboard.widgets?.length || 0)
      };

      const updatedDashboard = {
        ...dashboard,
        widgets: [...(dashboard.widgets || []), newWidget]
      };

      setDashboard(updatedDashboard);
      updateMiningDashboard(id, updatedDashboard);
      setIsAddWidgetModalOpen(false);
      return;
    }

    // Handle other widgets
    const processedData = {
      ...widgetData,
      title: widgetData.title === "Total Outlets by Channel - Active vs Inactive" 
        ? "Outlets by Channel - Total vs Active"
        : widgetData.title,
      data: widgetData.data || { value: 0, data: [] }
    };

    const newWidget = {
      id: Math.random().toString(36).substring(7),
      ...processedData,
      position: (dashboard.widgets?.length || 0)
    };

    const updatedDashboard = {
      ...dashboard,
      widgets: [...(dashboard.widgets || []), newWidget]
    };

    setDashboard(updatedDashboard);
    updateMiningDashboard(id, updatedDashboard);
    setIsAddWidgetModalOpen(false);
  };

  const handleChatIconClick = (widget) => {
    // Extract widget type and title
    const { type, title } = widget;

    // Store the current widget's title before redirecting
    sessionStorage.setItem('chatPillTitle', title);

    // Handle Table click (not Lost Customers table)
    if (type === 'table' && !title.includes('Lost Customers')) {
      // Create widget configurations
      const newWidgets = [
        {
          id: Math.random().toString(36).substring(7),
          type: 'line',
          title: 'Monthly Sales Split',
          position: (dashboard.widgets?.length || 0)
        },
        {
          id: Math.random().toString(36).substring(7),
          type: 'table',
          title: 'Lost Customers for Glass Fibre & Hybrid Fibre',
          position: (dashboard.widgets?.length || 0) + 1
        },
        {
          id: Math.random().toString(36).substring(7),
          type: 'pie',
          title: 'Contribution to Sales for Aramid Fibre',
          position: (dashboard.widgets?.length || 0) + 2
        }
      ];

      // Create updated dashboard with all widgets
      const updatedDashboard = {
        ...dashboard,
        widgets: [...(dashboard.widgets || []), ...newWidgets]
      };

      setDashboard(updatedDashboard);
      updateMiningDashboard(id, updatedDashboard);
    }
    
    // Handle Outlet comparison chart click
    if (title && (title.toLowerCase().includes('outlet') || title.toLowerCase().includes('channel'))) {
      // Create drop size chart configuration
      const dropSizeConfig = {
        series: [{
          name: 'Average Drop Size',
          data: [49, 44, 68, 61, 54, 158, 113]
        }],
        options: {
          chart: {
            type: 'bar',
            height: 500,
            toolbar: { show: false }
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '60%',
              dataLabels: {
                position: 'top'
              }
            }
          },
          colors: ['#3551F3'],
          dataLabels: {
            enabled: true,
            formatter: function(val) {
              return val + ' L';
            },
            style: {
              fontSize: '12px',
              fontWeight: '500',
              colors: ['#000000']
            },
            offsetY: -20
          },
          xaxis: {
            categories: OUTLET_DATA.labels,
            labels: {
              style: {
                fontSize: '12px',
                fontWeight: '400'
              },
              rotate: -45,
              offsetY: 5,
              maxHeight: 150,
              trim: false
            }
          },
          yaxis: {
            labels: {
              formatter: function(val) {
                return val + ' L';
              },
              style: {
                fontSize: '12px',
                fontWeight: '400'
              }
            }
          },
          grid: {
            yaxis: {
              lines: {
                show: true
              }
            },
            xaxis: {
              lines: {
                show: false
              }
            }
          }
        }
      };

      // Inside handleChatIconClick function, update the billingConfig
      const billingConfig = {
        series: [{
          name: 'Billing Percentage',
          data: [45.8, 41.4, 44.4, 35.4, 89.6, 84.9, 58.4]
        }],
        options: {
          chart: {
            type: 'bar',
            height: 400,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            bar: {
              horizontal: true,
              columnWidth: '60%',
              dataLabels: {
                position: 'right'
              }
            }
          },
          colors: ['#D97706'],  // Changed to orange
          dataLabels: {
            enabled: false
          },
          xaxis: {
            categories: OUTLET_DATA.labels,
            labels: {
              style: {
                fontSize: '12px',
                fontWeight: '400'
              }
            },
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            }
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '12px',
                fontWeight: '400'
              },
              maxWidth: undefined,
              minHeight: undefined,
              trim: false
            }
          },
          grid: {
            xaxis: {
              lines: {
                show: true
              }
            },
            yaxis: {
              lines: {
                show: false
              }
            }
          },
          tooltip: {
            y: {
              formatter: function(val) {
                return val.toFixed(1) + '%';
              }
            }
          }
        }
      };

      // Inside handleChatIconClick function, update the taxableValueConfig
      const totalValue = TAXABLE_VALUE_DATA.values.reduce((a, b) => a + b, 0);
      const percentages = TAXABLE_VALUE_DATA.values.map(val => (val / totalValue) * 100);

      const taxableValueConfig = {
        series: percentages,
        options: {
          chart: {
            type: 'pie',
            height: 400,
            background: 'transparent'
          },
          labels: TAXABLE_VALUE_DATA.labels,
          colors: ['#3551F3', '#DC2626', '#059669', '#7C3AED', '#D97706', '#2563EB', '#9333EA'],
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '13px',
            fontWeight: '400',
            markers: {
              width: 12,
              height: 12,
              radius: 3
            },
            itemMargin: {
              horizontal: 15
            }
          },
          dataLabels: {
            enabled: true,
            formatter: function(val) {
              return val.toFixed(2) + '%';
            },
            style: {
              fontSize: '13px',
              fontWeight: '500',
              colors: ['#ffffff']
            },
            dropShadow: {
              enabled: true,
              color: '#000000',
              top: 0,
              left: 0,
              blur: 3,
              opacity: 0.3
            }
          },
          tooltip: {
            y: {
              formatter: function(val) {
                const originalValue = TAXABLE_VALUE_DATA.values[TAXABLE_VALUE_DATA.labels.indexOf(this.w.globals.labels[this.seriesIndex])];
                return '₹' + originalValue.toLocaleString();
              }
            }
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['#ffffff']
          },
          plotOptions: {
            pie: {
              donut: {
                size: '0%'
              },
              expandOnClick: false
            }
          }
        }
      };

      const newWidgets = [
        {
          id: Math.random().toString(36).substring(7),
          type: 'bar',
          title: '% of Outlets Billed by Channel',
          chartConfig: billingConfig,
          config: { chartType: 'bar' },
          position: (dashboard.widgets?.length || 0)
        },
        {
          id: Math.random().toString(36).substring(7),
          type: 'bar',
          title: 'Average Drop Size Per Order',
          chartConfig: dropSizeConfig,
          config: { chartType: 'bar' },
          position: (dashboard.widgets?.length || 0) + 1
        }
      ];

      // Create updated dashboard with outlet-related widgets
      const updatedDashboard = {
        ...dashboard,
        widgets: [...(dashboard.widgets || []), ...newWidgets]
      };

      setDashboard(updatedDashboard);
      updateMiningDashboard(id, updatedDashboard);
    }

    // Redirect to chat page
    window.location.href = '/chat/mining';
  };

  const handleDeleteWidget = (widgetId) => {
    const updatedDashboard = {
      ...dashboard,
      widgets: dashboard.widgets.filter(w => w.id !== widgetId)
    };
    updateMiningDashboard(id, updatedDashboard);
    setDashboard(updatedDashboard);
  };

  const renderWidget = (widget) => {
    if (!widget || !widget.type) return null;

    const formatValue = (value) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }).format(value);
    };

    const renderChart = () => {
      switch (widget.type) {
        case "kpi":
          let value = 0, trend = 0, formattedValue = '0';
          
          if (widget.title === "Total Production") {
            value = 2500000;  // 2.5M tons
            trend = 12.4;
            formattedValue = value.toLocaleString() + " tons";
          } else if (widget.title === "Average Grade") {
            value = 4.2;  // 4.2 g/t
            trend = 8.6;
            formattedValue = value.toFixed(2) + " g/t";
          } else if (widget.title === "Recovery Rate") {
            value = 92.5;  // 92.5%
            trend = 3.5;
            formattedValue = value.toFixed(1) + "%";
          }
          
          const displayTrend = trend || 0;
          const trendDirection = displayTrend >= 0 ? "↑" : "↓";
          const trendColor = displayTrend >= 0 ? "text-green-600" : "text-red-600";
          
          return (
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold text-gray-900">{formattedValue}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={trendColor}>{trendDirection} {Math.abs(displayTrend)}%</span>
                    <span className="text-gray-500">vs last period</span>
                  </div>
                </div>
              </div>
            </div>
          );

        case "line":
          const lineData = {
            series: [
              {
                name: "Carbon Fibre",
                data: [2.8, 2.95, 3.0, 3.2, 3.3, 3.5]
              },
              {
                name: "Aramid Fibre",
                data: [1.3, 2.0, 2.05, 2.2, 2.25, 2.5]
              },
              {
                name: "Glass Fibre",
                data: [2.1, 2.0, 1.95, 1.93, 1.96, 1.9]
              },
              {
                name: "Hybrid Fibre",
                data: [1.45, 1.2, 1.25, 0.86, 0.87, 0.85]
              }
            ],
            options: {
              chart: {
                height: 350,
                type: 'line',
                animations: { enabled: false },
                toolbar: { show: false }
              },
              stroke: {
                width: 3,
                curve: 'smooth',
                colors: ['#3551F3', '#7C3AED', '#059669', '#DC2626']
              },
              xaxis: {
                categories: [
                  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'
                ],
                labels: {
                  style: {
                    colors: '#000000'
                  }
                }
              },
              yaxis: {
                labels: {
                  style: {
                    colors: '#000000',
                    fontSize: '12px'
                  },
                  formatter: function(value) {
                    return '₹' + value.toFixed(2) + ' Cr';
                  }
                },
                title: {
                  text: 'Sales (₹ Cr)',
                  style: {
                    color: '#000000'
                  }
                }
              },
              dataLabels: {
                enabled: false
              },
              markers: {
                size: 4
              },
              colors: CHART_COLORS.line,
              legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                labels: {
                  colors: '#000000'
                }
              }
            }
          };
          
          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={lineData.options}
                  series={lineData.series}
                  type="line"
                  height={350}
                  width="100%"
                />
              </Suspense>
            </div>
          );

        case "bar":
          // If widget has chartConfig, use it directly
          if (widget.chartConfig) {
            return (
              <div className="p-4">
                <Suspense fallback={<div>Loading chart...</div>}>
                  <Chart
                    options={widget.chartConfig.options}
                    series={widget.chartConfig.series}
                    type="bar"
                    height={widget.chartConfig.options.chart.height || 450}
                    width="100%"
                  />
                </Suspense>
              </div>
            );
          }

          // Handle outlet comparison chart
          if (widget.title && (widget.title.toLowerCase().includes('outlet') || widget.title.toLowerCase().includes('channel'))) {
            const outletData = {
              series: [
                {
                  name: 'Total Outlets',
                  data: OUTLET_DATA.inactive
                },
                {
                  name: 'Active Outlets',
                  data: OUTLET_DATA.active
                }
              ],
              options: {
                chart: {
                  type: 'bar',
                  height: 550,
                  stacked: false,
                  toolbar: {
                    show: false
                  },
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  parentHeightOffset: 0
                },
                plotOptions: {
                  bar: {
                    horizontal: true,
                    barHeight: '80%',
                    rangeBarOverlap: true,
                    distributed: false
                  }
                },
                colors: ['#DC2626', '#4F46E5'],  // Red for Total, Blue for Active
                dataLabels: {
                  enabled: false
                },
                stroke: {
                  width: 0
                },
                grid: {
                  show: true,
                  xaxis: {
                    lines: {
                      show: true
                    }
                  },
                  yaxis: {
                    lines: {
                      show: false
                    }
                  },
                  padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      fontSize: '13px',
                      fontWeight: '400'
                    },
                    maxWidth: 300,
                    trim: false,
                    minHeight: 50
                  }
                },
                xaxis: {
                  categories: OUTLET_DATA.labels,
                  labels: {
                    style: {
                      fontSize: '13px',
                      fontWeight: '400'
                    }
                  },
                  axisBorder: {
                    show: false
                  },
                  axisTicks: {
                    show: false
                  }
                },
                legend: {
                  show: true,
                  position: 'bottom',
                  horizontalAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '400',
                  markers: {
                    width: 12,
                    height: 12,
                    radius: 3
                  },
                  itemMargin: {
                    horizontal: 15
                  }
                },
                tooltip: {
                  enabled: true,
                  shared: true,
                  intersect: false,
                  style: {
                    fontSize: '13px'
                  },
                  y: {
                    formatter: function(val) {
                      return val.toLocaleString() + " outlets";
                    }
                  }
                }
              }
            };
            
            return (
              <div className="p-4">
                <Suspense fallback={<div>Loading chart...</div>}>
                  <Chart
                    options={outletData.options}
                    series={outletData.series}
                    type="bar"
                    height={450}
                    width="100%"
                  />
                </Suspense>
              </div>
            );
          }

          // Original bar chart code continues here
          const barData = {
            series: [{
              name: "Production (tons)",
              data: [180000, 155000, 142000, 138000, 129000]
            }],
            options: {
              chart: {
                height: 350,
                type: 'bar',
                animations: { enabled: false },
                toolbar: { show: false }
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  distributed: true,
                  columnWidth: '60%'
                }
              },
              xaxis: {
                categories: [
                  'Mine A',
                  'Mine B',
                  'Mine C',
                  'Mine D',
                  'Mine E'
                ],
                labels: {
                  style: {
                    colors: '#000000',
                    fontSize: '12px'
                  },
                  rotate: -45,
                  rotateAlways: false,
                  trim: false
                }
              },
              yaxis: {
                labels: {
                  formatter: function(value) {
                    return (value/1000).toFixed(1) + 'k tons';
                  },
                  style: {
                    colors: '#000000'
                  }
                }
              },
              colors: CHART_COLORS.bar,
              dataLabels: {
                enabled: true,
                style: {
                  colors: ['#000000'],
                  fontSize: '12px'
                },
                formatter: function(value) {
                  return (value/1000).toFixed(1) + 'k';
                },
                offsetY: -20
              },
              grid: {
                show: true,
                borderColor: '#f1f1f1',
                strokeDashArray: 4
              }
            }
          };
          
          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={barData.options}
                  series={barData.series}
                  type="bar"
                  height={350}
                  width="100%"
                />
              </Suspense>
            </div>
          );

        case "pie":
          // If widget has chartConfig, use it directly
          if (widget.chartConfig) {
            return (
              <div className="p-4">
                <Suspense fallback={<div>Loading chart...</div>}>
                  <Chart
                    options={widget.chartConfig.options}
                    series={widget.chartConfig.series}
                    type="pie"
                    height={widget.chartConfig.options.chart.height || 400}
                    width="100%"
                  />
                </Suspense>
              </div>
            );
          }

          // Default pie chart for other cases
          const pieData = {
            series: [27.63, 23.68, 19.74, 15.79, 13.16],
            options: {
              chart: {
                type: 'pie',
                animations: { enabled: false },
                toolbar: { show: false },
                background: '#ffffff'
              },
              labels: [
                'Kavita Mehta',
                'Mohit Nair',
                'Megha Rao',
                'Ankit Sharma',
                'Puneet Sinha'
              ],
              legend: {
                position: 'bottom',
                fontSize: '14px',
                fontWeight: 500,
                labels: {
                  colors: '#000000'
                }
              },
              colors: CHART_COLORS.pie,
              dataLabels: {
                enabled: true,
                formatter: function(val) {
                  return val.toFixed(2) + '%';
                },
                style: {
                  fontSize: '14px',
                  fontWeight: 500,
                  colors: ['#000000']
                }
              },
              tooltip: {
                style: {
                  fontSize: '14px'
                },
                y: {
                  formatter: function(val) {
                    return val.toFixed(2) + '%';
                  }
                }
              }
            }
          };
          
          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={pieData.options}
                  series={pieData.series}
                  type="pie"
                  height={350}
                  width="100%"
                />
              </Suspense>
            </div>
          );

        case "table":
          // If the widget title includes "Leaderboard", render the sales leaderboard table
          if (widget.title && widget.title.includes("Leaderboard")) {
            const leaderboardData = [
              { 
                rank: 1,
                name: "Kavita Mehta",
                sales: 37.4
              },
              { 
                rank: 2,
                name: "Mohit Nair",
                sales: 35
              },
              { 
                rank: 3,
                name: "Megha Rao",
                sales: 32.3
              },
              { 
                rank: 4,
                name: "Ankit Sharma",
                sales: 28.5
              },
              { 
                rank: 5,
                name: "Puneet Sinha",
                sales: 26
              }
            ];
            
            return (
              <div className="p-4 overflow-auto h-[350px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KAM</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Q1 Sales</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboardData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold ${
                            row.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                            row.rank === 2 ? 'bg-gray-100 text-gray-800' :
                            row.rank === 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {row.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹ {row.sales.toFixed(1)} Cr</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan="2">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ₹ {leaderboardData.reduce((sum, row) => sum + row.sales, 0).toFixed(1)} Cr
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          }

          // If the widget title includes "Lost" and "Customers", render the lost customers table
          if (widget.title && widget.title.includes("Lost") && widget.title.includes("Customers")) {
            const lostCustomersData = [
              { 
                clientName: "Tata Composites",
                fibreType: "Glass Fibre",
                lySales: 1.39,
                lyVolume: 18.4
              },
              { 
                clientName: "Reliance Fibres",
                fibreType: "Glass Fibre",
                lySales: 1.09,
                lyVolume: 13.0
              },
              { 
                clientName: "Bharat Textiles",
                fibreType: "Glass Fibre",
                lySales: 1.04,
                lyVolume: 8.8
              },
              { 
                clientName: "Aditya Polymers",
                fibreType: "Hybrid Fibre",
                lySales: 0.99,
                lyVolume: 15.8
              },
              { 
                clientName: "Larsen Composites",
                fibreType: "Glass Fibre",
                lySales: 1.39,
                lyVolume: 14.5
              }
            ];
            
            return (
              <div className="p-4 overflow-auto h-[350px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fibre Type</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LY Sales (₹ Cr)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LY Volume (tonnes)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lostCustomersData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.clientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            row.fibreType === 'Glass Fibre' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {row.fibreType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹ {row.lySales.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.lyVolume.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ₹ {lostCustomersData.reduce((sum, row) => sum + row.lySales, 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {lostCustomersData.reduce((sum, row) => sum + row.lyVolume, 0).toFixed(1)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          }

          // Original table case for other tables
          const tableData = [
            { 
              type: "Carbon Fibre",
              sales: "3.5 Cr",
              percentage: "40%",
              growth: "6%"
            },
            { 
              type: "Aramid Fibre",
              sales: "2.5 Cr",
              percentage: "28%",
              growth: "10%"
            },
            { 
              type: "Glass Fibre",
              sales: "1.9 Cr",
              percentage: "22%",
              growth: "-3%"
            },
            { 
              type: "Hybrid Fibre",
              sales: "0.85 Cr",
              percentage: "10%",
              growth: "-1%"
            }
          ];
          
          return (
            <div className="p-4 overflow-auto h-[350px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fibre Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales ₹ Cr</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MoM Growth</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹ {row.sales}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.percentage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          parseFloat(row.growth) >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {row.growth}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        case "outlet_comparison":
          const outletData = {
            series: [
              {
                name: 'Active Outlets',
                data: OUTLET_DATA.active
              },
              {
                name: 'Inactive Outlets',
                data: OUTLET_DATA.inactive
              }
            ],
            options: {
              chart: {
                type: 'bar',
                height: 450,
                stacked: false,
                toolbar: {
                  show: true,
                  tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                  }
                }
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                  dataLabels: {
                    position: 'top',
                  },
                }
              },
              colors: ['#3551F3', '#DC2626'],
              dataLabels: {
                enabled: true,
                formatter: function(val) {
                  return val.toLocaleString();
                },
                style: {
                  fontSize: '12px',
                }
              },
              stroke: {
                width: 1,
                colors: ['#fff']
              },
              grid: {
                show: true,
                xaxis: {
                  lines: {
                    show: false
                  }
                },
                yaxis: {
                  lines: {
                    show: false
                  }
                }
              },
              yaxis: {
                labels: {
                  style: {
                    colors: '#000000',
                    fontSize: '12px'
                  }
                }
              },
              xaxis: {
                categories: OUTLET_DATA.labels,
                labels: {
                  style: {
                    colors: '#000000',
                    fontSize: '12px'
                  },
                  formatter: function(val) {
                    return val.toLocaleString();
                  }
                }
              },
              legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetY: 10
              },
              tooltip: {
                shared: true,
                intersect: false,
                y: {
                  formatter: function(val) {
                    return val.toLocaleString() + " outlets";
                  }
                }
              }
            }
          };
          
          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={outletData.options}
                  series={outletData.series}
                  type="bar"
                  height={450}
                  width="100%"
                />
              </Suspense>
            </div>
          );

        default:
          return <div className="p-6 text-center text-gray-500">No data available</div>;
      }
    };

    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{widget.title}</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => handleChatIconClick(widget)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="flex items-center">
                    Edit
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteWidget(widget.id)} className="text-red-600">
                  <span className="flex items-center">
                    Delete
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {renderChart()}
      </div>
    );
  };

  if (isLoading) {
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

  if (!dashboard) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="text-red-500">Error loading dashboard</div>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#3551F3] hover:bg-[#2B41D9] text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/mining/dashboard" className="text-gray-400 hover:text-gray-600">
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
              onClick={() => setIsPresentationMode(true)}
              disabled={!dashboard.widgets?.length}
            >
              <Presentation className="h-4 w-4" />
              Present
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
          <div className="bg-white rounded-2xl border border-gray-200 p-16">
            <div className="max-w-md mx-auto text-center">
              <div className="h-12 w-12 rounded-lg bg-[#3551F3]/10 flex items-center justify-center mb-6 mx-auto">
                <LayoutDashboard className="h-6 w-6 text-[#3551F3]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No widgets yet</h2>
              <p className="text-gray-500 mb-8">
                Start building your mining dashboard by adding widgets. You can add various types of visualizations to track your metrics.
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

        {/* Dashboard Content */}
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

      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        onClose={setIsAddWidgetModalOpen}
        onSubmit={handleWidgetSubmit}
        dashboardType="mining"
        initialData={null}
      />
    </MainLayout>
  );
} 