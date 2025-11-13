import React from "react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 text-gray-500 opacity-100 transition-opacity duration-300">
      <span className="text-sm">Analyzing</span>
      <div className="flex gap-1">
        <span 
          className="w-1.5 h-1.5 rounded-full bg-[#3551F3] animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <span 
          className="w-1.5 h-1.5 rounded-full bg-[#3551F3] animate-bounce"
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        />
        <span 
          className="w-1.5 h-1.5 rounded-full bg-[#3551F3] animate-bounce"
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        />
      </div>
    </div>
  );
}

