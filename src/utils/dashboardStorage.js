const STORAGE_KEY = 'dashboards';

// Helper function to get all dashboards
const getDashboards = () => {
  const dashboardsJson = localStorage.getItem(STORAGE_KEY);
  return dashboardsJson ? JSON.parse(dashboardsJson) : [];
};

// Helper function to save all dashboards
const saveDashboards = (dashboards) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
};

// Get a single dashboard by ID
export const getDashboard = (id) => {
  const dashboard = getDashboards().find(d => d.id === id);
  
  if (dashboard) {
    // Ensure all widgets have positions
    if (dashboard.widgets) {
      dashboard.widgets = dashboard.widgets.map((widget, index) => ({
        ...widget,
        position: widget.position ?? index,
      }));

      // Sort widgets by position
      dashboard.widgets.sort((a, b) => a.position - b.position);
    }
  }

  return dashboard;
};

// Default widgets for Marketing dashboards
const getMarketingDefaultWidgets = () => [
  {
    id: "widget-1",
    type: "kpi",
    title: "Total Leads",
    description: "Current active leads",
    position: 0
  },
  {
    id: "widget-2",
    type: "kpi",
    title: "Total Cost",
    description: "Cost incurred in this month",
    position: 1,
    value: 1500000000 // 15 Cr in rupees
  },
  {
    id: "widget-3",
    type: "kpi",
    title: "Conversion Rate",
    description: "Lead to customer conversion",
    position: 2,
    value: 35 // 35%
  },
  {
    id: "widget-4",
    type: "line",
    title: "Campaign Performance Trend",
    description: "Monthly campaign ROI across channels",
    position: 3
  },
  {
    id: "widget-5",
    type: "bar",
    title: "Marketing Spend by Channel",
    description: "Budget allocation across marketing channels",
    position: 4
  },
  {
    id: "widget-6",
    type: "pie",
    title: "Traffic Source Distribution",
    description: "Website traffic by marketing channel",
    position: 5
  },
  {
    id: "widget-7",
    type: "table",
    title: "Campaign Performance Metrics",
    description: "Detailed campaign analytics and KPIs",
    position: 6
  },
  {
    id: "widget-8",
    type: "scatter",
    title: "Cost vs Conversion Analysis",
    description: "Marketing spend vs conversion correlation",
    position: 7
  },
  {
    id: "widget-9",
    type: "bubble",
    title: "Channel Effectiveness Matrix",
    description: "Multi-dimensional channel performance view",
    position: 8
  },
  {
    id: "widget-10",
    type: "heatmap",
    title: "Campaign Activity Heatmap",
    description: "Marketing campaign activity patterns",
    position: 9
  }
];

// Default widgets for Motul dashboards
const getMotulDefaultWidgets = () => [
  {
    id: "widget-1",
    type: "kpi",
    title: "Total Leads",
    description: "",
    position: 0
  },
  {
    id: "widget-2",
    type: "kpi",
    title: "Total Cost",
    description: "",
    position: 1
  },
  {
    id: "widget-3",
    type: "kpi",
    title: "Conversion Rate",
    description: "",
    position: 2
  },
  {
    id: "widget-4",
    type: "table",
    title: "Primary Segment Wise Sales",
    description: "",
    position: 3
  },
  {
    id: "widget-5",
    type: "combo",
    title: "Outlets Billed & Invoices by Region",
    description: "",
    position: 4
  }
];

// Get default widgets based on data source
const getDefaultWidgets = (dataSource = "Marketing") => {
  return dataSource === "Motul" ? getMotulDefaultWidgets() : getMarketingDefaultWidgets();
};

// Create a new dashboard
export const createDashboard = (data, dataSource = "Marketing") => {
  const dashboards = getDashboards();
  const newDashboard = {
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: getDefaultWidgets(dataSource),
    dataSource: dataSource,
    ...data,
  };

  dashboards.push(newDashboard);
  saveDashboards(dashboards);
  return newDashboard;
};

// Update an existing dashboard
export const updateDashboard = (id, data) => {
  const dashboards = getDashboards();
  const index = dashboards.findIndex(d => d.id === id);
  
  if (index !== -1) {
    dashboards[index] = {
      ...dashboards[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveDashboards(dashboards);
    return dashboards[index];
  }
  
  return null;
};

// Delete a dashboard
export const deleteDashboard = (id) => {
  const dashboards = getDashboards();
  const filteredDashboards = dashboards.filter(d => d.id !== id);
  saveDashboards(filteredDashboards);
};

// Update dashboard widgets
export const updateDashboardWidgets = (dashboardId, widgets) => {
  const dashboards = getDashboards();
  const index = dashboards.findIndex(d => d.id === dashboardId);
  
  if (index !== -1) {
    // Ensure all widgets have positions
    const updatedWidgets = widgets?.map((widget, idx) => ({
      ...widget,
      position: widget.position ?? idx,
    }));

    // Sort widgets by position
    updatedWidgets.sort((a, b) => a.position - b.position);

    dashboards[index] = {
      ...dashboards[index],
      widgets: updatedWidgets,
      updatedAt: new Date().toISOString(),
    };
    
    saveDashboards(dashboards);
    return dashboards[index];
  }
  
  return null;
};

// List all dashboards
export const listDashboards = () => {
  return getDashboards();
}; 