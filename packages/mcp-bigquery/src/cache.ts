/**
 * MCP BigQuery connector cache implementation
 */

import type { CacheEntry, MCPCacheConfig } from './types';

/**
 * In-memory cache for MCP connector
 * In production, use Redis or Memorystore
 */
export class MCPCache {
  private cache: Map<string, CacheEntry>;
  private config: MCPCacheConfig;

  constructor(config: MCPCacheConfig) {
    this.cache = new Map();
    this.config = config;
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or undefined
   */
  get<T = unknown>(key: string): T | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds TTL in seconds (optional, uses default from config)
   */
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): void {
    if (!this.config.enabled) {
      return;
    }

    const ttl = ttlSeconds || this.config.ttlSeconds;
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      expiresAt,
    });

    // Evict oldest entries if cache is full
    if (this.cache.size > this.config.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * Delete value from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Generate cache key from query
   * @param method MCP method
   * @param params MCP params
   * @returns Cache key
   */
  static generateKey(method: string, params: Record<string, unknown>): string {
    const paramsString = JSON.stringify(params, Object.keys(params).sort());
    return `${method}:${paramsString}`;
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
