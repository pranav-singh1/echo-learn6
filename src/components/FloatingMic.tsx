
import React, { useState } from 'react';
import { Mic, MicOff, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingMicProps {
  onQuizToggle: () => void;
}

const FloatingMic: React.FC<FloatingMicProps> = ({ onQuizToggle }) => {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-40">
      {/* Quiz Button */}
      <Button
        onClick={onQuizToggle}
        variant="outline"
        size="sm"
        className="bg-white shadow-lg border-gray-200 hover:bg-gray-50"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Quiz Me
      </Button>

      {/* Main Mic Button */}
      <div className="relative">
        <Button
          onClick={toggleListening}
          size="lg"
          className={`
            w-16 h-16 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }
            text-white
          `}
        >
          {isListening ? (
            <MicOff className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </Button>

        {/* Listening Indicator */}
        {isListening && (
          <div className="absolute -top-2 -right-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping" />
            <div className="absolute top-0 w-4 h-4 bg-red-600 rounded-full" />
          </div>
        )}

        {/* Pulse Ring */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
        )}
      </div>

      {/* Status Text */}
      <div className="bg-white px-3 py-1 rounded-full shadow-lg border border-gray-200">
        <span className="text-xs font-medium text-gray-600">
          {isListening ? 'Listening...' : 'Tap to speak'}
        </span>
      </div>
    </div>
  );
};

export default FloatingMic;
