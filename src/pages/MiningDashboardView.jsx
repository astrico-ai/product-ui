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
    updateMiningDashboard(id, updatedDashboard);
    
    // Close modal
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
      window.location.href = '/chat/mining';
    }
    

    // Redirect immediately to chat page
    
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
          
          case "table":


          
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
          
            
            {/* Other Widgets */}
            
            {/* Pinned Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(() => {
  const firstNonKPIWidget = dashboard.widgets.find(w => w.type !== 'kpi');
  return firstNonKPIWidget ? (
    <div >
      <div key={firstNonKPIWidget.id}>
        {renderWidget(firstNonKPIWidget)}
      </div>
    </div>
  ) : null;
})()}


          {(() => {
            const pinnedCharts = JSON.parse(localStorage.getItem('pinnedCharts') || '[]');

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
            
            return pinnedCharts.map((chart) => (
              <div key={chart.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">{chart.title}</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleChatIconClick(chart)}
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
                        <DropdownMenuItem onClick={() => {
                          const updatedCharts = pinnedCharts.filter(c => c.id !== chart.id);
                          localStorage.setItem('pinnedCharts', JSON.stringify(updatedCharts));
                          window.location.reload();
                        }} className="text-red-600">
                          <span className="flex items-center">
                            Delete
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
                  {chart.type === 'copper' && (
                    <Suspense fallback={<div>Loading chart...</div>}>
                      <Chart
                        options={{
                          chart: {
                            height: 350,
                            type: 'line',
                            animations: { enabled: false },
                            toolbar: { show: false }
                          },
                          stroke: {
                            width: 3,
                            curve: 'smooth',
                            colors: ['#3551F3']
                          },
                          xaxis: {
                            categories: ['January', 'February', 'March'],
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
                                return '$' + value.toFixed(2);
                              }
                            },
                            title: {
                              text: 'Price (USD)',
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
                          colors: ['#3551F3'],
                          legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                            labels: {
                              colors: '#000000'
                            }
                          }
                        }}
                        series={[{
                          name: "Copper Price",
                          data: [
                            { date: "March", price: 9363.5 },
                            { date: "February", price: 8949.5 },
                            { date: "January", price: 8949.5 }
                          ].map(d => d.price)
                        }]}
                        type="line"
                        height={350}
                        width="100%"
                      />
                    </Suspense>
                  )}
                  {chart.type === 'monthly_sales' && (
                    <Suspense fallback={<div>Loading chart...</div>}>
                      <Chart
                        options={{
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
                            categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
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
                        }}
                        series={[
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
                        ]}
                        type="line"
                        height={350}
                        width="100%"
                      />
                    </Suspense>
                  )}
                  {chart.type === 'lost_customers' && (
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
                          {[
                            { clientName: "Tata Composites", fibreType: "Glass Fibre", lySales: 1.39, lyVolume: 18.4 },
                            { clientName: "Reliance Fibres", fibreType: "Glass Fibre", lySales: 1.09, lyVolume: 13.0 },
                            { clientName: "Bharat Textiles", fibreType: "Glass Fibre", lySales: 1.04, lyVolume: 8.8 },
                            { clientName: "Aditya Polymers", fibreType: "Hybrid Fibre", lySales: 0.99, lyVolume: 15.8 },
                            { clientName: "Larsen Composites", fibreType: "Glass Fibre", lySales: 1.39, lyVolume: 14.5 }
                          ].map((row, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.clientName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.fibreType}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹ {row.lySales.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.lyVolume.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {chart.type === 'aramid_contribution' && (
                    <Suspense fallback={<div>Loading chart...</div>}>
                      <Chart
                        options={{
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
                        }}
                        series={[27.63, 23.68, 19.74, 15.79, 13.16]}
                        type="pie"
                        height={350}
                        width="100%"
                      />
                    </Suspense>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
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