import React from 'react';

export function Notification({ message, icon: Icon, show = false }) {
  if (!show) return null;

  return (
    <div 
      className={`
        fixed top-16 right-4 z-50
        flex items-center gap-2 
        bg-gray-900 text-white 
        px-4 py-3 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {message}
    </div>
  );
} 