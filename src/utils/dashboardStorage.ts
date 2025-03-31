import { v4 as uuidv4 } from 'uuid';

export interface Dashboard {
  id: string;
  name: string;
  owner: string;
  lastUpdatedAt: string; // Store as ISO string
  createdAt: string; // Store as ISO string
  description?: string;
  widgets?: Array<{
    id: string;
    type: string;
    title: string;
    position: number;
    config: {
      dataSources: string[];
      metric: string;
      groupBy: string[];
      chartType: string;
    };
  }>;
}

const DASHBOARDS_STORAGE_KEY = 'dashboards';

export const getDashboards = (): Dashboard[] => {
  const dashboards = localStorage.getItem(DASHBOARDS_STORAGE_KEY);
  if (!dashboards) return [];
  
  // Ensure all widgets have positions
  const parsed = JSON.parse(dashboards);
  return parsed.map((dashboard: Dashboard) => {
    if (dashboard.widgets) {
      // Add missing positions if needed
      dashboard.widgets = dashboard.widgets.map((widget, index) => ({
        ...widget,
        position: widget.position ?? index
      }));
      // Sort widgets by position
      dashboard.widgets.sort((a, b) => a.position - b.position);
    }
    return dashboard;
  });
};

export const saveDashboard = (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'lastUpdatedAt'>) => {
  const dashboards = getDashboards();
  const newDashboard: Dashboard = {
    ...dashboard,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    widgets: [],
  };
  
  dashboards.push(newDashboard);
  localStorage.setItem(DASHBOARDS_STORAGE_KEY, JSON.stringify(dashboards));
  return newDashboard;
};

export const updateDashboard = (id: string, updates: Partial<Dashboard>) => {
  const dashboards = getDashboards();
  const index = dashboards.findIndex(d => d.id === id);
  
  if (index !== -1) {
    dashboards[index] = {
      ...dashboards[index],
      ...updates,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DASHBOARDS_STORAGE_KEY, JSON.stringify(dashboards));
    return dashboards[index];
  }
  return null;
};

export const deleteDashboard = (id: string): boolean => {
  const dashboards = getDashboards();
  const filteredDashboards = dashboards.filter(d => d.id !== id);
  
  if (filteredDashboards.length !== dashboards.length) {
    localStorage.setItem(DASHBOARDS_STORAGE_KEY, JSON.stringify(filteredDashboards));
    return true;
  }
  return false;
};

export const getDashboardById = (id: string): Dashboard | null => {
  const dashboards = getDashboards();
  return dashboards.find(d => d.id === id) || null;
};

export const updateDashboardWidgets = (dashboardId: string, widgets: Dashboard['widgets']) => {
  const dashboards = getDashboards();
  const index = dashboards.findIndex(d => d.id === dashboardId);
  
  if (index !== -1) {
    // Ensure all widgets have positions
    const updatedWidgets = widgets?.map((widget, idx) => ({
      ...widget,
      position: widget.position ?? idx
    })) ?? [];
    
    // Sort widgets by position
    updatedWidgets.sort((a, b) => a.position - b.position);
    
    dashboards[index] = {
      ...dashboards[index],
      widgets: updatedWidgets,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DASHBOARDS_STORAGE_KEY, JSON.stringify(dashboards));
    return dashboards[index];
  }
  return null;
}; 