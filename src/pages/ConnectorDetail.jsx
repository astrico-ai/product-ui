import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { useConnectorStore } from '@/stores/useConnectorStore';

export default function ConnectorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getConnector, loading } = useConnectorStore();
  const [connector, setConnector] = useState(null);

  useEffect(() => {
    const conn = getConnector(id);
    setConnector(conn);
  }, [id]);

  if (loading || !connector) {
    return (
      <MainLayout>
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3551F3] mb-4"></div>
              <p className="text-gray-600">Loading connector...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/connectors/dashboard')}
          className="flex items-center gap-2 text-[#3551F3] hover:text-[#2B41D9] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Connector Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-gray-50 rounded-lg flex items-center justify-center">
                <img
                  src={
                    connector.schema?.connectorId === 'google-ads'
                      ? 'https://www.gstatic.com/images/branding/product/1x/googleg_40dp.png'
                      : 'https://via.placeholder.com/60'
                  }
                  alt="Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {connector.name}
                </h1>
                <p className="text-gray-600 mb-2">{connector.email}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      connector.status === 'healthy'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  ></span>
                  <span className="text-sm font-medium text-gray-700">
                    {connector.status === 'healthy' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Play className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Pause className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Tables</p>
            <p className="text-3xl font-bold text-gray-900">
              {connector.config?.tables?.length || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Rows</p>
            <p className="text-3xl font-bold text-gray-900">
              {(connector.metrics?.totalRowsProcessed / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {connector.metrics?.successRate || 0}%
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Syncs</p>
            <p className="text-3xl font-bold text-gray-900">
              {connector.metrics?.totalSyncs || 0}
            </p>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Configuration
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">Sync Frequency</p>
              <p className="text-lg font-semibold text-gray-900">
                {connector.config?.frequency || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Historical Range</p>
              <p className="text-lg font-semibold text-gray-900">
                {connector.config?.historicalRange || 'Not set'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-3">Enabled Tables</p>
            <div className="flex flex-wrap gap-2">
              {connector.config?.tables?.map((table) => (
                <span
                  key={table.tableId}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                >
                  {table.tableName}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
