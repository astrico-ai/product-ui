import React, { useState, useEffect } from "react";

export function TypewriterText({ text, delay = 20, onComplete }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  // Process markdown for bold text and headings
  const processMarkdown = (text) => {
    // Split by lines to process headings
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Check if line is a heading (starts with ##)
      if (line.trim().startsWith('## ')) {
        const headingText = line.trim().substring(3); // Remove '## '
        return (
          <div key={`line-${lineIndex}`} style={{
            color: '#4169E1',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginTop: '1rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {headingText}
          </div>
        );
      }

      // Process bold text within the line
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const processedParts = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      });

      return (
        <div key={`line-${lineIndex}`}>
          {processedParts}
          {lineIndex < lines.length - 1 && '\n'}
        </div>
      );
    });
  };

  return <div className="whitespace-pre-wrap">{processMarkdown(displayText)}</div>;
} 