import { useState } from 'react';
import { Platform } from 'react-native';
import { Message, ChatPreferences, UploadedFile, ProcessingStep } from '../types/chat';

export function useChatEngine() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // NEW LOGIC: Explicit layout pipeline stage controls
  const [ragProcessingStep, setRagProcessingStep] = useState<ProcessingStep>('IDLE');
  const [indexedFiles, setIndexedFiles] = useState<UploadedFile[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const [preferences, setPreferences] = useState<ChatPreferences>({
    provider: 'groq',
    temperature: 0.7,
    maxTokens: 2048,
    rememberConversation: true,
    theme: 'dark',
    ragEnabled: false,
    ragProvider: 'gemini',
    chunkSize: 500,     // Default server threshold matching rag.py
    chunkOverlap: 50,
    apiTokens: { groq: '', openai: '', gemini: '', cohere: '' }
  });

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  const ingestFileWithProgress = async (fileObj: { uri: string; name: string; type: string, blob?: any }) => {
    // Stage 1: Transmitting payload package
    setRagProcessingStep('TRANSMITTING');
    await new Promise(r => setTimeout(r, 800));

    // Stage 2: Parsing & chunking text structures over backend slider weights
    setRagProcessingStep('SPLITTING_CHUNKS');
    
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('provider', preferences.ragProvider);
      
      // Map sliders text settings onto Multi-part parameters lookup
      formData.append('chunk_size', preferences.chunkSize.toString());
      formData.append('chunk_overlap', preferences.chunkOverlap.toString());

      if (Platform.OS === 'web') {
        const res = await fetch(fileObj.uri);
        const finalFileBlob = await res.blob();
        formData.append('files', finalFileBlob, fileObj.name);
      } else {
        formData.append('files', { uri: fileObj.uri, name: fileObj.name, type: fileObj.type } as any);
      }

      const response = await fetch(`${BASE_URL}/api/rag/upload`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed code: ${response.status}`);
      
      // Stage 3: Vector indexing embedding processing loop
      setRagProcessingStep('EMBEDDING');
      await new Promise(r => setTimeout(r, 1200));

      // Stage 4: Ingestion loop verified
      setRagProcessingStep('SUCCESS');
      setIndexedFiles(prev => [...prev, { id: Date.now().toString(), name: fileObj.name, size: 'Synced' }]);
      await new Promise(r => setTimeout(r, 800));
      
    } catch (err) {
      console.error(err);
      alert('Document ingestion pipeline encountered an unexpected validation failure.');
    } finally {
      setRagProcessingStep('IDLE'); // Restore default view boards state
    }
  };

  const sendMessage = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: promptText };
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = { id: botMsgId, sender: 'bot', text: 'Thinking...' };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setIsTyping(true);

    try {
      let response;
      if (preferences.ragEnabled) {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('message', promptText);
        formData.append('provider', preferences.ragProvider);
        formData.append('temperature', preferences.temperature.toString());
        formData.append('max_tokens', preferences.maxTokens.toString());

        response = await fetch(`${BASE_URL}/api/rag/query`, { method: 'POST', body: formData });
      } else {
        const customToken = preferences.apiTokens[preferences.provider];
        const formattedHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        response = await fetch(`${BASE_URL}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: promptText,
            remember: preferences.rememberConversation,
            provider: preferences.provider,
            api_key_override: customToken || null,
            temperature: preferences.temperature,
            top_p: 1.0,
            max_tokens: preferences.maxTokens,
            history: preferences.rememberConversation ? formattedHistory : [],
          }),
        });
      }

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const jsonResponse = await response.json();

      if (jsonResponse && jsonResponse.content) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => msg.id === botMsgId ? { ...msg, text: jsonResponse.content } : msg)
        );
      }
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) => msg.id === botMsgId ? { ...msg, text: 'Failed to establish connection to target endpoint.' } : msg)
      );
    } finally {
      setIsTyping(false);
    }
  };

  const clearActiveFilesContext = () => setIndexedFiles([]);

  return { 
    messages, 
    isTyping, 
    ragProcessingStep, 
    indexedFiles, 
    preferences, 
    setPreferences, 
    sendMessage, 
    ingestFileWithProgress,
    clearActiveFilesContext
  };
}
  