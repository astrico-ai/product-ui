import React, { useEffect } from 'react';
import { Pause, Play, X } from 'lucide-react';
import { useSyncStore } from '@/stores/useSyncStore';
import { SyncProgressBar } from './SyncProgressBar';

export function SyncMonitor({ connectorId, compact = false }) {
  const { getActiveSync, isSyncPaused, pauseSync, resumeSync, cancelSync } = useSyncStore();

  const sync = getActiveSync(connectorId);
  const isPaused = isSyncPaused(connectorId);

  if (!sync) {
    return null;
  }

  const estimatedTimeRemaining = Math.max(
    0,
    Math.round((new Date(sync.estimatedEndTime) - new Date()) / 60000)
  );

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-gray-900">Syncing...</p>
          <span className="text-sm font-semibold text-gray-700">{sync.progress}%</span>
        </div>
        <SyncProgressBar progress={sync.progress} status={isPaused ? 'paused' : 'in_progress'} />
        <p className="text-xs text-gray-600 mt-2">
          Est. {estimatedTimeRemaining} minutes remaining
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Sync Progress</h3>
        <div className="flex items-center gap-2">
          {isPaused ? (
            <button
              onClick={() => resumeSync(connectorId, sync.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Resume"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => pauseSync(connectorId, sync.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => cancelSync(connectorId)}
            className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <SyncProgressBar progress={sync.progress} status={isPaused ? 'paused' : 'in_progress'} />
        <p className="text-xs text-gray-600 mt-3">
          Started: {new Date(sync.startTime).toLocaleTimeString()}
          {estimatedTimeRemaining > 0 && ` • Est. ${estimatedTimeRemaining} min remaining`}
        </p>
      </div>

      {/* Table Progress */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900 mb-4">Tables</p>
        {sync.tables?.map((table) => (
          <div key={table.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {table.status === 'complete' && (
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
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
                  </span>
                )}
                {table.status === 'in_progress' && (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0"></div>
                )}
                {table.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                )}
                <span className="text-sm text-gray-900 font-medium">{table.name}</span>
              </div>
              <span className="text-xs text-gray-600">
                {table.rowsProcessed?.toLocaleString() || 0} rows
              </span>
            </div>
            {table.progress > 0 && (
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${table.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {sync.tables
              ?.reduce((sum, t) => sum + (t.rowsProcessed || 0), 0)
              .toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Rows Processed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {sync.tables?.filter((t) => t.status === 'complete').length || 0}/
            {sync.tables?.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tables Complete</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {Math.round((new Date() - new Date(sync.startTime)) / 60000)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Minutes Elapsed</p>
        </div>
      </div>
    </div>
  );
}
