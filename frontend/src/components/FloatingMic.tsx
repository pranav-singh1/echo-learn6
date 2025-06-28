import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const FloatingMic: React.FC = () => {
  const { isConnected, isListening, startConversation, stopConversation } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show mic when not connected, hide when connected (since ChatInterface has controls)
  useEffect(() => {
    setIsVisible(!isConnected);
  }, [isConnected]);

  const handleMicClick = async () => {
    if (isConnected) {
      await stopConversation();
    } else {
      await startConversation();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        onClick={handleMicClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "h-16 w-16 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
          "text-white border-0",
          isHovered && "scale-110 shadow-xl",
          isListening && "animate-pulse bg-gradient-to-r from-red-500 to-pink-600"
        )}
      >
        {isListening ? (
          <Volume2 className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
          {isListening ? 'Stop Voice Chat' : 'Start Voice Chat'}
        </div>
      )}
    </div>
  );
};
