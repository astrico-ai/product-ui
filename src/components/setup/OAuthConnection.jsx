import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { useSetupWizardStore } from '@/stores/useSetupWizardStore';
import * as connectorService from '@/services/connectorService';
import { ConnectorLogo } from '@/components/connectors/ConnectorLogo';
import { AVAILABLE_CONNECTORS } from '@/services/mockData';

export function OAuthConnection({ onNext, onPrev }) {
  const { connectorTypeId, setOAuthData, validationErrors, addError, clearErrors } =
    useSetupWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connector = AVAILABLE_CONNECTORS.find((c) => c.id === connectorTypeId);

  if (!connector) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Connector not found</p>
      </div>
    );
  }

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      clearErrors();

      // Simulate OAuth flow
      const authData = await connectorService.authenticateConnector(connectorTypeId);

      setOAuthData(authData);
      setLoading(false);

      // Auto-advance to next step
      setTimeout(() => {
        onNext();
      }, 500);
    } catch (err) {
      setError(err.message);
      addError('oauth', err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connector Info */}
      <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <ConnectorLogo logo={connector.logo} name={connector.name} size="md" />
        <div>
          <h2 className="font-semibold text-gray-900">{connector.name}</h2>
          <p className="text-sm text-gray-600">{connector.description}</p>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">What we'll access:</h3>
        <div className="space-y-2">
          {connector.permissions?.map((permission, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">{permission}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Time */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-900">
          ⏱️ Expected setup time: {connector.setupTime}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Authentication failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Connect Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full px-6 py-3 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Connecting...' : `Continue with ${connector.name}`}
        </button>
      </div>

      {/* Security Note */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          🔒 Your credentials are securely transmitted and never stored in plain text. We only
          request the minimum permissions needed.
        </p>
      </div>
    </div>
  );
}
