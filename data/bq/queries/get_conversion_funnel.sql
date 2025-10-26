-- Get Conversion Funnel Query
-- Analyzes conversion funnel with step-by-step metrics
-- Used for funnel optimization and drop-off analysis

-- Parameters:
-- @funnel_steps: Array of event names representing funnel steps
--   Example: ['page_view', 'add_to_cart', 'begin_checkout', 'purchase']
-- @start_date: Start date (YYYY-MM-DD)
-- @end_date: End date (YYYY-MM-DD)
-- @device_category: Optional device filter
-- @country: Optional country filter

WITH funnel_events AS (
  SELECT
    unified_user_id,
    event_name,
    event_timestamp,
    device_category,
    country,
    session_id
  FROM
    `${project_id}.${dataset_id}.events`
  WHERE
    event_date >= @start_date
    AND event_date <= @end_date
    AND event_name IN UNNEST(@funnel_steps)
    AND (@device_category IS NULL OR device_category = @device_category)
    AND (@country IS NULL OR country = @country)
),

user_funnel_progression AS (
  SELECT
    unified_user_id,
    -- Step 1
    MAX(CASE WHEN event_name = @funnel_steps[OFFSET(0)] THEN 1 ELSE 0 END) AS reached_step_1,
    MIN(CASE WHEN event_name = @funnel_steps[OFFSET(0)] THEN event_timestamp END) AS step_1_timestamp,

    -- Step 2
    MAX(CASE WHEN event_name = @funnel_steps[SAFE_OFFSET(1)] THEN 1 ELSE 0 END) AS reached_step_2,
    MIN(CASE WHEN event_name = @funnel_steps[SAFE_OFFSET(1)] THEN event_timestamp END) AS step_2_timestamp,

    -- Step 3
    MAX(CASE WHEN event_name = @funnel_steps[SAFE_OFFSET(2)] THEN 1 ELSE 0 END) AS reached_step_3,
    MIN(CASE WHEN event_name = @funnel_steps[SAFE_OFFSET(2)] THEN event_timestamp END) AS step_3_timestamp,

    -- Step 4
    MAX(CASE WHEN event_name = @funnel_steps[SAFE_OFFSET(3)] THEN 1 ELSE 0 END) AS reached_step_4,
    MIN(CASE WHEN event_name = @funnel_steps[SAFE_OFFSET(3)] THEN event_timestamp END) AS step_4_timestamp,

    -- Step 5
    MAX(CASE WHEN event_name = @funnel_steps[SAFE_OFFSET(4)] THEN 1 ELSE 0 END) AS reached_step_5,
    MIN(CASE WHEN event_name = @funnel_steps[SAFE_OFFSET(4)] THEN event_timestamp END) AS step_5_timestamp

  FROM
    funnel_events
  GROUP BY
    unified_user_id
)

SELECT
  -- Step 1 metrics
  @funnel_steps[OFFSET(0)] AS step_1_name,
  SUM(reached_step_1) AS step_1_users,
  ROUND(100.0, 2) AS step_1_conversion_rate_pct,

  -- Step 2 metrics
  @funnel_steps[SAFE_OFFSET(1)] AS step_2_name,
  SUM(reached_step_2) AS step_2_users,
  ROUND(SAFE_DIVIDE(SUM(reached_step_2), SUM(reached_step_1)) * 100, 2) AS step_2_conversion_rate_pct,
  ROUND(AVG(CASE WHEN reached_step_2 = 1 THEN (step_2_timestamp - step_1_timestamp) / 1000000 END), 2) AS avg_time_to_step_2_seconds,

  -- Step 3 metrics
  @funnel_steps[SAFE_OFFSET(2)] AS step_3_name,
  SUM(reached_step_3) AS step_3_users,
  ROUND(SAFE_DIVIDE(SUM(reached_step_3), SUM(reached_step_2)) * 100, 2) AS step_3_conversion_rate_pct,
  ROUND(AVG(CASE WHEN reached_step_3 = 1 THEN (step_3_timestamp - step_2_timestamp) / 1000000 END), 2) AS avg_time_to_step_3_seconds,

  -- Step 4 metrics
  @funnel_steps[SAFE_OFFSET(3)] AS step_4_name,
  SUM(reached_step_4) AS step_4_users,
  ROUND(SAFE_DIVIDE(SUM(reached_step_4), SUM(reached_step_3)) * 100, 2) AS step_4_conversion_rate_pct,
  ROUND(AVG(CASE WHEN reached_step_4 = 1 THEN (step_4_timestamp - step_3_timestamp) / 1000000 END), 2) AS avg_time_to_step_4_seconds,

  -- Step 5 metrics
  @funnel_steps[SAFE_OFFSET(4)] AS step_5_name,
  SUM(reached_step_5) AS step_5_users,
  ROUND(SAFE_DIVIDE(SUM(reached_step_5), SUM(reached_step_4)) * 100, 2) AS step_5_conversion_rate_pct,
  ROUND(AVG(CASE WHEN reached_step_5 = 1 THEN (step_5_timestamp - step_4_timestamp) / 1000000 END), 2) AS avg_time_to_step_5_seconds,

  -- Overall funnel metrics
  ROUND(SAFE_DIVIDE(SUM(reached_step_2), SUM(reached_step_1)) * 100, 2) AS overall_conversion_rate_pct,
  ROUND(AVG(CASE
    WHEN reached_step_5 = 1 THEN (step_5_timestamp - step_1_timestamp) / 1000000
    WHEN reached_step_4 = 1 THEN (step_4_timestamp - step_1_timestamp) / 1000000
    WHEN reached_step_3 = 1 THEN (step_3_timestamp - step_1_timestamp) / 1000000
    WHEN reached_step_2 = 1 THEN (step_2_timestamp - step_1_timestamp) / 1000000
  END), 2) AS avg_funnel_completion_time_seconds

FROM
  user_funnel_progression

HAVING
  step_1_users > 0 -- Only return results if we have data
