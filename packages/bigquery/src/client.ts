/**
 * BigQuery client wrapper for Random Truffle
 */

import { BigQuery, Query } from '@google-cloud/bigquery';
import type {
  BigQueryConfig,
  QueryOptions,
  QueryResult,
  TableSchema,
  TableField,
  QueryCostEstimate,
} from './types';
import {
  DEFAULT_BIGQUERY_CONFIG,
  QUERY_TIMEOUT_MS,
  MAX_QUERY_RESULTS,
  QUERY_COST_THRESHOLDS,
} from './config';

/**
 * BigQuery client class
 * Wraps Google Cloud BigQuery client with Random Truffle-specific logic
 */
export class BigQueryClient {
  private client: BigQuery;
  private config: BigQueryConfig;

  constructor(config?: Partial<BigQueryConfig>) {
    this.config = { ...DEFAULT_BIGQUERY_CONFIG, ...config };

    this.client = new BigQuery({
      projectId: this.config.projectId,
      location: this.config.location,
      keyFilename: this.config.keyFilename,
      credentials: this.config.credentials,
    });
  }

  /**
   * Execute a BigQuery SQL query
   * @param options Query options
   * @returns Query result with rows and metadata
   */
  async query<T = unknown>(options: QueryOptions): Promise<QueryResult<T>> {
    const {
      query,
      params = {},
      timeoutMs = QUERY_TIMEOUT_MS,
      maxResults = MAX_QUERY_RESULTS,
      useLegacySql = false,
    } = options;

    // Validate query (safety check)
    this.validateQuery(query);

    // Estimate query cost
    const costEstimate = await this.estimateQueryCost(query);
    if (costEstimate.estimatedBytes > QUERY_COST_THRESHOLDS.ERROR) {
      throw new Error(
        `Query would process ${this.formatBytes(costEstimate.estimatedBytes)} which exceeds the limit of ${this.formatBytes(QUERY_COST_THRESHOLDS.ERROR)}`
      );
    }

    // Execute query
    const startTime = Date.now();
    const queryOptions: Query = {
      query,
      params,
      jobTimeoutMs: timeoutMs,
      maxResults,
      useLegacySql,
    };

    const [job] = await this.client.createQueryJob(queryOptions);
    const [rows, , response] = await job.getQueryResults();

    const executionTimeMs = Date.now() - startTime;

    return {
      rows: rows as T[],
      totalRows: parseInt(response?.totalRows || '0', 10),
      pageToken: response?.pageToken,
      jobId: job.id || '',
      executionTimeMs,
      bytesProcessed: parseInt(response?.totalBytesProcessed || '0', 10),
      cacheHit: response?.cacheHit || false,
    };
  }

  /**
   * List all tables in the dataset
   * @returns Array of table names
   */
  async listTables(): Promise<string[]> {
    const dataset = this.client.dataset(this.config.datasetId);
    const [tables] = await dataset.getTables();
    return tables.map((table) => table.id || '');
  }

  /**
   * Get table schema
   * @param tableName Table name
   * @returns Table schema
   */
  async getTableSchema(tableName: string): Promise<TableSchema> {
    const dataset = this.client.dataset(this.config.datasetId);
    const table = dataset.table(tableName);
    const [metadata] = await table.getMetadata();

    const schema = metadata.schema;
    const timePartitioning = metadata.timePartitioning;
    const clustering = metadata.clustering;

    return {
      name: tableName,
      fields: this.mapBigQueryFields(schema.fields),
      partitionField: timePartitioning?.field,
      clusterFields: clustering?.fields,
    };
  }

  /**
   * Validate query to prevent dangerous operations
   * @param query SQL query
   * @throws Error if query contains dangerous operations
   */
  private validateQuery(query: string): void {
    const dangerousPatterns = [
      /\bDELETE\b/i,
      /\bDROP\b/i,
      /\bTRUNCATE\b/i,
      /\bALTER\b/i,
      /\bCREATE\b/i,
      /\bINSERT\b/i,
      /\bUPDATE\b/i,
      /\bMERGE\b/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        throw new Error(
          `Query contains dangerous operation: ${pattern.source}. Only SELECT queries are allowed.`
        );
      }
    }
  }

  /**
   * Estimate query cost (bytes to be processed and cost in USD)
   * @param query SQL query
   * @returns Cost estimation with bytes and estimated cost
   */
  async estimateQueryCost(query: string): Promise<QueryCostEstimate> {
    try {
      const [job] = await this.client.createQueryJob({
        query,
        dryRun: true,
      });

      const estimatedBytes = parseInt(job.metadata.statistics?.totalBytesProcessed || '0', 10);

      // BigQuery pricing: $5 per TB processed (as of 2025)
      const estimatedCost = (estimatedBytes / (1024 * 1024 * 1024 * 1024)) * 5;

      return {
        estimatedBytes,
        estimatedCost,
        message: `Query will process ${this.formatBytes(estimatedBytes)} at an estimated cost of $${estimatedCost.toFixed(4)}`,
      };
    } catch (error) {
      // If dry run fails, return 0 and let the actual query handle the error
      console.warn('Failed to estimate query cost:', error);
      return {
        estimatedBytes: 0,
        estimatedCost: 0,
        message: 'Failed to estimate query cost. The query may be invalid.',
      };
    }
  }

  /**
   * Format bytes to human-readable string
   * @param bytes Number of bytes
   * @returns Formatted string (e.g., "1.5 MB")
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Map BigQuery field types to our TableField interface
   * @param fields BigQuery fields
   * @returns Mapped table fields
   */
  private mapBigQueryFields(fields: unknown[]): TableField[] {
    return fields.map((field: unknown) => {
      const f = field as Record<string, unknown>;
      return {
        name: f.name as string,
        type: f.type as TableField['type'],
        mode: (f.mode as TableField['mode']) || 'NULLABLE',
        description: f.description as string | undefined,
        fields: f.fields ? this.mapBigQueryFields(f.fields as unknown[]) : undefined,
      };
    });
  }
}

/**
 * Create a BigQuery client instance
 * @param config Optional configuration
 * @returns BigQuery client instance
 */
export function createBigQueryClient(config?: Partial<BigQueryConfig>): BigQueryClient {
  return new BigQueryClient(config);
}
