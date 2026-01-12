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
  Code,
  Globe,
  Palette,
  LayoutTemplate,
  Ban,
  ImageIcon as ImageIconLucide
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

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isGenerating, 
  onSendMessage,
  onSidebarToggle,
  onClearConversation,
  sessionTitle,
  modelId = 'flash',
  onModelChange
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  
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
    
    // We need to wait for state update if we just changed model, 
    // but onSendMessage uses the current prop modelId if we passed it down.
    // Ideally the parent handles the model switch and then sends. 
    // For now, we will just send.
    onSendMessage(suggestion.text, undefined, suggestion.modelId === 'imagine' ? imageConfig : undefined);
  };

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  const styles = ['Photorealistic', 'Anime', 'Digital Art', 'Oil Painting', 'Watercolor', 'Sketch', '3D Render', 'Cyberpunk', 'Steampunk'];

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
                        Are you sure you want to clear all messages in this conversation? This action cannot be undone.
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
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
            <button onClick={onSidebarToggle} className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors shrink-0">
                <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col min-w-0">
                <span className="font-semibold text-zinc-100 truncate text-sm md:text-base">
                    {sessionTitle || "New Conversation"}
                </span>
                
                {/* Model Selector Dropdown */}
                <div className="relative mt-0.5">
                    <button 
                        onClick={() => setShowModelSelector(!showModelSelector)}
                        className="group flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-zinc-400 hover:text-indigo-400 transition-colors py-0.5 rounded-md focus:outline-none"
                    >
                        <span className="flex items-center gap-1.5">
                            {React.cloneElement(currentModel.icon as React.ReactElement<{ className?: string }>, { className: "w-3 h-3" })}
                            {currentModel.name}
                        </span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showModelSelector ? 'rotate-180' : ''}`} />
                    </button>

                    {showModelSelector && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowModelSelector(false)} />
                            <div className="absolute top-full left-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                    Select Model
                                </div>
                                <div className="space-y-0.5">
                                {models.map((m) => {
                                    const isSelected = modelId === m.id;
                                    return (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            onModelChange?.(m.id);
                                            setShowModelSelector(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-all ${
                                            isSelected 
                                                ? 'bg-zinc-800 text-zinc-100' 
                                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                        }`}
                                    >
                                        <div className={`mt-0.5 p-1.5 rounded-md bg-zinc-950 border border-zinc-800 ${isSelected ? 'ring-1 ring-indigo-500/50 border-indigo-500/50' : ''}`}>
                                            {m.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-xs font-semibold">{m.name}</div>
                                                {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                                            </div>
                                            <div className="text-[10px] text-zinc-500 leading-tight mt-0.5 truncate">{m.desc}</div>
                                        </div>
                                    </button>
                                    );
                                })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        
        {messages.length > 0 && (
            <button 
                onClick={() => setShowClearConfirm(true)}
                className="p-2 ml-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                title="Clear conversation"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 lg:p-8 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 mb-2 relative group">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
                    <YahyaLogo className="w-full h-full relative z-10 shadow-2xl" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">How can I help you today?</h2>
                    <p className="text-zinc-400 max-w-md text-sm">
                        I'm ready to assist you with coding, analysis, creative writing, and more using <span className="text-zinc-300 font-medium">{currentModel.name}</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full px-4">
               {suggestions.map((suggestion, index) => (
                   <button 
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isGenerating}
                    className="group p-4 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 hover:border-indigo-500/30 rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col gap-2"
                   >
                       <div className="flex items-center gap-2 text-zinc-300 font-medium text-sm group-hover:text-indigo-400 transition-colors">
                            {suggestion.icon}
                            <span>{suggestion.label}</span>
                       </div>
                       <p className="text-xs text-zinc-500 group-hover:text-zinc-400 line-clamp-2">
                           "{suggestion.text}"
                       </p>
                   </button>
               ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-4xl mx-auto ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Avatar - Model */}
              {msg.role === 'model' && (
                <div className={`w-8 h-8 flex-shrink-0 mt-1 shadow-lg shadow-indigo-900/20 transition-all duration-300 ${
                  msg.isStreaming ? 'scale-105' : ''
                }`}>
                  <YahyaLogo className={`w-full h-full ${msg.isStreaming ? 'animate-pulse' : ''}`} />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`relative px-5 py-3.5 rounded-2xl max-w-[85%] lg:max-w-[75%] shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm'
                    : 'bg-transparent text-zinc-300 rounded-tl-sm px-0 lg:px-0'
                }`}
              >
                {msg.image && (
                  <div className="mb-3 overflow-hidden rounded-lg border border-zinc-700">
                    <img src={msg.image} alt="User upload" className="max-h-64 object-cover" />
                  </div>
                )}
                
                {msg.role === 'model' ? (
                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 max-w-none min-h-[24px]">
                        {!msg.content && msg.isStreaming ? (
                            <div className="flex items-center gap-1.5 h-6 pl-1">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                            </div>
                        ) : (
                             <>
                                <MarkdownRenderer content={msg.content} />
                                {msg.isStreaming && (
                                    <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-sub rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                )}
                             </>
                        )}
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>

              {/* Avatar - User */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-zinc-300" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto relative">
          
          {/* Image Settings Panel (Only for Imagine Model) */}
          {modelId === 'imagine' && (
             <div className="mb-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2">
                 {/* Aspect Ratio */}
                 <div className="space-y-1">
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                         <LayoutTemplate className="w-3 h-3" /> Aspect Ratio
                     </label>
                     <select 
                        value={imageConfig.aspectRatio}
                        onChange={(e) => setImageConfig({...imageConfig, aspectRatio: e.target.value as any})}
                        className="w-full bg-zinc-950 text-zinc-300 text-xs p-2 rounded-lg border border-zinc-800 focus:border-indigo-500 outline-none"
                     >
                         {aspectRatios.map(r => <option key={r} value={r}>{r}</option>)}
                     </select>
                 </div>

                 {/* Style */}
                 <div className="space-y-1">
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                         <Palette className="w-3 h-3" /> Style
                     </label>
                     <select 
                        value={imageConfig.style}
                        onChange={(e) => setImageConfig({...imageConfig, style: e.target.value})}
                        className="w-full bg-zinc-950 text-zinc-300 text-xs p-2 rounded-lg border border-zinc-800 focus:border-indigo-500 outline-none"
                     >
                         <option value="">None (Default)</option>
                         {styles.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                 </div>

                  {/* Negative Prompt */}
                  <div className="space-y-1">
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                         <Ban className="w-3 h-3" /> Negative Prompt
                     </label>
                     <input 
                        type="text"
                        value={imageConfig.negativePrompt}
                        onChange={(e) => setImageConfig({...imageConfig, negativePrompt: e.target.value})}
                        placeholder="e.g. blur, low quality"
                        className="w-full bg-zinc-950 text-zinc-300 text-xs p-2 rounded-lg border border-zinc-800 focus:border-indigo-500 outline-none"
                     />
                 </div>
             </div>
          )}

          {/* Image Preview */}
          {selectedImage && (
            <div className="absolute bottom-full left-0 mb-4 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-full p-1 border border-zinc-700 shadow-sm"
              >
                <div className="sr-only">Remove image</div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end gap-2 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-lg">
            
            {/* File Upload Button */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-xl transition-colors"
                title="Upload image"
            >
                <ImageIconLucide className="w-5 h-5" />
            </button>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={modelId === 'imagine' ? "Describe the image you want to generate..." : `Message ${currentModel.name}...`}
                rows={1}
                className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none py-3 px-2 max-h-48 leading-relaxed"
            />

            {/* Send Button */}
            <button
                onClick={handleSend}
                disabled={(!inputText.trim() && !selectedImage) || isGenerating}
                className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    (!inputText.trim() && !selectedImage) || isGenerating
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                }`}
            >
                {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Send className="w-5 h-5" />
                )}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-zinc-600">
                Yahya AI V2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;