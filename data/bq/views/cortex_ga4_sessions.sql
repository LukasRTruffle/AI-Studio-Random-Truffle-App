-- Cortex GA4 Sessions View
-- Per ADR-007: Use GA4 native BigQuery sync with Cortex views
-- This view transforms raw GA4 export data into our sessions table format

CREATE OR REPLACE VIEW `${project_id}.${dataset_id}.cortex_ga4_sessions` AS
SELECT
  -- Session identifiers
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,

  -- User identifiers (per ADR-009: Session Stitching)
  user_id,
  user_pseudo_id,
  COALESCE(user_id, user_pseudo_id) AS unified_user_id,

  -- Session timestamps
  UNIX_SECONDS(TIMESTAMP_MICROS(MIN(event_timestamp))) AS session_start_timestamp,
  UNIX_SECONDS(TIMESTAMP_MICROS(MAX(event_timestamp))) AS session_end_timestamp,
  DATE(TIMESTAMP_MICROS(MIN(event_timestamp))) AS session_start_date,

  -- Traffic source dimensions
  traffic_source.source AS traffic_source,
  traffic_source.medium AS medium,
  traffic_source.name AS campaign,
  traffic_source.source AS source_platform,

  -- Device & geography
  device.category AS device_category,
  device.operating_system AS operating_system,
  device.web_info.browser AS browser,
  geo.country AS country,
  geo.region AS region,
  geo.city AS city,

  -- Session metrics
  COUNT(*) AS total_events,
  COUNTIF(event_name IN ('purchase', 'lead', 'sign_up')) AS total_conversions,
  SUM(ecommerce.purchase_revenue) AS total_revenue,
  COALESCE(
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'currency' LIMIT 1),
    'USD'
  ) AS currency,

  -- Consent status (per ADR-008: GA4 Consent Mode)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'consent_ad_storage' LIMIT 1) AS consent_ad_storage,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'consent_analytics_storage' LIMIT 1) AS consent_analytics_storage,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'consent_ad_user_data' LIMIT 1) AS consent_ad_user_data,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'consent_ad_personalization' LIMIT 1) AS consent_ad_personalization,

  -- Metadata
  CURRENT_TIMESTAMP() AS created_at,
  CURRENT_TIMESTAMP() AS updated_at

FROM
  `${project_id}.${dataset_id}.events_*` -- GA4 raw export tables (sharded by date)

WHERE
  _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))

GROUP BY
  session_id,
  user_id,
  user_pseudo_id,
  unified_user_id,
  traffic_source,
  medium,
  campaign,
  source_platform,
  device_category,
  operating_system,
  browser,
  country,
  region,
  city,
  currency,
  consent_ad_storage,
  consent_analytics_storage,
  consent_ad_user_data,
  consent_ad_personalization

OPTIONS(
  description="Cortex GA4 sessions view - transforms raw GA4 export into sessions format",
  labels=[("source", "ga4_cortex"), ("layer", "transformed")]
);
