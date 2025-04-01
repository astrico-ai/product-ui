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

// Create a new dashboard
export const createDashboard = (data) => {
  const dashboards = getDashboards();
  const newDashboard = {
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [],
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