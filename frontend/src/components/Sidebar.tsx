
import React from 'react';
import { X, MessageSquare, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const chatHistory = [
    {
      id: 1,
      title: "Photosynthesis Deep Dive",
      timestamp: "2 hours ago",
      preview: "Discussing light-dependent and independent reactions..."
    },
    {
      id: 2,
      title: "Cell Membrane Structure",
      timestamp: "Yesterday",
      preview: "Exploring phospholipid bilayer and transport proteins..."
    },
    {
      id: 3,
      title: "Mitochondria Function",
      timestamp: "2 days ago",
      preview: "ATP synthesis and cellular respiration process..."
    },
    {
      id: 4,
      title: "DNA Replication",
      timestamp: "3 days ago",
      preview: "Helicase, primase, and DNA polymerase roles..."
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-80 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${!isOpen && 'md:w-0 md:border-r-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Chat History</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Recent Sessions</h3>
              <div className="space-y-3">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {chat.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {chat.preview}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {chat.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Topics */}
            <div className="px-6 py-3 border-t border-gray-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Study Topics</h3>
              <div className="space-y-2">
                {['Biology', 'Chemistry', 'Physics', 'Mathematics'].map((topic) => (
                  <div key={topic} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
