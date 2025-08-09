import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageCircle, 
  Plus, 
  Trash2, 
  Clock, 
  BookOpen,
  FileText,
  MoreVertical,
  Search,
  Calendar,
  Edit2,
  Check,
  X,
  Brain,
  GraduationCap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

// Add prop for onHide
interface ConversationHistoryProps {
  onHide?: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ onHide }) => {
  const { 
    activeSession, 
    allSessions, 
    createNewSession, 
    startFreshConversation,
    switchToSession, 
    deleteSession,
    updateSessionTitle,
    setActivePanel,
    setHighlightTerm
  } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Function to get the appropriate icon based on learning mode
  const getModeIcon = (learningMode: string) => {
    switch (learningMode) {
      case 'conversation':
        return <MessageCircle className="w-4 h-4 flex-shrink-0 text-blue-500" />;
      case 'blurting':
        return <Brain className="w-4 h-4 flex-shrink-0 text-purple-500" />;
      case 'teaching':
        return <GraduationCap className="w-4 h-4 flex-shrink-0 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 flex-shrink-0" />;
    }
  };

  // Filter sessions based on search term
  const filteredSessions = allSessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get conversation preview
  const getConversationPreview = (session: any) => {
    const userMessages = session.messages.filter((msg: any) => msg.speaker === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1].text;
      return lastUserMessage.length > 50 ? lastUserMessage.substring(0, 50) + '...' : lastUserMessage;
    }
    return 'No messages yet';
  };

  // Get message count
  const getMessageCount = (session: any) => {
    return session.messages.length;
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    setShowDeleteDialog(null);
    // Wait a short moment for sessions to update, then switch to the most recent session
    setTimeout(() => {
      const sessions = allSessions.filter(s => s.id !== sessionId);
      if (sessions.length > 0) {
        const sorted = [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        if (sorted[0]?.id) {
          switchToSession(sorted[0].id);
        }
      }
    }, 400); // Slightly longer delay to ensure state is updated
  };

  const handleStartEdit = (session: any) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = async () => {
    if (editingSessionId && editTitle.trim()) {
      await updateSessionTitle(editingSessionId, editTitle.trim());
      setEditingSessionId(null);
      setEditTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  function getLastMessageTime(session) {
    if (!Array.isArray(session.messages) || session.messages.length === 0) return null;
    const lastMsg = session.messages[session.messages.length - 1];
    return lastMsg && lastMsg.timestamp ? new Date(lastMsg.timestamp) : null;
  }

  // Helper to get subtle background based on session learning mode
  const getSessionCardClasses = (session: any) => {
    if (session.id === activeSession?.id) {
      return 'bg-blue-400/70 text-white shadow-lg dark:bg-sky-800/30 dark:hover:bg-sky-800/40 dark:text-sky-100 dark:ring-1 dark:ring-sky-700/40 dark:border-0';
    }
    const mode = session.learningMode;
    const base = 'hover:shadow-md border border-gray-100/50 dark:border-gray-800/50';
    if (mode === 'blurting') return `bg-purple-50/50 ${base} dark:bg-purple-950/25`;
    if (mode === 'teaching') return `bg-green-50/50 ${base} dark:bg-emerald-950/25`;
    return `bg-blue-50/50 ${base} dark:bg-slate-950/25`; // conversation
  };

  return (
    <aside className="h-full w-64 flex flex-col bg-white/95 dark:bg-gray-950/60 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-800/60 shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/60 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          History
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={startFreshConversation}
          className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-900/60 dark:text-gray-300 text-gray-600 transition-all duration-200 rounded-lg px-3 py-2"
          aria-label="Start a new chat"
          data-tour="new-chat"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New Chat</span>
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-950/40 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setHighlightTerm(e.target.value);
            }}
            placeholder="Search conversations..."
            className="w-full bg-gray-50/80 dark:bg-gray-900/60 text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 dark:focus:border-blue-500 transition-all duration-200"
            aria-label="Search conversations"
            onBlur={e => setHighlightTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/40 to-gray-50/40 dark:from-gray-950/40 dark:to-gray-950/20">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">No conversations yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start your first conversation to see it here</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative rounded-xl p-4 cursor-pointer transition-all duration-200 ${getSessionCardClasses(session)}`}
                onClick={() => switchToSession(session.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    session.id === activeSession?.id 
                      ? 'bg-white/20 dark:bg-white/10' 
                      : 'bg-gray-50 dark:bg-gray-800 group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
                  }`}>
                    {getModeIcon(session.learningMode)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      {editingSessionId === session.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleSaveEdit}
                          className="flex-1 bg-transparent border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          autoFocus
                          style={{ maxWidth: '140px' }}
                        />
                      ) : (
                        <h3 
                          className="font-semibold text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 text-gray-900 dark:text-gray-100 transition-colors duration-200" 
                          style={{ maxWidth: '140px' }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(session);
                          }}
                          title="Double-click to edit"
                        >
                          {session.title}
                        </h3>
                      )}
                      
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 text-gray-400 dark:text-gray-500"
                        onClick={e => {
                          e.stopPropagation();
                          setShowDeleteDialog(session.id);
                        }}
                        aria-label={`Delete conversation titled ${session.title}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{session.messages.length} messages</span>
                    </div>
                  </div>
                </div>
                
                {/* Delete Confirmation Dialog */}
                {showDeleteDialog === session.id && (
                  <AlertDialog open={true} onOpenChange={() => setShowDeleteDialog(null)}>
                    <AlertDialogContent className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                          Are you sure you want to delete this conversation? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          onClick={() => setShowDeleteDialog(null)} 
                          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg"
                          aria-label="Cancel delete conversation"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteSession(session.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          aria-label="Confirm delete conversation"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}; 