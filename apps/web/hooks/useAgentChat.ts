'use client';

import { useState, useCallback } from 'react';

/**
 * API base URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Agent type enum
 */
export type AgentType = 'data-science' | 'audience-builder';

/**
 * AI Model enum
 */
export type AIModel = 'claude-3-5-sonnet' | 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gpt-4-turbo';

/**
 * Conversation message
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/**
 * Agent chat request
 */
export interface AgentChatRequest {
  agentType: AgentType;
  message: string;
  conversationHistory?: ConversationMessage[];
  model?: AIModel;
  metadata?: Record<string, unknown>;
}

/**
 * Tool call information
 */
export interface ToolCall {
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

/**
 * Token usage
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

/**
 * Agent response
 */
export interface AgentChatResponse {
  success: boolean;
  data?: {
    message: string;
    toolCalls?: ToolCall[];
    model: AIModel;
    usage: TokenUsage;
    metadata: {
      responseTimeMs: number;
      retryCount: number;
      cached: boolean;
      requestId: string;
      timestamp: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Hook for agent chat communication
 */
export function useAgentChat(agentType: AgentType) {
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send message to agent
   */
  const sendMessage = useCallback(
    async (message: string, model?: AIModel): Promise<AgentChatResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const request: AgentChatRequest = {
          agentType,
          message,
          conversationHistory,
          model,
        };

        const response = await fetch(`${API_BASE_URL}/agents/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }

        const result: AgentChatResponse = await response.json();

        if (result.success && result.data) {
          // Add user message to history
          const userMessage: ConversationMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          };

          // Add assistant response to history
          const assistantMessage: ConversationMessage = {
            role: 'assistant',
            content: result.data.message,
            timestamp: result.data.metadata.timestamp,
          };

          setConversationHistory((prev) => [...prev, userMessage, assistantMessage]);
        } else if (result.error) {
          setError(result.error.message);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [agentType, conversationHistory]
  );

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setError(null);
  }, []);

  return {
    conversationHistory,
    loading,
    error,
    sendMessage,
    clearHistory,
  };
}

/**
 * Hook to fetch agent statistics
 */
export function useAgentStats(agentType?: AgentType) {
  const [stats, setStats] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = agentType
        ? `${API_BASE_URL}/agents/${agentType}/stats`
        : `${API_BASE_URL}/agents/stats`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [agentType]);

  return { stats, loading, error, fetchStats };
}
