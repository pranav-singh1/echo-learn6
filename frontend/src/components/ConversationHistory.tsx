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

  return (
    <aside className="h-full w-64 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border bg-sidebar">
        <h2 className="text-lg font-semibold text-sidebar-foreground">History</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={startFreshConversation}
          className="flex items-center gap-1 hover:bg-sidebar-accent text-sidebar-foreground"
          aria-label="Start a new chat"
          data-tour="new-chat"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      {/* Search Bar */}
      <div className="px-4 py-2 border-b border-sidebar-border bg-sidebar flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setHighlightTerm(e.target.value);
          }}
          placeholder="Search conversations..."
          className="w-full bg-sidebar text-sidebar-foreground placeholder:text-muted-foreground border border-sidebar-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Search conversations"
          onBlur={e => setHighlightTerm(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto bg-sidebar text-sidebar-foreground">
        {filteredSessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No conversations yet.</div>
        ) : (
          <ul className="divide-y divide-sidebar-border">
            {filteredSessions.map((session) => (
              <li
                key={session.id}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200 hover:scale-[1.02] active:scale-95 ${
                  session.id === activeSession?.id
                    ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
                    : 'hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-900 dark:hover:text-blue-100'
                }`}
                style={{ transition: 'background 0.2s, color 0.2s, transform 0.15s' }}
                onClick={() => switchToSession(session.id)}
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {getModeIcon(session.learningMode)}
                    {editingSessionId === session.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleSaveEdit}
                        className="flex-1 bg-transparent border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        autoFocus
                        style={{ maxWidth: '140px' }}
                      />
                    ) : (
                      <span 
                        className="truncate font-medium relative group cursor-pointer" 
                        style={{ maxWidth: '140px' }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(session);
                        }}
                        title="Double-click to edit"
                      >
                        {session.title}
                        <span className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900 px-2 py-1 rounded shadow text-xs whitespace-nowrap max-w-xs overflow-hidden overflow-ellipsis" style={{ minWidth: '80px' }}>
                          {session.title}
                        </span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {(() => {
                      const lastMsgTime = getLastMessageTime(session);
                      if (!lastMsgTime || isNaN(lastMsgTime.getTime())) return '';
                      const now = new Date();
                      const diffMs = now.getTime() - lastMsgTime.getTime();
                      const diffHrs = diffMs / (1000 * 60 * 60);
                      if (diffHrs < 24) {
                        return formatDistanceToNow(lastMsgTime, { addSuffix: true });
                      } else {
                        return lastMsgTime.toLocaleDateString();
                      }
                    })()}
                  </span>
                </div>
                <button
                  className="ml-2 p-1 rounded hover:bg-red-100 hover:text-red-600 transition-colors duration-150 active:scale-90"
                  onClick={e => {
                    e.stopPropagation();
                    setShowDeleteDialog(session.id);
                  }}
                  aria-label={`Delete conversation titled ${session.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {/* Delete Confirmation Dialog */}
                {showDeleteDialog === session.id && (
                  <AlertDialog open={true} onOpenChange={() => setShowDeleteDialog(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this conversation? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDeleteDialog(null)} aria-label="Cancel delete conversation">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteSession(session.id);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                          aria-label="Confirm delete conversation"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}; 