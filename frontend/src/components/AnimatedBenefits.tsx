import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedBenefitsProps {
  className?: string;
}

const AnimatedBenefits: React.FC<AnimatedBenefitsProps> = ({ className = '' }) => {
  const benefits = [
    'active recall',
    'interactive testing',
    'personalized quizzes',
    'voice conversations',
    'smart summaries',
    'AI-powered learning'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentBenefit = benefits[currentIndex];
    
    if (isTyping && !isDeleting) {
      // Typing animation
      if (displayText.length < currentBenefit.length) {
        const timer = setTimeout(() => {
          setDisplayText(currentBenefit.slice(0, displayText.length + 1));
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Finished typing, wait then start deleting
        const timer = setTimeout(() => {
          setIsDeleting(true);
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else if (isDeleting && !isTyping) {
      // Deleting animation
      if (displayText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        // Finished deleting, move to next benefit
        setIsDeleting(false);
        setIsTyping(true);
        setCurrentIndex((prev) => (prev + 1) % benefits.length);
      }
    }
  }, [displayText, isTyping, isDeleting, currentIndex, benefits]);

  return (
    <div className={`text-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-baseline justify-center flex-wrap gap-2"
      >
        <span className="text-2xl md:text-3xl font-medium text-gray-600">
          Learn better through
        </span>
        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {displayText}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block w-0.5 h-6 md:h-8 bg-gradient-to-r from-blue-600 to-purple-600 ml-1"
          />
        </span>
      </motion.div>
    </div>
  );
};

export default AnimatedBenefits; 