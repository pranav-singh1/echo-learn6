
import React from 'react';
import { Menu, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  onToggleSidebar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onToggleSidebar }) => {
  const messages = [
    {
      id: 1,
      type: 'user',
      content: "I'm studying photosynthesis and I want to explain how plants convert sunlight into energy.",
      timestamp: '2:34 PM'
    },
    {
      id: 2,
      type: 'ai',
      content: "Great topic! I'd love to hear your explanation of photosynthesis. Start by telling me what you know about how plants capture sunlight and what happens next in the process.",
      timestamp: '2:34 PM'
    },
    {
      id: 3,
      type: 'user',
      content: "So plants have chlorophyll in their leaves that absorbs light energy. This energy is used to split water molecules and combine carbon dioxide from the air to make glucose.",
      timestamp: '2:35 PM'
    },
    {
      id: 4,
      type: 'ai',
      content: "Excellent start! You've identified the key components. Can you walk me through the two main stages of photosynthesis? What happens in the light-dependent reactions versus the light-independent reactions?",
      timestamp: '2:35 PM'
    }
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="mr-3"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-gray-900">Study Session</h1>
            <p className="text-sm text-gray-500">Photosynthesis Topic</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Listening</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              </div>

              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <p className="text-gray-500 text-sm">Speak your thoughts or type here...</p>
          </div>
          <Button size="sm" variant="outline" className="px-4">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
