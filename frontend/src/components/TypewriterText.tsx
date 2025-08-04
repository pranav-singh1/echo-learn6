import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  enabled: boolean;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  children?: (displayText: string) => React.ReactNode;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  enabled,
  speed = 50, // milliseconds per character
  className = '',
  onComplete,
  children
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      // Show all text immediately if typewriter is disabled
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    // Reset for new text
    setDisplayText('');
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
        onComplete?.(); // Call onComplete when typewriter finishes
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, enabled, speed]);

  const finalText = displayText + (enabled && !isComplete ? '|' : '');

  if (children) {
    return <div className={className}>{children(finalText)}</div>;
  }

  return <div className={className}>{finalText}</div>;
}; 