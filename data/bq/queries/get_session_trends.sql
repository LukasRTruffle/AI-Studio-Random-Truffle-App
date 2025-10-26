-- Get Session Trends Query
-- Analyzes session trends over time with various groupings
-- Used for analytics dashboards and trend analysis

-- Parameters:
-- @start_date: Start date for analysis (YYYY-MM-DD)
-- @end_date: End date for analysis (YYYY-MM-DD)
-- @group_by: Grouping dimension ('date', 'device', 'country', 'traffic_source')
-- @currency: Currency filter (optional, e.g., 'USD')

WITH session_data AS (
  SELECT
    session_start_date,
    device_category,
    country,
    traffic_source,
    medium,
    campaign,
    session_id,
    unified_user_id,
    session_end_timestamp - session_start_timestamp AS session_duration_seconds,
    total_events,
    total_conversions,
    total_revenue,
    currency
  FROM
    `${project_id}.${dataset_id}.sessions`
  WHERE
    session_start_date >= @start_date
    AND session_start_date <= @end_date
    AND (@currency IS NULL OR currency = @currency)
),

trends AS (
  SELECT
    -- Dynamic grouping based on @group_by parameter
    CASE
      WHEN @group_by = 'date' THEN CAST(session_start_date AS STRING)
      WHEN @group_by = 'device' THEN device_category
      WHEN @group_by = 'country' THEN country
      WHEN @group_by = 'traffic_source' THEN CONCAT(traffic_source, ' / ', medium)
      ELSE 'unknown'
    END AS dimension,

    session_start_date AS date,

    -- Session metrics
    COUNT(DISTINCT session_id) AS total_sessions,
    COUNT(DISTINCT unified_user_id) AS total_users,

    -- Engagement metrics
    AVG(session_duration_seconds) AS avg_session_duration_seconds,
    AVG(total_events) AS avg_events_per_session,
    SAFE_DIVIDE(
      COUNTIF(total_events = 1),
      COUNT(DISTINCT session_id)
    ) AS bounce_rate,
    SAFE_DIVIDE(
      COUNTIF(total_events >= 2 OR session_duration_seconds > 10),
      COUNT(DISTINCT session_id)
    ) AS engagement_rate,

    -- Conversion metrics
    SUM(total_conversions) AS total_conversions,
    SAFE_DIVIDE(
      SUM(total_conversions),
      COUNT(DISTINCT session_id)
    ) AS conversion_rate,

    -- Revenue metrics
    SUM(total_revenue) AS total_revenue,
    AVG(total_revenue) AS avg_revenue_per_session,
    SAFE_DIVIDE(
      SUM(total_revenue),
      COUNT(DISTINCT unified_user_id)
    ) AS avg_revenue_per_user,

    -- Currency
    ANY_VALUE(currency) AS currency

  FROM
    session_data

  GROUP BY
    dimension,
    session_start_date
),

trends_with_growth AS (
  SELECT
    *,

    -- Calculate period-over-period growth
    LAG(total_sessions) OVER (
      PARTITION BY dimension
      ORDER BY date
    ) AS prev_period_sessions,

    LAG(total_revenue) OVER (
      PARTITION BY dimension
      ORDER BY date
    ) AS prev_period_revenue,

    -- Growth rates
    SAFE_DIVIDE(
      total_sessions - LAG(total_sessions) OVER (PARTITION BY dimension ORDER BY date),
      LAG(total_sessions) OVER (PARTITION BY dimension ORDER BY date)
    ) AS sessions_growth_rate,

    SAFE_DIVIDE(
      total_revenue - LAG(total_revenue) OVER (PARTITION BY dimension ORDER BY date),
      LAG(total_revenue) OVER (PARTITION BY dimension ORDER BY date)
    ) AS revenue_growth_rate

  FROM
    trends
)

SELECT
  dimension,
  date,

  -- Session metrics
  total_sessions,
  total_users,
  SAFE_DIVIDE(total_sessions, total_users) AS sessions_per_user,

  -- Engagement metrics
  CAST(avg_session_duration_seconds AS INT64) AS avg_session_duration_seconds,
  ROUND(avg_events_per_session, 2) AS avg_events_per_session,
  ROUND(bounce_rate * 100, 2) AS bounce_rate_pct,
  ROUND(engagement_rate * 100, 2) AS engagement_rate_pct,

  -- Conversion metrics
  total_conversions,
  ROUND(conversion_rate * 100, 2) AS conversion_rate_pct,

  -- Revenue metrics
  ROUND(total_revenue, 2) AS total_revenue,
  ROUND(avg_revenue_per_session, 2) AS avg_revenue_per_session,
  ROUND(avg_revenue_per_user, 2) AS avg_revenue_per_user,
  currency,

  -- Growth metrics
  prev_period_sessions,
  prev_period_revenue,
  ROUND(sessions_growth_rate * 100, 2) AS sessions_growth_rate_pct,
  ROUND(revenue_growth_rate * 100, 2) AS revenue_growth_rate_pct,

  -- Trend indicator
  CASE
    WHEN sessions_growth_rate > 0.1 THEN 'up_strong'
    WHEN sessions_growth_rate > 0 THEN 'up'
    WHEN sessions_growth_rate < -0.1 THEN 'down_strong'
    WHEN sessions_growth_rate < 0 THEN 'down'
    ELSE 'flat'
  END AS trend_direction

FROM
  trends_with_growth

ORDER BY
  date DESC,
  total_sessions DESC

-- Limit to top 100 results for performance
LIMIT 100
