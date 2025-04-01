import React from 'react';
import { useToast } from '@/hooks/useToast';

export function ToastContainer() {
  const { toast } = useToast();
  const Icon = toast?.icon;

  if (!toast) return null;

  return (
    <div 
      className={`
        fixed top-16 right-4 z-50
        flex items-center gap-2 
        bg-gray-900 text-white 
        px-4 py-3 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        translate-y-0 opacity-100
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {toast.message}
    </div>
  );
} 