/**
 * Agent Manager for Random Truffle AI Agents
 *
 * High-level API for managing and invoking AI agents.
 * Handles agent registration, configuration, and invocation routing.
 */

import type {
  AgentConfig,
  AgentRequest,
  AgentResponse,
  AgentType,
  AgentStats,
  AgentTool,
} from './types';
import { AgentInvoker, type AgentInvokerConfig } from './agent-invoker';
import { PromptLoader } from './prompt-loader';
// TODO: Re-enable MCP BigQuery connector once package is built
// import { createMCPBigQueryConnector } from '@random-truffle/mcp-bigquery';

/**
 * Agent manager configuration
 */
export interface AgentManagerConfig {
  /**
   * GCP project ID
   */
  projectId: string;

  /**
   * GCP region
   */
  region: string;

  /**
   * BigQuery dataset ID (for data science agent tools)
   */
  datasetId: string;

  /**
   * Enable statistics tracking
   */
  enableStats?: boolean;
}

/**
 * Agent Manager class
 */
export class AgentManager {
  private config: Required<AgentManagerConfig>;
  private agents: Map<AgentType, AgentConfig> = new Map();
  private invoker: AgentInvoker;
  private promptLoader: PromptLoader;
  private stats: Map<AgentType, AgentStats> = new Map();
  // TODO: Re-enable MCP BigQuery connector once package is built
  // private mcpConnector: ReturnType<typeof createMCPBigQueryConnector>;

  constructor(config: AgentManagerConfig) {
    this.config = {
      ...config,
      enableStats: config.enableStats ?? true,
    };

    this.promptLoader = new PromptLoader();

    const invokerConfig: AgentInvokerConfig = {
      projectId: config.projectId,
      region: config.region,
      promptLoader: this.promptLoader,
    };
    this.invoker = new AgentInvoker(invokerConfig);

    // TODO: Re-enable MCP BigQuery connector once package is built
    // Initialize MCP BigQuery connector for tools
    // this.mcpConnector = createMCPBigQueryConnector({
    //   projectId: config.projectId,
    //   datasetId: config.datasetId,
    //   cache: {
    //     enabled: true,
    //     ttlSeconds: 300,
    //     maxSize: 1000,
    //   },
    //   rateLimit: {
    //     enabled: true,
    //     maxRequestsPerMinute: 100,
    //     maxRequestsPerHour: 1000,
    //   },
    // });

    // Register default agents
    this.registerDefaultAgents();
  }

  /**
   * Register default agents
   */
  private registerDefaultAgents(): void {
    // Data Science Agent
    this.registerAgent('data-science', {
      type: 'data-science',
      primaryModel: 'gemini-1.5-pro',
      fallbackModel: 'gemini-1.5-flash',
      maxInputTokens: 100000,
      maxOutputTokens: 4000,
      temperature: 0.2,
      timeoutMs: 30000,
      maxRetries: 3,
      tools: this.createDataScienceTools(),
    });

    // Audience Builder Agent
    this.registerAgent('audience-builder', {
      type: 'audience-builder',
      primaryModel: 'claude-3-5-sonnet',
      fallbackModel: 'gemini-1.5-pro',
      maxInputTokens: 100000,
      maxOutputTokens: 4000,
      temperature: 0.4,
      timeoutMs: 30000,
      maxRetries: 3,
      tools: this.createAudienceBuilderTools(),
    });
  }

  /**
   * Create Data Science Agent tools
   *
   * @returns Array of agent tools
   */
  private createDataScienceTools(): AgentTool[] {
    return [
      {
        name: 'execute_bigquery_query',
        description: 'Execute SQL queries against BigQuery',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'SQL query to execute' },
            timeoutMs: { type: 'number', description: 'Query timeout in milliseconds' },
            maxResults: { type: 'number', description: 'Maximum number of results to return' },
          },
          required: ['query'],
        },
        handler: async (params: unknown) => {
          const {
            query: _query,
            timeoutMs: _timeoutMs,
            maxResults: _maxResults,
          } = params as {
            query: string;
            timeoutMs?: number;
            maxResults?: number;
          };

          // TODO: Re-enable MCP BigQuery connector once package is built
          // For now, return mock data
          console.warn('MCP BigQuery connector not available. Returning mock data.');
          return {
            rows: [],
            totalRows: 0,
            schema: [],
            message: 'MCP BigQuery connector not yet available. This is a stub response.',
          };

          // const response = await this.mcpConnector.handle({
          //   method: 'bigquery.query',
          //   params: { query, timeoutMs: timeoutMs || 30000, maxResults: maxResults || 1000 },
          // });

          // if (!response.success) {
          //   throw new Error(response.error?.message || 'Query execution failed');
          // }

          // return response.data;
        },
      },
      {
        name: 'get_table_schema',
        description: 'Get schema information for BigQuery tables',
        parameters: {
          type: 'object',
          properties: {
            tableName: { type: 'string', description: 'Name of table' },
          },
          required: ['tableName'],
        },
        handler: async (params: unknown) => {
          const { tableName } = params as { tableName: string };

          // TODO: Re-enable MCP BigQuery connector once package is built
          console.warn('MCP BigQuery connector not available. Returning mock data.');
          return { tableName, columns: [], message: 'MCP BigQuery connector not yet available.' };
        },
      },
      {
        name: 'list_available_tables',
        description: 'List all tables and views in the dataset',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: async () => {
          // TODO: Re-enable MCP BigQuery connector once package is built
          console.warn('MCP BigQuery connector not available. Returning mock data.');
          return { tables: [], message: 'MCP BigQuery connector not yet available.' };
        },
      },
      {
        name: 'estimate_query_cost',
        description: 'Estimate cost before executing expensive queries',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'SQL query to estimate' },
          },
          required: ['query'],
        },
        handler: async (params: unknown) => {
          const { query: _query } = params as { query: string };

          // TODO: Re-enable MCP BigQuery connector once package is built
          console.warn('MCP BigQuery connector not available. Returning mock data.');
          return {
            estimatedBytes: 0,
            estimatedCost: 0,
            message: 'MCP BigQuery connector not yet available.',
          };
        },
      },
    ];
  }

  /**
   * Create Audience Builder Agent tools
   *
   * @returns Array of agent tools
   */
  private createAudienceBuilderTools(): AgentTool[] {
    return [
      {
        name: 'estimate_audience_size',
        description: 'Estimate audience size based on criteria',
        parameters: {
          type: 'object',
          properties: {
            criteria: {
              type: 'object',
              description: 'Segmentation criteria',
              properties: {
                recency_days: { type: 'number' },
                min_revenue: { type: 'number' },
                min_sessions: { type: 'number' },
                min_conversions: { type: 'number' },
                device_category: { type: 'string' },
                country: { type: 'string' },
                traffic_source: { type: 'string' },
                consent_ad_personalization: { type: 'boolean' },
              },
            },
          },
          required: ['criteria'],
        },
        handler: async (_params: unknown) => {
          // TODO: Implement audience size estimation
          return {
            estimated_size: 0,
            meets_platform_minimums: {},
            characteristics: {},
          };
        },
      },
      {
        name: 'generate_audience_sql',
        description: 'Generate SQL definition for audience',
        parameters: {
          type: 'object',
          properties: {
            audience_name: { type: 'string', description: 'Descriptive name for audience' },
            criteria: { type: 'object', description: 'Same as estimate_audience_size' },
            include_comments: { type: 'boolean', description: 'Add SQL comments' },
          },
          required: ['audience_name', 'criteria'],
        },
        handler: async (_params: unknown) => {
          // TODO: Implement SQL generation
          return '';
        },
      },
      {
        name: 'recommend_channels',
        description: 'Recommend activation channels based on audience characteristics',
        parameters: {
          type: 'object',
          properties: {
            audience_characteristics: { type: 'object' },
            campaign_goal: {
              type: 'string',
              enum: ['awareness', 'consideration', 'conversion'],
            },
            budget: { type: 'number', description: 'Total budget in USD' },
          },
          required: ['audience_characteristics', 'campaign_goal'],
        },
        handler: async (_params: unknown) => {
          // TODO: Implement channel recommendations
          return { recommendations: [] };
        },
      },
      {
        name: 'validate_audience_consent',
        description: 'Check consent compliance for audience activation',
        parameters: {
          type: 'object',
          properties: {
            audience_sql: { type: 'string', description: 'SQL definition' },
            regions: { type: 'array', items: { type: 'string' } },
          },
          required: ['audience_sql'],
        },
        handler: async (_params: unknown) => {
          // TODO: Implement consent validation
          return {
            compliant: true,
            total_users: 0,
            consented_users: 0,
            non_consented_users: 0,
            compliance_rate: 1.0,
            recommendations: [],
          };
        },
      },
    ];
  }

  /**
   * Register agent with configuration
   *
   * @param type - Agent type
   * @param config - Agent configuration
   */
  registerAgent(type: AgentType, config: AgentConfig): void {
    this.agents.set(type, config);

    // Initialize stats
    if (this.config.enableStats) {
      this.stats.set(type, {
        agentType: type,
        totalInvocations: 0,
        successfulInvocations: 0,
        failedInvocations: 0,
        avgResponseTimeMs: 0,
        totalTokens: 0,
        totalCost: 0,
        successRate: 0,
        periodStart: new Date(),
        periodEnd: new Date(),
      });
    }
  }

  /**
   * Invoke agent with request
   *
   * @param request - Agent request
   * @returns Agent response
   */
  async invoke(request: AgentRequest): Promise<AgentResponse> {
    const agentConfig = this.agents.get(request.agentType);
    if (!agentConfig) {
      throw new Error(`Agent '${request.agentType}' not registered`);
    }

    // Invoke agent
    const response = await this.invoker.invoke(request, agentConfig);

    // Update statistics
    if (this.config.enableStats) {
      this.updateStats(request.agentType, response);
    }

    return response;
  }

  /**
   * Update statistics for agent
   *
   * @param agentType - Agent type
   * @param response - Agent response
   */
  private updateStats(agentType: AgentType, response: AgentResponse): void {
    const stats = this.stats.get(agentType);
    if (!stats) return;

    stats.totalInvocations++;
    if (response.success) {
      stats.successfulInvocations++;
    } else {
      stats.failedInvocations++;
    }

    // Update average response time (moving average)
    stats.avgResponseTimeMs =
      (stats.avgResponseTimeMs * (stats.totalInvocations - 1) + response.metadata.responseTimeMs) /
      stats.totalInvocations;

    // Update tokens and cost
    stats.totalTokens += response.usage.totalTokens;
    stats.totalCost += response.usage.estimatedCost;

    // Update success rate
    stats.successRate = stats.successfulInvocations / stats.totalInvocations;

    // Update period end
    stats.periodEnd = new Date();
  }

  /**
   * Get statistics for agent
   *
   * @param agentType - Agent type
   * @returns Agent statistics
   */
  getStats(agentType: AgentType): AgentStats | undefined {
    return this.stats.get(agentType);
  }

  /**
   * Get all agent statistics
   *
   * @returns Map of agent statistics
   */
  getAllStats(): Map<AgentType, AgentStats> {
    return this.stats;
  }

  /**
   * Reset statistics for agent
   *
   * @param agentType - Agent type
   */
  resetStats(agentType: AgentType): void {
    const stats = this.stats.get(agentType);
    if (stats) {
      stats.totalInvocations = 0;
      stats.successfulInvocations = 0;
      stats.failedInvocations = 0;
      stats.avgResponseTimeMs = 0;
      stats.totalTokens = 0;
      stats.totalCost = 0;
      stats.successRate = 0;
      stats.periodStart = new Date();
      stats.periodEnd = new Date();
    }
  }
}

/**
 * Create agent manager instance
 *
 * @param config - Manager configuration
 * @returns AgentManager instance
 */
export function createAgentManager(config: AgentManagerConfig): AgentManager {
  return new AgentManager(config);
}
