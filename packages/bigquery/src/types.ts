/**
 * BigQuery types and interfaces for Random Truffle
 */

/**
 * Currency codes supported by the platform
 */
export enum CurrencyCode {
  USD = 'USD',
  MXN = 'MXN',
  COP = 'COP',
}

/**
 * GA4 session data from BigQuery export
 */
export interface GA4Session {
  session_id: string;
  user_id: string | null; // GA4 User-ID (logged-in users)
  user_pseudo_id: string; // GA4 client ID (anonymous users)
  unified_user_id: string; // COALESCE(user_id, user_pseudo_id)
  session_start_timestamp: number;
  session_end_timestamp: number;
  traffic_source: string | null;
  medium: string | null;
  campaign: string | null;
  device_category: string;
  country: string;
  region: string | null;
  city: string | null;
}

/**
 * GA4 event data from BigQuery export
 */
export interface GA4Event {
  event_id: string;
  event_timestamp: number;
  event_name: string;
  session_id: string;
  user_id: string | null;
  user_pseudo_id: string;
  unified_user_id: string;
  page_location: string | null;
  page_title: string | null;
  event_params: Record<string, unknown>;
}

/**
 * Conversion event data
 */
export interface ConversionEvent {
  conversion_id: string;
  event_timestamp: number;
  conversion_type: string;
  session_id: string;
  user_id: string | null;
  user_pseudo_id: string;
  unified_user_id: string;
  value: number;
  currency: CurrencyCode;
  transaction_id: string | null;
}

/**
 * User attributes from BigQuery
 */
export interface UserAttributes {
  unified_user_id: string;
  first_seen_timestamp: number;
  last_seen_timestamp: number;
  total_sessions: number;
  total_events: number;
  total_conversions: number;
  total_revenue: number;
  currency: CurrencyCode;
  device_category: string;
  country: string;
  traffic_source_first: string | null;
  medium_first: string | null;
  campaign_first: string | null;
}

/**
 * Daily KPI metrics
 */
export interface DailyKPIs {
  date: string; // YYYY-MM-DD
  total_users: number;
  total_sessions: number;
  total_events: number;
  total_conversions: number;
  total_revenue: number;
  currency: CurrencyCode;
  avg_session_duration_seconds: number;
  bounce_rate: number;
}

/**
 * Audience metrics
 */
export interface AudienceMetrics {
  audience_id: string;
  date: string; // YYYY-MM-DD
  total_users: number;
  active_users_7d: number;
  active_users_30d: number;
  total_conversions: number;
  total_revenue: number;
  currency: CurrencyCode;
  avg_revenue_per_user: number;
}

/**
 * BigQuery query options
 */
export interface QueryOptions {
  query: string;
  params?: Record<string, unknown>;
  timeoutMs?: number; // Default: 30000
  maxResults?: number; // Default: 10000
  useLegacySql?: boolean; // Default: false
}

/**
 * BigQuery query result
 */
export interface QueryResult<T = unknown> {
  rows: T[];
  totalRows: number;
  pageToken?: string;
  jobId: string;
  executionTimeMs: number;
  bytesProcessed: number;
  cacheHit: boolean;
}

/**
 * BigQuery query cost estimation result
 */
export interface QueryCostEstimate {
  estimatedBytes: number;
  estimatedCost: number;
  message?: string;
}

/**
 * BigQuery table schema
 */
export interface TableSchema {
  name: string;
  fields: TableField[];
  partitionField?: string;
  clusterFields?: string[];
}

/**
 * BigQuery table field
 */
export interface TableField {
  name: string;
  type: 'STRING' | 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'TIMESTAMP' | 'DATE' | 'RECORD' | 'NUMERIC';
  mode: 'NULLABLE' | 'REQUIRED' | 'REPEATED';
  description?: string;
  fields?: TableField[]; // For RECORD type
}

/**
 * BigQuery client configuration
 */
export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  location?: string; // Default: 'US'
  keyFilename?: string; // Path to service account key file
  credentials?: {
    client_email: string;
    private_key: string;
  };
}

/**
 * Session stitching result
 */
export interface StitchedSession {
  unified_user_id: string;
  session_ids: string[];
  user_id: string | null;
  user_pseudo_ids: string[];
  first_session_timestamp: number;
  last_session_timestamp: number;
  total_sessions: number;
}

/**
 * GA4 Consent Mode status
 */
export interface GA4ConsentStatus {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  timestamp: number;
}

/**
 * GA4 Consent Mode defaults
 */
export interface GA4ConsentDefaults {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  region?: string[]; // ISO 3166-2 region codes
  wait_for_update?: number; // Milliseconds to wait
}
