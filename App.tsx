import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, KeyRound, ExternalLink } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { ChatSession, Message, ModelId, ImageGenConfig } from './types';
import { geminiService } from './services/geminiService';

const STORAGE_KEY = 'yahya_ai_sessions';
const DEFAULT_MODEL_KEY = 'yahya_ai_default_model';

const YahyaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="32" height="32" rx="10" fill="url(#logo-gradient-landing)" />
    <path d="M10 9L16 17L22 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17V23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="logo-gradient-landing" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </svg>
);

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Track default model preference
  const [defaultModelId, setDefaultModelId] = useState<ModelId>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(DEFAULT_MODEL_KEY);
        return (saved as ModelId) || 'flash';
    }
    return 'flash';
  });

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        try {
          const has = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(has);
        } catch (e) {
          console.error("Error checking API key:", e);
          setHasApiKey(false);
        }
      } else {
        // Fallback: If not in the specific environment, check if process.env.API_KEY is defined
        // or assume true for development if needed. 
        setHasApiKey(!!process.env.API_KEY);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleConnectApiKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        // Assuming success after closing dialog as per instructions
        setHasApiKey(true);
        // Reset checking to force re-render/re-check if needed, but here just setting true is faster
      } catch (error) {
        console.error("Failed to select key", error);
      }
    }
  };

  // Load sessions from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        // Find the first non-archived session to set as current, or just the first available
        if (parsed.length > 0) {
            const firstActive = parsed.find((s: ChatSession) => !s.isArchived) || parsed[0];
            setCurrentSessionId(firstActive.id);
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    } else {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to local storage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      isArchived: false,
      modelId: defaultModelId // Use the sticky default model
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [defaultModelId]);

  const deleteSession = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => {
        const filtered = prev.filter(s => s.id !== id);
        if (currentSessionId === id) {
            const remaining = filtered.find(s => !s.isArchived) || filtered[0];
            setCurrentSessionId(remaining ? remaining.id : null);
        }
        return filtered;
    });
  }, [currentSessionId]);

  const renameSession = useCallback((id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  }, []);

  const archiveSession = useCallback((id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isArchived: true } : s));
  }, []);

  const unarchiveSession = useCallback((id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isArchived: false } : s));
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    if (currentSessionId) {
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return { ...s, messages: s.messages.filter(m => m.id !== messageId) };
            }
            return s;
        }));
    }
  }, [currentSessionId]);

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Update title if it's the first user message
        let title = s.title;
        if (s.messages.length === 0 && newMessages.length > 0) {
            const firstMsg = newMessages[0];
            if (firstMsg.role === 'user') {
                if (firstMsg.content.trim()) {
                    title = firstMsg.content.slice(0, 30) + (firstMsg.content.length > 30 ? '...' : '');
                } else if (firstMsg.image) {
                    title = 'Image Upload';
                }
            }
        }
        return { ...s, messages: newMessages, title };
      }
      return s;
    }));
  };

  const handleClearConversation = useCallback(() => {
    if (currentSessionId) {
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return { ...s, messages: [] };
            }
            return s;
        }));
    }
  }, [currentSessionId]);

  const handleModelChange = useCallback((modelId: ModelId) => {
    // Update sticky default
    setDefaultModelId(modelId);
    localStorage.setItem(DEFAULT_MODEL_KEY, modelId);

    // Update current session
    if (currentSessionId) {
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return { ...s, modelId };
            }
            return s;
        }));
    }
  }, [currentSessionId]);

  const handleSendMessage = async (text: string, image?: string, imageGenConfig?: ImageGenConfig) => {
    if (!currentSessionId) {
        createNewSession();
        return;
    }

    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;
    
    if (currentSession.isArchived) {
        unarchiveSession(currentSessionId);
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      image,
      timestamp: Date.now(),
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    updateSessionMessages(currentSessionId, updatedMessages);
    setIsGenerating(true);

    const aiMessageId = uuidv4();
    const aiMessagePlaceholder: Message = {
      id: aiMessageId,
      role: 'model',
      content: '', 
      timestamp: Date.now(),
      isStreaming: true
    };
    
    updateSessionMessages(currentSessionId, [...updatedMessages, aiMessagePlaceholder]);

    try {
      let fullResponse = "";
      // Pass the session's modelId to the service
      const modelToUse = currentSession.modelId || defaultModelId;
      const stream = geminiService.streamChat(updatedMessages, text, image, modelToUse, imageGenConfig);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const msgs = [...s.messages];
                const lastMsgIndex = msgs.findIndex(m => m.id === aiMessageId);
                if (lastMsgIndex !== -1) {
                    msgs[lastMsgIndex] = {
                        ...msgs[lastMsgIndex],
                        content: fullResponse
                    };
                }
                return { ...s, messages: msgs };
            }
            return s;
        }));
      }

       setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const msgs = [...s.messages];
                const lastMsgIndex = msgs.findIndex(m => m.id === aiMessageId);
                if (lastMsgIndex !== -1) {
                    msgs[lastMsgIndex] = {
                        ...msgs[lastMsgIndex],
                        isStreaming: false
                    };
                }
                return { ...s, messages: msgs };
            }
            return s;
        }));

    } catch (error) {
      console.error("Chat error", error);
       const errorMsg: Message = {
        id: uuidv4(),
        role: 'model',
        content: "I apologize, but I encountered an error while processing your request. It's possible the API key needs to be re-connected or does not have permission for this model.",
        timestamp: Date.now(),
        isError: true
      };
       
       // Use functional update to ensure we are modifying the latest state and cleanly replacing placeholder
       setSessions(prev => prev.map(s => {
           if (s.id === currentSessionId) {
               // Remove the placeholder if it exists and add the error message
               const filteredMessages = s.messages.filter(m => m.id !== aiMessageId);
               return { ...s, messages: [...filteredMessages, errorMsg] };
           }
           return s;
       }));
    } finally {
      setIsGenerating(false);
    }
  };

  // Render Landing Page if no API Key
  if (isCheckingKey) {
    return (
      <div className="flex h-screen bg-zinc-950 text-zinc-100 items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse-slow" />
              <YahyaLogo className="w-full h-full relative z-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Yahya AI V2</h1>
              <p className="text-zinc-400">Experience the next generation of AI.</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
             <div className="space-y-2">
               <h3 className="font-semibold text-lg text-white">Connect API Key</h3>
               <p className="text-sm text-zinc-400">
                 To access advanced models like Gemini 3 Pro and Image Generation, please connect your Google Cloud API key.
               </p>
             </div>
             
             <button
               onClick={handleConnectApiKey}
               className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 group"
             >
               <KeyRound className="w-5 h-5 group-hover:scale-110 transition-transform" />
               Connect API Key
             </button>

             <div className="pt-4 border-t border-zinc-800">
               <a 
                 href="https://ai.google.dev/gemini-api/docs/billing" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
               >
                 <ExternalLink className="w-3 h-3" />
                 View Billing Information & Pricing
               </a>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];
  const currentModelId = currentSession?.modelId || defaultModelId;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onArchiveSession={archiveSession}
        onUnarchiveSession={unarchiveSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-full w-full">
        <ChatArea 
          messages={currentMessages}
          isGenerating={isGenerating}
          onSendMessage={handleSendMessage}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onClearConversation={handleClearConversation}
          sessionTitle={currentSession?.title}
          modelId={currentModelId}
          onModelChange={handleModelChange}
          onDeleteMessage={handleDeleteMessage}
        />
      </main>
    </div>
  );
};

export default App;