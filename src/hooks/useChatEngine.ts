import { useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { Message, ChatPreferences, UploadedFile, ProcessingStep, SourceMetadata } from '../types/chat';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readSourceMetadata = (value: unknown): SourceMetadata | null => {
  if (!isRecord(value)) return null;

  const metadata = isRecord(value.metadata) ? value.metadata : value;
  const sourceName = metadata.source ?? metadata.filename ?? metadata.file_name ?? metadata.document_name;
  if (typeof sourceName !== 'string') return null;

  return {
    source: sourceName,
    ...(typeof metadata.session_id === 'string' && { session_id: metadata.session_id }),
    ...(typeof metadata.file_type === 'string' && { file_type: metadata.file_type }),
    ...((typeof metadata.page_number === 'number' || typeof metadata.page_number === 'string') && {
      page_number: metadata.page_number,
    }),
    ...(typeof metadata.uploaded_at === 'string' && { uploaded_at: metadata.uploaded_at }),
    ...((typeof metadata.chunk_number === 'number' || typeof metadata.chunk_number === 'string') && {
      chunk_number: metadata.chunk_number,
    }),
  };
};

const readResponseSources = (response: unknown, content: string): SourceMetadata[] => {
  if (!isRecord(response)) return [];

  const sourceData = response.sources ?? response.source_documents ?? response.citations ?? response.metadata;
  const candidates = (Array.isArray(sourceData) ? sourceData : [sourceData])
    .map(readSourceMetadata)
    .filter((source): source is SourceMetadata => source !== null);

  if (candidates.length > 0) return candidates;

  return Array.from(content.matchAll(/【([^】]+)】/g), ([, citation]) => {
    const [sourceName, ...details] = citation.split('|').map((detail) => detail.trim());
    const chunk = details.join(' ').match(/\bchunk\s*:\s*(\d+)/i)?.[1];
    return {
      source: sourceName,
      ...(chunk && { chunk_number: chunk }),
    };
  }).filter((source) => source.source.length > 0);
};

const readChunkCount = (value: unknown): number | undefined => {
  if (Array.isArray(value)) {
    const counts = value.map(readChunkCount).filter((count): count is number => count !== undefined);
    return counts.length > 0 ? counts.reduce((total, count) => total + count, 0) : undefined;
  }
  if (!isRecord(value)) return undefined;

  const countKeys = [
    'chunk_count',
    'chunkCount',
    'total_chunks',
    'totalChunks',
    'chunks_count',
    'chunksCount',
    'chunks_created',
    'chunks_processed',
    'embedded_chunks',
    'num_chunks',
    'chunks',
  ];
  for (const key of countKeys) {
    const count = value[key];
    if (typeof count === 'number' && Number.isFinite(count) && count >= 0) return count;
  }

  if (Array.isArray(value.chunks)) return value.chunks.length;

  for (const key of [
    'data',
    'result',
    'results',
    'documents',
    'files',
    'processed_files',
    'uploaded_files',
    'ingested_files',
    'items',
  ]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      const counts = nested.map(readChunkCount).filter((count): count is number => count !== undefined);
      if (counts.length > 0) return counts.reduce((total, count) => total + count, 0);
    } else {
      const count = readChunkCount(nested);
      if (count !== undefined) return count;
    }
  }

  return undefined;
};

const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return 'Uploaded';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function useChatEngine() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // NEW LOGIC: Explicit layout pipeline stage controls
  const [ragProcessingStep, setRagProcessingStep] = useState<ProcessingStep>('IDLE');
  const [indexedFiles, setIndexedFiles] = useState<UploadedFile[]>([]);
  const [ragUploadError, setRagUploadError] = useState<string | null>(null);
  const [currentUploadName, setCurrentUploadName] = useState<string | null>(null);
  const [uploadAttempts, setUploadAttempts] = useState(0);
  const [failedUploadCount, setFailedUploadCount] = useState(0);
  const [totalUploadDuration, setTotalUploadDuration] = useState(0);
  const [successfulUploadCount, setSuccessfulUploadCount] = useState(0);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const [preferences, setPreferences] = useState<ChatPreferences>(() => ({
    provider: 'gemini',
    temperature: 0.7,
    maxTokens: 2048,
    rememberConversation: true,
    theme: Platform.OS !== 'web' || Dimensions.get('window').width < 768 ? 'light' : 'dark',
    ragEnabled: false,
    ragProvider: 'gemini',
    chunkSize: 500,     // Default server threshold matching rag.py
    chunkOverlap: 50,
    apiTokens: { groq: '', openai: '', gemini: '', cohere: '' }
  }));

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  const ingestFileWithProgress = async (fileObj: {
    uri: string;
    name: string;
    type: string;
    blob?: Blob;
    size?: number;
  }) => {
    setRagUploadError(null);
    setCurrentUploadName(fileObj.name);
    setUploadAttempts((attempts) => attempts + 1);
    setRagProcessingStep('TRANSMITTING');
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    try {
      timeoutId = setTimeout(() => controller.abort(), 120_000);
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('provider', preferences.ragProvider);
      
      // Map sliders text settings onto Multi-part parameters lookup
      formData.append('chunk_size', preferences.chunkSize.toString());
      formData.append('chunk_overlap', preferences.chunkOverlap.toString());
      const embeddingApiKey = preferences.apiTokens[preferences.ragProvider];
      if (embeddingApiKey) formData.append('api_key', embeddingApiKey);

      if (Platform.OS === 'web') {
        const fileResponse = fileObj.blob ? null : await fetch(fileObj.uri, { signal: controller.signal });
        if (fileResponse && !fileResponse.ok) {
          throw new Error(`Could not read the selected document (${fileResponse.status}). Please select it again.`);
        }
        const finalFileBlob = fileObj.blob ?? await fileResponse!.blob();
        formData.append('files', finalFileBlob, fileObj.name);
      } else {
        formData.append('files', { uri: fileObj.uri, name: fileObj.name, type: fileObj.type } as any);
      }

      setRagProcessingStep('SPLITTING_CHUNKS');
      const uploadUrl = `${BASE_URL}/api/rag/upload`;
      console.info('[RAG upload] Sending request', {
        method: 'POST',
        url: uploadUrl,
        fileName: fileObj.name,
        provider: preferences.ragProvider,
      });
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
        signal: controller.signal,
      });
      console.info('[RAG upload] Response received', {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const responseText = await response.text();
        let detail = responseText;
        try {
          const body: unknown = JSON.parse(responseText);
          if (isRecord(body)) {
            const message = body.detail ?? body.message ?? body.error;
            if (typeof message === 'string') detail = message;
          }
        } catch {
          // Keep the plain-text response as the backend error detail.
        }
        throw new Error(detail
          ? `Upload failed (${response.status}): ${detail.slice(0, 300)}`
          : `Upload failed (${response.status}).`);
      }

      const responseText = await response.text();
      let uploadResult: unknown;
      if (responseText) {
        try {
          uploadResult = JSON.parse(responseText);
        } catch {
          console.warn('[RAG upload] Successful response was not JSON; chunk count is unavailable');
        }
      }
      const durationSeconds = (Date.now() - startedAt) / 1000;
      const chunkCount = readChunkCount(uploadResult);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = undefined;
      console.info('[RAG upload] Indexing complete', {
        fileName: fileObj.name,
        chunkCount: chunkCount ?? 'not returned by API',
      });
      setRagProcessingStep('SUCCESS');
      setIndexedFiles((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${fileObj.name}`,
          name: fileObj.name,
          size: formatFileSize(fileObj.size),
          ...(chunkCount !== undefined && { chunkCount }),
          durationSeconds,
          uploadedAt: new Date().toISOString(),
        },
      ]);
      setTotalUploadDuration((duration) => duration + durationSeconds);
      setSuccessfulUploadCount((count) => count + 1);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error && err.name === 'AbortError'
        ? 'Document upload timed out after 2 minutes. Check that the RAG API is running and reachable, then try again.'
        : err instanceof TypeError
          ? `Could not connect to the RAG API at ${BASE_URL}. Check that the server is running, the API URL is correct, and browser CORS is configured.`
        : err instanceof Error
          ? err.message
          : 'Document upload failed for an unknown reason.';
      setRagUploadError(message);
      setFailedUploadCount((count) => count + 1);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setCurrentUploadName(null);
      setRagProcessingStep('IDLE');
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
        const embeddingApiKey = preferences.apiTokens[preferences.ragProvider];
        if (embeddingApiKey) formData.append('api_key', embeddingApiKey);

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
        const sources = preferences.ragEnabled
          ? readResponseSources(jsonResponse, jsonResponse.content)
          : undefined;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMsgId
              ? { ...msg, text: jsonResponse.content, ...(sources?.length && { sources }) }
              : msg
          )
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
  const clearMessages = () => setMessages([]);

  return { 
    messages, 
    isTyping, 
    ragProcessingStep, 
    ragUploadError,
    currentUploadName,
    uploadAttempts,
    failedUploadCount,
    successfulUploadCount,
    totalUploadDuration,
    indexedFiles, 
    preferences, 
    setPreferences, 
    sendMessage, 
    ingestFileWithProgress,
    clearActiveFilesContext,
    clearMessages
  };
}
  