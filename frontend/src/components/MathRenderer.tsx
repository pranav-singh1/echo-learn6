import React from 'react';

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

  // Split text into code blocks and normal text
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  const elements = [];
  let partIndex = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Text before code block
    if (lastIndex < match.index) {
      const before = text.slice(lastIndex, match.index);
      if (before) {
        elements.push({ type: 'text', content: before, key: `text-${partIndex++}` });
      }
    }
    // Code block
    elements.push({ type: 'code', content: match[2], lang: match[1], key: `code-${partIndex++}` });
    lastIndex = match.index + match[0].length;
  }
  // Remaining text after last code block
  if (lastIndex < text.length) {
    elements.push({ type: 'text', content: text.slice(lastIndex), key: `text-${partIndex++}` });
  }

  return (
    <span className={className}>
      {elements.map((el) => {
        if (el.type === 'code') {
          return (
            <pre key={el.key} className="bg-gray-100 rounded p-3 overflow-x-auto text-sm border border-gray-200 my-4"><code>{el.content}</code></pre>
          );
        } else {
          return (
            <span key={el.key}>
              {highlightTerm ? highlightText(el.content, highlightTerm) : el.content}
            </span>
          );
        }
      })}
    </span>
  );
};

export default MathRenderer; 