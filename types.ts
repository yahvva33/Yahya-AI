
export type ModelId = 'flash' | 'pro' | 'deep' | 'creative' | 'imagine';

export interface ImageGenConfig {
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  style?: string;
  negativePrompt?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  image?: string; // Base64 string (User upload)
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  isArchived?: boolean;
  modelId: ModelId;
}

export interface SendMessageOptions {
  message: string;
  image?: string; // Base64
  history: Message[];
}

export interface ChatState {
  currentSessionId: string | null;
  sessions: ChatSession[];
  isSidebarOpen: boolean;
  isGenerating: boolean;
}
