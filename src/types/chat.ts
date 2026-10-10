export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  activeAgentStep?: string; 
  sources?: SourceMetadata[];
}

export interface SourceMetadata {
  source: string;
  session_id?: string;
  file_type?: string;
  page_number?: number | string;
  uploaded_at?: string;
  chunk_number?: number | string;
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
