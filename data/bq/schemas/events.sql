-- GA4 Events Table Schema
-- Stores event-level data from GA4 BigQuery export
-- Partitioned by event_date for optimal query performance

CREATE TABLE IF NOT EXISTS `${project_id}.${dataset_id}.events` (
  -- Event identifiers
  event_id STRING NOT NULL OPTIONS(description="Unique event identifier"),
  event_name STRING NOT NULL OPTIONS(description="Event name (e.g., page_view, purchase)"),
  event_timestamp INT64 NOT NULL OPTIONS(description="Event timestamp in microseconds"),
  event_date DATE NOT NULL OPTIONS(description="Event date for partitioning"),

  -- Session & user identifiers
  session_id STRING NOT NULL OPTIONS(description="Session identifier"),
  user_id STRING OPTIONS(description="GA4 User-ID for logged-in users"),
  user_pseudo_id STRING NOT NULL OPTIONS(description="GA4 client ID for anonymous users"),
  unified_user_id STRING NOT NULL OPTIONS(description="COALESCE(user_id, user_pseudo_id)"),

  -- Page/screen information
  page_location STRING OPTIONS(description="Full page URL"),
  page_title STRING OPTIONS(description="Page title"),
  page_referrer STRING OPTIONS(description="Page referrer URL"),
  screen_name STRING OPTIONS(description="Screen name (for mobile apps)"),

  -- Event parameters (JSON)
  event_params JSON OPTIONS(description="Event parameters as JSON object"),

  -- User properties (JSON)
  user_properties JSON OPTIONS(description="User properties as JSON object"),

  -- Device & geography
  device_category STRING NOT NULL OPTIONS(description="Device category (desktop, mobile, tablet)"),
  operating_system STRING OPTIONS(description="Operating system"),
  browser STRING OPTIONS(description="Browser name"),
  country STRING NOT NULL OPTIONS(description="Country (ISO 3166-1 alpha-2)"),
  region STRING OPTIONS(description="Region/state"),
  city STRING OPTIONS(description="City"),

  -- Traffic source
  traffic_source STRING OPTIONS(description="Traffic source"),
  medium STRING OPTIONS(description="Traffic medium"),
  campaign STRING OPTIONS(description="Campaign name"),

  -- E-commerce data (for purchase events)
  transaction_id STRING OPTIONS(description="Transaction ID for purchase events"),
  transaction_revenue NUMERIC OPTIONS(description="Transaction revenue"),
  currency STRING DEFAULT 'USD' OPTIONS(description="Currency code (USD, MXN, COP)"),

  -- Consent status (per ADR-008)
  consent_ad_storage STRING OPTIONS(description="Ad storage consent at event time"),
  consent_analytics_storage STRING OPTIONS(description="Analytics storage consent at event time"),

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS(description="Record creation timestamp"),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS(description="Record update timestamp")
)
PARTITION BY event_date
CLUSTER BY event_name, unified_user_id, session_id
OPTIONS(
  description="GA4 event-level data with full event parameters",
  labels=[("source", "ga4"), ("layer", "raw")],
  require_partition_filter=true
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_event_name
  ON `${project_id}.${dataset_id}.events`(event_name);

CREATE INDEX IF NOT EXISTS idx_unified_user_id
  ON `${project_id}.${dataset_id}.events`(unified_user_id);

CREATE INDEX IF NOT EXISTS idx_session_id
  ON `${project_id}.${dataset_id}.events`(session_id);

CREATE INDEX IF NOT EXISTS idx_event_timestamp
  ON `${project_id}.${dataset_id}.events`(event_timestamp);
