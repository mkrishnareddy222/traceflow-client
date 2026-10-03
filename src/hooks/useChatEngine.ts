import { useState } from 'react';
import { Message } from '../types/chat';

export interface ChatPreferences {
  provider: 'groq' | 'openai' | 'gemini';
  temperature: number;
  maxTokens: number;
  rememberConversation: boolean;
  theme: 'light' | 'dark'; // ARCHITECTURE TRACKER: Dynamic design token framework
  apiTokens: {
    groq: string;
    openai: string;
    gemini: string;
  };
}

export function useChatEngine() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [preferences, setPreferences] = useState<ChatPreferences>({
    provider: 'groq',
    temperature: 0.7,
    maxTokens: 2048,
    rememberConversation: true,
    theme: 'dark', // Defaults cleanly to our production darkness matrix
    apiTokens: { groq: '', openai: '', gemini: '' }
  });

  const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/search';

  const sendMessage = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: promptText };
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = { id: botMsgId, sender: 'bot', text: 'Thinking...' };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, botMsg]);
    setIsTyping(true);

    try {
      const customToken = preferences.apiTokens[preferences.provider];
      const formattedHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch(BASE_API_URL, {
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
          history: preferences.rememberConversation ? formattedHistory : [] 
        }),
      });

      if (!response.ok) throw new Error(`Server status crash: ${response.status}`);
      const jsonResponse = await response.json();

      if (jsonResponse && jsonResponse.content) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: jsonResponse.content } : msg
          )
        );
      }
    } catch (error) {
      console.error('Connection fault:', error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMsgId ? { ...msg, text: 'Failed to establish connection to backend router.' } : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    isTyping,
    preferences,
    setPreferences,
    sendMessage,
  };
}
