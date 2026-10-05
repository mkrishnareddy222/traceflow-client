import { useState } from 'react';
import { Message, ChatPreferences } from '../types/chat';

export function useChatEngine() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
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

  const sendMessage = async (promptText: string, attachedFiles: any[] = []) => {
    if (!promptText.trim() && attachedFiles.length === 0) return;

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

      // DUAL ROUTING LOGIC: Call dedicated paths based on user selection state
      const targetEndpoint = preferences.ragEnabled 
        ? `${BASE_URL}/api/rag/search`  // RAG Endpoint
        : `${BASE_URL}/api/search`;     // Standard Base Endpoint

      const response = await fetch(targetEndpoint, {
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
          // Pass downstream parameters conditionally if RAG switch triggers active
          ...(preferences.ragEnabled ? {
            rag_provider: preferences.ragProvider,
            rag_token: preferences.apiTokens.cohere || null,
            files: attachedFiles.map(f => f.name)
          } : {})
        }),
      });

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

  return { messages, isTyping, preferences, setPreferences, sendMessage };
}
