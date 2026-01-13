import React, { useRef, useEffect, useState } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Loader2, 
  User, 
  Trash2, 
  Menu, 
  AlertTriangle,
  Zap,
  Sparkles,
  BrainCircuit,
  Gem,
  ChevronDown,
  Check,
  Palette,
  XCircle,
  X,
  Copy
} from 'lucide-react';
import { Message, ModelId, ImageGenConfig } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatAreaProps {
  messages: Message[];
  isGenerating: boolean;
  onSendMessage: (text: string, image?: string, imageGenConfig?: ImageGenConfig) => void;
  onSidebarToggle: () => void;
  onClearConversation: () => void;
  sessionTitle?: string;
  modelId?: ModelId;
  onModelChange?: (id: ModelId) => void;
  onDeleteMessage?: (id: string) => void;
}

const YahyaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="32" height="32" rx="10" fill="url(#logo-gradient-chat)" />
    <path d="M10 9L16 17L22 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17V23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="logo-gradient-chat" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" /> {/* Indigo 500 */}
        <stop offset="1" stopColor="#a855f7" /> {/* Purple 500 */}
      </linearGradient>
    </defs>
  </svg>
);

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 py-1">
    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-[bounce_1s_infinite]"></div>
  </div>
);

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isGenerating, 
  onSendMessage,
  onSidebarToggle,
  onClearConversation,
  sessionTitle,
  modelId = 'flash',
  onModelChange,
  onDeleteMessage
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Image Generation Settings
  const [imageConfig, setImageConfig] = useState<ImageGenConfig>({
    aspectRatio: '1:1',
    style: '',
    negativePrompt: ''
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if ((!inputText.trim() && !selectedImage) || isGenerating) return;
    
    onSendMessage(inputText, selectedImage || undefined, modelId === 'imagine' ? imageConfig : undefined);
    setInputText('');
    setSelectedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmClear = () => {
    onClearConversation();
    setShowClearConfirm(false);
  };

  const models: { id: ModelId; name: string; icon: React.ReactElement; desc: string }[] = [
    { id: 'flash', name: 'Yahya V2 Flash', icon: <Zap className="w-4 h-4 text-green-400" />, desc: 'Fast, efficient, everyday tasks' },
    { id: 'pro', name: 'Yahya V2 Pro', icon: <Gem className="w-4 h-4 text-blue-400" />, desc: 'Complex tasks, coding, math' },
    { id: 'deep', name: 'Yahya V2 Deep', icon: <BrainCircuit className="w-4 h-4 text-purple-400" />, desc: 'Deep reasoning & analysis' },
    { id: 'creative', name: 'Yahya V2 Creative', icon: <Sparkles className="w-4 h-4 text-amber-400" />, desc: 'Writing, brainstorming, ideas' },
    { id: 'imagine', name: 'Yahya V2 Imagine', icon: <Palette className="w-4 h-4 text-pink-400" />, desc: 'Generate high-quality images' },
  ];

  const currentModel = models.find(m => m.id === modelId) || models[0];

  const suggestions = [
    { 
      text: "Draft a clear and concise email to the team about the weekly updates.", 
      label: "Flash: Quick Tasks", 
      icon: <Zap className="w-4 h-4 text-green-400" />,
      modelId: 'flash' 
    },
    { 
      text: "Write a React component for a responsive navigation bar with Tailwind CSS.", 
      label: "Pro: Coding", 
      icon: <Gem className="w-4 h-4 text-blue-400" />,
      modelId: 'pro'
    },
    { 
      text: "Analyze the potential long-term economic impacts of artificial intelligence.", 
      label: "Deep: Reasoning", 
      icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
      modelId: 'deep'
    },
    { 
      text: "A futuristic cityscape with neon lights and flying cars, cyberpunk style.", 
      label: "Imagine: Generate Image", 
      icon: <Palette className="w-4 h-4 text-pink-400" />,
      modelId: 'imagine'
    },
  ];

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    if (isGenerating) return;
    
    if (onModelChange && suggestion.modelId !== modelId) {
         onModelChange(suggestion.modelId as ModelId);
    }
    
    onSendMessage(suggestion.text, undefined, suggestion.modelId === 'imagine' ? imageConfig : undefined);
  };

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  
  return (
    <div className="flex-1 flex flex-col h-full relative bg-zinc-950">
      
      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-zinc-800">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-amber-500">
                        <AlertTriangle className="w-6 h-6" />
                        <h3 className="text-lg font-bold text-white">Clear Conversation?</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        This will remove all messages from the current session. This action cannot be undone.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-950/50 border-t border-zinc-800">
                    <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmClear}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-lg shadow-red-900/20"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onSidebarToggle}
            className="p-2 -ml-2 rounded-lg hover:bg-zinc-800 lg:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="font-semibold text-zinc-100 text-sm truncate max-w-[150px] sm:max-w-md">
                {sessionTitle || "New Conversation"}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                {currentModel.icon}
                <span>{currentModel.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
              onClick={() => setShowClearConfirm(true)}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mb-6 relative">
                 <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                 <YahyaLogo className="w-full h-full relative z-10" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
              Yahya AI V2
            </h1>
            <p className="text-zinc-500 max-w-md mb-8 leading-relaxed">
              Experience the next generation of intelligence. How can I assist you today?
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="text-left p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/80 hover:border-indigo-500/30 transition-all group flex items-start gap-3"
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors">
                     {s.icon}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-500 mb-1 group-hover:text-indigo-400 transition-colors">{s.label}</div>
                    <div className="text-sm text-zinc-300 leading-snug">{s.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-4 max-w-4xl mx-auto group ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg mt-1
                ${message.role === 'user' 
                  ? 'bg-zinc-800 text-zinc-100' 
                  : message.isError 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20'
                }
              `}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : (message.isError ? <AlertTriangle className="w-5 h-5" /> : <YahyaLogo className="w-5 h-5" />)}
              </div>
              
              <div className={`flex-1 overflow-hidden ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`text-xs text-zinc-500 mb-1.5 flex items-center gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  <span className="font-medium text-zinc-400">
                    {message.role === 'user' ? 'You' : (message.isError ? 'System Error' : 'Yahya AI')}
                  </span>
                  {!message.isError && !message.isStreaming && (
                     <button 
                        onClick={() => handleCopyMessage(message.content, message.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 ${copiedId === message.id ? 'text-green-500' : ''}`}
                        title="Copy message"
                     >
                        {copiedId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                     </button>
                  )}
                </div>

                {message.image && (
                    <div className={`mb-3 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                        <img 
                            src={message.image} 
                            alt="Uploaded content" 
                            className="max-w-xs sm:max-w-sm rounded-lg border border-zinc-800 shadow-xl"
                        />
                    </div>
                )}

                {message.isError ? (
                  <div className="inline-block text-left bg-red-950/20 border border-red-500/30 rounded-lg p-4 text-red-200 text-sm max-w-[90%] md:max-w-2xl shadow-sm relative group/error animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 pr-6">
                        <h4 className="font-semibold text-red-400 mb-1">Request Failed</h4>
                        <p className="opacity-90 leading-relaxed text-red-200/80">{message.content}</p>
                      </div>
                      {onDeleteMessage && (
                         <button 
                            onClick={() => onDeleteMessage(message.id)}
                            className="absolute top-2 right-2 text-red-400/50 hover:text-red-300 hover:bg-red-500/20 p-1.5 rounded-md transition-all"
                            title="Dismiss error"
                         >
                            <X className="w-3.5 h-3.5" />
                         </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`
                    inline-block text-left
                    ${message.role === 'user' 
                      ? 'bg-zinc-800 text-zinc-100 px-5 py-3 rounded-2xl rounded-tr-sm shadow-md border border-zinc-700/50' 
                      : 'w-full'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <>
                        {message.content ? <MarkdownRenderer content={message.content} /> : null}
                        {message.isStreaming && message.content.length === 0 && <TypingIndicator />}
                      </>
                    )}
                  </div>
                )}
                
                {message.isStreaming && !message.isError && message.content.length > 0 && (
                   <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse rounded-sm align-middle shadow-[0_0_8px_rgba(99,102,241,0.6)]"/>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto relative group">
            {/* Image Preview */}
            {selectedImage && (
                <div className="absolute bottom-full left-0 mb-3 ml-2 animate-in zoom-in-95 fade-in duration-200">
                    <div className="relative group/image">
                        <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-zinc-700 shadow-xl object-cover" />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:text-white p-1 rounded-full border border-zinc-700 shadow-sm"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
            
            <div className="absolute top-1/2 -translate-y-1/2 left-3 z-10 flex items-center gap-1">
                 {/* Model Selector Trigger */}
                 <div className="relative">
                    <button 
                        onClick={() => setShowModelSelector(!showModelSelector)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5"
                        title="Select Model"
                    >
                        {currentModel.icon}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    
                    {/* Model Selector Dropdown */}
                    {showModelSelector && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowModelSelector(false)} />
                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-bottom-2 zoom-in-95 duration-200">
                                <div className="p-2 space-y-1">
                                    <div className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Model</div>
                                    {models.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                if(onModelChange) onModelChange(model.id);
                                                setShowModelSelector(false);
                                            }}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                                                modelId === model.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-zinc-300 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <div className="mt-0.5">{model.icon}</div>
                                            <div>
                                                <div className="text-sm font-medium">{model.name}</div>
                                                <div className="text-xs text-zinc-500">{model.desc}</div>
                                            </div>
                                            {modelId === model.id && <Check className="w-4 h-4 ml-auto text-indigo-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                 </div>

                 {/* Image Upload Button */}
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-1.5 rounded-lg transition-colors ${selectedImage ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    title="Upload Image"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
            </div>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={modelId === 'imagine' ? "Describe the image you want to generate..." : "Message Yahya..."}
            className="w-full bg-zinc-900/50 text-zinc-100 pl-24 pr-12 py-3.5 rounded-2xl border border-zinc-800 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 focus:bg-zinc-900 transition-all resize-none min-h-[52px] max-h-[200px]"
            rows={1}
            disabled={isGenerating}
          />

          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !selectedImage) || isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-center mt-2">
            <span className="text-[10px] text-zinc-600">Yahya AI can make mistakes. Consider checking important information.</span>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;