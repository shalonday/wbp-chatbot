import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, SearchResult, MaterialRequest } from '../types';
import { generateSessionId } from '../utils/common';
import { PerkAPIClient } from '../api/perkClient';

interface UseChatbotOptions {
  apiClient: PerkAPIClient;
  systemPrompt?: string;
  customInstructions?: string;
  onMaterialRequestSubmit?: (request: MaterialRequest) => Promise<void>;
}

export function useChatbot(options: UseChatbotOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef(generateSessionId());

  const systemPrompt = options.systemPrompt || getDefaultSystemPrompt();
  const finalPrompt = options.customInstructions
    ? `${systemPrompt}\n\n${options.customInstructions}`
    : systemPrompt;

  const addMessage = useCallback(
    (
      role: 'user' | 'assistant',
      content: string,
      metadata?: ChatMessage['metadata']
    ) => {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        role,
        content,
        timestamp: new Date(),
        metadata,
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    []
  );

  const search = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      try {
        setIsLoading(true);
        setError(null);
        const results = await options.apiClient.searchBySimilarity(query);
        return results;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Search failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options.apiClient]
  );

  const submitMaterialRequest = useCallback(
    async (
      userIntent: string,
      suggestedMaterials: SearchResult[],
      userIdentification?: string
    ) => {
      const request: MaterialRequest = {
        userIntent,
        suggestedMaterials,
        userIdentification,
        sessionId: sessionIdRef.current,
        timestamp: new Date(),
      };

      try {
        setIsLoading(true);
        setError(null);

        if (options.onMaterialRequestSubmit) {
          await options.onMaterialRequestSubmit(request);
        } else {
          await options.apiClient.submitMaterialRequest(request);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Request submission failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId: sessionIdRef.current,
    addMessage,
    search,
    submitMaterialRequest,
    clear,
    systemPrompt: finalPrompt,
  };
}

function getDefaultSystemPrompt(): string {
  return `You are a helpful AI assistant for the Web Brain Project (WBP), a platform for discovering educational content organized as a graph of skills and learning materials.

Your responsibilities:
1. Help users search for skills and learning materials that match their queries, even if the exact wording differs
2. When users ask about adding new materials, first search for related existing materials to avoid duplicates
3. Provide clear, concise responses with relevant information about skills and learning paths
4. Format results as clickable links when displaying nodes (use format /paths/:startId/:endId)
5. Ask for confirmation before submitting material requests to the admin

Guidelines:
- Be conversational and encouraging
- When users ask about adding materials, explain what you found and ask if they'd like to proceed
- Always include the node ID and name in results so links can be generated
- If unsure about a query, ask clarifying questions
`;
}
