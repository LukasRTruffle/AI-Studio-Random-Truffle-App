'use client';

import { useState, useEffect } from 'react';

/**
 * API base URL
 * In production, this should be from environment variables
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * KPI data structure
 */
export interface KPIData {
  date: string;
  total_users: number;
  total_sessions: number;
  total_events: number;
  total_conversions: number;
  total_revenue: number;
  currency: string;
  avg_session_duration_seconds: number;
  bounce_rate: number;
  sessions_per_user: number;
  events_per_session: number;
  conversion_rate: number;
  revenue_per_user: number;
  avg_order_value: number;
}

/**
 * Aggregated KPI metrics
 */
export interface AggregatedKPIs {
  totalUsers: number;
  totalSessions: number;
  totalRevenue: number;
  conversionRate: number;
}

/**
 * Hook to fetch analytics KPIs
 */
export function useAnalyticsKPIs(startDate: string, endDate: string, currency?: string) {
  const [data, setData] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          startDate,
          endDate,
          ...(currency && { currency }),
        });

        const response = await fetch(`${API_BASE_URL}/analytics/kpis?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch KPIs: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Use mock data on error
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, [startDate, endDate, currency]);

  // Calculate aggregated metrics from daily data
  const aggregated: AggregatedKPIs = data.reduce(
    (acc, day) => ({
      totalUsers: acc.totalUsers + day.total_users,
      totalSessions: acc.totalSessions + day.total_sessions,
      totalRevenue: acc.totalRevenue + day.total_revenue,
      conversionRate: acc.conversionRate + day.conversion_rate,
    }),
    { totalUsers: 0, totalSessions: 0, totalRevenue: 0, conversionRate: 0 }
  );

  // Average conversion rate
  if (data.length > 0) {
    aggregated.conversionRate = aggregated.conversionRate / data.length;
  }

  return { data, aggregated, loading, error };
}

/**
 * Session trends data structure
 */
export interface SessionTrend {
  dimension: string;
  date: string;
  total_sessions: number;
  total_users: number;
  sessions_per_user: number;
  avg_session_duration_seconds: number;
  avg_events_per_session: number;
  bounce_rate_pct: number;
  engagement_rate_pct: number;
  total_conversions: number;
  conversion_rate_pct: number;
  total_revenue: number;
  avg_revenue_per_session: number;
  avg_revenue_per_user: number;
  currency: string;
  sessions_growth_rate_pct: number;
  revenue_growth_rate_pct: number;
  trend_direction: string;
}

/**
 * Hook to fetch session trends
 */
export function useSessionTrends(
  startDate: string,
  endDate: string,
  groupBy: 'date' | 'device' | 'country' | 'traffic_source' = 'date',
  currency?: string
) {
  const [data, setData] = useState<SessionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          startDate,
          endDate,
          groupBy,
          ...(currency && { currency }),
        });

        const response = await fetch(`${API_BASE_URL}/analytics/sessions/trends?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch trends: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, [startDate, endDate, groupBy, currency]);

  return { data, loading, error };
}
