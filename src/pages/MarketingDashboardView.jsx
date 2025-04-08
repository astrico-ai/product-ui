import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PieChart, Share2, Edit, MoreHorizontal, Plus, ChevronRight, Presentation, MessageSquare, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import AddWidgetModal from "@/components/dashboard/AddWidgetModal";

// Lazy load ApexCharts
const Chart = lazy(() => import('react-apexcharts'));

// Use marketing dashboard storage function
const STORAGE_KEY = 'marketing_dashboards';

const getMarketingDashboard = (id) => {
  const dashboardsJson = localStorage.getItem(STORAGE_KEY);
  const dashboards = dashboardsJson ? JSON.parse(dashboardsJson) : [];
  return dashboards.find(d => d.id === id);
};

const updateMarketingDashboard = (id, data) => {
  const dashboardsJson = localStorage.getItem(STORAGE_KEY);
  const dashboards = dashboardsJson ? JSON.parse(dashboardsJson) : [];
  const index = dashboards.findIndex(d => d.id === id);
  
  if (index !== -1) {
    dashboards[index] = {
      ...dashboards[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
    return dashboards[index];
  }
  
  return null;
};

export default function MarketingDashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
    const loadDashboard = () => {
      setIsLoading(true);
      // Fetch the dashboard data
      const dashboardData = getMarketingDashboard(id);
      
      if (dashboardData) {
        setDashboard(dashboardData);
      }
      
      setIsLoading(false);
    };
    
    loadDashboard();
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
    updateMarketingDashboard(id, updatedDashboard);
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
    updateMarketingDashboard(id, updatedDashboard);
  };

  const renderWidget = (widget) => {
    if (!widget) return null;

    const renderChart = () => {
      switch (widget.type) {
        case "kpi":
          // Add more realistic trend values based on widget title
          let value, trend;
          
          if (widget.title === "Impressions") {
            value = 256789;
            trend = 12.7;
          } else if (widget.title === "Click-through Rate") {
            value = 3.45;
            trend = -0.8;
          } else if (widget.title === "Conversions") {
            value = 3256;
            trend = 8.2;
          } else if (widget.title === "ROI") {
            value = 324;
            trend = 5.6;
          } else if (widget.title === "CAC") {
            value = 1250;
            trend = -3.4;
          } else if (widget.title === "Revenue") {
            value = 845600;
            trend = 15.3;
          } else {
            value = widget.data?.[0]?.value || Math.floor(Math.random() * 10000);
            trend = widget.data?.[0]?.trend || (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 150) / 10);
          }
          
          // Special case for the first KPI card - make it positive
          const isFirstKpi = widget.title === "Impressions" || widget.id === dashboard.widgets.filter(w => w.type === "kpi")[0]?.id;
          const displayTrend = isFirstKpi ? Math.abs(trend) : trend;
          const trendDirection = isFirstKpi ? "↑" : (trend > 0 ? "↑" : "↓");
          const trendColor = isFirstKpi ? "text-green-600" : (trend > 0 ? "text-green-600" : "text-red-600");
          
          // Format the value based on the KPI type
          let formattedValue;
          if (widget.title === "Click-through Rate") {
            formattedValue = value.toFixed(2) + "%";
          } else if (widget.title === "ROI") {
            formattedValue = value.toFixed(1) + "%";
          } else if (widget.title === "CAC" || widget.title === "Revenue") {
            formattedValue = "₹" + value.toLocaleString();
          } else {
            formattedValue = value.toLocaleString();
          }
          
          return (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {formattedValue}
                </div>
                <div className={cn(
                  "text-sm mt-2 flex items-center justify-center gap-1",
                  trendColor
                )}>
                  {trendDirection} {Math.abs(displayTrend).toFixed(1)}% vs last period
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
                size: 8
              },
              colors: ['#4F46E5']
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
                name: "Google Ads",
                data: [902, 1414, 887, 1108, 1076, 1360, 1499]
              },
              {
                name: "Facebook Ads",
                data: [1235, 921, 1172, 1143, 960, 1274, 989]
              },
              {
                name: "Instagram Ads",
                data: [1070, 1266, 899, 1291, 1259, 858, 1486]
              },
              {
                name: "Email Campaigns",
                data: [906, 1014, 1463, 1213, 1113, 1310, 1362]
              },
              {
                name: "Organic Search",
                data: [871, 1130, 930, 1185, 821, 1481, 1366]
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
                curve: 'smooth'
              },
              xaxis: {
                categories: ["Jun'24", "Jul'24", "Aug'24", "Sep'24", "Oct'24", "Nov'24", "Dec'24"]
              },
              markers: {
                size: 0
              },
              colors: ['#4285F4', '#2374E1', '#F56040', '#00A82D', '#FF3E30']
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
              name: "Campaign Performance",
              data: [30, 40, 45, 50, 49, 60, 70, 81]
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
                  columnWidth: '60%',
                  borderRadius: 4,
                  distributed: true
                }
              },
              xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
              },
              fill: {
                opacity: 1
              },
              colors: ['#F97316', '#FB923C', '#FDBA74', '#F97316', '#FB923C', '#FDBA74', '#F97316', '#FB923C']
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
            series: [44, 55, 13, 43, 22],
            options: {
              chart: {
                height: 350,
                type: 'pie',
                animations: { enabled: false },
                toolbar: { show: false }
              },
              labels: ['Email', 'Social', 'SEO', 'Direct', 'Other'],
              legend: {
                position: 'bottom'
              },
              colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#7C3AED', '#5B21B6']
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
          const tableData = [
            { campaign: "Summer Sale", spend: "₹9,25,000", impressions: "2,30,000", clicks: "8,560", ctr: "3.72%", conversions: "428", cpa: "₹2,160" },
            { campaign: "Holiday Promo", spend: "₹13,87,500", impressions: "4,20,000", clicks: "15,120", ctr: "3.60%", conversions: "756", cpa: "₹1,835" },
            { campaign: "Product Launch", spend: "₹18,50,000", impressions: "5,10,000", clicks: "22,950", ctr: "4.50%", conversions: "1,147", cpa: "₹1,613" },
            { campaign: "Brand Awareness", spend: "₹5,92,000", impressions: "3,20,000", clicks: "6,400", ctr: "2.00%", conversions: "192", cpa: "₹3,083" },
            { campaign: "Remarketing", spend: "₹4,07,000", impressions: "1,25,000", clicks: "7,500", ctr: "6.00%", conversions: "525", cpa: "₹775" }
          ];
          
          return (
            <div className="p-4 overflow-auto h-[350px] flex flex-col">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPA</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.campaign}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.spend}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.impressions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.clicks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${parseFloat(row.ctr) > 3.5 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {row.ctr}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.conversions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${parseFloat(row.cpa.replace(/[₹,]/g, '')) < 2000 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {row.cpa}
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 w-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!dashboard) {
    return (
      <MainLayout>
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard Not Found</h2>
            <p className="text-gray-500 mb-8">The dashboard you're looking for doesn't exist or has been deleted.</p>
            <Button
              onClick={() => navigate("/marketing/dashboard")}
              className="bg-[#3551F3] hover:bg-[#2B41D9] text-white"
            >
              Go to Dashboards
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Presentation mode
  if (isPresentationMode && dashboard.widgets?.length > 0) {
    const currentWidget = dashboard.widgets[currentSlideIndex];
    
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

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        {/* Header Section */}
        <div className="mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 text-gray-500 hover:text-gray-900 pl-2 pr-3 -ml-2"
            onClick={() => navigate("/marketing/dashboard")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3551F3]/10 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-[#3551F3]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{dashboard.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge 
                    className={dashboard.settings?.visibility === 'public' 
                      ? "bg-green-100 text-green-800 hover:bg-green-200" 
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
                  >
                    {dashboard.settings?.visibility === 'public' ? 'Public' : 'Private'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(dashboard.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="gap-2 border-gray-200"
                onClick={() => setIsPresentationMode(true)}
                disabled={!dashboard.widgets?.length}
              >
                <Presentation className="h-4 w-4" />
                Present
              </Button>
              <Button variant="outline" className="gap-2 border-gray-200">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                className="gap-2 bg-[#3551F3] hover:bg-[#2B41D9] text-white"
                onClick={() => setIsAddWidgetModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Widget
              </Button>
            </div>
          </div>
        </div>

        {dashboard.description && (
          <p className="text-gray-500 mb-8 max-w-3xl">{dashboard.description}</p>
        )}

        {/* Dashboard Widgets */}
        {dashboard.widgets && dashboard.widgets.length > 0 ? (
          <div className="space-y-6 mb-10">
            {/* KPI Cards - 3 in a row */}
            <div className="grid grid-cols-3 gap-6">
              {dashboard.widgets
                .filter(widget => widget.type === "kpi")
                .map(widget => (
                  <div key={widget.id}>
                    {renderWidget(widget)}
                  </div>
                ))}
            </div>
            
            {/* Charts - 2 in a row */}
            <div className="grid grid-cols-2 gap-6">
              {dashboard.widgets
                .filter(widget => widget.type !== "kpi")
                .map(widget => (
                  <div key={widget.id}>
                    {renderWidget(widget)}
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
            <PieChart className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No widgets found</h3>
            <p className="text-gray-500 mb-6 max-w-md">This dashboard is empty. Add your first widget to start visualizing your marketing data.</p>
            <Button 
              onClick={() => setIsAddWidgetModalOpen(true)}
              className="bg-[#3551F3] hover:bg-[#2B41D9] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        )}
      </div>

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        onClose={setIsAddWidgetModalOpen}
        onSubmit={handleWidgetSubmit}
        dashboardType="marketing"
        initialData={null}
      />
    </MainLayout>
  );
} 