import React from 'react';
import { cn } from '@/lib/utils';

export function ConnectorStatusBadge({ status, isActive = false, size = 'sm' }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'coming_soon':
        return 'bg-amber-100 text-amber-700';
      case 'healthy':
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'paused':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'coming_soon':
        return 'Coming Soon';
      case 'healthy':
      case 'active':
        return 'Active';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      case 'paused':
        return 'Paused';
      default:
        return 'Unknown';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className="relative inline-block">
      <span
        className={cn(
          'font-medium rounded-full',
          sizeClass,
          getStatusStyles()
        )}
      >
        {getStatusLabel()}
      </span>

      {/* Pulse animation for active syncs */}
      {isActive && (
        <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
      )}
    </div>
  );
}
