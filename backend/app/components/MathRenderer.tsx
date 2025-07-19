import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  text: string;
  className?: string;
  highlightTerm?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className, highlightTerm }) => {
  // Helper to highlight search term in text
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 text-yellow-900 rounded px-1 py-0.5 font-semibold">
          {part}
        </span>
      ) : part
    );
  };

  // Function to parse text and identify LaTeX expressions
  const parseText = (input: string) => {
    const parts = [];
    let currentIndex = 0;
    let partIndex = 0;

    // First, find all display math expressions ($$...$$ take priority)
    const displayMatches = [];
    let displayMatch;
    const displayRegex = /\$\$([\s\S]*?)\$\$/g;
    while ((displayMatch = displayRegex.exec(input)) !== null) {
      displayMatches.push({
        start: displayMatch.index,
        end: displayMatch.index + displayMatch[0].length,
        content: displayMatch[1].trim(),
        type: 'display'
      });
    }

    // Then find inline math expressions, excluding areas already covered by display math
    const inlineMatches = [];
    let inlineMatch;
    const inlineRegex = /\$([^$\n]*?)\$/g;
    while ((inlineMatch = inlineRegex.exec(input)) !== null) {
      const start = inlineMatch.index;
      const end = inlineMatch.index + inlineMatch[0].length;
      
      // Check if this inline match overlaps with any display math
      const overlaps = displayMatches.some(dm => 
        (start >= dm.start && start < dm.end) || 
        (end > dm.start && end <= dm.end) ||
        (start <= dm.start && end >= dm.end)
      );
      
      if (!overlaps) {
        inlineMatches.push({
          start,
          end,
          content: inlineMatch[1].trim(),
          type: 'inline'
        });
      }
    }

    // Combine and sort all matches
    const allMatches = [...displayMatches, ...inlineMatches].sort((a, b) => a.start - b.start);

    // Build the result array
    allMatches.forEach(match => {
      // Add text before the math expression
      if (currentIndex < match.start) {
        const textContent = input.slice(currentIndex, match.start);
        if (textContent) {
          parts.push({
            key: `text-${partIndex++}`,
            type: 'text',
            content: textContent
          });
        }
      }

      // Add the math expression
      parts.push({
        key: `math-${partIndex++}`,
        type: match.type,
        content: match.content
      });

      currentIndex = match.end;
    });

    // Add remaining text
    if (currentIndex < input.length) {
      const textContent = input.slice(currentIndex);
      if (textContent) {
        parts.push({
          key: `text-${partIndex++}`,
          type: 'text',
          content: textContent
        });
      }
    }

    return parts;
  };

  const renderPart = (part: any) => {
    try {
      switch (part.type) {
        case 'display':
          return (
            <div key={part.key} className="my-4 text-center">
              <BlockMath math={part.content} />
            </div>
          );
        case 'inline':
          return <InlineMath key={part.key} math={part.content} />;
        case 'text':
        default:
          // Apply highlighting to text parts
          return (
            <span key={part.key}>
              {highlightTerm ? highlightText(part.content, highlightTerm) : part.content}
            </span>
          );
      }
    } catch (error) {
      // If LaTeX rendering fails, fall back to displaying the raw text
      console.warn('LaTeX rendering error:', error);
      const fallbackText = part.type === 'display' ? `$$${part.content}$$` : 
                          part.type === 'inline' ? `$${part.content}$` : 
                          part.content;
      return (
        <span key={part.key} className="text-red-500 bg-red-50 px-1 rounded">
          {highlightTerm ? highlightText(fallbackText, highlightTerm) : fallbackText}
        </span>
      );
    }
  };

  // If no LaTeX expressions found, render as plain text with highlighting
  if (!text.includes('$')) {
    return (
      <span className={className}>
        {highlightTerm ? highlightText(text, highlightTerm) : text}
      </span>
    );
  }

  const parts = parseText(text);
  
  return (
    <span className={className}>
      {parts.map(renderPart)}
    </span>
  );
};

export default MathRenderer; 