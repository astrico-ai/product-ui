import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonLoader({ className, count = 3, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
          >
            {/* Logo and Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="text-center">
                  <div className="h-6 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn('bg-white border border-gray-200 rounded-xl', className)}>
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1">
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border-b border-gray-100 p-4 flex gap-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex-1">
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={cn('space-y-3 animate-pulse', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return null;
}
