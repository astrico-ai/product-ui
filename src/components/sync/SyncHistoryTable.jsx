import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function SyncHistoryTable({ syncHistory, onViewDetails }) {
  const [expandedSyncId, setExpandedSyncId] = useState(null);

  if (!syncHistory || syncHistory.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-500">No sync history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 font-medium text-sm text-gray-700">
        <div>Time</div>
        <div>Duration</div>
        <div>Rows</div>
        <div>Status</div>
        <div></div>
      </div>

      {/* Table Rows */}
      <div>
        {syncHistory.map((sync) => (
          <div key={sync.id} className="border-b border-gray-100 last:border-b-0">
            {/* Main Row */}
            <button
              onClick={() =>
                setExpandedSyncId(expandedSyncId === sync.id ? null : sync.id)
              }
              className="w-full px-6 py-4 hover:bg-gray-50 transition-colors grid grid-cols-5 gap-4 items-center text-left"
            >
              {/* Time */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(sync.startTime).toLocaleString()}
                </p>
              </div>

              {/* Duration */}
              <div>
                <p className="text-sm text-gray-600">
                  {sync.duration ? `${sync.duration}s` : '-'}
                </p>
              </div>

              {/* Rows */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {(sync.rowsProcessed / 1000).toFixed(1)}K
                </p>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    sync.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {sync.status === 'success' ? '✓ Success' : '✗ Failed'}
                </span>
              </div>

              {/* Expand */}
              <div className="flex justify-end">
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSyncId === sync.id ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Expanded Details */}
            {expandedSyncId === sync.id && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                {/* Error Message */}
                {sync.errorMessage && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{sync.errorMessage}</p>
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
                            {(table.rowsProcessed || 0).toLocaleString()} rows
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

                {/* Detailed Timing */}
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-gray-600">Started</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(sync.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ended</p>
                    <p className="text-gray-900 font-medium">
                      {sync.endTime
                        ? new Date(sync.endTime).toLocaleTimeString()
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="text-gray-900 font-medium">
                      {sync.duration ? `${Math.floor(sync.duration / 60)}m ${sync.duration % 60}s` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
