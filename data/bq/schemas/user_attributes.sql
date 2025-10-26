-- User Attributes Table Schema
-- Stores aggregated user-level attributes for audience building
-- Updated daily via scheduled query

CREATE TABLE IF NOT EXISTS `${project_id}.${dataset_id}.user_attributes` (
  -- User identifier
  unified_user_id STRING NOT NULL OPTIONS(description="COALESCE(user_id, user_pseudo_id)"),

  -- Temporal attributes
  first_seen_timestamp INT64 NOT NULL OPTIONS(description="First time user was seen (Unix seconds)"),
  last_seen_timestamp INT64 NOT NULL OPTIONS(description="Last time user was seen (Unix seconds)"),
  first_seen_date DATE NOT NULL OPTIONS(description="First seen date"),
  last_seen_date DATE NOT NULL OPTIONS(description="Last seen date"),
  days_since_first_seen INT64 OPTIONS(description="Days since first seen"),
  days_since_last_seen INT64 OPTIONS(description="Days since last seen (recency)"),

  -- Engagement metrics
  total_sessions INT64 NOT NULL DEFAULT 0 OPTIONS(description="Total number of sessions"),
  total_events INT64 NOT NULL DEFAULT 0 OPTIONS(description="Total number of events"),
  total_page_views INT64 NOT NULL DEFAULT 0 OPTIONS(description="Total page views"),
  avg_session_duration_seconds NUMERIC OPTIONS(description="Average session duration in seconds"),
  total_engaged_sessions INT64 OPTIONS(description="Total engaged sessions (> 10s or 2+ events)"),
  engagement_rate NUMERIC OPTIONS(description="Engaged sessions / total sessions"),

  -- Conversion metrics
  total_conversions INT64 NOT NULL DEFAULT 0 OPTIONS(description="Total number of conversions"),
  total_revenue NUMERIC NOT NULL DEFAULT 0 OPTIONS(description="Total revenue from user"),
  currency STRING NOT NULL DEFAULT 'USD' OPTIONS(description="Primary currency for user"),
  avg_order_value NUMERIC OPTIONS(description="Average order value"),
  days_since_last_conversion INT64 OPTIONS(description="Days since last conversion"),

  -- Device & technology
  device_category STRING NOT NULL OPTIONS(description="Primary device category"),
  operating_system STRING OPTIONS(description="Primary operating system"),
  browser STRING OPTIONS(description="Primary browser"),

  -- Geography
  country STRING NOT NULL OPTIONS(description="Primary country"),
  region STRING OPTIONS(description="Primary region/state"),
  city STRING OPTIONS(description="Primary city"),

  -- Acquisition attributes (first touch)
  traffic_source_first STRING OPTIONS(description="First traffic source"),
  medium_first STRING OPTIONS(description="First medium"),
  campaign_first STRING OPTIONS(description="First campaign"),
  source_platform_first STRING OPTIONS(description="First source platform"),

  -- Most recent attributes (last touch)
  traffic_source_last STRING OPTIONS(description="Last traffic source"),
  medium_last STRING OPTIONS(description="Last medium"),
  campaign_last STRING OPTIONS(description="Last campaign"),
  source_platform_last STRING OPTIONS(description="Last source platform"),

  -- Behavioral segments
  user_lifecycle_stage STRING OPTIONS(description="Lifecycle stage (new, active, at_risk, churned)"),
  value_segment STRING OPTIONS(description="Value segment (high, medium, low)"),
  engagement_segment STRING OPTIONS(description="Engagement segment (highly_engaged, moderately_engaged, low_engaged)"),

  -- Consent status (latest)
  consent_ad_storage STRING OPTIONS(description="Latest ad storage consent"),
  consent_analytics_storage STRING OPTIONS(description="Latest analytics storage consent"),
  consent_ad_user_data STRING OPTIONS(description="Latest ad user data consent"),
  consent_ad_personalization STRING OPTIONS(description="Latest ad personalization consent"),

  -- Audience membership
  audience_ids ARRAY<STRING> OPTIONS(description="Array of audience IDs user belongs to"),

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS(description="Record creation timestamp"),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS(description="Record update timestamp"),
  last_calculated_at TIMESTAMP NOT NULL OPTIONS(description="Last time attributes were calculated")
)
CLUSTER BY unified_user_id, country, device_category, user_lifecycle_stage
OPTIONS(
  description="Aggregated user-level attributes for audience building and segmentation",
  labels=[("source", "ga4"), ("layer", "aggregated")],
  friendly_name="User Attributes"
);

-- Primary key constraint (enforced in application layer)
-- BigQuery doesn't support PRIMARY KEY, but we enforce uniqueness via MERGE statements

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_unified_user_id
  ON `${project_id}.${dataset_id}.user_attributes`(unified_user_id);

CREATE INDEX IF NOT EXISTS idx_lifecycle_stage
  ON `${project_id}.${dataset_id}.user_attributes`(user_lifecycle_stage);

CREATE INDEX IF NOT EXISTS idx_value_segment
  ON `${project_id}.${dataset_id}.user_attributes`(value_segment);

CREATE INDEX IF NOT EXISTS idx_last_seen_date
  ON `${project_id}.${dataset_id}.user_attributes`(last_seen_date);
