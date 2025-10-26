/**
 * Agent Types for Random Truffle AI Agents
 *
 * This module defines types for agent configuration, prompts, tools, and responses
 * following Anthropic's principles for effective context engineering.
 */

/**
 * Supported AI models for agents
 */
export type AIModel = 'claude-3-5-sonnet' | 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gpt-4-turbo';

/**
 * Agent types available in Random Truffle
 */
export type AgentType = 'data-science' | 'audience-builder';

/**
 * Agent configuration
 */
export interface AgentConfig {
  /**
   * Agent type identifier
   */
  type: AgentType;

  /**
   * Primary model to use for agent
   */
  primaryModel: AIModel;

  /**
   * Fallback model if primary fails
   */
  fallbackModel?: AIModel;

  /**
   * Maximum input tokens
   */
  maxInputTokens: number;

  /**
   * Maximum output tokens
   */
  maxOutputTokens: number;

  /**
   * Temperature for response generation (0.0 to 1.0)
   */
  temperature: number;

  /**
   * Timeout in milliseconds for agent invocation
   */
  timeoutMs: number;

  /**
   * Maximum retry attempts
   */
  maxRetries: number;

  /**
   * Tools available to the agent
   */
  tools: AgentTool[];
}

/**
 * Agent tool definition
 */
export interface AgentTool {
  /**
   * Tool identifier (must match MCP tool name)
   */
  name: string;

  /**
   * Human-readable description of what the tool does
   */
  description: string;

  /**
   * JSON schema for tool parameters
   */
  parameters: Record<string, unknown>;

  /**
   * Function to execute when tool is invoked
   */
  handler: (params: unknown) => Promise<unknown>;
}

/**
 * Agent prompt structure
 */
export interface AgentPrompt {
  /**
   * Agent type
   */
  type: AgentType;

  /**
   * Prompt version (semver)
   */
  version: string;

  /**
   * System prompt content
   */
  systemPrompt: string;

  /**
   * Shared guidelines content
   */
  guidelines: string;

  /**
   * Shared guardrails content
   */
  guardrails: string;

  /**
   * Last updated timestamp
   */
  lastUpdated: Date;
}

/**
 * Agent invocation request
 */
export interface AgentRequest {
  /**
   * Agent type to invoke
   */
  agentType: AgentType;

  /**
   * User message/query
   */
  message: string;

  /**
   * Conversation history (for multi-turn conversations)
   */
  conversationHistory?: ConversationMessage[];

  /**
   * User context (tenant ID, user ID, etc.)
   */
  context?: AgentContext;

  /**
   * Override default model
   */
  model?: AIModel;
}

/**
 * Conversation message for multi-turn conversations
 */
export interface ConversationMessage {
  /**
   * Role of the message sender
   */
  role: 'user' | 'assistant' | 'system';

  /**
   * Message content
   */
  content: string;

  /**
   * Timestamp of message
   */
  timestamp: Date;

  /**
   * Tool calls made in this message (if any)
   */
  toolCalls?: ToolCall[];
}

/**
 * Tool call made by agent
 */
export interface ToolCall {
  /**
   * Tool name
   */
  toolName: string;

  /**
   * Tool parameters
   */
  parameters: Record<string, unknown>;

  /**
   * Tool result
   */
  result?: unknown;

  /**
   * Error if tool call failed
   */
  error?: string;
}

/**
 * Agent context for request
 */
export interface AgentContext {
  /**
   * Tenant ID (for multi-tenancy)
   */
  tenantId: string;

  /**
   * User ID making the request
   */
  userId: string;

  /**
   * User role (for authorization)
   */
  userRole: 'user' | 'admin' | 'superadmin';

  /**
   * Session ID (for tracking)
   */
  sessionId: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Agent invocation response
 */
export interface AgentResponse {
  /**
   * Success status
   */
  success: boolean;

  /**
   * Agent's response message
   */
  message: string;

  /**
   * Tool calls made by agent
   */
  toolCalls?: ToolCall[];

  /**
   * Model used for response
   */
  model: AIModel;

  /**
   * Token usage
   */
  usage: TokenUsage;

  /**
   * Response metadata
   */
  metadata: AgentResponseMetadata;

  /**
   * Error information (if failed)
   */
  error?: AgentError;
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  /**
   * Input tokens consumed
   */
  inputTokens: number;

  /**
   * Output tokens generated
   */
  outputTokens: number;

  /**
   * Total tokens
   */
  totalTokens: number;

  /**
   * Estimated cost in USD
   */
  estimatedCost: number;
}

/**
 * Agent response metadata
 */
export interface AgentResponseMetadata {
  /**
   * Response time in milliseconds
   */
  responseTimeMs: number;

  /**
   * Retry count (if retries occurred)
   */
  retryCount: number;

  /**
   * Whether response was cached
   */
  cached: boolean;

  /**
   * Request ID for tracking
   */
  requestId: string;

  /**
   * Timestamp of response
   */
  timestamp: Date;
}

/**
 * Agent error
 */
export interface AgentError {
  /**
   * Error code
   */
  code: AgentErrorCode;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Detailed error information
   */
  details?: Record<string, unknown>;
}

/**
 * Agent error codes
 */
export enum AgentErrorCode {
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  MODEL_ERROR = 'MODEL_ERROR',
  TOOL_ERROR = 'TOOL_ERROR',
  PROMPT_ERROR = 'PROMPT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  GUARDRAIL_VIOLATION = 'GUARDRAIL_VIOLATION',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Agent statistics for monitoring
 */
export interface AgentStats {
  /**
   * Agent type
   */
  agentType: AgentType;

  /**
   * Total invocations
   */
  totalInvocations: number;

  /**
   * Successful invocations
   */
  successfulInvocations: number;

  /**
   * Failed invocations
   */
  failedInvocations: number;

  /**
   * Average response time in milliseconds
   */
  avgResponseTimeMs: number;

  /**
   * Total tokens consumed
   */
  totalTokens: number;

  /**
   * Total cost in USD
   */
  totalCost: number;

  /**
   * Success rate (0.0 to 1.0)
   */
  successRate: number;

  /**
   * Statistics period start
   */
  periodStart: Date;

  /**
   * Statistics period end
   */
  periodEnd: Date;
}
