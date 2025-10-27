/**
 * Data Ingestion Package for Random Truffle
 *
 * ETL orchestration for ad platform data to BigQuery (MMM training data)
 */

// BigQuery schemas and setup
export * from './bigquery-schemas';

// BigQuery loader
export * from './bigquery-loader';

// Platform-specific sync jobs
export { GoogleAdsSync, type GoogleAdsSyncConfig } from './google-ads-sync';
export { MetaSync, type MetaSyncConfig } from './meta-sync';
export { TikTokSync, type TikTokSyncConfig } from './tiktok-sync';

// Scheduler configuration
export * from './scheduler-config';
