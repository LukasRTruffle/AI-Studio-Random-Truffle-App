-- Conversions Table Schema
-- Stores conversion events with revenue and attribution data
-- Partitioned by conversion_date for optimal query performance

CREATE TABLE IF NOT EXISTS `${project_id}.${dataset_id}.conversions` (
  -- Conversion identifiers
  conversion_id STRING NOT NULL OPTIONS(description="Unique conversion identifier"),
  conversion_type STRING NOT NULL OPTIONS(description="Conversion type (purchase, lead, signup, etc.)"),
  conversion_name STRING NOT NULL OPTIONS(description="Conversion event name"),
  conversion_timestamp INT64 NOT NULL OPTIONS(description="Conversion timestamp in Unix seconds"),
  conversion_date DATE NOT NULL OPTIONS(description="Conversion date for partitioning"),

  -- Session & user identifiers
  session_id STRING NOT NULL OPTIONS(description="Session identifier where conversion occurred"),
  user_id STRING OPTIONS(description="GA4 User-ID for logged-in users"),
  user_pseudo_id STRING NOT NULL OPTIONS(description="GA4 client ID for anonymous users"),
  unified_user_id STRING NOT NULL OPTIONS(description="COALESCE(user_id, user_pseudo_id)"),

  -- Revenue data (per ADR-010: Multi-currency support)
  value NUMERIC NOT NULL DEFAULT 0 OPTIONS(description="Conversion value (revenue)"),
  currency STRING NOT NULL DEFAULT 'USD' OPTIONS(description="Currency code (USD, MXN, COP)"),
  value_usd NUMERIC OPTIONS(description="Conversion value converted to USD (future)"),

  -- Transaction data
  transaction_id STRING OPTIONS(description="Transaction ID for purchase conversions"),
  product_category STRING OPTIONS(description="Product category"),
  product_name STRING OPTIONS(description="Product name"),
  quantity INT64 OPTIONS(description="Quantity purchased"),

  -- Attribution data
  traffic_source STRING OPTIONS(description="Traffic source for attribution"),
  medium STRING OPTIONS(description="Traffic medium for attribution"),
  campaign STRING OPTIONS(description="Campaign for attribution"),
  source_platform STRING OPTIONS(description="Source platform (Google Ads, Meta, etc.)"),
  attribution_model STRING DEFAULT 'last_click' OPTIONS(description="Attribution model used"),

  -- Geography & device
  device_category STRING NOT NULL OPTIONS(description="Device category at conversion"),
  country STRING NOT NULL OPTIONS(description="Country at conversion"),
  region STRING OPTIONS(description="Region/state at conversion"),
  city STRING OPTIONS(description="City at conversion"),

  -- Audience membership (for attribution to audiences)
  audience_ids ARRAY<STRING> OPTIONS(description="Array of audience IDs user belonged to at conversion"),

  -- Consent status at conversion
  consent_ad_storage STRING OPTIONS(description="Ad storage consent at conversion"),
  consent_analytics_storage STRING OPTIONS(description="Analytics storage consent at conversion"),

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS(description="Record creation timestamp"),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS(description="Record update timestamp")
)
PARTITION BY conversion_date
CLUSTER BY conversion_type, unified_user_id, currency
OPTIONS(
  description="Conversion events with revenue and attribution data",
  labels=[("source", "ga4"), ("layer", "processed")],
  require_partition_filter=true
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_unified_user_id
  ON `${project_id}.${dataset_id}.conversions`(unified_user_id);

CREATE INDEX IF NOT EXISTS idx_conversion_type
  ON `${project_id}.${dataset_id}.conversions`(conversion_type);

CREATE INDEX IF NOT EXISTS idx_conversion_timestamp
  ON `${project_id}.${dataset_id}.conversions`(conversion_timestamp);

CREATE INDEX IF NOT EXISTS idx_currency
  ON `${project_id}.${dataset_id}.conversions`(currency);
