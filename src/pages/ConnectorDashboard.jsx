import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { Plus, ArrowRight } from 'lucide-react';
import { useConnectorStore } from '@/stores/useConnectorStore';

export default function ConnectorDashboard() {
  const navigate = useNavigate();
  const { connectors, fetchConnectors, loading } = useConnectorStore();

  useEffect(() => {
    fetchConnectors();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connected Sources
            </h1>
            <p className="text-gray-600">
              Manage your connected data sources and view sync status
            </p>
          </div>
          <button
            onClick={() => navigate('/connectors')}
            className="px-4 py-2 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        {/* Connected Connectors */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3551F3] mb-4"></div>
              <p className="text-gray-600">Loading connectors...</p>
            </div>
          </div>
        ) : connectors.length === 0 ? (
          <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-4">No connected sources yet</p>
              <button
                onClick={() => navigate('/connectors')}
                className="px-4 py-2 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors inline-flex items-center gap-2"
              >
                Browse Connectors
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {connectors.map((connector) => (
              <div
                key={connector.id}
                onClick={() => navigate(`/connectors/${connector.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img
                          src={
                            connector.schema?.connectorId === 'google-ads'
                              ? 'https://www.gstatic.com/images/branding/product/1x/googleg_40dp.png'
                              : 'https://via.placeholder.com/40'
                          }
                          alt="Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {connector.name}
                        </h3>
                        <p className="text-sm text-gray-500">{connector.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            connector.status === 'healthy'
                              ? 'bg-green-500'
                              : connector.status === 'warning'
                                ? 'bg-yellow-500'
                                : connector.status === 'error'
                                  ? 'bg-red-500'
                                  : 'bg-gray-300'
                          }`}
                        ></span>
                        <span className="text-sm font-medium text-gray-700">
                          {connector.status === 'healthy'
                            ? 'Active'
                            : connector.status === 'warning'
                              ? 'Warning'
                              : connector.status === 'error'
                                ? 'Error'
                                : 'Paused'}
                        </span>
                      </div>
                    </div>

                    {/* Sync Info */}
                    <div className="text-sm text-gray-600">
                      <p>
                        Last sync:{' '}
                        {connector.lastSyncTime
                          ? new Date(connector.lastSyncTime).toLocaleString()
                          : 'Never'}
                      </p>
                      <p>
                        Next sync:{' '}
                        {connector.nextSyncTime
                          ? new Date(connector.nextSyncTime).toLocaleString()
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-4 ml-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {connector.config?.tables?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Tables</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {(connector.metrics?.totalRowsProcessed / 1000).toFixed(
                          0
                        )}
                        K
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {connector.metrics?.successRate || 0}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        100%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Uptime</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/connectors/${connector.id}`);
                    }}
                    className="text-sm text-[#3551F3] hover:text-[#2B41D9] font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/connectors/${connector.id}/sync-history`);
                    }}
                    className="text-sm text-[#3551F3] hover:text-[#2B41D9] font-medium"
                  >
                    Sync History
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    Configure
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
