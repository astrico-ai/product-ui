import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import * as connectorService from '@/services/connectorService';

export default function ConnectorCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState(null);
  const [selectedTables, setSelectedTables] = useState(new Set());
  const [connectorName, setConnectorName] = useState('');
  const [error, setError] = useState(null);
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('schema');
  const hasRun = useRef(false);

  console.log('[CALLBACK PAGE] Component mounted - User returned from Connect Card');

  useEffect(() => {
    // Guard to prevent StrictMode double-invocation in development
    if (hasRun.current) {
      console.log('[CALLBACK PAGE] Effect already ran, skipping duplicate execution');
      return;
    }
    hasRun.current = true;

    console.log('[CALLBACK PAGE] useEffect running - Starting loadSchema');
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      setLoading(true);
      console.log('[CALLBACK] loadSchema called at:', new Date().toISOString());

      const connectionId = localStorage.getItem('currentConnectionId');
      const name = localStorage.getItem('currentConnectorName');

      console.log('[CALLBACK] Retrieved from localStorage:', { connectionId, name });

      if (!connectionId) {
        throw new Error('Connection ID not found. Please try connecting again.');
      }

      setConnectorName(name);

      // Step 1: Wait 5 seconds to ensure connection is fully set up
      console.log('[CALLBACK] Waiting 5 seconds before triggering sync at:', new Date().toISOString());
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('[CALLBACK] 5 second wait completed at:', new Date().toISOString());

      // Step 2: Trigger sync API
      console.log('[CALLBACK] About to call triggerSync API at:', new Date().toISOString());
      try {
        await connectorService.triggerSync(connectionId);
        console.log('[CALLBACK] Sync API responded successfully at:', new Date().toISOString());
      } catch (syncError) {
        console.error('[CALLBACK] Sync API failed:', syncError.message);
        throw new Error('Failed to trigger sync: ' + syncError.message);
      }

      // Step 3: Retrieve schema after sync succeeds
      console.log('[CALLBACK] About to fetch schema at:', new Date().toISOString());
      const schemaData = await connectorService.getConnectionSchema(connectionId);
      console.log('[CALLBACK] Schema fetched successfully at:', new Date().toISOString());
      setSchema(schemaData);

      const enabled = new Set(
        schemaData.tables
          .filter(table => table.enabled)
          .map(table => table.name)
      );
      setSelectedTables(enabled);
      setExpandedTables(new Set(enabled));

      setLoading(false);
    } catch (err) {
      console.error('[CALLBACK] Failed to load schema:', err);
      setError(err.message || 'Failed to load schema. Please try again.');
      setLoading(false);
    }
  };

  const toggleTable = (tableName) => {
    const newSelected = new Set(selectedTables);
    if (newSelected.has(tableName)) {
      newSelected.delete(tableName);
    } else {
      newSelected.add(tableName);
    }
    setSelectedTables(newSelected);
  };

  const toggleExpanded = (tableName) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const handleConfirm = async () => {
    localStorage.removeItem('currentConnectionId');
    localStorage.removeItem('currentConnectorName');
    navigate('/connectors/dashboard');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/connectors')}
            className="px-6 py-2 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium"
          >
            Back to Connectors
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3551F3] mb-4"></div>
          <p className="text-gray-600 mb-2">Setting up your connector...</p>
          <p className="text-sm text-gray-500">Discovering available tables from {connectorName}</p>
        </div>
      </div>
    );
  }

  const filteredTables = schema.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/connectors')}
            className="flex items-center gap-2 text-[#3551F3] hover:text-[#2B41D9] font-medium mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Connections
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <span>{connectorName}</span>
              </h1>
              <p className="text-gray-600">{connectorName} → Astrico</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTables.size === schema.totalTables}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTables(new Set(schema.tables.map(t => t.name)));
                    } else {
                      setSelectedTables(new Set());
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-[#3551F3]"
                />
                <span className="text-sm font-medium text-gray-700">Enabled</span>
              </label>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium"
              >
                Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto flex gap-8">
          {['Status', 'Schema', 'Usage', 'Setup'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === tab.toLowerCase()
                  ? 'border-[#3551F3] text-[#3551F3]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by table name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]"
              />
            </div>
            <button className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
              Schema change settings
            </button>
          </div>

          {/* Schema Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Panel - Tables */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Summary */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900 mb-1">Schema</h3>
                <p className="text-sm text-gray-600">Select data to sync</p>
              </div>

              {/* Tables List */}
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {/* Schema Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTables.size === filteredTables.length && filteredTables.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTables(new Set(filteredTables.map(t => t.name)));
                      } else {
                        setSelectedTables(new Set());
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-[#3551F3]"
                  />
                  <button
                    onClick={() => {
                      if (expandedTables.size === 0) {
                        setExpandedTables(new Set(filteredTables.map(t => t.name)));
                      } else {
                        setExpandedTables(new Set());
                      }
                    }}
                    className="font-semibold text-gray-900 flex items-center gap-2"
                  >
                    {expandedTables.size > 0 ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {connectorName}
                  </button>
                  <span className="ml-auto text-sm font-medium text-blue-600">
                    {selectedTables.size}/{schema.totalTables} tables selected
                  </span>
                </div>

                {/* Tables */}
                {filteredTables.map((table) => (
                  <div key={table.name}>
                    <div className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedTables.has(table.name)}
                        onChange={() => toggleTable(table.name)}
                        className="w-4 h-4 rounded border-gray-300 text-[#3551F3]"
                      />
                      <button
                        onClick={() => toggleExpanded(table.name)}
                        className="flex items-center gap-1 flex-1 text-left"
                      >
                        {expandedTables.has(table.name) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-medium text-gray-900">{table.name}</span>
                      </button>
                      <span className="text-xs text-blue-600 font-medium ml-auto hover:underline cursor-pointer">
                        Re-sync
                      </span>
                    </div>

                    {/* Expanded Columns */}
                    {expandedTables.has(table.name) && (
                      <div className="bg-gray-50 border-t border-gray-200 pl-6">
                        <div className="px-6 py-2 flex items-center gap-3 text-sm text-gray-600 bg-gray-50">
                          <span className="ml-8">{table.columnCount}/{table.columnCount} columns selected</span>
                        </div>
                        {/* Column items would go here */}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Column Hashing */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Column hashing</h3>
                <p className="text-sm text-gray-600 mt-1">Columns</p>
              </div>
              <div className="p-6 text-sm text-gray-600">
                Open a table to view this
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
