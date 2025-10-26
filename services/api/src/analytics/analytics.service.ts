import { Injectable, Logger } from '@nestjs/common';
import { createMCPBigQueryConnector } from '@random-truffle/mcp-bigquery';
import type { MCPBigQueryConnector } from '@random-truffle/mcp-bigquery';
import type { QueryResult } from '@random-truffle/bigquery';
import {
  buildDailyKPIsQuery,
  buildSessionTrendsQuery,
  buildAudienceMetricsQuery,
  replaceQueryVariables,
} from '@random-truffle/bigquery';
import type { GetKPIsDto, GetSessionTrendsDto, GetAudienceMetricsDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private mcpConnector: MCPBigQueryConnector;
  private projectId: string;
  private datasetId: string;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || 'random-truffle-dev';
    this.datasetId = process.env.BIGQUERY_DATASET_ID || 'random_truffle_analytics';

    this.mcpConnector = createMCPBigQueryConnector({
      projectId: this.projectId,
      datasetId: this.datasetId,
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
    });
  }

  /**
   * Get daily KPIs
   */
  async getKPIs(dto: GetKPIsDto): Promise<unknown[]> {
    this.logger.log(`Getting KPIs for ${dto.startDate} to ${dto.endDate}`);

    const queryTemplate = buildDailyKPIsQuery(dto.startDate, dto.endDate, dto.currency);

    const query = replaceQueryVariables(queryTemplate, this.projectId, this.datasetId);

    const response = await this.mcpConnector.handle<QueryResult>({
      method: 'bigquery.query',
      params: {
        query,
        timeoutMs: 30000,
        maxResults: 1000,
      },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get KPIs');
    }

    return response.data.rows;
  }

  /**
   * Get session trends
   */
  async getSessionTrends(dto: GetSessionTrendsDto): Promise<unknown[]> {
    this.logger.log(
      `Getting session trends for ${dto.startDate} to ${dto.endDate}, groupBy: ${dto.groupBy || 'date'}`
    );

    const queryTemplate = buildSessionTrendsQuery(
      dto.startDate,
      dto.endDate,
      dto.groupBy?.toUpperCase() as 'DATE' | 'DEVICE_CATEGORY' | 'COUNTRY'
    );

    const query = replaceQueryVariables(queryTemplate, this.projectId, this.datasetId);

    const response = await this.mcpConnector.handle<QueryResult>({
      method: 'bigquery.query',
      params: {
        query,
        params: {
          currency: dto.currency || null,
        },
        timeoutMs: 30000,
        maxResults: dto.limit || 100,
      },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get session trends');
    }

    return response.data.rows;
  }

  /**
   * Get audience metrics
   */
  async getAudienceMetrics(dto: GetAudienceMetricsDto): Promise<unknown[]> {
    this.logger.log(
      `Getting audience metrics for ${dto.audienceId}, ${dto.startDate} to ${dto.endDate}`
    );

    const queryTemplate = buildAudienceMetricsQuery(dto.audienceId, dto.startDate, dto.endDate);

    const query = replaceQueryVariables(queryTemplate, this.projectId, this.datasetId);

    const response = await this.mcpConnector.handle<QueryResult>({
      method: 'bigquery.query',
      params: {
        query,
        timeoutMs: 30000,
        maxResults: 1000,
      },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get audience metrics');
    }

    return response.data.rows;
  }

  /**
   * Get MCP connector cache stats
   */
  getCacheStats(): { size: number } {
    return {
      size: this.mcpConnector.getCache().size(),
    };
  }

  /**
   * Get MCP connector rate limit state
   */
  getRateLimitState(): {
    perMinute: number;
    perHour: number;
  } {
    return this.mcpConnector.getRateLimiter().getRemaining();
  }

  /**
   * Clear MCP connector cache
   */
  clearCache(): void {
    this.mcpConnector.clearCache();
    this.logger.log('Cache cleared');
  }
}
