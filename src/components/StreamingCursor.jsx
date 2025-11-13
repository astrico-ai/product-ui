import React from "react";

export function StreamingCursor() {
  return (
    <span 
      className="inline-block w-0.5 h-4 bg-[#3551F3] ml-1.5 align-baseline"
      style={{
        animation: 'blink 1s step-end infinite',
        verticalAlign: '0.15em'
      }}
    />
  );
}

// Add CSS animation for smooth blinking (text cursor style)
if (typeof document !== 'undefined') {
  const styleId = 'streaming-cursor-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes blink {
        0%, 50% {
          opacity: 1;
        }
        51%, 100% {
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

