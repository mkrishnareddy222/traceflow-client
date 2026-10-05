export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  activeAgentStep?: string; 
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

export interface ChatPreferences {
  provider: 'groq' | 'openai' | 'gemini';
  temperature: number;
  maxTokens: number;
  rememberConversation: boolean;
  theme: 'light' | 'dark';
  // RAG CONTRACT FIELDS
  ragEnabled: boolean;
  ragProvider: 'cohere' | 'gemini';
  apiTokens: {
    groq: string;
    openai: string;
    gemini: string;
    cohere: string; // Dynamic tracking token added
  };
}
