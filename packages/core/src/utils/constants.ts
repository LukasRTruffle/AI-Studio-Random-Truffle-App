/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * Authentication Configuration
 */
export const AUTH_CONFIG = {
  SESSION_DURATION: 3600000, // 1 hour in milliseconds
  REFRESH_TOKEN_DURATION: 604800000, // 7 days in milliseconds
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

/**
 * Activation Channels
 */
export const ACTIVATION_CHANNELS = {
  GOOGLE_ADS: 'google_ads',
  META: 'meta',
  TIKTOK: 'tiktok',
} as const;

/**
 * Audience Status
 */
export const AUDIENCE_STATUS = {
  DRAFT: 'draft',
  BUILDING: 'building',
  READY: 'ready',
  ERROR: 'error',
} as const;

/**
 * Agent Names
 */
export const AGENT_NAMES = {
  DATA_SCIENCE: 'data-science',
  AUDIENCE_BUILDER: 'audience-builder',
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
} as const;

/**
 * Currencies
 */
export const CURRENCIES = ['USD', 'MXN', 'COP'] as const;

/**
 * BigQuery Configuration
 */
export const BIGQUERY_CONFIG = {
  MAX_QUERY_TIMEOUT: 30000, // 30 seconds
  MAX_RESULTS: 10000,
} as const;

/**
 * Cost Budgets (per day)
 */
export const COST_BUDGETS = {
  DEV: 10, // $10/day
  STAGING: 25, // $25/day
  PROD: 100, // $100/day
} as const;

/**
 * Agent Configuration
 */
export const AGENT_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_BACKOFF: [1000, 2000, 4000], // Exponential backoff in ms
  TIMEOUT: 30000, // 30 seconds
  MAX_TOKEN_INPUT: 100000,
  MAX_TOKEN_OUTPUT: 4000,
} as const;

/**
 * Test Coverage Targets
 */
export const TEST_COVERAGE = {
  TARGET: 95, // 95% coverage target
  WARN_THRESHOLD: 90,
} as const;

/**
 * Lighthouse Score Targets
 */
export const LIGHTHOUSE_SCORES = {
  MIN_SCORE: 90,
} as const;

/**
 * Security Headers
 */
export const SECURITY_HEADERS = {
  CSP: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  X_CONTENT_TYPE_OPTIONS: 'nosniff',
  X_FRAME_OPTIONS: 'DENY',
  X_XSS_PROTECTION: '1; mode=block',
  REFERRER_POLICY: 'strict-origin-when-cross-origin',
  PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=()',
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validation
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_VALUE: 'VALIDATION_INVALID_VALUE',

  // Database
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  DB_DUPLICATE_KEY: 'DB_DUPLICATE_KEY',

  // Agent
  AGENT_INVOCATION_FAILED: 'AGENT_INVOCATION_FAILED',
  AGENT_TIMEOUT: 'AGENT_TIMEOUT',
  AGENT_INVALID_OUTPUT: 'AGENT_INVALID_OUTPUT',

  // External API
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  API_TIMEOUT: 'API_TIMEOUT',

  // Generic
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
} as const;
