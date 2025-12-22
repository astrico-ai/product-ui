import React from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { ConnectorStatusBadge } from './ConnectorStatusBadge';
import { ConnectorLogo } from './ConnectorLogo';
import { ConnectorMetrics } from './ConnectorMetrics';
import { cn } from '@/lib/utils';

export function ConnectorCard({
  connector,
  onClick,
  onConnect,
  state = 'default',
  className,
  showMetrics = true,
  showActions = true,
  actions = [],
}) {
  // Determine styling based on state
  const getStateStyles = () => {
    const baseStyle =
      'bg-white border rounded-xl p-6 transition-all duration-300 cursor-pointer';
    const borderStyle = 'border-gray-200';

    switch (state) {
      case 'hover':
        return cn(baseStyle, borderStyle, 'shadow-lg -translate-y-1');
      case 'loading':
        return cn(baseStyle, borderStyle, 'opacity-75');
      case 'connected':
        return cn(baseStyle, 'border-green-200 bg-green-50/30');
      case 'error':
        return cn(baseStyle, 'border-red-200 bg-red-50/30');
      case 'paused':
        return cn(baseStyle, borderStyle, 'opacity-60');
      case 'coming_soon':
        return cn(baseStyle, borderStyle, 'opacity-75 cursor-not-allowed');
      case 'default':
      default:
        return cn(baseStyle, borderStyle, 'hover:shadow-lg hover:-translate-y-1');
    }
  };

  return (
    <div
      className={cn(getStateStyles(), className)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      aria-label={`${connector.name} connector`}
    >
      {/* Header with Logo and Status */}
      <div className="flex items-start justify-between mb-4">
        <ConnectorLogo logo={connector.logo} name={connector.name} size="lg" />

        <div className="flex items-center gap-2">
          {state === 'loading' && (
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#3551F3]"></div>
          )}
          {state === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <ConnectorStatusBadge
            status={connector.status}
            isActive={state === 'loading' || state === 'connected'}
          />
        </div>
      </div>

      {/* Name and Description */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {connector.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {connector.description}
        </p>
      </div>

      {/* Metrics */}
      {showMetrics && connector.metrics && (
        <ConnectorMetrics metrics={connector.metrics} size="sm" />
      )}

      {/* Error Message */}
      {state === 'error' && connector.errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{connector.errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-4">
          {actions.length > 0 ? (
            actions.map((action) => (
              <button
                key={action.id}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                disabled={action.disabled}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  action.variant === 'primary'
                    ? 'bg-[#3551F3] text-white hover:bg-[#2B41D9] disabled:opacity-50'
                    : 'text-[#3551F3] hover:bg-blue-50 disabled:opacity-50'
                )}
              >
                {action.label}
              </button>
            ))
          ) : (
            <>
              {connector.status === 'available' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnect?.();
                  }}
                  className="flex-1 px-3 py-2 bg-[#3551F3] text-white rounded-lg text-sm font-medium hover:bg-[#2B41D9] transition-colors flex items-center justify-center gap-1"
                >
                  Connect
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Loading State */}
      {state === 'loading' && (
        <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3551F3] mb-2"></div>
            <p className="text-xs text-gray-600">Setting up...</p>
          </div>
        </div>
      )}
    </div>
  );
}
