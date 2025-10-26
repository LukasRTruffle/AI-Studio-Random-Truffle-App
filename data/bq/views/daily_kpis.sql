-- Daily KPIs View
-- Aggregates daily metrics from sessions, events, and conversions tables
-- Used for analytics dashboard

CREATE OR REPLACE VIEW `${project_id}.${dataset_id}.daily_kpis` AS
WITH daily_sessions AS (
  SELECT
    session_start_date AS date,
    currency,
    COUNT(DISTINCT unified_user_id) AS total_users,
    COUNT(DISTINCT session_id) AS total_sessions,
    SUM(total_events) AS total_events,
    AVG(session_end_timestamp - session_start_timestamp) AS avg_session_duration_seconds,
    -- Bounce rate: sessions with only 1 event
    SAFE_DIVIDE(
      COUNTIF(total_events = 1),
      COUNT(DISTINCT session_id)
    ) AS bounce_rate
  FROM
    `${project_id}.${dataset_id}.sessions`
  WHERE
    session_start_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  GROUP BY
    session_start_date,
    currency
),

daily_conversions AS (
  SELECT
    conversion_date AS date,
    currency,
    COUNT(*) AS total_conversions,
    SUM(value) AS total_revenue
  FROM
    `${project_id}.${dataset_id}.conversions`
  WHERE
    conversion_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  GROUP BY
    conversion_date,
    currency
)

SELECT
  s.date,
  s.total_users,
  s.total_sessions,
  s.total_events,
  COALESCE(c.total_conversions, 0) AS total_conversions,
  COALESCE(c.total_revenue, 0) AS total_revenue,
  s.currency,
  s.avg_session_duration_seconds,
  s.bounce_rate,

  -- Derived metrics
  SAFE_DIVIDE(s.total_sessions, s.total_users) AS sessions_per_user,
  SAFE_DIVIDE(s.total_events, s.total_sessions) AS events_per_session,
  SAFE_DIVIDE(COALESCE(c.total_conversions, 0), s.total_sessions) AS conversion_rate,
  SAFE_DIVIDE(COALESCE(c.total_revenue, 0), s.total_users) AS revenue_per_user,
  SAFE_DIVIDE(COALESCE(c.total_revenue, 0), COALESCE(c.total_conversions, 0)) AS avg_order_value

FROM
  daily_sessions s
LEFT JOIN
  daily_conversions c
ON
  s.date = c.date
  AND s.currency = c.currency

ORDER BY
  s.date DESC

OPTIONS(
  description="Daily KPI metrics aggregated from sessions and conversions",
  labels=[("layer", "aggregated"), ("refresh", "daily")]
);
