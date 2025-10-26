/**
 * MCP BigQuery connector rate limiter
 */

import type { MCPRateLimitConfig, RateLimitState } from './types';

/**
 * Rate limiter for MCP connector
 * Implements sliding window rate limiting
 */
export class MCPRateLimiter {
  private config: MCPRateLimitConfig;
  private state: RateLimitState;

  constructor(config: MCPRateLimitConfig) {
    this.config = config;
    this.state = {
      requestsPerMinute: 0,
      requestsPerHour: 0,
      lastMinuteReset: Date.now(),
      lastHourReset: Date.now(),
    };
  }

  /**
   * Check if request is allowed
   * @returns True if allowed, false if rate limited
   */
  isAllowed(): boolean {
    if (!this.config.enabled) {
      return true;
    }

    this.resetIfNeeded();

    const minuteAllowed = this.state.requestsPerMinute < this.config.maxRequestsPerMinute;
    const hourAllowed = this.state.requestsPerHour < this.config.maxRequestsPerHour;

    return minuteAllowed && hourAllowed;
  }

  /**
   * Record a request
   * Call this after checking isAllowed()
   */
  recordRequest(): void {
    if (!this.config.enabled) {
      return;
    }

    this.resetIfNeeded();
    this.state.requestsPerMinute++;
    this.state.requestsPerHour++;
  }

  /**
   * Get current rate limit state
   * @returns Rate limit state
   */
  getState(): RateLimitState {
    return { ...this.state };
  }

  /**
   * Get remaining requests for current window
   * @returns Remaining requests per minute and per hour
   */
  getRemaining(): { perMinute: number; perHour: number } {
    this.resetIfNeeded();

    return {
      perMinute: Math.max(0, this.config.maxRequestsPerMinute - this.state.requestsPerMinute),
      perHour: Math.max(0, this.config.maxRequestsPerHour - this.state.requestsPerHour),
    };
  }

  /**
   * Reset counters if time windows have elapsed
   */
  private resetIfNeeded(): void {
    const now = Date.now();

    // Reset minute counter if 60 seconds have elapsed
    if (now - this.state.lastMinuteReset >= 60000) {
      this.state.requestsPerMinute = 0;
      this.state.lastMinuteReset = now;
    }

    // Reset hour counter if 3600 seconds have elapsed
    if (now - this.state.lastHourReset >= 3600000) {
      this.state.requestsPerHour = 0;
      this.state.lastHourReset = now;
    }
  }

  /**
   * Reset all counters
   */
  reset(): void {
    this.state = {
      requestsPerMinute: 0,
      requestsPerHour: 0,
      lastMinuteReset: Date.now(),
      lastHourReset: Date.now(),
    };
  }
}
