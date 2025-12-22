import React from 'react';
import { cn } from '@/lib/utils';

export function SyncProgressBar({ progress = 0, status = 'in_progress', animated = true }) {
  const getProgressColor = () => {
    if (status === 'complete') return 'from-green-500 to-green-600';
    if (status === 'error') return 'from-red-500 to-red-600';
    if (status === 'paused') return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  const getBackgroundColor = () => {
    if (status === 'error') return 'bg-red-100';
    return 'bg-gray-200';
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className={cn('h-3 rounded-full overflow-hidden', getBackgroundColor())}>
        <div
          className={cn(
            `h-full bg-gradient-to-r transition-all duration-500 ease-out`,
            getProgressColor(),
            animated && progress > 0 && progress < 100 && 'animate-pulse'
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Animated shimmer effect */}
          {animated && progress > 0 && progress < 100 && (
            <div className="h-full bg-white/30 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Progress Text */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-medium text-gray-600">
          {status === 'complete'
            ? '✓ Complete'
            : status === 'error'
              ? '✗ Error'
              : status === 'paused'
                ? '⏸ Paused'
                : 'In Progress'}
        </span>
        <span className="text-xs font-semibold text-gray-900">{progress}%</span>
      </div>
    </div>
  );
}
