-- Audience Metrics View
-- Calculates daily metrics per audience
-- Used for audience performance tracking and optimization

CREATE OR REPLACE VIEW `${project_id}.${dataset_id}.audience_metrics` AS
WITH audience_users AS (
  -- Unnest audience_ids array to get one row per user per audience
  SELECT
    audience_id,
    unified_user_id,
    last_seen_date,
    total_revenue,
    currency,
    total_conversions
  FROM
    `${project_id}.${dataset_id}.user_attributes`,
    UNNEST(audience_ids) AS audience_id
  WHERE
    last_seen_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
),

daily_audience_metrics AS (
  SELECT
    audience_id,
    last_seen_date AS date,
    currency,
    COUNT(DISTINCT unified_user_id) AS total_users,

    -- Active users in last 7 days
    COUNT(DISTINCT CASE
      WHEN DATE_DIFF(CURRENT_DATE(), last_seen_date, DAY) <= 7
      THEN unified_user_id
    END) AS active_users_7d,

    -- Active users in last 30 days
    COUNT(DISTINCT CASE
      WHEN DATE_DIFF(CURRENT_DATE(), last_seen_date, DAY) <= 30
      THEN unified_user_id
    END) AS active_users_30d,

    -- Aggregated conversions and revenue
    SUM(total_conversions) AS total_conversions,
    SUM(total_revenue) AS total_revenue

  FROM
    audience_users
  GROUP BY
    audience_id,
    last_seen_date,
    currency
)

SELECT
  audience_id,
  date,
  total_users,
  active_users_7d,
  active_users_30d,
  total_conversions,
  total_revenue,
  currency,

  -- Derived metrics
  SAFE_DIVIDE(total_revenue, total_users) AS avg_revenue_per_user,
  SAFE_DIVIDE(total_conversions, total_users) AS conversions_per_user,
  SAFE_DIVIDE(active_users_7d, total_users) AS active_user_rate_7d,
  SAFE_DIVIDE(active_users_30d, total_users) AS active_user_rate_30d,
  SAFE_DIVIDE(total_revenue, total_conversions) AS avg_order_value,

  -- Engagement score (0-100)
  CAST(
    LEAST(100, (
      (SAFE_DIVIDE(active_users_7d, total_users) * 40) +
      (SAFE_DIVIDE(active_users_30d, total_users) * 30) +
      (SAFE_DIVIDE(total_conversions, total_users) * 30)
    ) * 100)
  AS INT64) AS engagement_score

FROM
  daily_audience_metrics

WHERE
  total_users > 0 -- Only include audiences with users

ORDER BY
  audience_id,
  date DESC

OPTIONS(
  description="Daily metrics per audience for performance tracking",
  labels=[("layer", "aggregated"), ("refresh", "daily")]
);
