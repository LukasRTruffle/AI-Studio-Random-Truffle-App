-- Get Audience Size Query
-- Estimates audience size based on conditions
-- Used for audience validation and forecasting

-- Parameters:
-- @audience_conditions: WHERE clause conditions (e.g., "total_revenue > 100 AND country = 'US'")
-- @start_date: Start date for analysis (YYYY-MM-DD)
-- @end_date: End date for analysis (YYYY-MM-DD)

WITH audience_users AS (
  SELECT
    unified_user_id,
    first_seen_timestamp,
    last_seen_timestamp,
    total_sessions,
    total_events,
    total_conversions,
    total_revenue,
    currency,
    device_category,
    country,
    region,
    city,
    user_lifecycle_stage,
    value_segment,
    engagement_segment,
    days_since_last_seen
  FROM
    `${project_id}.${dataset_id}.user_attributes`
  WHERE
    first_seen_date >= @start_date
    AND first_seen_date <= @end_date
    -- Audience conditions will be injected here dynamically
    -- AND (@audience_conditions)
)

SELECT
  -- Total audience size
  COUNT(DISTINCT unified_user_id) AS total_audience_size,

  -- Active users (last 7 days)
  COUNT(DISTINCT CASE
    WHEN days_since_last_seen <= 7
    THEN unified_user_id
  END) AS active_users_7d,

  -- Active users (last 30 days)
  COUNT(DISTINCT CASE
    WHEN days_since_last_seen <= 30
    THEN unified_user_id
  END) AS active_users_30d,

  -- Active users (last 90 days)
  COUNT(DISTINCT CASE
    WHEN days_since_last_seen <= 90
    THEN unified_user_id
  END) AS active_users_90d,

  -- Breakdown by lifecycle stage
  COUNTIF(user_lifecycle_stage = 'new') AS users_new,
  COUNTIF(user_lifecycle_stage = 'active') AS users_active,
  COUNTIF(user_lifecycle_stage = 'at_risk') AS users_at_risk,
  COUNTIF(user_lifecycle_stage = 'churned') AS users_churned,

  -- Breakdown by value segment
  COUNTIF(value_segment = 'high') AS users_high_value,
  COUNTIF(value_segment = 'medium') AS users_medium_value,
  COUNTIF(value_segment = 'low') AS users_low_value,

  -- Breakdown by device
  COUNTIF(device_category = 'desktop') AS users_desktop,
  COUNTIF(device_category = 'mobile') AS users_mobile,
  COUNTIF(device_category = 'tablet') AS users_tablet,

  -- Top 5 countries
  ARRAY_AGG(STRUCT(country, COUNT(*) AS user_count) ORDER BY user_count DESC LIMIT 5) AS top_countries,

  -- Revenue metrics
  SUM(total_revenue) AS total_revenue,
  AVG(total_revenue) AS avg_revenue_per_user,
  MAX(total_revenue) AS max_revenue,

  -- Engagement metrics
  AVG(total_sessions) AS avg_sessions_per_user,
  AVG(total_events) AS avg_events_per_user,
  AVG(total_conversions) AS avg_conversions_per_user,

  -- Currency breakdown
  ARRAY_AGG(STRUCT(
    currency,
    COUNT(*) AS user_count,
    SUM(total_revenue) AS revenue
  ) ORDER BY user_count DESC) AS currency_breakdown

FROM
  audience_users

-- Note: This query provides summary statistics
-- For actual user IDs, use get_audience_users.sql
