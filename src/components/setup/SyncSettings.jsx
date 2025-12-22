import React, { useEffect, useState } from 'react';
import { useSetupWizardStore } from '@/stores/useSetupWizardStore';
import * as connectorService from '@/services/connectorService';

export function SyncSettings({ onNext }) {
  const { config, updateConfig, validationErrors, addError, clearErrors } =
    useSetupWizardStore();
  const [frequencies, setFrequencies] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [connectorName, setConnectorName] = useState(config.name || '');

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const freqs = await connectorService.listSyncFrequencies();
      const rngs = await connectorService.listHistoricalRanges();
      setFrequencies(freqs);
      setRanges(rngs);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const handleContinue = () => {
    clearErrors();

    if (!connectorName.trim()) {
      addError('name', 'Connector name is required');
      return;
    }

    updateConfig({
      name: connectorName,
      frequency: config.frequency,
      historicalRange: config.historicalRange,
    });

    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Connector Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Connector Name
        </label>
        <input
          type="text"
          value={connectorName}
          onChange={(e) => setConnectorName(e.target.value)}
          placeholder="e.g., My Google Ads Account"
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3] transition-colors ${
            validationErrors.name ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {validationErrors.name && (
          <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">This will help you identify this connector</p>
      </div>

      {/* Sync Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Sync Frequency
        </label>
        <div className="space-y-2">
          {frequencies.map((freq) => (
            <label
              key={freq.id}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="frequency"
                value={freq.id}
                checked={config.frequency === freq.id}
                onChange={(e) => updateConfig({ frequency: e.target.value })}
                className="w-4 h-4 text-[#3551F3] cursor-pointer"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{freq.label}</p>
                {freq.recommended && (
                  <p className="text-xs text-blue-600">Recommended</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Historical Range */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Historical Data Range
        </label>
        <select
          value={config.historicalRange}
          onChange={(e) => updateConfig({ historicalRange: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]"
        >
          {ranges.map((range) => (
            <option key={range.id} value={range.id}>
              {range.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          How far back we'll sync data from your account
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 Your sync settings can be changed anytime. We recommend starting with "Every hour"
          and "Last 90 days" for optimal performance.
        </p>
      </div>

      {/* Continue Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleContinue}
          className="w-full px-6 py-3 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
