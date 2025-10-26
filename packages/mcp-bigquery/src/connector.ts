/**
 * MCP BigQuery connector implementation
 */

import { BigQueryClient } from '@random-truffle/bigquery';
import type { QueryResult, TableSchema } from '@random-truffle/bigquery';
import { MCPCache } from './cache';
import { MCPRateLimiter } from './rate-limiter';
import type {
  MCPRequest,
  MCPResponse,
  MCPConnectorConfig,
  MCPQueryRequest,
  MCPListTablesRequest,
  MCPGetSchemaRequest,
  MCPMetadata,
} from './types';

/**
 * Default MCP connector configuration
 */
const DEFAULT_CONFIG: Partial<MCPConnectorConfig> = {
  cache: {
    enabled: true,
    ttlSeconds: 300, // 5 minutes
    maxSize: 1000,
  },
  rateLimit: {
    enabled: true,
    maxRequestsPerMinute: 100,
    maxRequestsPerHour: 1000,
  },
  allowedMethods: ['bigquery.query', 'bigquery.listTables', 'bigquery.getSchema'],
};

/**
 * MCP BigQuery connector
 * Implements Model Context Protocol for BigQuery access
 */
export class MCPBigQueryConnector {
  private client: BigQueryClient;
  private cache: MCPCache;
  private rateLimiter: MCPRateLimiter;
  private config: MCPConnectorConfig;

  constructor(config: MCPConnectorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as MCPConnectorConfig;

    this.client = new BigQueryClient({
      projectId: this.config.projectId,
      datasetId: this.config.datasetId,
    });

    this.cache = new MCPCache(this.config.cache || DEFAULT_CONFIG.cache!);

    this.rateLimiter = new MCPRateLimiter(this.config.rateLimit || DEFAULT_CONFIG.rateLimit!);
  }

  /**
   * Handle MCP request
   * @param request MCP request
   * @returns MCP response
   */
  async handle<T = unknown>(request: MCPRequest): Promise<MCPResponse<T>> {
    const startTime = Date.now();

    try {
      // Validate method
      if (!this.isMethodAllowed(request.method)) {
        return this.errorResponse(
          'METHOD_NOT_ALLOWED',
          `Method ${request.method} is not allowed`,
          startTime
        );
      }

      // Check rate limit
      if (!this.rateLimiter.isAllowed()) {
        const remaining = this.rateLimiter.getRemaining();
        return this.errorResponse('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', startTime, {
          remaining,
        });
      }

      // Record request
      this.rateLimiter.recordRequest();

      // Check cache
      const cacheKey = MCPCache.generateKey(request.method, request.params || {});
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return this.successResponse(cached, startTime, {
          cached: true,
          cacheKey,
        });
      }

      // Route to appropriate handler
      let result: T;
      switch (request.method) {
        case 'bigquery.query':
          result = (await this.handleQuery(request as MCPQueryRequest)) as T;
          break;
        case 'bigquery.listTables':
          result = (await this.handleListTables(request as MCPListTablesRequest)) as T;
          break;
        case 'bigquery.getSchema':
          result = (await this.handleGetSchema(request as MCPGetSchemaRequest)) as T;
          break;
        default:
          return this.errorResponse(
            'UNKNOWN_METHOD',
            `Unknown method: ${request.method}`,
            startTime
          );
      }

      // Cache result
      this.cache.set(cacheKey, result);

      return this.successResponse(result, startTime, {
        cached: false,
        cacheKey,
      });
    } catch (error) {
      return this.errorResponse(
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'Unknown error',
        startTime
      );
    }
  }

  /**
   * Handle bigquery.query request
   */
  private async handleQuery(request: MCPQueryRequest): Promise<QueryResult> {
    const { query, params, timeoutMs, maxResults } = request.params;

    return await this.client.query({
      query,
      params,
      timeoutMs,
      maxResults,
    });
  }

  /**
   * Handle bigquery.listTables request
   */
  private async handleListTables(_request: MCPListTablesRequest): Promise<string[]> {
    return await this.client.listTables();
  }

  /**
   * Handle bigquery.getSchema request
   */
  private async handleGetSchema(request: MCPGetSchemaRequest): Promise<TableSchema> {
    const { tableName } = request.params;
    return await this.client.getTableSchema(tableName);
  }

  /**
   * Check if method is allowed
   */
  private isMethodAllowed(method: string): boolean {
    if (!this.config.allowedMethods) {
      return true;
    }
    return this.config.allowedMethods.includes(method);
  }

  /**
   * Create success response
   */
  private successResponse<T>(
    data: T,
    startTime: number,
    extra?: Partial<MCPMetadata>
  ): MCPResponse<T> {
    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      data,
      metadata: {
        executionTimeMs,
        ...extra,
      },
    };
  }

  /**
   * Create error response
   */
  private errorResponse(
    code: string,
    message: string,
    startTime: number,
    details?: Record<string, unknown>
  ): MCPResponse {
    const executionTimeMs = Date.now() - startTime;

    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      metadata: {
        executionTimeMs,
      },
    };
  }

  /**
   * Get cache instance
   */
  getCache(): MCPCache {
    return this.cache;
  }

  /**
   * Get rate limiter instance
   */
  getRateLimiter(): MCPRateLimiter {
    return this.rateLimiter;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset rate limiter
   */
  resetRateLimiter(): void {
    this.rateLimiter.reset();
  }
}

/**
 * Create MCP BigQuery connector instance
 */
export function createMCPBigQueryConnector(config: MCPConnectorConfig): MCPBigQueryConnector {
  return new MCPBigQueryConnector(config);
}
