import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPCache } from '../cache';
import type { MCPCacheConfig } from '../types';

describe('MCPCache', () => {
  let cache: MCPCache;
  let config: MCPCacheConfig;

  beforeEach(() => {
    config = {
      enabled: true,
      ttlSeconds: 60,
      maxSize: 100,
    };
    cache = new MCPCache(config);
  });

  describe('get/set', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeUndefined();
    });

    it('should respect TTL', () => {
      vi.useFakeTimers();

      cache.set('key1', 'value1', 1); // 1 second TTL

      expect(cache.get('key1')).toBe('value1');

      // Advance time by 2 seconds
      vi.advanceTimersByTime(2000);

      expect(cache.get('key1')).toBeUndefined();

      vi.useRealTimers();
    });

    it('should not store when disabled', () => {
      const disabledCache = new MCPCache({ ...config, enabled: false });

      disabledCache.set('key1', 'value1');

      expect(disabledCache.get('key1')).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a key', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');

      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('size', () => {
    it('should return cache size', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('generateKey', () => {
    it('should generate consistent keys for same params', () => {
      const key1 = MCPCache.generateKey('method1', { a: 1, b: 2 });
      const key2 = MCPCache.generateKey('method1', { a: 1, b: 2 });

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different params', () => {
      const key1 = MCPCache.generateKey('method1', { a: 1 });
      const key2 = MCPCache.generateKey('method1', { a: 2 });

      expect(key1).not.toBe(key2);
    });

    it('should generate consistent keys regardless of param order', () => {
      const key1 = MCPCache.generateKey('method1', { a: 1, b: 2 });
      const key2 = MCPCache.generateKey('method1', { b: 2, a: 1 });

      expect(key1).toBe(key2);
    });
  });

  describe('eviction', () => {
    it('should evict oldest entries when max size reached', () => {
      const smallCache = new MCPCache({ ...config, maxSize: 2 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3'); // Should evict key1

      expect(smallCache.size()).toBe(2);
      expect(smallCache.get('key1')).toBeUndefined();
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');
    });
  });
});
