/**
 * Agent Invoker for Random Truffle AI Agents
 *
 * Handles agent invocation with retry logic, fallback models, and response formatting.
 * Supports Vertex AI Conversational Agents (synchronous API).
 */

import type {
  AgentConfig,
  AgentRequest,
  AgentResponse,
  AgentError,
  AgentErrorCode,
  AIModel,
  ConversationMessage,
  ToolCall,
  TokenUsage,
} from './types';
import { PromptLoader } from './prompt-loader';

/**
 * Agent invoker configuration
 */
export interface AgentInvokerConfig {
  /**
   * GCP project ID
   */
  projectId: string;

  /**
   * GCP region
   */
  region: string;

  /**
   * Prompt loader instance
   */
  promptLoader?: PromptLoader;

  /**
   * Default timeout in milliseconds
   */
  defaultTimeoutMs?: number;

  /**
   * Default max retries
   */
  defaultMaxRetries?: number;
}

/**
 * Agent Invoker class
 */
export class AgentInvoker {
  private config: Required<AgentInvokerConfig>;
  private promptLoader: PromptLoader;

  constructor(config: AgentInvokerConfig) {
    this.config = {
      ...config,
      promptLoader: config.promptLoader || new PromptLoader(),
      defaultTimeoutMs: config.defaultTimeoutMs || 30000,
      defaultMaxRetries: config.defaultMaxRetries || 3,
    };
    this.promptLoader = this.config.promptLoader;
  }

  /**
   * Invoke agent with request
   *
   * @param request - Agent request
   * @param agentConfig - Agent configuration
   * @returns Agent response
   */
  async invoke(request: AgentRequest, agentConfig: AgentConfig): Promise<AgentResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    let retryCount = 0;
    let lastError: Error | undefined;

    // Try primary model with retries
    while (retryCount <= agentConfig.maxRetries) {
      try {
        const model = retryCount === 0 ? agentConfig.primaryModel : agentConfig.fallbackModel;
        if (!model) {
          throw new Error('No model available');
        }

        const response = await this.invokeModel(request, agentConfig, model, requestId);
        const responseTimeMs = Date.now() - startTime;

        return {
          ...response,
          metadata: {
            ...response.metadata,
            responseTimeMs,
            retryCount,
          },
        };
      } catch (error) {
        lastError = error as Error;
        retryCount++;

        // If max retries reached, throw error
        if (retryCount > agentConfig.maxRetries) {
          break;
        }

        // Exponential backoff
        await this.sleep(Math.pow(2, retryCount) * 1000);
      }
    }

    // All retries failed
    const responseTimeMs = Date.now() - startTime;
    return this.errorResponse(
      'MODEL_ERROR',
      `Failed to invoke agent after ${retryCount} retries: ${lastError?.message || 'Unknown error'}`,
      requestId,
      responseTimeMs,
      retryCount,
      agentConfig.primaryModel
    );
  }

  /**
   * Invoke specific model
   *
   * @param request - Agent request
   * @param config - Agent configuration
   * @param model - Model to invoke
   * @param requestId - Request ID
   * @returns Agent response
   */
  private async invokeModel(
    request: AgentRequest,
    config: AgentConfig,
    model: AIModel,
    requestId: string
  ): Promise<AgentResponse> {
    // Load prompt
    const agentPrompt = await this.promptLoader.load(request.agentType);
    const systemPrompt = this.promptLoader.buildCompletePrompt(agentPrompt);

    // Build messages
    const messages = this.buildMessages(request, systemPrompt);

    // Validate request against guardrails
    this.validateRequest(request, systemPrompt);

    // Invoke model (mock implementation for now)
    // TODO: Replace with actual Vertex AI API call
    const response = await this.mockModelInvocation(messages, model, config);

    return {
      success: true,
      message: response.message,
      toolCalls: response.toolCalls,
      model,
      usage: response.usage,
      metadata: {
        responseTimeMs: 0, // Will be set by caller
        retryCount: 0, // Will be set by caller
        cached: false,
        requestId,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Build messages for model invocation
   *
   * @param request - Agent request
   * @param systemPrompt - System prompt
   * @returns Conversation messages
   */
  private buildMessages(request: AgentRequest, systemPrompt: string): ConversationMessage[] {
    const messages: ConversationMessage[] = [];

    // Add system prompt
    messages.push({
      role: 'system',
      content: systemPrompt,
      timestamp: new Date(),
    });

    // Add conversation history
    if (request.conversationHistory) {
      messages.push(...request.conversationHistory);
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: request.message,
      timestamp: new Date(),
    });

    return messages;
  }

  /**
   * Validate request against guardrails
   *
   * @param request - Agent request
   * @param systemPrompt - System prompt with guardrails
   */
  private validateRequest(request: AgentRequest, _systemPrompt: string): void {
    // Check for forbidden SQL operations (basic check)
    const forbiddenKeywords = ['DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'INSERT', 'UPDATE', 'MERGE'];
    const upperMessage = request.message.toUpperCase();

    for (const keyword of forbiddenKeywords) {
      if (upperMessage.includes(keyword)) {
        throw new Error(
          `Guardrail violation: Request contains forbidden SQL operation '${keyword}'`
        );
      }
    }

    // Additional validation can be added here
  }

  /**
   * Mock model invocation (for testing)
   * TODO: Replace with actual Vertex AI API integration
   *
   * @param messages - Conversation messages
   * @param model - Model to invoke
   * @param config - Agent configuration
   * @returns Mock response
   */
  private async mockModelInvocation(
    messages: ConversationMessage[],
    model: AIModel,
    _config: AgentConfig
  ): Promise<{
    message: string;
    toolCalls?: ToolCall[];
    usage: TokenUsage;
  }> {
    // Simulate API delay
    await this.sleep(500);

    const userMessage = messages[messages.length - 1].content;

    return {
      message: `[Mock Response from ${model}] Received your request: "${userMessage}". This is a placeholder response until Vertex AI integration is complete.`,
      usage: {
        inputTokens: 1000,
        outputTokens: 100,
        totalTokens: 1100,
        estimatedCost: 0.001,
      },
    };
  }

  /**
   * Create error response
   *
   * @param code - Error code
   * @param message - Error message
   * @param requestId - Request ID
   * @param responseTimeMs - Response time
   * @param retryCount - Retry count
   * @param model - Model used
   * @returns Error response
   */
  private errorResponse(
    code: AgentErrorCode,
    message: string,
    requestId: string,
    responseTimeMs: number,
    retryCount: number,
    model: AIModel
  ): AgentResponse {
    const error: AgentError = { code, message };

    return {
      success: false,
      message: '',
      model,
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
      },
      metadata: {
        responseTimeMs,
        retryCount,
        cached: false,
        requestId,
        timestamp: new Date(),
      },
      error,
    };
  }

  /**
   * Generate unique request ID
   *
   * @returns Request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Sleep utility
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create agent invoker instance
 *
 * @param config - Invoker configuration
 * @returns AgentInvoker instance
 */
export function createAgentInvoker(config: AgentInvokerConfig): AgentInvoker {
  return new AgentInvoker(config);
}
