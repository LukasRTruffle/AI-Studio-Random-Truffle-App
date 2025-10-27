/**
 * Google Ads Data Sync Job
 *
 * Fetches campaign performance data from Google Ads API
 * and loads into BigQuery for MMM training
 */

import { ReportingAPIClient } from '@random-truffle/google-ads-client';
import type { GoogleAdsClientConfig, CampaignPerformance } from '@random-truffle/google-ads-client';
import { BigQueryLoader } from './bigquery-loader';
import type { BigQueryDatasetConfig } from './bigquery-schemas';
import { TABLE_NAMES } from './bigquery-schemas';

/**
 * Sync configuration
 */
export interface GoogleAdsSyncConfig {
  googleAds: GoogleAdsClientConfig;
  bigquery: BigQueryDatasetConfig;
  dateRange?: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  };
  currency?: string; // Default: USD
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  rowsSynced: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  duration: number; // milliseconds
  errors?: string[];
}

/**
 * Google Ads Sync Job
 *
 * Daily sync of campaign performance data to BigQuery
 */
export class GoogleAdsSync {
  private reportingClient: ReportingAPIClient;
  private bigqueryLoader: BigQueryLoader;
  private config: GoogleAdsSyncConfig;

  constructor(config: GoogleAdsSyncConfig) {
    this.config = config;
    this.reportingClient = new ReportingAPIClient(config.googleAds);
    this.bigqueryLoader = new BigQueryLoader(config.bigquery);
  }

  /**
   * Run daily sync (default: yesterday's data)
   */
  async syncDaily(): Promise<SyncResult> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

    return this.sync({
      startDate: dateStr,
      endDate: dateStr,
    });
  }

  /**
   * Backfill historical data
   *
   * Google Ads allows querying unlimited historical data
   * Recommended: Start with last 90 days for initial MMM dataset
   */
  async backfill(days: number = 90): Promise<SyncResult> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    return this.sync({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }

  /**
   * Sync data for a specific date range
   */
  async sync(dateRange?: { startDate: string; endDate: string }): Promise<SyncResult> {
    const startTime = Date.now();
    const range = dateRange ||
      this.config.dateRange || {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      };

    console.log(`Starting Google Ads sync for ${range.startDate} to ${range.endDate}...`);

    try {
      // Fetch campaign performance from Google Ads
      const performanceData = await this.reportingClient.getCampaignPerformance(
        this.config.googleAds.customerId,
        range.startDate,
        range.endDate,
        this.config.currency || 'USD'
      );

      console.log(`Fetched ${performanceData.length} rows from Google Ads API`);

      if (performanceData.length === 0) {
        return {
          success: true,
          rowsSynced: 0,
          dateRange: range,
          duration: Date.now() - startTime,
        };
      }

      // Transform to BigQuery format
      const rows = performanceData.map((row) => this.transformRow(row));

      // Load into BigQuery (upsert to handle duplicates)
      const result = await this.bigqueryLoader.upsertRows(
        'GOOGLE_ADS',
        rows,
        ['date', 'customer_id', 'campaign_id'] // Dedup keys
      );

      const duration = Date.now() - startTime;

      if (!result.success) {
        return {
          success: false,
          rowsSynced: result.rowsInserted,
          dateRange: range,
          duration,
          errors: result.errors?.map((e) => JSON.stringify(e)),
        };
      }

      console.log(`Successfully synced ${result.rowsInserted} rows in ${duration}ms`);

      return {
        success: true,
        rowsSynced: result.rowsInserted,
        dateRange: range,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        rowsSynced: 0,
        dateRange: range,
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Validate sync (check row counts)
   */
  async validate(dateRange: { startDate: string; endDate: string }): Promise<{
    rowCount: number;
    sampleRows: unknown[];
  }> {
    const rowCount = await this.bigqueryLoader.getRowCount(
      'GOOGLE_ADS',
      dateRange.startDate,
      dateRange.endDate
    );

    const sampleRows = await this.bigqueryLoader.query(`
      SELECT *
      FROM \`${this.config.bigquery.projectId}.${this.config.bigquery.datasetId}.${TABLE_NAMES.GOOGLE_ADS}\`
      WHERE date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      LIMIT 10
    `);

    return { rowCount, sampleRows };
  }

  /**
   * Transform Google Ads row to BigQuery format
   */
  private transformRow(row: CampaignPerformance): Record<string, unknown> {
    return {
      date: row.date,
      customer_id: row.customerId,
      campaign_id: row.campaignId,
      campaign_name: row.campaignName,
      campaign_status: row.campaignStatus,
      impressions: row.impressions,
      clicks: row.clicks,
      cost_micros: row.costMicros,
      conversions: row.conversions,
      conversion_value: row.conversionValue,
      all_conversions: row.allConversions,
      all_conversions_value: row.allConversionsValue,
      currency: row.currency,
    };
  }

  /**
   * Get daily aggregated data (for MMM)
   *
   * This is optimized for feeding directly into MMM models
   */
  async getDailyAggregatedData(dateRange: { startDate: string; endDate: string }): Promise<
    Array<{
      date: string;
      total_spend: number;
      total_impressions: number;
      total_clicks: number;
      total_conversions: number;
      total_conversion_value: number;
    }>
  > {
    const sql = `
      SELECT
        date,
        SUM(cost_micros / 1000000) AS total_spend,
        SUM(impressions) AS total_impressions,
        SUM(clicks) AS total_clicks,
        SUM(conversions) AS total_conversions,
        SUM(conversion_value) AS total_conversion_value
      FROM \`${this.config.bigquery.projectId}.${this.config.bigquery.datasetId}.${TABLE_NAMES.GOOGLE_ADS}\`
      WHERE date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      GROUP BY date
      ORDER BY date ASC
    `;

    return await this.bigqueryLoader.query(sql);
  }
}
