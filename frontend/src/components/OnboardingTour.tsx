import React, { useState, useLayoutEffect } from 'react';

const BASE_STEPS = [
  {
    selector: '[data-tour="new-chat"]',
    title: 'New Chat',
    description: 'Start a fresh conversation here. This creates a new session and clears the chat area.',
    popoverPosition: { top: 120, left: 280 },
  },
  {
    selector: '[data-tour="history"]',
    title: 'Show/Hide History',
    description: 'Toggle the conversation history sidebar here. The sidebar on the left shows your past conversations.',
    popoverPosition: { top: 120, right: 32 },
  },
  {
    selector: '[data-tour="start-voice"]',
    title: 'Start Voice Conversation',
    description: 'Click here to start a new voice conversation with EchoLearn. You can also type messages in the input below.',
    popoverPosition: { top: 180, right: 32 },
  },
  {
    selector: '[data-tour="quiz"]',
    title: 'Generate Quiz',
    description: 'After having a conversation (3+ messages), this button becomes active and you can generate a quiz to test your knowledge.',
    popoverPosition: { top: 180, right: 32 },
  },
  {
    selector: '[data-tour="theme-toggle"]',
    title: 'Theme Toggle',
    description: 'Switch between light and dark mode for your preferred experience.',
    shiftLeft: true,
    popoverPosition: { top: 80, right: 32 },
  },
  {
    selector: '[data-tour="home"]',
    title: 'Home Button',
    description: 'Return to the landing page at any time.',
    shiftLeft: true,
    popoverPosition: { top: 80, right: 16 },
  },
];

export const OnboardingTour: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Show all steps - no filtering needed since we want to tour all buttons
  const steps = BASE_STEPS;
  const [step, setStep] = useState(0);
  const current = steps[step];

  // --- Fix: Cache popover style for current step ---
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | undefined>(undefined);

  useLayoutEffect(() => {
    if (!current) return;
    // Only use fixed popover positions from BASE_STEPS
    if (current.popoverPosition) {
      setPopoverStyle({
        position: 'fixed',
        ...current.popoverPosition,
        zIndex: 10000,
        minWidth: 260,
        maxWidth: 340,
      });
    }
  }, [step, current]);

  // Find the element to highlight
  React.useEffect(() => {
    if (!current) return;
    // Highlight the main element for this step
    let el: HTMLElement | null = null;
    if (current.selector === '[data-tour="history"]') {
      // Prefer the desktop Hide History button
      el = Array.from(document.querySelectorAll('button.hidden.md\\:flex')).find(
        btn => btn.textContent && btn.textContent.trim().toLowerCase().includes('hide history')
      ) as HTMLElement | null;
      if (!el) {
        el = document.querySelector(current.selector) as HTMLElement;
      }
    } else {
      el = document.querySelector(current.selector) as HTMLElement;
    }
    let cleanupFns: (() => void)[] = [];
    if (el) {
      if (current.selector === '[data-tour="history"]') {
        el.classList.add('border-2', 'border-blue-600', 'rounded-lg');
        cleanupFns.push(() => {
          el.classList.remove('border-2', 'border-blue-600', 'rounded-lg');
        });
      } else {
        el.classList.add('ring-4', 'ring-blue-500', 'z-[10001]', 'relative', 'shadow-lg');
        cleanupFns.push(() => {
          el.classList.remove('ring-4', 'ring-blue-500', 'z-[10001]', 'relative', 'shadow-lg');
        });
      }
    }
    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [step, current]);

  if (!current) return null;

  return (
    <div>
      {/* Overlay (no onClick, blocks interaction) */}
      <div className="fixed inset-0 bg-black/30 z-[9999] pointer-events-auto" />
      {/* Popover */}
      <div style={popoverStyle} className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-xl shadow-xl p-6 flex flex-col items-start animate-fade-in-up z-[10000]">
        <div className="flex items-center justify-between w-full mb-2">
          <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">{current.title}</h3>
          <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold">×</button>
        </div>
        <p className="text-gray-700 dark:text-gray-200 mb-4">{current.description}</p>
        <div className="flex gap-2 w-full justify-end">
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 