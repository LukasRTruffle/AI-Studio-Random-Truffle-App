/**
 * Google Ads Reporting API Client
 *
 * Fetch campaign performance data for BigQuery sync and MMM
 */

import type {
  CustomerId,
  GoogleAdsClientConfig,
  GoogleAdsQuery,
  CampaignPerformance,
  AdGroupPerformance,
  GoogleAdsError,
} from './types';

/**
 * Reporting API Client
 */
export class ReportingAPIClient {
  private config: GoogleAdsClientConfig;
  private baseUrl = 'https://googleads.googleapis.com/v22';

  constructor(config: GoogleAdsClientConfig) {
    this.config = config;
  }

  /**
   * Execute a Google Ads Query Language (GAQL) query
   */
  async query<T = any>(queryRequest: GoogleAdsQuery): Promise<T[]> {
    const results: T[] = [];
    let pageToken = queryRequest.pageToken;

    do {
      const response = await this.makeRequest(
        `/customers/${queryRequest.customerId}/googleAds:search`,
        'POST',
        {
          query: queryRequest.query,
          pageSize: queryRequest.pageSize || 10000,
          pageToken,
        }
      );

      if (response.results) {
        results.push(...response.results);
      }

      pageToken = response.nextPageToken;
    } while (pageToken);

    return results;
  }

  /**
   * Get campaign performance for a date range
   */
  async getCampaignPerformance(
    customerId: CustomerId,
    startDate: string, // YYYY-MM-DD
    endDate: string, // YYYY-MM-DD
    currency: string = 'USD'
  ): Promise<CampaignPerformance[]> {
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.all_conversions,
        metrics.all_conversions_value,
        segments.date
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
      ORDER BY segments.date ASC
    `;

    const results = await this.query<any>({
      customerId,
      query,
      pageSize: 10000,
    });

    return results.map((row) => ({
      date: row.segments.date,
      customerId,
      campaignId: row.campaign.id.toString(),
      campaignName: row.campaign.name,
      campaignStatus: row.campaign.status,
      impressions: parseInt(row.metrics.impressions || '0', 10),
      clicks: parseInt(row.metrics.clicks || '0', 10),
      costMicros: parseInt(row.metrics.costMicros || '0', 10),
      conversions: parseFloat(row.metrics.conversions || '0'),
      conversionValue: parseFloat(row.metrics.conversionsValue || '0'),
      allConversions: parseFloat(row.metrics.allConversions || '0'),
      allConversionsValue: parseFloat(row.metrics.allConversionsValue || '0'),
      currency,
    }));
  }

  /**
   * Get ad group performance for a date range
   */
  async getAdGroupPerformance(
    customerId: CustomerId,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<AdGroupPerformance[]> {
    const query = `
      SELECT
        campaign.id,
        ad_group.id,
        ad_group.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        segments.date
      FROM ad_group
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND ad_group.status != 'REMOVED'
      ORDER BY segments.date ASC
    `;

    const results = await this.query<any>({
      customerId,
      query,
      pageSize: 10000,
    });

    return results.map((row) => ({
      date: row.segments.date,
      customerId,
      campaignId: row.campaign.id.toString(),
      adGroupId: row.adGroup.id.toString(),
      adGroupName: row.adGroup.name,
      impressions: parseInt(row.metrics.impressions || '0', 10),
      clicks: parseInt(row.metrics.clicks || '0', 10),
      costMicros: parseInt(row.metrics.costMicros || '0', 10),
      conversions: parseFloat(row.metrics.conversions || '0'),
      conversionValue: parseFloat(row.metrics.conversionsValue || '0'),
      currency,
    }));
  }

  /**
   * Get user list (audience) details
   */
  async getUserLists(customerId: CustomerId): Promise<any[]> {
    const query = `
      SELECT
        user_list.id,
        user_list.name,
        user_list.description,
        user_list.size_for_display,
        user_list.size_for_search,
        user_list.membership_life_span,
        user_list.crm_based_user_list.upload_key_type
      FROM user_list
      WHERE user_list.type = 'CRM_BASED'
    `;

    return await this.query<any>({
      customerId,
      query,
    });
  }

  /**
   * Get conversion actions (for understanding what counts as conversion)
   */
  async getConversionActions(customerId: CustomerId): Promise<any[]> {
    const query = `
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.type,
        conversion_action.status,
        conversion_action.category
      FROM conversion_action
      WHERE conversion_action.status = 'ENABLED'
    `;

    return await this.query<any>({
      customerId,
      query,
    });
  }

  /**
   * Stream results (for very large datasets)
   *
   * Uses searchStream endpoint for better performance with large result sets
   */
  async streamQuery<T = any>(
    queryRequest: GoogleAdsQuery,
    onBatch: (batch: T[]) => Promise<void>
  ): Promise<void> {
    const response = await this.makeRequest(
      `/customers/${queryRequest.customerId}/googleAds:searchStream`,
      'POST',
      {
        query: queryRequest.query,
      }
    );

    // Process streamed results in batches
    if (response.results) {
      await onBatch(response.results);
    }
  }

  /**
   * Get daily aggregated performance (optimized for MMM)
   */
  async getDailyPerformanceForMMM(
    customerId: CustomerId,
    startDate: string,
    endDate: string
  ): Promise<
    Array<{
      date: string;
      totalImpressions: number;
      totalClicks: number;
      totalCostMicros: number;
      totalConversions: number;
      totalConversionValue: number;
    }>
  > {
    const query = `
      SELECT
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      ORDER BY segments.date ASC
    `;

    const results = await this.query<any>({
      customerId,
      query,
    });

    // Aggregate by date (in case multiple rows per date)
    const dailyData = new Map<
      string,
      {
        date: string;
        totalImpressions: number;
        totalClicks: number;
        totalCostMicros: number;
        totalConversions: number;
        totalConversionValue: number;
      }
    >();

    for (const row of results) {
      const date = row.segments.date;
      const existing = dailyData.get(date) || {
        date,
        totalImpressions: 0,
        totalClicks: 0,
        totalCostMicros: 0,
        totalConversions: 0,
        totalConversionValue: 0,
      };

      existing.totalImpressions += parseInt(row.metrics.impressions || '0', 10);
      existing.totalClicks += parseInt(row.metrics.clicks || '0', 10);
      existing.totalCostMicros += parseInt(row.metrics.costMicros || '0', 10);
      existing.totalConversions += parseFloat(row.metrics.conversions || '0');
      existing.totalConversionValue += parseFloat(row.metrics.conversionsValue || '0');

      dailyData.set(date, existing);
    }

    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Make authenticated request to Google Ads API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.accessToken}`,
      'developer-token': this.config.developerToken,
      'Content-Type': 'application/json',
    };

    // Add login-customer-id header for manager accounts
    if (this.config.loginCustomerId) {
      headers['login-customer-id'] = this.config.loginCustomerId;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = (await response.json()) as GoogleAdsError;
      throw new Error(
        `Google Ads API error: ${error.message || response.statusText} (${error.code})`
      );
    }

    return await response.json();
  }
}
