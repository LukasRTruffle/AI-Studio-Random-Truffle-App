import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPRateLimiter } from '../rate-limiter';
import type { MCPRateLimitConfig } from '../types';

describe('MCPRateLimiter', () => {
  let rateLimiter: MCPRateLimiter;
  let config: MCPRateLimitConfig;

  beforeEach(() => {
    config = {
      enabled: true,
      maxRequestsPerMinute: 10,
      maxRequestsPerHour: 100,
    };
    rateLimiter = new MCPRateLimiter(config);
  });

  describe('isAllowed', () => {
    it('should allow requests under the limit', () => {
      expect(rateLimiter.isAllowed()).toBe(true);
    });

    it('should block requests over minute limit', () => {
      // Make 10 requests (at the limit)
      for (let i = 0; i < 10; i++) {
        expect(rateLimiter.isAllowed()).toBe(true);
        rateLimiter.recordRequest();
      }

      // 11th request should be blocked
      expect(rateLimiter.isAllowed()).toBe(false);
    });

    it('should always allow when disabled', () => {
      const disabledRateLimiter = new MCPRateLimiter({
        ...config,
        enabled: false,
      });

      // Make many requests
      for (let i = 0; i < 100; i++) {
        expect(disabledRateLimiter.isAllowed()).toBe(true);
        disabledRateLimiter.recordRequest();
      }
    });
  });

  describe('recordRequest', () => {
    it('should increment request counters', () => {
      const initialState = rateLimiter.getState();
      expect(initialState.requestsPerMinute).toBe(0);

      rateLimiter.recordRequest();

      const newState = rateLimiter.getState();
      expect(newState.requestsPerMinute).toBe(1);
      expect(newState.requestsPerHour).toBe(1);
    });

    it('should not increment when disabled', () => {
      const disabledRateLimiter = new MCPRateLimiter({
        ...config,
        enabled: false,
      });

      disabledRateLimiter.recordRequest();

      const state = disabledRateLimiter.getState();
      expect(state.requestsPerMinute).toBe(0);
    });
  });

  describe('getRemaining', () => {
    it('should return remaining requests', () => {
      rateLimiter.recordRequest();
      rateLimiter.recordRequest();

      const remaining = rateLimiter.getRemaining();

      expect(remaining.perMinute).toBe(8); // 10 - 2
      expect(remaining.perHour).toBe(98); // 100 - 2
    });

    it('should not return negative values', () => {
      // Exhaust the limit
      for (let i = 0; i < 15; i++) {
        rateLimiter.recordRequest();
      }

      const remaining = rateLimiter.getRemaining();

      expect(remaining.perMinute).toBeGreaterThanOrEqual(0);
      expect(remaining.perHour).toBeGreaterThanOrEqual(0);
    });
  });

  describe('reset', () => {
    it('should reset all counters', () => {
      rateLimiter.recordRequest();
      rateLimiter.recordRequest();

      rateLimiter.reset();

      const state = rateLimiter.getState();
      expect(state.requestsPerMinute).toBe(0);
      expect(state.requestsPerHour).toBe(0);
    });
  });

  describe('time window reset', () => {
    it('should reset minute counter after 60 seconds', () => {
      vi.useFakeTimers();

      // Make some requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest();
      }

      expect(rateLimiter.getState().requestsPerMinute).toBe(5);

      // Advance time by 61 seconds
      vi.advanceTimersByTime(61000);

      // Check if minute counter reset
      expect(rateLimiter.isAllowed()).toBe(true);
      const state = rateLimiter.getState();
      expect(state.requestsPerMinute).toBe(0);

      vi.useRealTimers();
    });

    it('should reset hour counter after 3600 seconds', () => {
      vi.useFakeTimers();

      // Make some requests
      for (let i = 0; i < 50; i++) {
        rateLimiter.recordRequest();
      }

      expect(rateLimiter.getState().requestsPerHour).toBe(50);

      // Advance time by 3601 seconds
      vi.advanceTimersByTime(3601000);

      // Check if hour counter reset
      expect(rateLimiter.isAllowed()).toBe(true);
      const state = rateLimiter.getState();
      expect(state.requestsPerHour).toBe(0);

      vi.useRealTimers();
    });
  });
});
