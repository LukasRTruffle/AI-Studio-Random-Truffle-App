/**
 * Session stitching utilities for Random Truffle
 * Per ADR-009: Use GA4 User-ID + user_pseudo_id for cross-session tracking
 */

import type { BigQueryClient } from './client';
import type { StitchedSession, GA4Session } from './types';
import { BIGQUERY_TABLES, SESSION_STITCHING_CONFIG } from './config';

/**
 * Stitch sessions for a user based on User-ID and user_pseudo_id
 * @param client BigQuery client
 * @param userId User ID (logged-in) or user_pseudo_id (anonymous)
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Stitched session data
 */
export async function stitchUserSessions(
  client: BigQueryClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<StitchedSession> {
  const query = `
    WITH user_sessions AS (
      SELECT
        COALESCE(user_id, user_pseudo_id) as unified_user_id,
        session_id,
        user_id,
        user_pseudo_id,
        session_start_timestamp,
        session_end_timestamp
      FROM \`\${projectId}.\${datasetId}.${BIGQUERY_TABLES.SESSIONS}\`
      WHERE (user_id = @userId OR user_pseudo_id = @userId)
        AND DATE(TIMESTAMP_SECONDS(session_start_timestamp)) >= @startDate
        AND DATE(TIMESTAMP_SECONDS(session_start_timestamp)) <= @endDate
      ORDER BY session_start_timestamp
      LIMIT ${SESSION_STITCHING_CONFIG.MAX_SESSIONS}
    )
    SELECT
      unified_user_id,
      ARRAY_AGG(session_id ORDER BY session_start_timestamp) as session_ids,
      ANY_VALUE(user_id) as user_id,
      ARRAY_AGG(DISTINCT user_pseudo_id) as user_pseudo_ids,
      MIN(session_start_timestamp) as first_session_timestamp,
      MAX(session_end_timestamp) as last_session_timestamp,
      COUNT(DISTINCT session_id) as total_sessions
    FROM user_sessions
    GROUP BY unified_user_id
  `;

  const result = await client.query<{
    unified_user_id: string;
    session_ids: string[];
    user_id: string | null;
    user_pseudo_ids: string[];
    first_session_timestamp: number;
    last_session_timestamp: number;
    total_sessions: number;
  }>({
    query,
    params: {
      userId,
      startDate,
      endDate,
    },
  });

  if (result.rows.length === 0) {
    throw new Error(`No sessions found for user: ${userId}`);
  }

  return result.rows[0];
}

/**
 * Build unified user ID query
 * Uses COALESCE to prefer user_id over user_pseudo_id
 * @returns SQL expression for unified user ID
 */
export function buildUnifiedUserIdExpression(): string {
  return 'COALESCE(user_id, user_pseudo_id) AS unified_user_id';
}

/**
 * Get cross-session user journey
 * @param client BigQuery client
 * @param unifiedUserId Unified user ID
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Array of sessions in chronological order
 */
export async function getUserJourney(
  client: BigQueryClient,
  unifiedUserId: string,
  startDate: string,
  endDate: string
): Promise<GA4Session[]> {
  const query = `
    SELECT
      session_id,
      user_id,
      user_pseudo_id,
      COALESCE(user_id, user_pseudo_id) as unified_user_id,
      session_start_timestamp,
      session_end_timestamp,
      traffic_source,
      medium,
      campaign,
      device_category,
      country,
      region,
      city
    FROM \`\${projectId}.\${datasetId}.${BIGQUERY_TABLES.SESSIONS}\`
    WHERE COALESCE(user_id, user_pseudo_id) = @unifiedUserId
      AND DATE(TIMESTAMP_SECONDS(session_start_timestamp)) >= @startDate
      AND DATE(TIMESTAMP_SECONDS(session_start_timestamp)) <= @endDate
    ORDER BY session_start_timestamp
    LIMIT ${SESSION_STITCHING_CONFIG.MAX_SESSIONS}
  `;

  const result = await client.query<GA4Session>({
    query,
    params: {
      unifiedUserId,
      startDate,
      endDate,
    },
  });

  return result.rows;
}

/**
 * Find users with cross-device sessions
 * Identifies users who have logged in from multiple devices
 * @param client BigQuery client
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @param minDevices Minimum number of different devices (default: 2)
 * @returns Array of user IDs with cross-device activity
 */
export async function findCrossDeviceUsers(
  client: BigQueryClient,
  startDate: string,
  endDate: string,
  minDevices: number = 2
): Promise<Array<{ unified_user_id: string; device_count: number }>> {
  const query = `
    SELECT
      COALESCE(user_id, user_pseudo_id) as unified_user_id,
      COUNT(DISTINCT device_category) as device_count
    FROM \`\${projectId}.\${datasetId}.${BIGQUERY_TABLES.SESSIONS}\`
    WHERE DATE(TIMESTAMP_SECONDS(session_start_timestamp)) >= @startDate
      AND DATE(TIMESTAMP_SECONDS(session_start_timestamp)) <= @endDate
      AND user_id IS NOT NULL
    GROUP BY unified_user_id
    HAVING device_count >= @minDevices
    ORDER BY device_count DESC
    LIMIT 1000
  `;

  const result = await client.query<{
    unified_user_id: string;
    device_count: number;
  }>({
    query,
    params: {
      startDate,
      endDate,
      minDevices,
    },
  });

  return result.rows;
}

/**
 * Calculate session continuity score
 * Measures how well sessions are stitched together for a user
 * @param sessions Array of sessions for a user
 * @returns Continuity score (0-1, higher is better)
 */
export function calculateSessionContinuityScore(sessions: GA4Session[]): number {
  if (sessions.length <= 1) return 1.0;

  // Calculate time gaps between sessions
  const gaps: number[] = [];
  for (let i = 1; i < sessions.length; i++) {
    const gap = sessions[i].session_start_timestamp - sessions[i - 1].session_end_timestamp;
    gaps.push(gap);
  }

  // Average gap in hours
  const avgGapHours = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length / 3600;

  // Score based on time window (24 hours is ideal)
  const timeWindowHours = SESSION_STITCHING_CONFIG.TIME_WINDOW_HOURS;
  const score = Math.max(0, 1 - avgGapHours / timeWindowHours);

  return score;
}
