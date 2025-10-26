/**
 * BigQuery configuration for Random Truffle
 */

import type { BigQueryConfig, GA4ConsentDefaults } from './types';

/**
 * Default BigQuery configuration
 * These values should be overridden via environment variables in production
 */
export const DEFAULT_BIGQUERY_CONFIG: BigQueryConfig = {
  projectId: process.env.GCP_PROJECT_ID || 'random-truffle-dev',
  datasetId: process.env.BIGQUERY_DATASET_ID || 'random_truffle_analytics',
  location: process.env.BIGQUERY_LOCATION || 'US',
  keyFilename: process.env.GCP_KEY_FILENAME,
};

/**
 * BigQuery table names
 */
export const BIGQUERY_TABLES = {
  SESSIONS: 'sessions',
  EVENTS: 'events',
  CONVERSIONS: 'conversions',
  USER_ATTRIBUTES: 'user_attributes',
} as const;

/**
 * BigQuery view names
 */
export const BIGQUERY_VIEWS = {
  CORTEX_GA4_SESSIONS: 'cortex_ga4_sessions',
  DAILY_KPIS: 'daily_kpis',
  AUDIENCE_METRICS: 'audience_metrics',
} as const;

/**
 * Query timeout in milliseconds
 */
export const QUERY_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Maximum query results to return
 */
export const MAX_QUERY_RESULTS = 10000;

/**
 * Query cost estimation thresholds (in bytes)
 */
export const QUERY_COST_THRESHOLDS = {
  WARNING: 100 * 1024 * 1024, // 100 MB
  ERROR: 1024 * 1024 * 1024, // 1 GB
} as const;

/**
 * GA4 Consent Mode default configuration
 * Per ADR-008: Use GA4 Consent Mode, not custom consent registry
 */
export const GA4_CONSENT_DEFAULTS: GA4ConsentDefaults = {
  ad_storage: 'denied', // Conservative default
  analytics_storage: 'granted', // Allow analytics by default
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500, // Wait 500ms for user consent
};

/**
 * Supported currency codes
 */
export const SUPPORTED_CURRENCIES = ['USD', 'MXN', 'COP'] as const;

/**
 * Session stitching configuration
 */
export const SESSION_STITCHING_CONFIG = {
  // Time window to consider sessions as part of same user journey (in hours)
  TIME_WINDOW_HOURS: 24,
  // Maximum sessions to stitch per user
  MAX_SESSIONS: 1000,
} as const;
