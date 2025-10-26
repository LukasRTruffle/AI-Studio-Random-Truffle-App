-- Get Audience Users Query
-- Retrieves list of user IDs matching audience conditions
-- Used for audience activation (uploading to ad platforms)

-- Parameters:
-- @audience_id: Audience ID
-- @audience_conditions: WHERE clause conditions
-- @start_date: Start date (YYYY-MM-DD)
-- @end_date: End date (YYYY-MM-DD)
-- @limit: Maximum number of users to return (default: 10000)

WITH audience_users AS (
  SELECT
    unified_user_id,
    user_id,
    first_seen_timestamp,
    last_seen_timestamp,
    total_sessions,
    total_conversions,
    total_revenue,
    currency,
    device_category,
    country,
    user_lifecycle_stage,
    value_segment,
    engagement_segment,
    consent_ad_storage,
    consent_analytics_storage,
    consent_ad_user_data,
    consent_ad_personalization
  FROM
    `${project_id}.${dataset_id}.user_attributes`
  WHERE
    first_seen_date >= @start_date
    AND first_seen_date <= @end_date
    -- Audience conditions will be injected here dynamically
    -- AND (@audience_conditions)
    -- Filter by audience membership if audience_id provided
    AND (@audience_id IS NULL OR @audience_id IN UNNEST(audience_ids))
)

SELECT
  unified_user_id,
  user_id,

  -- Timestamps
  TIMESTAMP_SECONDS(first_seen_timestamp) AS first_seen_at,
  TIMESTAMP_SECONDS(last_seen_timestamp) AS last_seen_at,

  -- User metrics
  total_sessions,
  total_conversions,
  total_revenue,
  currency,

  -- Segmentation
  device_category,
  country,
  user_lifecycle_stage,
  value_segment,
  engagement_segment,

  -- Consent status (important for ad platform activation)
  consent_ad_storage,
  consent_analytics_storage,
  consent_ad_user_data,
  consent_ad_personalization,

  -- Activation eligibility
  CASE
    WHEN consent_ad_storage = 'granted'
      AND consent_ad_user_data = 'granted'
      AND consent_ad_personalization = 'granted'
    THEN true
    ELSE false
  END AS eligible_for_advertising,

  -- Quality score (0-100)
  CAST(
    LEAST(100, (
      -- Recency score (40 points)
      (CASE
        WHEN DATE_DIFF(CURRENT_DATE(), DATE(TIMESTAMP_SECONDS(last_seen_timestamp)), DAY) <= 7 THEN 40
        WHEN DATE_DIFF(CURRENT_DATE(), DATE(TIMESTAMP_SECONDS(last_seen_timestamp)), DAY) <= 30 THEN 30
        WHEN DATE_DIFF(CURRENT_DATE(), DATE(TIMESTAMP_SECONDS(last_seen_timestamp)), DAY) <= 90 THEN 20
        ELSE 10
      END) +
      -- Engagement score (30 points)
      (CASE
        WHEN total_sessions >= 10 THEN 30
        WHEN total_sessions >= 5 THEN 20
        WHEN total_sessions >= 2 THEN 10
        ELSE 5
      END) +
      -- Value score (30 points)
      (CASE
        WHEN total_revenue >= 1000 THEN 30
        WHEN total_revenue >= 100 THEN 20
        WHEN total_revenue >= 10 THEN 10
        ELSE 5
      END)
    ))
  AS INT64) AS quality_score

FROM
  audience_users

ORDER BY
  quality_score DESC,
  last_seen_timestamp DESC

LIMIT @limit
