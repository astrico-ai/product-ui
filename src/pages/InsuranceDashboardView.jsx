import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, ChevronLeft, ChevronRight, Presentation, LayoutDashboard, MessageSquare, Share2 } from "lucide-react";
import AddWidgetModal from "@/components/dashboard/AddWidgetModal";
import { MainLayout } from "@/components/MainLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Line, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie, 
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { format } from "date-fns";
import ReactDOMServer from "react-dom/server";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { districtData, findDistrictByCode, INDIA_TOPO_JSON, COLOR_RANGE } from "@/pages/IndiaMapDemo";

// Lazy load ApexCharts
const Chart = lazy(() => import('react-apexcharts'));

// Define color schemes at the top of the component
const CHART_COLORS = {
  bar: ['#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE'], // Blue theme
  line: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'], // Purple theme
  pie: ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5'], // Orange theme
  scatter: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'] // Green theme
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

// Use insurance dashboard storage
const STORAGE_KEY = 'insurance_dashboards';

const getInsuranceDashboard = (id) => {
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

const updateInsuranceDashboard = (id, data) => {
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

export default function InsuranceDashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loadingWidgets, setLoadingWidgets] = useState({});
  const [tooltipContent, setTooltipContent] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
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
      const loadedDashboard = getInsuranceDashboard(id);
      if (!loadedDashboard) {
        // Initialize new dashboard if it doesn't exist
        const newDashboard = {
          id,
          name: "New Dashboard",
          widgets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updateInsuranceDashboard(id, newDashboard);
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
        name: "New Dashboard",
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

    // Ensure the data structure is correct
    const processedData = {
      ...widgetData,
      data: widgetData.data || { value: 0, data: [] }  // Provide default values
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

    // Update local state
    setDashboard(updatedDashboard);

    // Save to storage
    updateInsuranceDashboard(id, updatedDashboard);
    
    // Close modal
    setIsAddWidgetModalOpen(false);
  };

  const handleDeleteWidget = (widgetId) => {
    const updatedDashboard = {
      ...dashboard,
      widgets: dashboard.widgets.filter(w => w.id !== widgetId)
    };
    updateInsuranceDashboard(id, updatedDashboard);
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
          
          if (widget.title === "Total Policies Sold") {
            value = 2347;  // Between 1000-3000 as requested
            trend = 10.4;
            formattedValue = value.toLocaleString();
          } else if (widget.title === "Total Premium Collected") {
            value = 28500000;  // 2.85 Cr (between 2-3 Cr)
            trend = 11.6;
            formattedValue = "₹" + (value / 10000000).toFixed(2) + " Cr";  // Format as Crores
          } else if (widget.title === "Average Premium") {
            value = 42500;  // Between 35000-50000 as requested
            trend = 8.5;
            formattedValue = "₹" + value.toLocaleString();  // Format with rupee symbol
          }
          
          const displayTrend = trend || 0;
          const trendDirection = displayTrend >= 0 ? "↑" : "↓";
          const trendColor = displayTrend >= 0 ? "text-green-600" : "text-red-600";
          
          return (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {formattedValue}
                </div>
                <div className={cn(
                  "text-sm mt-2 flex items-center justify-center gap-1",
                  trendColor
                )}>
                  {trendDirection} {Math.abs(displayTrend).toFixed(1)}% vs last month
                </div>
              </div>
            </div>
          );

        case "scatter":
          const scatterData = {
            series: [{
              name: "Sample Data",
              data: [
                { x: 10, y: 41 }, { x: 20, y: 30 }, { x: 30, y: 45 }, 
                { x: 40, y: 35 }, { x: 50, y: 55 }, { x: 60, y: 48 }
              ]
            }],
            options: {
              chart: {
                height: 350,
                type: 'scatter',
                animations: { enabled: false },
                toolbar: { show: false }
              },
              tooltip: { enabled: true },
              xaxis: {
                type: 'numeric',
                min: 0,
                max: 70,
                tickAmount: 7
              },
              yaxis: {
                min: 0,
                max: 60,
                tickAmount: 6
              },
              markers: {
                size: 8,
                strokeColors: '#fff',
                strokeWidth: 2
              },
              colors: CHART_COLORS.scatter
            }
          };

          return (
            <div className="p-4">
              <Suspense fallback={<div>Loading chart...</div>}>
                <Chart
                  options={scatterData.options}
                  series={scatterData.series}
                  type="scatter"
                  height={350}
                  width="100%"
                />
              </Suspense>
            </div>
          );

        case "line":
          const lineData = {
            series: [
              {
                name: "Andheri",
                data: [18.2, 19.1, 17.8, 19.5, 18.9, 20.0]
              },
              {
                name: "Bandra",
                data: [12.5, 13.2, 14.5, 15.1, 15.8, 16.2]
              },
              {
                name: "Fort",
                data: [15.8, 16.4, 15.9, 17.2, 16.8, 18.1]
              },
              {
                name: "Borivali",
                data: [8.7, 9.3, 10.2, 11.4, 12.1, 12.8]
              },
              {
                name: "Ghatkopar",
                data: [7.2, 8.1, 8.9, 9.8, 10.5, 11.2]
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
                colors: ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706']
              },
              xaxis: {
                categories: [
                  'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'
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
                    colors: '#000000'
                  },
                  formatter: function(value) {
                    return value.toFixed(1) + '%';
                  }
                },
                title: {
                  text: 'Conversion Rate (%)',
                  style: {
                    color: '#000000'
                  }
                }
              },
              dataLabels: {
                enabled: false
              },
              markers: {
                size: 0
              },
              colors: ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706'],
              legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                labels: {
                  colors: '#000000'
                }
              },
              tooltip: {
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                  return ReactDOMServer.renderToString(
                    CustomTooltip({
                      active: true,
                      payload: series.map((s, i) => ({
                        name: w.globals.seriesNames[i],
                        value: s[dataPointIndex],
                        color: w.globals.colors[i]
                      })),
                      label: w.globals.categoryLabels[dataPointIndex]
                    })
                  );
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
          const barData = {
            series: [{
              name: "Premium Collected",
              data: [1800000, 1550000, 1420000, 1380000, 1290000]
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
                  'Andheri',
                  'Bandra',
                  'Fort',
                  'Borivali',
                  'Ghatkopar'
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
                min: 0,
                max: 2000000,
                tickAmount: 5,
                labels: {
                  formatter: function(value) {
                    return '₹' + (value/100000).toFixed(1) + 'L';
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
                  return '₹' + (value/100000).toFixed(1) + 'L';
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
          const pieData = {
            series: [38, 32, 18, 8, 4],
            options: {
              chart: {
                type: 'pie',
                animations: { enabled: false },
                toolbar: { show: false },
                background: '#ffffff'
              },
              labels: [
                'Branch Walk-ins',
                'Relationship Managers',
                'Digital Banking',
                'Contact Center',
                'Others'
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
                  return val.toFixed(0) + '%';
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
                    return val + '%';
                  }
                }
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 320
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }],
              plotOptions: {
                pie: {
                  expandOnClick: false,
                  donut: {
                    size: '0%'
                  }
                }
              },
              stroke: {
                width: 2,
                colors: ['#fff']
              }
            }
          };
          
          return (
            <div className="p-4 h-full">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading chart...</div>
                </div>
              }>
                <Chart
                  options={pieData.options}
                  series={pieData.series}
                  type="pie"
                  height={isPresentationMode ? 500 : 350}
                  width="100%"
                />
              </Suspense>
            </div>
          );

        case "table":
          const tableData = [
            { 
              branch: "Mumbai - Andheri",
              policies: 432,
              premium: "₹18,00,000",
              conversion: "21%"
            },
            { 
              branch: "Mumbai - Bandra",
              policies: 389,
              premium: "₹15,50,000",
              conversion: "18%"
            },
            { 
              branch: "Mumbai - Fort",
              policies: 355,
              premium: "₹14,20,000",
              conversion: "20%"
            },
            { 
              branch: "Mumbai - Borivali",
              policies: 310,
              premium: "₹13,80,000",
              conversion: "17%"
            },
            { 
              branch: "Mumbai - Ghatkopar",
              policies: 299,
              premium: "₹12,90,000",
              conversion: "16%"
            }
          ];
          
          return (
            <div className="p-4 overflow-auto h-[350px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policies Sold</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium Collected</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.branch}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.policies.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.premium}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          parseInt(row.conversion) >= 20 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {row.conversion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        case "map":
          const colorScale = scaleQuantile()
            .domain(districtData.map(d => d.value))
            .range(COLOR_RANGE);

          const getData = (districtCode) => {
            const district = findDistrictByCode(districtCode);
            return district ? district.value : 0;
          };

          const getDistrictData = (districtCode) => {
            return findDistrictByCode(districtCode);
          };

          const handleMoveEnd = (position) => {
            setMapPosition(position);
          };

          const renderLegend = () => {
            const legendData = colorScale.range().map((color, i) => {
              const domain = colorScale.invertExtent(color);
              return {
                color: color,
                min: domain[0],
                max: domain[1]
              };
            });

            return (
              <div className="flex flex-col gap-1 absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md border border-gray-200">
                <div className="text-xs font-medium text-gray-700">Insurance Sales</div>
                {legendData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-[10px] text-gray-600">
                      {item.min ? formatValue(Math.round(item.min)) : '0'} 
                      {item.max ? ` - ${formatValue(Math.round(item.max))}` : '+'}
                    </span>
                  </div>
                ))}
              </div>
            );
          };

          return (
            <div className="relative" style={{ height: "400px" }}>
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 1000
                }}
                style={{
                  width: "100%",
                  height: "100%"
                }}
              >
                <ZoomableGroup
                  zoom={mapPosition.zoom}
                  center={mapPosition.coordinates}
                  onMoveEnd={handleMoveEnd}
                  maxZoom={8}
                  minZoom={1}
                >
                  <Geographies geography={INDIA_TOPO_JSON}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const districtCode = geo.properties.dt_code;
                        const districtName = geo.properties.district;
                        const stateName = geo.properties.st_nm;
                        const districtInfo = getDistrictData(districtCode);
                        const value = getData(districtCode);

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={value ? colorScale(value) : "#EEE"}
                            stroke="#FFF"
                            strokeWidth={0.5}
                            style={{
                              default: {
                                outline: "none",
                                transition: 'all 250ms'
                              },
                              hover: {
                                fill: "#666",
                                outline: "none",
                                cursor: 'pointer'
                              },
                              pressed: {
                                outline: "none"
                              }
                            }}
                            onMouseEnter={() => {
                              const tooltipHtml = districtInfo 
                                ? `<div class="p-2">
                                    <div class="font-medium">${districtName}</div>
                                    <div class="text-xs text-gray-500">${stateName}</div>
                                    <div class="text-sm mt-1">Sales: ${formatValue(value)}</div>
                                  </div>`
                                : `<div class="p-2">
                                    <div class="font-medium">${districtName}</div>
                                    <div class="text-xs text-gray-500">${stateName}</div>
                                    <div class="text-sm mt-1">No data available</div>
                                  </div>`;
                              setTooltipContent(tooltipHtml);
                            }}
                            onMouseLeave={() => {
                              setTooltipContent("");
                            }}
                            onClick={() => {
                              setSelectedDistrict(districtInfo ? {
                                ...districtInfo,
                                district: districtName,
                                state: stateName
                              } : null);
                            }}
                            data-tooltip-id="map-tooltip"
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              {renderLegend()}
              <ReactTooltip 
                id="map-tooltip"
                html={tooltipContent}
                className="!bg-white !text-gray-800 !shadow-lg !rounded-lg !border !border-gray-200"
              />
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteWidget(widget.id)} className="text-red-600">
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

  // Presentation mode render
  if (isPresentationMode && dashboard?.widgets?.length > 0) {
    const currentWidget = dashboard.widgets[currentSlideIndex];
    if (!currentWidget) {
      setIsPresentationMode(false);
      return null;
    }
    
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Presentation Header */}
        <div className="bg-black/80 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{dashboard.name} - Slide {currentSlideIndex + 1} of {dashboard.widgets.length}</h1>
          <Button variant="ghost" className="text-white" onClick={() => setIsPresentationMode(false)}>
            Exit Presentation
          </Button>
        </div>
        
        {/* Widget Content */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
          <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden">
            {renderWidget(currentWidget)}
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="bg-black/80 text-white p-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="text-white" 
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-gray-400">
            Use arrow keys to navigate • ESC to exit
          </div>
          <Button 
            variant="ghost" 
            className="text-white" 
            onClick={handleNextSlide}
            disabled={currentSlideIndex === dashboard.widgets.length - 1}
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Add a loading state
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
            <Link to="/insurance/dashboard" className="text-gray-400 hover:text-gray-600">
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
                    <div key={widget.id} className={widget.type === 'table' ? 'md:col-span-2' : ''}>
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
        dashboardType="insurance"
        initialData={null}
      />
    </MainLayout>
  );
} 