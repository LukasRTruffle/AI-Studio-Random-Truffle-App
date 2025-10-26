-- GA4 Sessions Table Schema
-- Stores session-level data from GA4 BigQuery export
-- Partitioned by session_start_date for optimal query performance

CREATE TABLE IF NOT EXISTS `${project_id}.${dataset_id}.sessions` (
  -- Session identifiers
  session_id STRING NOT NULL OPTIONS(description="Unique session identifier"),

  -- User identifiers (per ADR-009: Session Stitching)
  user_id STRING OPTIONS(description="GA4 User-ID for logged-in users"),
  user_pseudo_id STRING NOT NULL OPTIONS(description="GA4 client ID for anonymous users"),
  unified_user_id STRING NOT NULL OPTIONS(description="COALESCE(user_id, user_pseudo_id) for cross-session tracking"),

  -- Session timestamps
  session_start_timestamp INT64 NOT NULL OPTIONS(description="Session start time in Unix seconds"),
  session_end_timestamp INT64 NOT NULL OPTIONS(description="Session end time in Unix seconds"),
  session_start_date DATE NOT NULL OPTIONS(description="Session start date for partitioning"),

  -- Traffic source dimensions
  traffic_source STRING OPTIONS(description="Traffic source (e.g., google, facebook)"),
  medium STRING OPTIONS(description="Traffic medium (e.g., cpc, organic, referral)"),
  campaign STRING OPTIONS(description="Campaign name"),
  source_platform STRING OPTIONS(description="Source platform (e.g., Google Ads, Meta)"),

  -- Device & geography
  device_category STRING NOT NULL OPTIONS(description="Device category (desktop, mobile, tablet)"),
  operating_system STRING OPTIONS(description="Operating system"),
  browser STRING OPTIONS(description="Browser name"),
  country STRING NOT NULL OPTIONS(description="Country (ISO 3166-1 alpha-2)"),
  region STRING OPTIONS(description="Region/state"),
  city STRING OPTIONS(description="City"),

  -- Session metrics
  total_events INT64 NOT NULL DEFAULT 0 OPTIONS(description="Total events in session"),
  total_conversions INT64 NOT NULL DEFAULT 0 OPTIONS(description="Total conversions in session"),
  total_revenue NUMERIC DEFAULT 0 OPTIONS(description="Total revenue from session"),
  currency STRING DEFAULT 'USD' OPTIONS(description="Currency code (USD, MXN, COP)"),

  -- Consent status (per ADR-008: GA4 Consent Mode)
  consent_ad_storage STRING OPTIONS(description="Ad storage consent (granted, denied)"),
  consent_analytics_storage STRING OPTIONS(description="Analytics storage consent (granted, denied)"),
  consent_ad_user_data STRING OPTIONS(description="Ad user data consent (granted, denied)"),
  consent_ad_personalization STRING OPTIONS(description="Ad personalization consent (granted, denied)"),

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS(description="Record creation timestamp"),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS(description="Record update timestamp")
)
PARTITION BY session_start_date
CLUSTER BY unified_user_id, device_category, country
OPTIONS(
  description="GA4 session-level data with user stitching and consent tracking",
  labels=[("source", "ga4"), ("layer", "raw")],
  require_partition_filter=true
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_unified_user_id
  ON `${project_id}.${dataset_id}.sessions`(unified_user_id);

CREATE INDEX IF NOT EXISTS idx_session_start
  ON `${project_id}.${dataset_id}.sessions`(session_start_timestamp);
