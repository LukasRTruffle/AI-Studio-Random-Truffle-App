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
export * from './google-ads-sync';

// Scheduler configuration
export * from './scheduler-config';
