export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  // ARCHITECTURE READY: Tracks which LangGraph agent or RAG system generated this node response
  activeAgentStep?: string; 
}
