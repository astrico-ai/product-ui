const axios = require('axios');

class FivetranService {
  constructor() {
    this.apiKey = process.env.FIVETRAN_API_KEY;
    this.apiSecret = process.env.FIVETRAN_API_SECRET;
    this.groupId = process.env.FIVETRAN_GROUP_ID;
    this.redirectUri = process.env.FIVETRAN_REDIRECT_URI;
    this.baseUrl = 'https://api.fivetran.com/v1';

    // Create auth header
    this.authHeader = 'Basic ' + Buffer.from(
      `${this.apiKey}:${this.apiSecret}`
    ).toString('base64');
  }

  // Helper: Make authenticated request
  async request(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json'
        }
      };

      if (data) config.data = data;

      console.log(`Fivetran API Request: ${method} ${this.baseUrl}${endpoint}`);
      console.log('Request payload:', JSON.stringify(data, null, 2));
      const response = await axios(config);
      console.log(`Fivetran API Response: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error(`Fivetran API Error: ${error.response?.status || error.message}`);
      console.error('Error response:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Create new connection with Connect Card
  async createConnection(service, name) {
    // Generate schema name from service name
    const schemaName = `${service}_${Date.now()}`;

    const data = await this.request('POST', '/connections', {
      service: service,
      group_id: this.groupId,
      schema: schemaName, // Required: destination schema name
      paused: false, // Allow auto-sync to start after OAuth and discover schema
      run_setup_tests: false, // Can't run setup tests with Connect Card
      config: {
        schema: schemaName // Required inside config
      },
      connect_card_config: {
        redirect_uri: this.redirectUri,
        hide_setup_guide: true
      }
    });

    return {
      connectionId: data.data.id,
      connectCardUrl: data.data.connect_card.uri,
      service: data.data.service,
      status: data.data.status
    };
  }

  // List all connections in group
  async listConnections() {
    const data = await this.request('GET', `/groups/${this.groupId}/connections`);
    return data.data.items || [];
  }

  // Get single connection details
  async getConnection(connectionId) {
    const data = await this.request('GET', `/connections/${connectionId}`);
    return data.data;
  }

  // Update connection
  async updateConnection(connectionId, updates) {
    const data = await this.request('PATCH', `/connections/${connectionId}`, updates);
    return data.data;
  }

  // Delete connection
  async deleteConnection(connectionId) {
    await this.request('DELETE', `/connections/${connectionId}`);
    return { success: true };
  }

  // Get Connect Card URL for existing connection
  async getConnectCardUrl(connectionId) {
    const data = await this.request('POST', `/connections/${connectionId}/connect-card`, {
      redirect_uri: this.redirectUri
    });
    return data.data.connect_card.uri;
  }

  // Trigger manual sync
  async triggerSync(connectionId) {
    console.log('[FIVETRAN SERVICE] Triggering sync at:', new Date().toISOString());
    const data = await this.request('POST', `/connections/${connectionId}/sync`, {
      force: true
    });
    console.log('[FIVETRAN SERVICE] Sync response received at:', new Date().toISOString());
    console.log('[FIVETRAN SERVICE] Sync response:', JSON.stringify(data, null, 2));
    return data;
  }

  // List available connector types
  async listConnectorTypes() {
    // TODO: Enable Fivetran API once metadata/connectors endpoint is verified
    // try {
    //   const data = await this.request('GET', '/metadata/connectors');
    //   return data.data?.items || [];
    // } catch (error) {
    //   console.error('Fivetran API error:', error.message);
    // }

    // Use hardcoded connector list for now
    return [
      {
        id: 'google_ads',
        name: 'Google Ads',
        description: 'Connect to Google Ads to sync your advertising data',
        type: 'Advertising',
        icon_url: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png'
      },
      {
        id: 'facebook_ads',
        name: 'Meta Ads (Facebook)',
        description: 'Connect to Meta Ads to sync your Facebook advertising data',
        type: 'Advertising',
        icon_url: 'https://www.facebook.com/images/icons/favicons/favicon-96x96.png'
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Connect to HubSpot to sync CRM and marketing data',
        type: 'CRM',
        icon_url: 'https://www.hubspot.com/favicon.ico'
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'Connect to Salesforce to sync CRM data',
        type: 'CRM',
        icon_url: 'https://www.salesforce.com/favicon.ico'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Connect to Stripe to sync payment and transaction data',
        type: 'Payments',
        icon_url: 'https://www.stripe.com/favicon.ico'
      }
    ];
  }

  // Get connector schema/metadata
  async getConnectorSchema(service) {
    const data = await this.request('GET', `/metadata/connectors/${service}`);
    return data.data;
  }

  // Get connection schema (all tables and columns that will be synced)
  async getConnectionSchema(connectionId) {
    const data = await this.request('GET', `/connections/${connectionId}/schemas`);
    return data.data;
  }

  // Get columns for a specific table
  async getTableColumns(connectionId, schemaName, tableName) {
    const data = await this.request(
      'GET',
      `/connections/${connectionId}/schemas/${schemaName}/tables/${tableName}/columns`
    );
    return data.data;
  }

  // Helper: Extract table list from connection schema
  parseConnectionSchema(schemaData) {
    const tables = [];

    for (const [schemaName, schemaConfig] of Object.entries(schemaData.schemas || {})) {
      for (const [tableName, tableConfig] of Object.entries(schemaConfig.tables || {})) {
        const columns = Object.entries(tableConfig.columns || {}).map(([colName, colConfig]) => ({
          name: colName,
          nameInDestination: colConfig.name_in_destination,
          enabled: colConfig.enabled,
          isPrimaryKey: colConfig.is_primary_key,
          hashed: colConfig.hashed
        }));

        tables.push({
          schema: schemaName,
          name: tableName,
          nameInDestination: tableConfig.name_in_destination,
          enabled: tableConfig.enabled,
          syncMode: tableConfig.sync_mode,
          columns: columns,
          columnCount: columns.length
        });
      }
    }

    return tables;
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        status,
        message: data.message || 'Fivetran API error',
        code: data.code,
        details: data
      };
    }
    return {
      status: 500,
      message: error.message,
      code: 'INTERNAL_ERROR'
    };
  }
}

module.exports = new FivetranService();
