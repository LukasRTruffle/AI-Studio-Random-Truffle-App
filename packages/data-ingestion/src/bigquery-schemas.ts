/**
 * BigQuery Table Schemas for Ad Platform Data
 *
 * Defines schemas for Google Ads, Meta, and TikTok performance data
 * Optimized for Marketing Mix Modeling (MMM)
 */

import { BigQuery } from '@google-cloud/bigquery';

/**
 * BigQuery dataset and table configuration
 */
export interface BigQueryDatasetConfig {
  projectId: string;
  datasetId: string; // e.g., 'marketing_data'
  location?: string; // Default: 'US'
}

/**
 * Google Ads campaign performance schema
 *
 * Daily metrics for MMM training
 */
export const GOOGLE_ADS_CAMPAIGN_PERFORMANCE_SCHEMA = [
  { name: 'date', type: 'DATE', mode: 'REQUIRED' },
  { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'campaign_id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'campaign_name', type: 'STRING', mode: 'NULLABLE' },
  { name: 'campaign_status', type: 'STRING', mode: 'NULLABLE' },
  { name: 'impressions', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'clicks', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'cost_micros', type: 'INTEGER', mode: 'REQUIRED' }, // Cost in micro currency units (divide by 1M)
  { name: 'conversions', type: 'FLOAT', mode: 'REQUIRED' },
  { name: 'conversion_value', type: 'FLOAT', mode: 'REQUIRED' },
  { name: 'all_conversions', type: 'FLOAT', mode: 'NULLABLE' },
  { name: 'all_conversions_value', type: 'FLOAT', mode: 'NULLABLE' },
  { name: 'currency', type: 'STRING', mode: 'REQUIRED' }, // USD, MXN, COP
  { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
];

/**
 * Meta (Facebook/Instagram) campaign performance schema
 */
export const META_CAMPAIGN_PERFORMANCE_SCHEMA = [
  { name: 'date', type: 'DATE', mode: 'REQUIRED' },
  { name: 'account_id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'campaign_id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'campaign_name', type: 'STRING', mode: 'NULLABLE' },
  { name: 'impressions', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'clicks', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'spend', type: 'FLOAT', mode: 'REQUIRED' }, // Already in currency units
  { name: 'actions', type: 'STRING', mode: 'NULLABLE' }, // JSON array of action objects
  { name: 'action_values', type: 'STRING', mode: 'NULLABLE' }, // JSON array of values
  { name: 'currency', type: 'STRING', mode: 'REQUIRED' },
  { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
];

/**
 * TikTok campaign performance schema
 */
export const TIKTOK_CAMPAIGN_PERFORMANCE_SCHEMA = [
  { name: 'date', type: 'DATE', mode: 'REQUIRED' },
  { name: 'advertiser_id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'campaign_id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'campaign_name', type: 'STRING', mode: 'NULLABLE' },
  { name: 'impressions', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'clicks', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'spend', type: 'FLOAT', mode: 'REQUIRED' },
  { name: 'conversions', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'conversion_value', type: 'FLOAT', mode: 'NULLABLE' },
  { name: 'currency', type: 'STRING', mode: 'REQUIRED' },
  { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
];

/**
 * Table names
 */
export const TABLE_NAMES = {
  GOOGLE_ADS: 'google_ads_campaign_performance',
  META: 'meta_campaign_performance',
  TIKTOK: 'tiktok_campaign_performance',
} as const;

/**
 * MMM Training Data View SQL
 *
 * Joins GA4 events with ad platform data for MMM model training
 */
export const MMM_TRAINING_DATA_VIEW_SQL = `
CREATE OR REPLACE VIEW \`{project_id}.{dataset_id}.mmm_training_data\` AS
WITH ga4_daily AS (
  SELECT
    PARSE_DATE('%Y%m%d', event_date) AS date,
    COUNT(DISTINCT user_pseudo_id) AS unique_users,
    COUNTIF(event_name = 'purchase') AS conversions,
    SUM(CASE WHEN event_name = 'purchase' THEN
      (SELECT COALESCE(value.double_value, value.int_value, 0)
       FROM UNNEST(event_params)
       WHERE key = 'value')
    END) AS revenue
  FROM \`{project_id}.analytics_{property_id}.events_*\`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY))
    AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
  GROUP BY date
),
google_ads_daily AS (
  SELECT
    date,
    SUM(cost_micros / 1000000) AS google_ads_spend,
    SUM(impressions) AS google_ads_impressions,
    SUM(clicks) AS google_ads_clicks
  FROM \`{project_id}.{dataset_id}.google_ads_campaign_performance\`
  GROUP BY date
),
meta_daily AS (
  SELECT
    date,
    SUM(spend) AS meta_spend,
    SUM(impressions) AS meta_impressions,
    SUM(clicks) AS meta_clicks
  FROM \`{project_id}.{dataset_id}.meta_campaign_performance\`
  GROUP BY date
),
tiktok_daily AS (
  SELECT
    date,
    SUM(spend) AS tiktok_spend,
    SUM(impressions) AS tiktok_impressions,
    SUM(clicks) AS tiktok_clicks
  FROM \`{project_id}.{dataset_id}.tiktok_campaign_performance\`
  GROUP BY date
)
SELECT
  ga4.date,
  -- GA4 metrics (conversions, revenue)
  COALESCE(ga4.unique_users, 0) AS unique_users,
  COALESCE(ga4.conversions, 0) AS conversions,
  COALESCE(ga4.revenue, 0) AS revenue,
  -- Google Ads spend
  COALESCE(google.google_ads_spend, 0) AS google_ads_spend,
  COALESCE(google.google_ads_impressions, 0) AS google_ads_impressions,
  COALESCE(google.google_ads_clicks, 0) AS google_ads_clicks,
  -- Meta spend
  COALESCE(meta.meta_spend, 0) AS meta_spend,
  COALESCE(meta.meta_impressions, 0) AS meta_impressions,
  COALESCE(meta.meta_clicks, 0) AS meta_clicks,
  -- TikTok spend
  COALESCE(tiktok.tiktok_spend, 0) AS tiktok_spend,
  COALESCE(tiktok.tiktok_impressions, 0) AS tiktok_impressions,
  COALESCE(tiktok.tiktok_clicks, 0) AS tiktok_clicks,
  -- Seasonality features
  EXTRACT(DAYOFWEEK FROM ga4.date) AS day_of_week,
  EXTRACT(MONTH FROM ga4.date) AS month,
  EXTRACT(YEAR FROM ga4.date) AS year
FROM ga4_daily ga4
LEFT JOIN google_ads_daily google USING (date)
LEFT JOIN meta_daily meta USING (date)
LEFT JOIN tiktok_daily tiktok USING (date)
ORDER BY ga4.date ASC;
`;

/**
 * Create or update BigQuery tables
 */
export async function createBigQueryTables(config: BigQueryDatasetConfig): Promise<void> {
  const bigquery = new BigQuery({
    projectId: config.projectId,
  });

  const dataset = bigquery.dataset(config.datasetId);

  // Check if dataset exists, create if not
  const [datasetExists] = await dataset.exists();
  if (!datasetExists) {
    await bigquery.createDataset(config.datasetId, {
      location: config.location || 'US',
    });
    console.log(`Created dataset: ${config.datasetId}`);
  }

  // Create Google Ads table
  const googleAdsTable = dataset.table(TABLE_NAMES.GOOGLE_ADS);
  const [googleAdsExists] = await googleAdsTable.exists();
  if (!googleAdsExists) {
    await dataset.createTable(TABLE_NAMES.GOOGLE_ADS, {
      schema: GOOGLE_ADS_CAMPAIGN_PERFORMANCE_SCHEMA,
      timePartitioning: {
        type: 'DAY',
        field: 'date',
      },
      clustering: {
        fields: ['customer_id', 'campaign_id'],
      },
    });
    console.log(`Created table: ${TABLE_NAMES.GOOGLE_ADS}`);
  }

  // Create Meta table
  const metaTable = dataset.table(TABLE_NAMES.META);
  const [metaExists] = await metaTable.exists();
  if (!metaExists) {
    await dataset.createTable(TABLE_NAMES.META, {
      schema: META_CAMPAIGN_PERFORMANCE_SCHEMA,
      timePartitioning: {
        type: 'DAY',
        field: 'date',
      },
      clustering: {
        fields: ['account_id', 'campaign_id'],
      },
    });
    console.log(`Created table: ${TABLE_NAMES.META}`);
  }

  // Create TikTok table
  const tiktokTable = dataset.table(TABLE_NAMES.TIKTOK);
  const [tiktokExists] = await tiktokTable.exists();
  if (!tiktokExists) {
    await dataset.createTable(TABLE_NAMES.TIKTOK, {
      schema: TIKTOK_CAMPAIGN_PERFORMANCE_SCHEMA,
      timePartitioning: {
        type: 'DAY',
        field: 'date',
      },
      clustering: {
        fields: ['advertiser_id', 'campaign_id'],
      },
    });
    console.log(`Created table: ${TABLE_NAMES.TIKTOK}`);
  }

  console.log('All BigQuery tables created successfully');
}

/**
 * Create MMM training data view
 */
export async function createMMMTrainingDataView(
  config: BigQueryDatasetConfig,
  ga4PropertyId: string
): Promise<void> {
  const bigquery = new BigQuery({
    projectId: config.projectId,
  });

  const sql = MMM_TRAINING_DATA_VIEW_SQL.replace(/{project_id}/g, config.projectId)
    .replace(/{dataset_id}/g, config.datasetId)
    .replace(/{property_id}/g, ga4PropertyId);

  await bigquery.query(sql);
  console.log('Created MMM training data view');
}
