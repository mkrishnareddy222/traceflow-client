import { useState } from 'react';
import { Platform } from 'react-native'; // FIXED: Importing the official Native/Web Platform detector module
import { Message, ChatPreferences, UploadedFile } from '../types/chat';

export function useChatEngine() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  
  // Unique persistent session ID for RAG database storage partition mapping
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`);

  const [preferences, setPreferences] = useState<ChatPreferences>({
    provider: 'groq',
    temperature: 0.7,
    maxTokens: 2048,
    rememberConversation: true,
    theme: 'dark',
    ragEnabled: false,
    ragProvider: 'cohere',
    apiTokens: { groq: '', openai: '', gemini: '', cohere: '' }
  });

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  // =================================══════════════════════════════
  // REPAIRED ENGINE: Hybrid File Blob Multipart Transformer
  // =================================══════════════════════════════
  const uploadFileToServer = async (fileObj: { uri: string; name: string; type: string, blob?: any }): Promise<UploadedFile | null> => {
    setIsFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('provider', preferences.ragProvider);
      
      // Using core react-native Platform engine check cleanly
      if (Platform.OS === 'web') {
        let finalFileBlob;
        if (fileObj.uri.startsWith('data:') || fileObj.uri.startsWith('blob:')) {
          const res = await fetch(fileObj.uri);
          finalFileBlob = await res.blob();
        } else if (fileObj.blob && fileObj.blob.file) {
          finalFileBlob = fileObj.blob.file;
        } else {
          const res = await fetch(fileObj.uri);
          finalFileBlob = await res.blob();
        }
        formData.append('files', finalFileBlob, fileObj.name);
      } else {
        // Native mobile systems track files via local system paths
        formData.append('files', {
          uri: fileObj.uri,
          name: fileObj.name,
          type: fileObj.type,
        } as any);
      }

      const response = await fetch(`${BASE_URL}/api/rag/upload`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload fault server code: ${response.status}`);
      const data = await response.json();
      console.log('RAG Indexing Success:', data.message);

      return { id: Date.now().toString(), name: fileObj.name, size: 'Synced' };
    } catch (err) {
      console.error('Network file stream failure:', err);
      return null;
    } finally {
      setIsFileUploading(false);
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
      const customToken = preferences.apiTokens[preferences.provider];
      const formattedHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      let response;
      if (preferences.ragEnabled) {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('message', promptText);
        formData.append('provider', preferences.ragProvider);
        formData.append('temperature', preferences.temperature.toString());
        formData.append('max_tokens', preferences.maxTokens.toString());

        response = await fetch(`${BASE_URL}/api/rag/query`, {
          method: 'POST',
          body: formData,
        });
      } else {
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

      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      const jsonResponse = await response.json();

      if (jsonResponse && jsonResponse.content) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => msg.id === botMsgId ? { ...msg, text: jsonResponse.content } : msg)
        );
      }
    } catch (error) {
      console.error('Connection fault:', error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) => msg.id === botMsgId ? { ...msg, text: 'Failed to establish connection to target endpoint.' } : msg)
      );
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, isTyping, isFileUploading, preferences, setPreferences, sendMessage, uploadFileToServer };
}
