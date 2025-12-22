import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useConnectorStore } from '@/stores/useConnectorStore';

export default function SyncHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getConnector } = useConnectorStore();
  const [connector, setConnector] = useState(null);
  const [expandedSync, setExpandedSync] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const conn = getConnector(id);
    setConnector(conn);
  }, [id]);

  if (!connector) {
    return (
      <MainLayout>
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-gray-600">Connector not found</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const filteredHistory = connector.syncHistory?.filter((sync) => {
    if (filterStatus === 'all') return true;
    return sync.status === filterStatus;
  }) || [];

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(`/connectors/${id}`)}
          className="flex items-center gap-2 text-[#3551F3] hover:text-[#2B41D9] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Connector
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sync History: {connector.name}
          </h1>
          <p className="text-gray-600">
            View all past syncs and their details
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]"
          >
            <option value="all">All Syncs</option>
            <option value="success">Successful</option>
            <option value="error">Failed</option>
          </select>
        </div>

        {/* Sync History Table */}
        {filteredHistory.length === 0 ? (
          <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No sync history found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((sync) => (
              <div
                key={sync.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all"
              >
                {/* Summary Row */}
                <button
                  onClick={() =>
                    setExpandedSync(expandedSync === sync.id ? null : sync.id)
                  }
                  className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {sync.status === 'success' ? (
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      ) : (
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      )}
                    </div>

                    {/* Time */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {new Date(sync.startTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Duration: {sync.duration || 'N/A'} seconds
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-8 mr-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {(sync.rowsProcessed / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-gray-500">Rows</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          sync.status === 'success'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {sync.status === 'success' ? 'Success' : 'Failed'}
                      </p>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedSync === sync.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Details Row */}
                {expandedSync === sync.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    {/* Error Message */}
                    {sync.errorMessage && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900">
                          Error
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {sync.errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Table Details */}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        Tables Processed
                      </p>
                      <div className="space-y-2">
                        {sync.tables?.map((table) => (
                          <div
                            key={table.name}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {table.name}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                {table.rowsProcessed?.toLocaleString() || 0} rows
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                                  table.status === 'complete'
                                    ? 'bg-green-100 text-green-700'
                                    : table.status === 'error'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {table.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredHistory.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-2">Total Syncs</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredHistory.length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-2">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">
                {(
                  (filteredHistory.filter((s) => s.status === 'success').length /
                    filteredHistory.length) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-2">Total Rows Processed</p>
              <p className="text-3xl font-bold text-gray-900">
                {(
                  filteredHistory.reduce((sum, s) => sum + (s.rowsProcessed || 0), 0) /
                  1000000
                ).toFixed(1)}
                M
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
