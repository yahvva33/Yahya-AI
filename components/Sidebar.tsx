import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  X, 
  MoreHorizontal, 
  Pencil, 
  Archive, 
  ArchiveRestore,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onArchiveSession: (id: string) => void;
  onUnarchiveSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const YahyaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="32" height="32" rx="10" fill="url(#logo-gradient-sidebar)" />
    <path d="M10 9L16 17L22 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17V23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="logo-gradient-sidebar" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" /> {/* Indigo 500 */}
        <stop offset="1" stopColor="#a855f7" /> {/* Purple 500 */}
      </linearGradient>
    </defs>
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onArchiveSession,
  onUnarchiveSession,
  isOpen,
  onClose
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const activeSessions = sessions.filter(s => !s.isArchived);
  const archivedSessions = sessions.filter(s => s.isArchived);

  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingSessionId]);

  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
    setActiveMenuId(null);
  };

  const handleFinishRename = () => {
    if (editingSessionId && editTitle.trim()) {
      onRenameSession(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
    }
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onArchiveSession(id);
    setActiveMenuId(null);
  };

  const handleUnarchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onUnarchiveSession(id);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
    setActiveMenuId(null);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
        const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
        onDeleteSession(mockEvent, sessionToDelete);
        setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
  };

  const renderSessionItem = (session: ChatSession) => {
    const isCurrent = currentSessionId === session.id;
    const isEditing = editingSessionId === session.id;
    const isMenuOpen = activeMenuId === session.id;

    return (
      <div key={session.id} className="relative group">
        <div
          onClick={() => {
            onSelectSession(session.id);
            if (window.innerWidth < 1024) onClose();
          }}
          className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${
            isCurrent
              ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800'
              : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
          }`}
        >
          <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-indigo-500' : 'text-zinc-600'}`} />
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-zinc-950 text-zinc-100 px-1 py-0.5 rounded border border-indigo-500/50 focus:outline-none focus:border-indigo-500 text-sm"
              />
            ) : (
              <span className="truncate text-sm block">{session.title}</span>
            )}
          </div>

          {!isEditing && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(isMenuOpen ? null : session.id);
                }}
                className={`p-1 rounded-md hover:bg-zinc-800 transition-opacity ${
                  isMenuOpen || isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <MoreHorizontal className="w-4 h-4 text-zinc-500" />
              </button>

              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                    }} 
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                    <button
                      onClick={(e) => handleStartRename(e, session)}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Rename
                    </button>
                    {session.isArchived ? (
                       <button
                       onClick={(e) => handleUnarchive(e, session.id)}
                       className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2"
                     >
                       <ArchiveRestore className="w-3.5 h-3.5" /> Unarchive
                     </button>
                    ) : (
                      <button
                        onClick={(e) => handleArchive(e, session.id)}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2"
                      >
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </button>
                    )}
                    <div className="h-px bg-zinc-800 my-1" />
                    <button
                      onClick={(e) => handleDeleteClick(e, session.id)}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-zinc-800">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-amber-500">
                        <AlertTriangle className="w-6 h-6" />
                        <h3 className="text-lg font-bold text-white">Delete Conversation?</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        This action cannot be undone. This conversation will be permanently removed from your history.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-950/50 border-t border-zinc-800">
                    <button 
                        onClick={cancelDelete}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-lg shadow-red-900/20"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <YahyaLogo className="w-8 h-8 shadow-lg shadow-indigo-500/20" />
                <span className="font-bold text-xl text-white tracking-tight">Yahya AI <span className="text-xs align-top text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">V2</span></span>
            </div>
            <button onClick={onClose} className="lg:hidden text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 justify-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg shadow-indigo-900/20 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            New Conversation
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          <div className="px-2 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Conversations</div>
          {activeSessions.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-8 italic">
                No active conversations.
            </div>
          ) : (
            activeSessions.map((session) => renderSessionItem(session))
          )}

          {/* Archived Section */}
          {archivedSessions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-zinc-900">
              <button 
                onClick={() => setIsArchivedOpen(!isArchivedOpen)}
                className="w-full px-2 flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
              >
                {isArchivedOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span className="text-xs font-semibold uppercase tracking-wider">Archived ({archivedSessions.length})</span>
              </button>
              
              {isArchivedOpen && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {archivedSessions.map((session) => renderSessionItem(session))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-zinc-900">
            <div className="flex items-center gap-3 px-2">
                <YahyaLogo className="w-8 h-8 rounded-lg" />
                <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-200">Yahya AI v2</div>
                    <div className="text-xs text-zinc-500">Online</div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;