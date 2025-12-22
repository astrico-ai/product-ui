/**
 * Connector Service
 * Calls real Fivetran API through backend proxy
 */

import {
  SYNC_FREQUENCIES,
  HISTORICAL_RANGES,
  simulateOAuthFlow,
  delay,
} from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Get all available connectors for the gallery
export const listAvailableConnectors = async () => {
  try {
    console.log(`Fetching connectors from: ${API_URL}/api/connectors/services`);
    const response = await fetch(`${API_URL}/api/connectors/services`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    console.log('Raw connector data from API:', data);

    // Transform Fivetran response to expected format
    // Fivetran returns: id, name, type, description, icon_url
    const transformed = {
      connectors: (data.connectors || []).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon_url,
        logo: c.icon_url,
        category: c.type || 'Data Source',
        status: 'available' // Fivetran connectors are available
      }))
    };
    console.log('Transformed connectors:', transformed);
    return transformed;
  } catch (error) {
    console.error('Failed to list available connectors:', error);
    // Return empty array instead of throwing to show what went wrong
    console.error('Falling back to empty connector list');
    return { connectors: [] };
  }
};

// Get details of a specific available connector
export const getAvailableConnector = async (connectorId) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/services`);
    if (!response.ok) throw new Error('Failed to fetch connectors');
    const data = await response.json();
    const connector = data.connectors?.find((c) => c.id === connectorId);
    if (!connector) {
      throw new Error(`Connector ${connectorId} not found`);
    }
    return {
      id: connector.id,
      name: connector.name,
      description: connector.description,
      icon: connector.icon_url,
      logo: connector.icon_url,
      category: connector.type || 'Data Source',
      status: 'available'
    };
  } catch (error) {
    console.error('Failed to get connector:', error);
    throw error;
  }
};

// Get schema for a connector type
export const getConnectorSchema = async (connectorId) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/services/${connectorId}/schema`);
    if (!response.ok) throw new Error('Failed to fetch connector schema');
    return response.json();
  } catch (error) {
    console.error('Failed to get connector schema:', error);
    throw error;
  }
};

// List user's connected connectors
export const listConnectors = async () => {
  try {
    const response = await fetch(`${API_URL}/api/connectors`);
    if (!response.ok) throw new Error('Failed to fetch connectors');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to list connectors:', error);
    throw error;
  }
};

// Get a specific connected connector
export const getConnector = async (connectorId) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/${connectorId}`);
    if (!response.ok) throw new Error('Connector not found');
    return response.json();
  } catch (error) {
    console.error('Failed to get connector:', error);
    throw error;
  }
};

// Create a new connector (returns Connect Card URL - does NOT auto-redirect)
export const createConnector = async (config) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: config.connectorTypeId,
        name: config.name
      })
    });

    if (!response.ok) throw new Error('Failed to create connector');
    const data = await response.json();

    // Return the data - caller decides whether to redirect or show in modal
    return data;
  } catch (error) {
    console.error('Failed to create connector:', error);
    throw error;
  }
};

// Update a connector
export const updateConnector = async (connectorId, updates) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/${connectorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update connector');
    return response.json();
  } catch (error) {
    console.error('Failed to update connector:', error);
    throw error;
  }
};

// Delete a connector
export const deleteConnector = async (connectorId) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/${connectorId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete connector');
    return response.json();
  } catch (error) {
    console.error('Failed to delete connector:', error);
    throw error;
  }
};

// Pause a connector
export const pauseConnector = async (connectorId) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/${connectorId}/pause`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to pause connector');
    return response.json();
  } catch (error) {
    console.error('Failed to pause connector:', error);
    throw error;
  }
};

// Resume a connector
export const resumeConnector = async (connectorId) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/${connectorId}/resume`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to resume connector');
    return response.json();
  } catch (error) {
    console.error('Failed to resume connector:', error);
    throw error;
  }
};

// Get connection schema (all tables and columns)
export const getConnectionSchema = async (connectorId) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/${connectorId}/schema`);
    if (!response.ok) throw new Error('Failed to fetch connection schema');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch connection schema:', error);
    throw error;
  }
};

// Get columns for a specific table
export const getTableColumns = async (connectorId, schemaName, tableName) => {
  try {
    const response = await fetch(
      `${API_URL}/api/connectors/${connectorId}/schema/${schemaName}/tables/${tableName}/columns`
    );
    if (!response.ok) throw new Error('Failed to fetch table columns');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch table columns:', error);
    throw error;
  }
};

// Get sync history for a connector
export const getSyncHistory = async (connectorId, options = {}) => {
  await delay(500);

  const connector = await getConnector(connectorId);

  let history = connector.syncHistory;

  // Apply filters
  if (options.status) {
    history = history.filter((h) => h.status === options.status);
  }

  if (options.limit) {
    history = history.slice(0, options.limit);
  }

  return history;
};

// Get sync details
export const getSyncDetails = async (connectorId, syncId) => {
  await delay(300);

  const history = await getSyncHistory(connectorId);
  const sync = history.find((s) => s.id === syncId);

  if (!sync) {
    throw new Error(`Sync ${syncId} not found`);
  }

  return sync;
};

// Get sync frequencies
export const listSyncFrequencies = async () => {
  await delay(100);
  return SYNC_FREQUENCIES;
};

// Get historical ranges
export const listHistoricalRanges = async () => {
  await delay(100);
  return HISTORICAL_RANGES;
};

// Simulate OAuth flow for a connector
export const authenticateConnector = async (connectorId) => {
  await delay(1200); // Simulate OAuth redirect and auth

  return simulateOAuthFlow(connectorId);
};

// Trigger a manual sync
export const triggerSync = async (connectorId) => {
  try {
    const response = await fetch(`${API_URL}/api/connectors/${connectorId}/sync`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to trigger sync');
    return response.json();
  } catch (error) {
    console.error('Failed to trigger sync:', error);
    throw error;
  }
};

// Pause an active sync
export const pauseSync = async (connectorId, syncId) => {
  await delay(200);
  return { success: true, status: 'paused' };
};

// Resume a paused sync
export const resumeSync = async (connectorId, syncId) => {
  await delay(200);
  return { success: true, status: 'in_progress' };
};

// Get sync metrics for a connector
export const getConnectorMetrics = async (connectorId) => {
  await delay(400);

  const connector = await getConnector(connectorId);

  return {
    connectorId,
    metrics: connector.metrics,
    lastUpdated: new Date(),
  };
};

// Test a connector configuration (dry run)
export const testConnectorConfig = async (connectorId, config) => {
  await delay(2000); // Simulate testing

  // Randomly succeed or fail for demo
  const success = Math.random() > 0.1; // 90% success rate

  if (!success) {
    throw new Error('Failed to authenticate with Google Ads. Please check your credentials.');
  }

  return {
    success: true,
    message: 'Successfully connected to Google Ads',
    tablesFound: 5,
    estimatedRows: 125000,
  };
};

// Export connector data (mock implementation)
export const exportConnectorData = async (connectorId, format = 'json') => {
  await delay(1500);

  const connector = await getConnector(connectorId);

  // In real implementation, this would prepare actual data for download
  return {
    filename: `${connector.name.replace(/\s+/g, '_')}_export_${Date.now()}.${format}`,
    data: connector,
    mimeType: format === 'json' ? 'application/json' : 'text/csv',
  };
};

// Validate connector setup
export const validateConnectorSetup = async (config) => {
  await delay(800);

  const errors = [];

  if (!config.connectorTypeId) {
    errors.push('Connector type is required');
  }

  if (!config.name || config.name.trim().length === 0) {
    errors.push('Connector name is required');
  }

  if (!config.frequency) {
    errors.push('Sync frequency is required');
  }

  if (!config.tables || config.tables.length === 0) {
    errors.push('At least one table must be selected');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Simulate getting auth URL for OAuth
export const getAuthUrl = async (connectorId) => {
  await delay(200);

  const providers = {
    'google-ads': 'https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/adwords',
    'meta-ads': 'https://www.facebook.com/v18.0/dialog/oauth',
    'bing-ads': 'https://login.live.com/oauth20_authorize.srf',
  };

  const authUrl = providers[connectorId];

  if (!authUrl) {
    throw new Error(`Auth not available for ${connectorId}`);
  }

  // In real app, generate proper OAuth state and PKCE codes
  const state = Math.random().toString(36).substr(2, 9);

  return {
    authUrl: `${authUrl}&client_id=demo&state=${state}&redirect_uri=http://localhost:5173/auth/callback`,
    state,
  };
};
