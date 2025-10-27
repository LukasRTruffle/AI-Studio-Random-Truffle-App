/**
 * TikTok Reporting API Client
 *
 * Extracts campaign performance data for MMM (Marketing Mix Modeling)
 * Documentation: https://business-api.tiktok.com/portal/docs?id=1738864915188737
 */

import type { TikTokAdvertiserId, TikTokCampaignPerformance, TikTokApiResponse } from './types';

const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3';

/**
 * Reporting request parameters
 */
export interface TikTokReportingRequest {
  advertiserId: TikTokAdvertiserId;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dimensions?: string[]; // e.g., ['campaign_id', 'stat_time_day']
  metrics?: string[]; // e.g., ['spend', 'impressions', 'clicks']
  dataLevel?: 'AUCTION_CAMPAIGN' | 'AUCTION_ADGROUP' | 'AUCTION_AD';
  currency?: string; // e.g., 'USD', 'MXN', 'COP'
}

/**
 * TikTok API raw response format
 */
interface TikTokReportRow {
  dimensions: {
    campaign_id?: string;
    campaign_name?: string;
    stat_time_day?: string;
  };
  metrics: {
    spend?: number;
    impressions?: number;
    clicks?: number;
    conversion?: number;
    total_complete_payment?: number;
    total_complete_payment_rate?: number;
  };
}

export class TikTokReportingClient {
  constructor(private readonly accessToken: string) {}

  /**
   * Get campaign performance data
   *
   * @param advertiserId - TikTok advertiser ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param currency - Currency code (default: 'USD')
   * @returns Array of campaign performance records
   */
  async getCampaignPerformance(
    advertiserId: TikTokAdvertiserId,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<TikTokCampaignPerformance[]> {
    const request: TikTokReportingRequest = {
      advertiserId,
      startDate,
      endDate,
      dimensions: ['campaign_id', 'stat_time_day'],
      metrics: [
        'spend',
        'impressions',
        'clicks',
        'conversion',
        'total_complete_payment',
        'total_complete_payment_rate',
      ],
      dataLevel: 'AUCTION_CAMPAIGN',
      currency,
    };

    const rows = await this.fetchReport(request);
    return this.transformRows(rows, advertiserId, currency);
  }

  /**
   * Fetch report data from TikTok API
   */
  private async fetchReport(request: TikTokReportingRequest): Promise<TikTokReportRow[]> {
    const response = await fetch(`${TIKTOK_API_URL}/report/integrated/get/`, {
      method: 'POST',
      headers: {
        'Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        advertiser_id: request.advertiserId,
        report_type: 'BASIC',
        data_level: request.dataLevel || 'AUCTION_CAMPAIGN',
        dimensions: request.dimensions || ['campaign_id', 'stat_time_day'],
        metrics: request.metrics || ['spend', 'impressions', 'clicks', 'conversion'],
        start_date: request.startDate,
        end_date: request.endDate,
        page: 1,
        page_size: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`TikTok Reporting API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TikTokApiResponse<{
      list: TikTokReportRow[];
      page_info: {
        total_number: number;
        page: number;
        page_size: number;
      };
    }>;

    if (data.code !== 0) {
      throw new Error(`TikTok Reporting API error: ${data.message}`);
    }

    // Handle pagination if needed
    let allRows = data.data.list;
    const totalPages = Math.ceil(data.data.page_info.total_number / data.data.page_info.page_size);

    if (totalPages > 1) {
      const promises = [];
      for (let page = 2; page <= totalPages; page++) {
        promises.push(this.fetchReportPage(request, page));
      }
      const additionalPages = await Promise.all(promises);
      allRows = allRows.concat(...additionalPages);
    }

    return allRows;
  }

  /**
   * Fetch a specific page of report data
   */
  private async fetchReportPage(
    request: TikTokReportingRequest,
    page: number
  ): Promise<TikTokReportRow[]> {
    const response = await fetch(`${TIKTOK_API_URL}/report/integrated/get/`, {
      method: 'POST',
      headers: {
        'Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        advertiser_id: request.advertiserId,
        report_type: 'BASIC',
        data_level: request.dataLevel || 'AUCTION_CAMPAIGN',
        dimensions: request.dimensions || ['campaign_id', 'stat_time_day'],
        metrics: request.metrics || ['spend', 'impressions', 'clicks', 'conversion'],
        start_date: request.startDate,
        end_date: request.endDate,
        page,
        page_size: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`TikTok Reporting API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TikTokApiResponse<{
      list: TikTokReportRow[];
    }>;

    if (data.code !== 0) {
      throw new Error(`TikTok Reporting API error: ${data.message}`);
    }

    return data.data.list;
  }

  /**
   * Transform TikTok rows to standardized format
   */
  private transformRows(
    rows: TikTokReportRow[],
    advertiserId: string,
    currency: string
  ): TikTokCampaignPerformance[] {
    return rows.map((row) => ({
      date: row.dimensions.stat_time_day || '',
      advertiserId,
      campaignId: row.dimensions.campaign_id || '',
      campaignName: row.dimensions.campaign_name || '',
      impressions: row.metrics.impressions || 0,
      clicks: row.metrics.clicks || 0,
      spend: row.metrics.spend || 0,
      conversions: row.metrics.conversion || 0,
      conversionValue: row.metrics.total_complete_payment || 0,
      currency,
    }));
  }

  /**
   * Get ad group performance data
   */
  async getAdGroupPerformance(
    advertiserId: TikTokAdvertiserId,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<TikTokReportRow[]> {
    const request: TikTokReportingRequest = {
      advertiserId,
      startDate,
      endDate,
      dimensions: ['adgroup_id', 'adgroup_name', 'stat_time_day'],
      metrics: ['spend', 'impressions', 'clicks', 'conversion'],
      dataLevel: 'AUCTION_ADGROUP',
      currency,
    };

    return this.fetchReport(request);
  }

  /**
   * Get ad creative performance data
   */
  async getAdPerformance(
    advertiserId: TikTokAdvertiserId,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<TikTokReportRow[]> {
    const request: TikTokReportingRequest = {
      advertiserId,
      startDate,
      endDate,
      dimensions: ['ad_id', 'ad_name', 'stat_time_day'],
      metrics: ['spend', 'impressions', 'clicks', 'conversion'],
      dataLevel: 'AUCTION_AD',
      currency,
    };

    return this.fetchReport(request);
  }

  /**
   * Get daily spend summary
   */
  async getDailySpend(
    advertiserId: TikTokAdvertiserId,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<Array<{ date: string; spend: number; currency: string }>> {
    const request: TikTokReportingRequest = {
      advertiserId,
      startDate,
      endDate,
      dimensions: ['stat_time_day'],
      metrics: ['spend'],
      dataLevel: 'AUCTION_CAMPAIGN',
      currency,
    };

    const rows = await this.fetchReport(request);

    return rows.map((row) => ({
      date: row.dimensions.stat_time_day || '',
      spend: row.metrics.spend || 0,
      currency,
    }));
  }
}
