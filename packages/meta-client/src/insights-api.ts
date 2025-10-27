/**
 * Meta Insights API
 *
 * Fetch campaign performance data for MMM
 * Documentation: https://developers.facebook.com/docs/marketing-api/insights
 */

import type {
  MetaAdAccountId,
  InsightsRequest,
  InsightsResponse,
  InsightsRow,
  MetaCampaignPerformance,
  MetaApiError,
} from './types';

const META_API_VERSION = 'v22.0';
const META_GRAPH_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Meta Insights API Client
 */
export class MetaInsightsClient {
  constructor(private readonly accessToken: string) {}

  /**
   * Get insights for an ad account
   *
   * @param request - Insights request
   * @returns Insights data
   */
  async getInsights(request: InsightsRequest): Promise<InsightsResponse> {
    const params = new URLSearchParams();

    // Time range
    if (request.datePreset) {
      params.append('date_preset', request.datePreset);
    } else if (request.timeRange) {
      params.append('time_range', JSON.stringify(request.timeRange));
    }

    // Level
    params.append('level', request.level);

    // Fields
    params.append('fields', request.fields.join(','));

    // Breakdowns
    if (request.breakdowns && request.breakdowns.length > 0) {
      params.append('breakdowns', request.breakdowns.join(','));
    }

    // Time increment
    if (request.timeIncrement) {
      params.append('time_increment', String(request.timeIncrement));
    }

    // Filtering
    if (request.filtering && request.filtering.length > 0) {
      params.append('filtering', JSON.stringify(request.filtering));
    }

    const response = await fetch(
      `${META_GRAPH_API_BASE}/${request.adAccountId}/insights?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = (await response.json()) as MetaApiError;
      throw new Error(`Failed to fetch insights: ${error.error?.message || 'Unknown error'}`);
    }

    const data = (await response.json()) as InsightsResponse;
    return data;
  }

  /**
   * Get paginated insights (follow next page cursor)
   *
   * @param nextPageUrl - Next page URL from paging.next
   * @returns Insights data
   */
  async getNextPage(nextPageUrl: string): Promise<InsightsResponse> {
    const response = await fetch(nextPageUrl, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as MetaApiError;
      throw new Error(`Failed to fetch insights page: ${error.error?.message || 'Unknown error'}`);
    }

    const data = (await response.json()) as InsightsResponse;
    return data;
  }

  /**
   * Get all insights (auto-paginate)
   *
   * @param request - Insights request
   * @returns All insights rows
   */
  async getAllInsights(request: InsightsRequest): Promise<InsightsRow[]> {
    const allRows: InsightsRow[] = [];

    let response = await this.getInsights(request);
    allRows.push(...response.data);

    // Follow pagination
    while (response.paging?.next) {
      response = await this.getNextPage(response.paging.next);
      allRows.push(...response.data);

      // Rate limiting: wait 100ms between pages
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return allRows;
  }

  /**
   * Get campaign performance for MMM (daily aggregated data)
   *
   * @param adAccountId - Ad Account ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param currency - Currency code (e.g., 'USD')
   * @returns Daily campaign performance data
   */
  async getCampaignPerformance(
    adAccountId: MetaAdAccountId,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<MetaCampaignPerformance[]> {
    const insights = await this.getAllInsights({
      adAccountId,
      timeRange: {
        since: startDate,
        until: endDate,
      },
      level: 'campaign',
      fields: [
        'campaign_id',
        'campaign_name',
        'impressions',
        'clicks',
        'spend',
        'actions',
        'action_values',
      ],
      timeIncrement: 1, // Daily
    });

    // Transform to BigQuery format
    const performance: MetaCampaignPerformance[] = [];

    for (const row of insights) {
      // Extract conversions (purchase action type)
      const purchaseAction = row.actions?.find((a) => a.action_type === 'purchase');
      const purchaseValue = row.action_values?.find((a) => a.action_type === 'purchase');

      performance.push({
        date: row.date_start,
        accountId: adAccountId.replace('act_', ''), // Remove "act_" prefix for consistency
        campaignId: row.campaign_id || '',
        campaignName: row.campaign_name || '',
        impressions: parseInt(row.impressions || '0', 10),
        clicks: parseInt(row.clicks || '0', 10),
        spend: parseFloat(row.spend || '0'),
        conversions: parseFloat(purchaseAction?.value || '0'),
        conversionValue: parseFloat(purchaseValue?.value || '0'),
        currency,
      });
    }

    return performance;
  }

  /**
   * Get daily performance for MMM (aggregated across all campaigns)
   *
   * @param adAccountId - Ad Account ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param currency - Currency code (e.g., 'USD')
   * @returns Daily aggregated performance data
   */
  async getDailyPerformanceForMMM(
    adAccountId: MetaAdAccountId,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<
    Array<{
      date: string;
      totalImpressions: number;
      totalClicks: number;
      totalSpend: number;
      totalConversions: number;
      totalConversionValue: number;
    }>
  > {
    const campaignData = await this.getCampaignPerformance(
      adAccountId,
      startDate,
      endDate,
      currency
    );

    // Aggregate by date
    const dailyData = new Map<
      string,
      {
        date: string;
        totalImpressions: number;
        totalClicks: number;
        totalSpend: number;
        totalConversions: number;
        totalConversionValue: number;
      }
    >();

    for (const row of campaignData) {
      const existing = dailyData.get(row.date);

      if (existing) {
        existing.totalImpressions += row.impressions;
        existing.totalClicks += row.clicks;
        existing.totalSpend += row.spend;
        existing.totalConversions += row.conversions;
        existing.totalConversionValue += row.conversionValue;
      } else {
        dailyData.set(row.date, {
          date: row.date,
          totalImpressions: row.impressions,
          totalClicks: row.clicks,
          totalSpend: row.spend,
          totalConversions: row.conversions,
          totalConversionValue: row.conversionValue,
        });
      }
    }

    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
