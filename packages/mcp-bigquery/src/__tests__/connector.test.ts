import { describe, it, expect, beforeEach } from 'vitest';
import { MCPBigQueryConnector } from '../connector';
import type { MCPQueryRequest } from '../types';

describe('MCPBigQueryConnector', () => {
  let connector: MCPBigQueryConnector;

  beforeEach(() => {
    connector = new MCPBigQueryConnector({
      projectId: 'test-project',
      datasetId: 'test-dataset',
      cache: {
        enabled: true,
        ttlSeconds: 300,
        maxSize: 100,
      },
      rateLimit: {
        enabled: true,
        maxRequestsPerMinute: 10,
        maxRequestsPerHour: 100,
      },
    });
  });

  describe('handle', () => {
    it('should reject disallowed methods', async () => {
      const request = {
        method: 'bigquery.deleteTable',
        params: {},
      };

      const response = await connector.handle(request);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('should handle rate limiting', async () => {
      // Make requests until rate limit is hit
      const request: MCPQueryRequest = {
        method: 'bigquery.query',
        params: {
          query: 'SELECT 1',
        },
      };

      // Make 11 requests (over the limit of 10)
      for (let i = 0; i < 11; i++) {
        await connector.handle(request);
      }

      const response = await connector.handle(request);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should return cached results on second request', async () => {
      const request: MCPQueryRequest = {
        method: 'bigquery.query',
        params: {
          query: 'SELECT 1',
        },
      };

      await connector.handle(request);
      const secondResponse = await connector.handle(request);

      expect(secondResponse.metadata?.cached).toBe(true);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      connector.clearCache();

      expect(connector.getCache().size()).toBe(0);
    });
  });

  describe('rate limiter management', () => {
    it('should reset rate limiter', () => {
      connector.resetRateLimiter();

      const state = connector.getRateLimiter().getState();
      expect(state.requestsPerMinute).toBe(0);
      expect(state.requestsPerHour).toBe(0);
    });
  });
});
