import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterText({ content, speed = 10, onComplete }: TypewriterTextProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [content, currentIndex, speed, onComplete]);

  // Split text by newlines and map to paragraphs
  const paragraphs = displayedContent.split('\n').map((paragraph, index) => (
    <p key={index} className="mb-4 last:mb-0">
      {paragraph}
    </p>
  ));

  return <div className="prose prose-sm max-w-none">{paragraphs}</div>;
} 