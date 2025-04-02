import React from 'react';
import { X } from 'lucide-react';

export function VideoPlayer({ isOpen, onClose, videoUrl }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 shadow-sm z-10"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="aspect-video w-full rounded-xl overflow-hidden">
          <iframe
            src={videoUrl.replace('/view', '/preview')}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
            title="Training Video"
          />
        </div>
      </div>
    </div>
  );
} 