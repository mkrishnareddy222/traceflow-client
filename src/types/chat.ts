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

export type ProcessingStep = 'IDLE' | 'TRANSMITTING' | 'SPLITTING_CHUNKS' | 'EMBEDDING' | 'SUCCESS';

export interface ChatPreferences {
  provider: 'groq' | 'openai' | 'gemini';
  temperature: number;
  maxTokens: number;
  rememberConversation: boolean;
  theme: 'light' | 'dark';
  ragEnabled: boolean;
  ragProvider: 'cohere' | 'gemini';
  // NEW CRITICAL CONFIGURATION TOKENS
  chunkSize: number;
  chunkOverlap: number;
  apiTokens: {
    groq: string;
    openai: string;
    gemini: string;
    cohere: string;
  };
}
