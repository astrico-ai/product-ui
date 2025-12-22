const express = require('express');
const router = express.Router();
const fivetranService = require('../services/fivetranService');

// List available connector types
router.get('/services', async (req, res, next) => {
  try {
    console.log('Fetching connector types from Fivetran API...');
    const connectors = await fivetranService.listConnectorTypes();
    console.log('Connector types received:', connectors);
    res.json({ connectors });
  } catch (error) {
    console.error('Error fetching connector types:', error);
    next(error);
  }
});

// Get connector schema/metadata
router.get('/services/:service/schema', async (req, res, next) => {
  try {
    const schema = await fivetranService.getConnectorSchema(req.params.service);
    res.json(schema);
  } catch (error) {
    next(error);
  }
});

// List user's connections
router.get('/', async (req, res, next) => {
  try {
    const connections = await fivetranService.listConnections();

    // Transform to frontend format
    const formatted = connections.map(conn => ({
      id: conn.id,
      name: conn.schema,
      service: conn.service,
      status: mapStatus(conn.status),
      createdAt: conn.created_at,
      lastSyncTime: conn.succeeded_at,
      nextSyncTime: conn.failed_at,
      config: {
        frequency: conn.sync_frequency,
        paused: conn.paused
      }
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// Get single connection
router.get('/:id', async (req, res, next) => {
  try {
    const connection = await fivetranService.getConnection(req.params.id);
    res.json(connection);
  } catch (error) {
    next(error);
  }
});

// Create new connection (returns Connect Card URL)
router.post('/', async (req, res, next) => {
  try {
    const { service, name } = req.body;

    console.log('Creating connector:', { service, name });

    if (!service) {
      return res.status(400).json({ error: 'Service is required' });
    }

    const result = await fivetranService.createConnection(service, name);

    console.log('Connector created successfully:', result);
    console.log('Connection paused - Schema discovery will start when user returns from Connect Card');

    res.json({
      connectionId: result.connectionId,
      connectCardUrl: result.connectCardUrl,
      message: 'Redirect user to connectCardUrl to complete setup'
    });
  } catch (error) {
    console.error('ERROR creating connector:', error.message);
    console.error('Full error:', error);
    next(error);
  }
});

// Update connection
router.patch('/:id', async (req, res, next) => {
  try {
    const updated = await fivetranService.updateConnection(
      req.params.id,
      req.body
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete connection
router.delete('/:id', async (req, res, next) => {
  try {
    await fivetranService.deleteConnection(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Pause connection
router.post('/:id/pause', async (req, res, next) => {
  try {
    const updated = await fivetranService.updateConnection(req.params.id, {
      paused: true
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Resume connection
router.post('/:id/resume', async (req, res, next) => {
  try {
    const updated = await fivetranService.updateConnection(req.params.id, {
      paused: false
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Trigger manual sync
router.post('/:id/sync', async (req, res, next) => {
  try {
    const connectionId = req.params.id;
    console.log('[BACKEND] Sync API called at:', new Date().toISOString());
    console.log('[BACKEND] Triggering sync for connectionId:', connectionId);
    const result = await fivetranService.triggerSync(connectionId);
    console.log('[BACKEND] Sync trigger completed at:', new Date().toISOString());
    res.json(result);
  } catch (error) {
    console.error('[BACKEND] Sync API error:', error.message);
    next(error);
  }
});

// Get new Connect Card URL for existing connection
router.post('/:id/setup', async (req, res, next) => {
  try {
    const connectCardUrl = await fivetranService.getConnectCardUrl(req.params.id);
    res.json({ connectCardUrl });
  } catch (error) {
    next(error);
  }
});

// Get connection schema (tables and columns that will be synced)
router.get('/:id/schema', async (req, res, next) => {
  try {
    const schemaData = await fivetranService.getConnectionSchema(req.params.id);
    const tables = fivetranService.parseConnectionSchema(schemaData);

    res.json({
      schemaChangeHandling: schemaData.schema_change_handling,
      enableNewByDefault: schemaData.enable_new_by_default,
      tables: tables,
      totalTables: tables.length,
      enabledTables: tables.filter(t => t.enabled).length
    });
  } catch (error) {
    next(error);
  }
});

// Get columns for a specific table
router.get('/:id/schema/:schemaName/tables/:tableName/columns', async (req, res, next) => {
  try {
    const { id, schemaName, tableName } = req.params;
    const columns = await fivetranService.getTableColumns(id, schemaName, tableName);
    res.json(columns);
  } catch (error) {
    next(error);
  }
});

// Helper: Map Fivetran status to our status
function mapStatus(fivetranStatus) {
  const stateMapping = {
    'connected': 'healthy',
    'broken': 'error',
    'initial_sync': 'syncing',
    'paused': 'paused'
  };
  return stateMapping[fivetranStatus.setup_state] || 'unknown';
}

module.exports = router;
