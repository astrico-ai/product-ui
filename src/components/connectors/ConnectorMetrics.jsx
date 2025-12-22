import React from 'react';
import { cn } from '@/lib/utils';

export function ConnectorMetrics({ metrics, size = 'md', layout = 'grid' }) {
  if (!metrics) return null;

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const metricItems = [
    {
      label: 'Tables',
      value: metrics.tables || 0,
      format: (v) => v,
    },
    {
      label: 'Rows',
      value: metrics.totalRowsProcessed || 0,
      format: (v) => formatNumber(v),
    },
    {
      label: 'Success',
      value: metrics.successRate || 0,
      format: (v) => v.toFixed(1) + '%',
      color: 'text-green-600',
    },
    {
      label: 'Uptime',
      value: metrics.uptime || 0,
      format: (v) => v.toFixed(1) + '%',
      color: 'text-blue-600',
    },
  ];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (layout === 'row') {
    return (
      <div className="flex items-center gap-4">
        {metricItems.map((item, idx) => (
          <div key={idx} className="text-center">
            <p className={cn('font-bold text-gray-900', sizeClasses[size])}>
              {item.format(item.value)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="grid grid-cols-4 gap-3">
      {metricItems.map((item, idx) => (
        <div key={idx} className="text-center">
          <p
            className={cn(
              'font-bold',
              sizeClasses[size],
              item.color || 'text-gray-900'
            )}
          >
            {item.format(item.value)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
