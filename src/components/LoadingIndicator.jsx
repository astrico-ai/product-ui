import React, { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
  'Analyzing your documents...',
  'Processing PDF content...',
  'Extracting information...',
  'Reviewing document details...',
  'Preparing response...'
];

export function LoadingIndicator({ isActive = true }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isActive) {
      // Fade out when not active
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    
    // Rotate messages every 2.5 seconds
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive && !isVisible) {
    return null;
  }

  return (
    <div 
      className={`flex items-center gap-3 text-gray-600 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Spinning loader */}
      <div className="relative w-5 h-5">
        <div 
          className="absolute inset-0 border-2 border-[#3551F3] border-t-transparent rounded-full animate-spin"
          style={{ animationDuration: '1s' }}
        />
      </div>
      
      {/* Rotating message */}
      <span 
        className="text-sm font-medium transition-opacity duration-300"
        key={currentMessageIndex}
      >
        {STATUS_MESSAGES[currentMessageIndex]}
      </span>
    </div>
  );
}

