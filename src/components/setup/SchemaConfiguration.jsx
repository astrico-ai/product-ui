import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { useSetupWizardStore } from '@/stores/useSetupWizardStore';
import * as connectorService from '@/services/connectorService';

export function SchemaConfiguration({ onNext, onPrev }) {
  const { connectorTypeId, updateConfig, config, validationErrors } = useSetupWizardStore();
  const [schema, setSchema] = useState(null);
  const [selectedTables, setSelectedTables] = useState(new Set(config.tables?.map((t) => t.tableId) || []));
  const [expandedTable, setExpandedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchema();
  }, [connectorTypeId]);

  const loadSchema = async () => {
    try {
      setLoading(true);
      const schemaData = await connectorService.getConnectorSchema(connectorTypeId);
      setSchema(schemaData);
    } catch (error) {
      console.error('Failed to load schema:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableToggle = (tableId) => {
    const newSelected = new Set(selectedTables);
    if (newSelected.has(tableId)) {
      newSelected.delete(tableId);
    } else {
      newSelected.add(tableId);
    }
    setSelectedTables(newSelected);
  };

  const handleContinue = () => {
    const tables = Array.from(selectedTables).map((tableId) => {
      const table = schema.tables.find((t) => t.id === tableId);
      return {
        tableId,
        tableName: table.name,
        enabled: true,
        columns: table.columns.map((c) => ({ name: c.name, enabled: true })),
      };
    });

    updateConfig({ tables });
    onNext();
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3551F3] mb-4"></div>
        <p className="text-gray-600">Loading schema...</p>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Failed to load schema</p>
      </div>
    );
  }

  const estimatedRows = schema.tables?.reduce((sum, t) => sum + t.rowCount, 0) || 0;
  const selectedRowCount = schema.tables
    ?.filter((t) => selectedTables.has(t.id))
    .reduce((sum, t) => sum + t.rowCount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-900">
          Select which tables you want to sync. You can change this later.
        </p>
      </div>

      {/* Error Message */}
      {validationErrors.tables && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{validationErrors.tables}</p>
        </div>
      )}

      {/* Tables List */}
      <div className="space-y-2">
        {schema.tables?.map((table) => (
          <div key={table.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Row */}
            <button
              onClick={() => handleTableToggle(table.id)}
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <input
                  type="checkbox"
                  checked={selectedTables.has(table.id)}
                  onChange={() => {}}
                  className="w-5 h-5 text-[#3551F3] rounded cursor-pointer"
                />
                <div>
                  <p className="font-medium text-gray-900">{table.name}</p>
                  <p className="text-xs text-gray-500">
                    {table.rowCount.toLocaleString()} rows •{' '}
                    {table.columns.length} columns
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedTable === table.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded View */}
            {expandedTable === table.id && (
              <div className="border-t border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900 mb-3">Columns:</p>
                <div className="space-y-2">
                  {table.columns?.map((column) => (
                    <div key={column.name} className="text-xs">
                      <p className="font-mono text-gray-700">{column.name}</p>
                      <p className="text-gray-500">{column.type}</p>
                      {column.description && (
                        <p className="text-gray-600 mt-1">{column.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Selected Tables</p>
            <p className="text-xs text-gray-600 mt-1">
              {selectedTables.size} of {schema.tables?.length || 0} tables
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {(selectedRowCount / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-600">estimated rows</p>
          </div>
        </div>
      </div>

      {/* Select All / Deselect All */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedTables(new Set(schema.tables?.map((t) => t.id) || []))}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Select All
        </button>
        <button
          onClick={() => setSelectedTables(new Set())}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Continue Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleContinue}
          disabled={selectedTables.size === 0}
          className="w-full px-6 py-3 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
