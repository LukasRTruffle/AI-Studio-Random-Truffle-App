'use client';

import { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import KpiCard from '../../../components/ui/KpiCard';
import { useAnalyticsKPIs } from '../../../hooks/useAnalytics';

/**
 * Get date range for last N days
 */
function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: startDate.toISOString().split('T')[0] || '',
    endDate: endDate.toISOString().split('T')[0] || '',
  };
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const { startDate, endDate } = getDateRange(days);

  const { aggregated, loading, error } = useAnalyticsKPIs(startDate, endDate);

  // Format KPI data for cards
  const kpiData = [
    {
      title: 'Total Users',
      value: loading ? '...' : aggregated.totalUsers.toLocaleString(),
      change: 0.0, // TODO: Calculate from previous period
      changeType: 'increase' as const,
    },
    {
      title: 'Total Sessions',
      value: loading ? '...' : aggregated.totalSessions.toLocaleString(),
      change: 0.0,
      changeType: 'increase' as const,
    },
    {
      title: 'Total Revenue',
      value: loading
        ? '...'
        : `$${aggregated.totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      change: 0.0,
      changeType: 'increase' as const,
    },
    {
      title: 'Conversion Rate',
      value: loading ? '...' : `${(aggregated.conversionRate * 100).toFixed(2)}%`,
      change: 0.0,
      changeType: 'increase' as const,
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Overview of audience and activation performance."
      />

      {/* Date Range Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setDateRange('7d')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            dateRange === '7d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 7 days
        </button>
        <button
          onClick={() => setDateRange('30d')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            dateRange === '30d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 30 days
        </button>
        <button
          onClick={() => setDateRange('90d')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            dateRange === '90d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 90 days
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Error loading analytics:</strong> {error}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Using placeholder data. Please check backend API connection.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">Loading analytics data...</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* Data Source Info */}
      {!loading && !error && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            ✓ Data loaded from BigQuery ({startDate} to {endDate})
          </p>
        </div>
      )}

      {/* TODO: Restore charts with Recharts implementation (ADR-003) */}
      {/* Charts will show session trends and conversion funnels */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Charts Coming Soon</h3>
        <p className="text-sm text-gray-600">
          Session trends and conversion funnel charts will be implemented using Recharts (per
          ADR-003).
        </p>
      </div>
    </div>
  );
}
