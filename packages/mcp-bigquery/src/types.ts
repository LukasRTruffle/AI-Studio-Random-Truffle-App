/**
 * MCP BigQuery connector types
 */

/**
 * MCP request base
 */
export interface MCPRequest {
  method: string;
  params?: Record<string, unknown>;
}

/**
 * MCP response base
 */
export interface MCPResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: MCPError;
  metadata?: MCPMetadata;
}

/**
 * MCP error
 */
export interface MCPError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * MCP metadata
 */
export interface MCPMetadata {
  executionTimeMs: number;
  bytesProcessed?: number;
  cacheHit?: boolean;
  cached?: boolean;
  cacheKey?: string;
}

/**
 * MCP BigQuery query request
 */
export interface MCPQueryRequest extends MCPRequest {
  method: 'bigquery.query';
  params: {
    query: string;
    params?: Record<string, unknown>;
    timeoutMs?: number;
    maxResults?: number;
  };
}

/**
 * MCP BigQuery list tables request
 */
export interface MCPListTablesRequest extends MCPRequest {
  method: 'bigquery.listTables';
  params?: Record<string, never>;
}

/**
 * MCP BigQuery get schema request
 */
export interface MCPGetSchemaRequest extends MCPRequest {
  method: 'bigquery.getSchema';
  params: {
    tableName: string;
  };
}

/**
 * MCP cache configuration
 */
export interface MCPCacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxSize: number;
}

/**
 * MCP rate limit configuration
 */
export interface MCPRateLimitConfig {
  enabled: boolean;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
}

/**
 * MCP connector configuration
 */
export interface MCPConnectorConfig {
  projectId: string;
  datasetId: string;
  cache?: MCPCacheConfig;
  rateLimit?: MCPRateLimitConfig;
  allowedMethods?: string[];
}

/**
 * Cache entry
 */
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Rate limit state
 */
export interface RateLimitState {
  requestsPerMinute: number;
  requestsPerHour: number;
  lastMinuteReset: number;
  lastHourReset: number;
}
