import React from 'react';
import { ChevronRight, Edit2 } from 'lucide-react';
import { useSetupWizardStore } from '@/stores/useSetupWizardStore';
import { AVAILABLE_CONNECTORS } from '@/services/mockData';

export function ReviewAndConfirm({ onNext }) {
  const { connectorTypeId, config, getFormData, goToStep } = useSetupWizardStore();

  const connector = AVAILABLE_CONNECTORS.find((c) => c.id === connectorTypeId);
  const formData = getFormData();

  const frequencyLabel = {
    '15m': 'Every 15 minutes',
    '1h': 'Every hour',
    '6h': 'Every 6 hours',
    '24h': 'Daily',
  }[config.frequency] || config.frequency;

  const rangeLabel = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '180d': 'Last 180 days',
    '1y': 'Last year',
    all: 'All historical data',
  }[config.historicalRange] || config.historicalRange;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium">
          ✓ Ready to set up your connector
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Review your settings before confirming
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Connector Info */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">Connector</p>
            <button
              onClick={() => goToStep('oauth')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={connector?.logo}
              alt={connector?.name}
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{connector?.name}</p>
              <p className="text-xs text-gray-600">{formData.email}</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">Connector Name</p>
            <button
              onClick={() => goToStep('sync')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-700">{config.name}</p>
        </div>

        {/* Tables */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">Tables</p>
            <button
              onClick={() => goToStep('schema')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="space-y-2">
            {config.tables?.map((table) => (
              <div
                key={table.tableId}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#3551F3]"></div>
                <span className="text-sm text-gray-700">{table.tableName}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            {config.tables?.length || 0} table{config.tables?.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Sync Settings */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">Sync Settings</p>
            <button
              onClick={() => goToStep('sync')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Frequency</p>
              <p className="text-sm text-gray-900">{frequencyLabel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Historical Range</p>
              <p className="text-sm text-gray-900">{rangeLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-900 font-medium">
          Everything looks good! Your first sync will begin immediately after setup.
        </p>
        <p className="text-xs text-green-700 mt-2">
          Expected completion time: 15-20 minutes depending on data size
        </p>
      </div>

      {/* Continue Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onNext}
          className="w-full px-6 py-3 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium flex items-center justify-center gap-2"
        >
          Confirm & Setup
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
