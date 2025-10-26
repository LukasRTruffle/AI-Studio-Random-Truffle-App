/**
 * BigQuery query utilities and builders for Random Truffle
 */

import type { CurrencyCode } from './types';
import { BIGQUERY_TABLES, BIGQUERY_VIEWS } from './config';

/**
 * Query builder for audience size estimation
 * @param audienceConditions WHERE clause conditions for audience
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns SQL query string
 */
export function buildAudienceSizeQuery(
  audienceConditions: string,
  startDate: string,
  endDate: string
): string {
  return `
    SELECT
      COUNT(DISTINCT unified_user_id) as audience_size,
      COUNT(DISTINCT CASE WHEN last_seen_timestamp >= UNIX_SECONDS(CURRENT_TIMESTAMP()) - 7*24*60*60 THEN unified_user_id END) as active_users_7d,
      COUNT(DISTINCT CASE WHEN last_seen_timestamp >= UNIX_SECONDS(CURRENT_TIMESTAMP()) - 30*24*60*60 THEN unified_user_id END) as active_users_30d
    FROM \`\${projectId}.\${datasetId}.${BIGQUERY_TABLES.USER_ATTRIBUTES}\`
    WHERE first_seen_timestamp >= UNIX_SECONDS(TIMESTAMP('${startDate}'))
      AND first_seen_timestamp <= UNIX_SECONDS(TIMESTAMP('${endDate}'))
      AND (${audienceConditions})
  `;
}

/**
 * Query builder for session trends
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @param groupBy Group by clause (e.g., 'DATE', 'DEVICE_CATEGORY')
 * @returns SQL query string
 */
export function buildSessionTrendsQuery(
  startDate: string,
  endDate: string,
  groupBy: 'DATE' | 'DEVICE_CATEGORY' | 'COUNTRY' = 'DATE'
): string {
  const groupByClause =
    groupBy === 'DATE'
      ? 'DATE(TIMESTAMP_SECONDS(session_start_timestamp))'
      : groupBy === 'DEVICE_CATEGORY'
        ? 'device_category'
        : 'country';

  const selectClause =
    groupBy === 'DATE'
      ? 'FORMAT_TIMESTAMP("%Y-%m-%d", TIMESTAMP_SECONDS(session_start_timestamp)) as date'
      : groupBy === 'DEVICE_CATEGORY'
        ? 'device_category as dimension'
        : 'country as dimension';

  return `
    SELECT
      ${selectClause},
      COUNT(DISTINCT session_id) as total_sessions,
      COUNT(DISTINCT unified_user_id) as total_users,
      AVG(session_end_timestamp - session_start_timestamp) as avg_session_duration_seconds
    FROM \`\${projectId}.\${datasetId}.${BIGQUERY_TABLES.SESSIONS}\`
    WHERE DATE(TIMESTAMP_SECONDS(session_start_timestamp)) >= '${startDate}'
      AND DATE(TIMESTAMP_SECONDS(session_start_timestamp)) <= '${endDate}'
    GROUP BY ${groupByClause}
    ORDER BY ${groupByClause}
  `;
}

/**
 * Query builder for daily KPIs
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @param currency Currency code filter (optional)
 * @returns SQL query string
 */
export function buildDailyKPIsQuery(
  startDate: string,
  endDate: string,
  currency?: CurrencyCode
): string {
  const currencyFilter = currency ? `AND currency = '${currency}'` : '';

  return `
    SELECT
      date,
      total_users,
      total_sessions,
      total_events,
      total_conversions,
      total_revenue,
      currency,
      avg_session_duration_seconds,
      bounce_rate
    FROM \`\${projectId}.\${datasetId}.${BIGQUERY_VIEWS.DAILY_KPIS}\`
    WHERE date >= '${startDate}'
      AND date <= '${endDate}'
      ${currencyFilter}
    ORDER BY date
  `;
}

/**
 * Query builder for audience metrics
 * @param audienceId Audience ID
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns SQL query string
 */
export function buildAudienceMetricsQuery(
  audienceId: string,
  startDate: string,
  endDate: string
): string {
  return `
    SELECT
      audience_id,
      date,
      total_users,
      active_users_7d,
      active_users_30d,
      total_conversions,
      total_revenue,
      currency,
      avg_revenue_per_user
    FROM \`\${projectId}.\${datasetId}.${BIGQUERY_VIEWS.AUDIENCE_METRICS}\`
    WHERE audience_id = '${audienceId}'
      AND date >= '${startDate}'
      AND date <= '${endDate}'
    ORDER BY date
  `;
}

/**
 * Query builder for user attributes
 * @param unifiedUserId Unified user ID
 * @returns SQL query string
 */
export function buildUserAttributesQuery(unifiedUserId: string): string {
  return `
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
      traffic_source_first,
      medium_first,
      campaign_first
    FROM \`\${projectId}.\${datasetId}.${BIGQUERY_TABLES.USER_ATTRIBUTES}\`
    WHERE unified_user_id = '${unifiedUserId}'
  `;
}

/**
 * Query builder for conversion funnel
 * @param funnelSteps Array of event names representing funnel steps
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns SQL query string
 */
export function buildConversionFunnelQuery(
  funnelSteps: string[],
  startDate: string,
  endDate: string
): string {
  const stepQueries = funnelSteps
    .map(
      (step, index) => `
      COUNT(DISTINCT CASE WHEN event_name = '${step}' THEN unified_user_id END) as step_${index + 1}_users
    `
    )
    .join(',\n');

  return `
    SELECT
      ${stepQueries}
    FROM \`\${projectId}.\${datasetId}.${BIGQUERY_TABLES.EVENTS}\`
    WHERE DATE(TIMESTAMP_SECONDS(event_timestamp / 1000000)) >= '${startDate}'
      AND DATE(TIMESTAMP_SECONDS(event_timestamp / 1000000)) <= '${endDate}'
  `;
}

/**
 * Replace template variables in query
 * @param query SQL query with template variables
 * @param projectId GCP project ID
 * @param datasetId BigQuery dataset ID
 * @returns Query with replaced variables
 */
export function replaceQueryVariables(query: string, projectId: string, datasetId: string): string {
  return query.replace(/\$\{projectId\}/g, projectId).replace(/\$\{datasetId\}/g, datasetId);
}
