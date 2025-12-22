import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export function ConnectorLogo({ logo, name, size = 'md', className }) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const bgClass = size === 'sm' ? 'bg-gray-100' : 'bg-gray-50';

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg flex-shrink-0',
        sizeClasses[size],
        bgClass,
        className
      )}
    >
      {!imageError ? (
        <img
          src={logo}
          alt={`${name} logo`}
          className="max-h-full max-w-full object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-gray-200 rounded text-gray-600">
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}
