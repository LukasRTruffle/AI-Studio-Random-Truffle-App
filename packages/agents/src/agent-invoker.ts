/**
 * Agent Invoker for Random Truffle AI Agents
 *
 * Handles agent invocation with retry logic, fallback models, and response formatting.
 * Supports Vertex AI Conversational Agents (synchronous API).
 */

import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import type {
  AgentConfig,
  AgentRequest,
  AgentResponse,
  AgentError,
  AIModel,
  ConversationMessage,
  ToolCall,
  TokenUsage,
} from './types';
import { AgentErrorCode } from './types';
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
  private vertexAI: VertexAI;

  constructor(config: AgentInvokerConfig) {
    this.config = {
      ...config,
      promptLoader: config.promptLoader || new PromptLoader(),
      defaultTimeoutMs: config.defaultTimeoutMs || 30000,
      defaultMaxRetries: config.defaultMaxRetries || 3,
    };
    this.promptLoader = this.config.promptLoader;

    // Initialize Vertex AI client
    this.vertexAI = new VertexAI({
      project: config.projectId,
      location: config.region,
    });
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
      AgentErrorCode.MODEL_ERROR,
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

    // Invoke Vertex AI model
    const response = await this.invokeVertexAI(messages, model, config);

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
   * Invoke Vertex AI model
   *
   * @param messages - Conversation messages
   * @param model - Model to invoke
   * @param config - Agent configuration
   * @returns Model response
   */
  private async invokeVertexAI(
    messages: ConversationMessage[],
    model: AIModel,
    config: AgentConfig
  ): Promise<{
    message: string;
    toolCalls?: ToolCall[];
    usage: TokenUsage;
  }> {
    // Map our model names to Vertex AI model names
    const modelNameMap: Record<string, string> = {
      'gemini-1.5-pro': 'gemini-1.5-pro-002',
      'gemini-1.5-flash': 'gemini-1.5-flash-002',
      'gemini-pro': 'gemini-1.0-pro-002',
      'gpt-4': 'gpt-4', // If using OpenAI via Vertex AI
    };

    const vertexModelName = modelNameMap[model] || model;

    // Get generative model
    const generativeModel = this.vertexAI.getGenerativeModel({
      model: vertexModelName,
      generationConfig: {
        maxOutputTokens: config.maxOutputTokens || 4096,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Build chat session or single request
    // For conversation history, we use chat
    if (messages.length > 2) {
      // Has history beyond system + user message
      const chat = generativeModel.startChat({
        history: messages
          .slice(0, -1) // All except last message
          .filter((msg) => msg.role !== 'system') // Remove system messages from history
          .map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
      });

      const userMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage(userMessage);
      const response = result.response;

      return {
        message: response.candidates?.[0]?.content?.parts?.[0]?.text || '',
        usage: this.extractUsageMetrics(response.usageMetadata),
      };
    } else {
      // Single turn request with system prompt
      const systemMessage = messages.find((m) => m.role === 'system');
      const userMessage = messages.find((m) => m.role === 'user');

      const prompt = systemMessage
        ? `${systemMessage.content}\n\nUser: ${userMessage?.content || ''}`
        : userMessage?.content || '';

      const result = await generativeModel.generateContent(prompt);
      const response = result.response;

      return {
        message: response.candidates?.[0]?.content?.parts?.[0]?.text || '',
        usage: this.extractUsageMetrics(response.usageMetadata),
      };
    }
  }

  /**
   * Extract usage metrics from Vertex AI response
   *
   * @param usageMetadata - Usage metadata from Vertex AI
   * @returns Token usage
   */
  private extractUsageMetrics(usageMetadata: unknown): TokenUsage {
    const metadata = usageMetadata as
      | { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
      | undefined;
    const inputTokens = metadata?.promptTokenCount || 0;
    const outputTokens = metadata?.candidatesTokenCount || 0;
    const totalTokens = metadata?.totalTokenCount || inputTokens + outputTokens;

    // Rough cost estimation (Gemini 1.5 Pro pricing as of 2024)
    // $0.00125 per 1K input tokens, $0.005 per 1K output tokens
    const inputCost = (inputTokens / 1000) * 0.00125;
    const outputCost = (outputTokens / 1000) * 0.005;
    const estimatedCost = inputCost + outputCost;

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
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
