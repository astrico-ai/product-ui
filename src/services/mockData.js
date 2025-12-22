/**
 * Mock Data for Fivetran Connector Management
 * Provides realistic datasets for frontend-only development
 */

// Available connectors in the gallery
export const AVAILABLE_CONNECTORS = [
  {
    id: 'google-ads',
    name: 'Google Ads',
    provider: 'Google',
    logo: 'https://www.gstatic.com/images/branding/product/1x/googleg_40dp.png',
    description: 'Online advertising platform for campaign management and performance tracking',
    category: 'Advertising',
    status: 'available',
    documentation: 'https://support.google.com/google-ads',
    setupTime: '~5 minutes',
    estimatedRows: 125000,
    updateFrequency: 'Hourly',
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    provider: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1200px-Meta_Platforms_Inc._logo.svg.png',
    description: 'Social media advertising platform for Facebook, Instagram, and other Meta services',
    category: 'Advertising',
    status: 'coming_soon',
    documentation: 'https://www.facebook.com/business/help',
    setupTime: '~5 minutes',
    estimatedRows: 89000,
    updateFrequency: 'Hourly',
  },
  {
    id: 'bing-ads',
    name: 'Bing Ads',
    provider: 'Microsoft',
    logo: 'https://www.bing.com/sa/simg/bing_p_blk.svg',
    description: 'Microsoft advertising platform for search and programmatic advertising',
    category: 'Advertising',
    status: 'coming_soon',
    documentation: 'https://ads.microsoft.com/en-US/help',
    setupTime: '~5 minutes',
    estimatedRows: 56000,
    updateFrequency: 'Hourly',
  },
];

// Google Ads schema definition
export const GOOGLE_ADS_SCHEMA = {
  id: 'google-ads-schema',
  connectorId: 'google-ads',
  tables: [
    {
      id: 'campaigns',
      name: 'Campaigns',
      description: 'Campaign-level performance data',
      rowCount: 42450,
      columns: [
        { name: 'campaign_id', type: 'string', description: 'Unique campaign identifier' },
        { name: 'campaign_name', type: 'string', description: 'Name of the campaign' },
        { name: 'status', type: 'string', description: 'Campaign status (ENABLED, PAUSED, etc)' },
        { name: 'impressions', type: 'number', description: 'Total ad impressions' },
        { name: 'clicks', type: 'number', description: 'Total clicks' },
        { name: 'conversions', type: 'number', description: 'Total conversions' },
        { name: 'spend', type: 'number', description: 'Total spend in currency' },
        { name: 'created_at', type: 'timestamp', description: 'Campaign creation date' },
        { name: 'updated_at', type: 'timestamp', description: 'Last update timestamp' },
      ],
    },
    {
      id: 'ad-groups',
      name: 'Ad Groups',
      description: 'Ad group level performance metrics',
      rowCount: 38150,
      columns: [
        { name: 'ad_group_id', type: 'string', description: 'Unique ad group identifier' },
        { name: 'campaign_id', type: 'string', description: 'Parent campaign ID' },
        { name: 'ad_group_name', type: 'string', description: 'Name of the ad group' },
        { name: 'status', type: 'string', description: 'Ad group status' },
        { name: 'impressions', type: 'number', description: 'Total impressions' },
        { name: 'clicks', type: 'number', description: 'Total clicks' },
        { name: 'ctr', type: 'number', description: 'Click-through rate' },
        { name: 'updated_at', type: 'timestamp', description: 'Last update timestamp' },
      ],
    },
    {
      id: 'keywords',
      name: 'Keywords',
      description: 'Keyword-level performance data',
      rowCount: 126500,
      columns: [
        { name: 'keyword_id', type: 'string', description: 'Unique keyword identifier' },
        { name: 'ad_group_id', type: 'string', description: 'Parent ad group ID' },
        { name: 'keyword', type: 'string', description: 'Keyword text' },
        { name: 'match_type', type: 'string', description: 'Match type (BROAD, PHRASE, EXACT)' },
        { name: 'impressions', type: 'number', description: 'Total impressions' },
        { name: 'clicks', type: 'number', description: 'Total clicks' },
        { name: 'conversions', type: 'number', description: 'Total conversions' },
        { name: 'cost_per_click', type: 'number', description: 'Average CPC' },
        { name: 'updated_at', type: 'timestamp', description: 'Last update timestamp' },
      ],
    },
    {
      id: 'ad-performance',
      name: 'Ad Performance',
      description: 'Individual ad creative performance',
      rowCount: 89340,
      columns: [
        { name: 'ad_id', type: 'string', description: 'Unique ad identifier' },
        { name: 'ad_group_id', type: 'string', description: 'Parent ad group ID' },
        { name: 'ad_type', type: 'string', description: 'Type of ad (Text, Image, Video, etc)' },
        { name: 'headline', type: 'string', description: 'Ad headline' },
        { name: 'impressions', type: 'number', description: 'Total impressions' },
        { name: 'clicks', type: 'number', description: 'Total clicks' },
        { name: 'ctr', type: 'number', description: 'Click-through rate' },
        { name: 'quality_score', type: 'number', description: 'Google Quality Score (1-10)' },
        { name: 'updated_at', type: 'timestamp', description: 'Last update timestamp' },
      ],
    },
    {
      id: 'conversions',
      name: 'Conversions',
      description: 'Conversion tracking data',
      rowCount: 16780,
      columns: [
        { name: 'conversion_id', type: 'string', description: 'Unique conversion identifier' },
        { name: 'click_id', type: 'string', description: 'Associated click ID' },
        { name: 'conversion_action_name', type: 'string', description: 'Name of conversion action' },
        { name: 'conversion_value', type: 'number', description: 'Value of conversion' },
        { name: 'currency', type: 'string', description: 'Currency code (USD, EUR, etc)' },
        { name: 'conversion_time', type: 'timestamp', description: 'When conversion occurred' },
        { name: 'user_id', type: 'string', description: 'Associated user ID' },
      ],
    },
  ],
};

// Sync frequency options
export const SYNC_FREQUENCIES = [
  { id: '15m', label: 'Every 15 minutes', value: 15, unit: 'minutes' },
  { id: '1h', label: 'Every hour', value: 1, unit: 'hours', recommended: true },
  { id: '6h', label: 'Every 6 hours', value: 6, unit: 'hours' },
  { id: '24h', label: 'Daily', value: 1, unit: 'days' },
  { id: 'custom', label: 'Custom', value: null, unit: 'custom' },
];

// Historical data range options
export const HISTORICAL_RANGES = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: '90d', label: 'Last 90 days', days: 90, recommended: true },
  { id: '180d', label: 'Last 180 days', days: 180 },
  { id: '1y', label: 'Last year', days: 365 },
  { id: 'all', label: 'All historical data', days: null },
];

// Mock sync history for connected connectors
export const generateMockSyncHistory = (connectorId, days = 30) => {
  const history = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const syncTime = new Date(now);
    syncTime.setDate(syncTime.getDate() - i);

    // Simulate 2 syncs per day (morning and evening)
    for (let j = 0; j < 2; j++) {
      syncTime.setHours(j === 0 ? 3 : 15, Math.random() * 60, 0);

      const isSuccess = Math.random() > 0.05; // 95% success rate
      const duration = isSuccess ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 120) + 30;
      const rowCount = isSuccess ? Math.floor(125000 + Math.random() * 5000) : 0;

      history.push({
        id: `sync-${connectorId}-${i}-${j}`,
        connectorId,
        startTime: new Date(syncTime),
        endTime: new Date(syncTime.getTime() + duration * 60 * 1000),
        duration,
        status: isSuccess ? 'success' : 'error',
        rowsProcessed: rowCount,
        errorMessage: isSuccess
          ? null
          : [
              'API rate limit exceeded - retrying next sync',
              'Connection timeout - check your credentials',
              'Invalid authentication token - please re-authenticate',
              'Schema mismatch detected in table "keywords"',
            ][Math.floor(Math.random() * 4)],
        tables: [
          { name: 'campaigns', rowsProcessed: isSuccess ? 42450 : 0, status: 'complete' },
          {
            name: 'ad_groups',
            rowsProcessed: isSuccess ? 38150 : 0,
            status: isSuccess ? 'complete' : 'error',
          },
          {
            name: 'keywords',
            rowsProcessed: isSuccess ? 42000 : 0,
            status: isSuccess ? 'complete' : 'pending',
          },
          { name: 'ad_performance', rowsProcessed: isSuccess ? 2400 : 0, status: 'complete' },
        ],
      });
    }
  }

  return history.sort((a, b) => b.startTime - a.startTime);
};

// Mock connected connectors (after setup)
export const createMockConnector = (connectorData) => {
  const now = new Date();
  const lastSyncTime = new Date(now.getTime() - Math.random() * 3600000); // Last 1 hour

  return {
    id: connectorData.id,
    connectorTypeId: connectorData.connectorTypeId,
    name: connectorData.name,
    status: 'healthy', // healthy, warning, error, paused
    email: connectorData.email,
    schema: connectorData.schema,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: now,
    lastSyncTime: lastSyncTime,
    nextSyncTime: new Date(lastSyncTime.getTime() + 3600000), // 1 hour after last sync
    lastSyncDuration: 842, // seconds
    syncHistory: generateMockSyncHistory(connectorData.id),
    config: {
      frequency: '1h',
      historicalRange: '90d',
      tables: connectorData.schema.tables.map((t) => ({
        tableId: t.id,
        tableName: t.name,
        enabled: true,
        columns: t.columns.map((c) => ({ name: c.name, enabled: true })),
      })),
    },
    metrics: {
      successRate: 99.8,
      uptime: 100,
      totalRowsProcessed: 2847500,
      totalSyncs: 60,
      averageSyncTime: 842,
    },
  };
};

// Mock active sync progress
export const createMockActiveSyncProgress = (connectorId) => {
  const startTime = new Date(Date.now() - 60000); // Started 1 minute ago

  return {
    id: `sync-${connectorId}-${Date.now()}`,
    connectorId,
    status: 'in_progress',
    startTime,
    estimatedEndTime: new Date(startTime.getTime() + 15 * 60000),
    progress: Math.floor(Math.random() * 70) + 10, // 10-80%
    tables: [
      {
        tableId: 'campaigns',
        tableName: 'Campaigns',
        status: 'complete',
        rowsProcessed: 42450,
        rowsTotal: 42450,
        progress: 100,
      },
      {
        tableId: 'ad-groups',
        tableName: 'Ad Groups',
        status: 'in_progress',
        rowsProcessed: Math.floor(38150 * (Math.random() * 0.8 + 0.2)),
        rowsTotal: 38150,
        progress: Math.floor(Math.random() * 80) + 10,
      },
      {
        tableId: 'keywords',
        tableName: 'Keywords',
        status: 'pending',
        rowsProcessed: 0,
        rowsTotal: 126500,
        progress: 0,
      },
      {
        tableId: 'ad-performance',
        tableName: 'Ad Performance',
        status: 'pending',
        rowsProcessed: 0,
        rowsTotal: 89340,
        progress: 0,
      },
      {
        tableId: 'conversions',
        tableName: 'Conversions',
        status: 'pending',
        rowsProcessed: 0,
        rowsTotal: 16780,
        progress: 0,
      },
    ],
  };
};

// OAuth provider configurations
export const OAUTH_PROVIDERS = {
  'google-ads': {
    name: 'Google Ads',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/adwords'],
    permissions: [
      'View your advertising accounts',
      'Access performance metrics',
      'Read campaign data',
    ],
    icon: '🔍',
  },
  'meta-ads': {
    name: 'Meta Ads',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['ads_management', 'ads_read'],
    permissions: [
      'Access your Meta Ads accounts',
      'Read campaign performance',
      'View ad metrics',
    ],
    icon: '📱',
  },
  'bing-ads': {
    name: 'Bing Ads',
    authUrl: 'https://login.live.com/oauth20_authorize.srf',
    scopes: ['bingads.manage'],
    permissions: [
      'Access your Bing Ads accounts',
      'Read campaign data',
      'View performance reports',
    ],
    icon: '🔵',
  },
};

// Delay utility for simulating network requests
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate OAuth flow
export const simulateOAuthFlow = async (connectorId) => {
  await delay(800); // Simulate auth server round trip

  return {
    success: true,
    message: `Successfully connected ${AVAILABLE_CONNECTORS.find((c) => c.id === connectorId)?.name}`,
    email: `user.${Math.floor(Math.random() * 1000)}@example.com`,
    accountId: `ACC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };
};
