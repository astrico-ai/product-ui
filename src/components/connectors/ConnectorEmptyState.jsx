import React from 'react';
import { Plus, Search } from 'lucide-react';

export function ConnectorEmptyState({
  title = 'No connectors found',
  description = 'Get started by connecting your first data source',
  icon: Icon = Search,
  action,
}) {
  return (
    <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-100">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="p-3 bg-blue-50 rounded-full">
            <Icon className="w-8 h-8 text-[#3551F3]" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-sm">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
