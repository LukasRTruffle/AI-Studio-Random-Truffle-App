/**
 * TikTok Data Sync Job
 *
 * Syncs campaign performance data from TikTok to BigQuery for MMM
 */

import {
  TikTokReportingClient,
  type TikTokCampaignPerformance,
} from '@random-truffle/tiktok-client';
import { BigQueryLoader } from './bigquery-loader';
import type { BigQueryDatasetConfig } from './bigquery-schemas';
import { TABLE_NAMES } from './bigquery-schemas';

/**
 * TikTok sync configuration
 */
export interface TikTokSyncConfig {
  tiktok: {
    accessToken: string;
    advertiserId: string; // Numeric advertiser ID
  };
  bigquery: BigQueryDatasetConfig;
  currency: string; // Default currency (e.g., 'USD')
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
  error?: string;
}

/**
 * TikTok Data Sync Job
 *
 * Fetches campaign performance from TikTok and loads into BigQuery
 */
export class TikTokSync {
  private reportingClient: TikTokReportingClient;
  private bigqueryLoader: BigQueryLoader;
  private config: TikTokSyncConfig;

  constructor(config: TikTokSyncConfig) {
    this.config = config;
    this.reportingClient = new TikTokReportingClient(config.tiktok.accessToken);
    this.bigqueryLoader = new BigQueryLoader(config.bigquery);
  }

  /**
   * Sync yesterday's data (for daily cron job)
   */
  async syncDaily(): Promise<SyncResult> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    return this.sync({ startDate: dateStr, endDate: dateStr });
  }

  /**
   * Backfill historical data
   *
   * @param days - Number of days to backfill (default: 90)
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
   * Sync data for a date range
   */
  async sync(dateRange?: { startDate: string; endDate: string }): Promise<SyncResult> {
    const startTime = Date.now();

    const range = dateRange || {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };

    try {
      // 1. Fetch campaign performance from TikTok
      console.log(
        `Fetching TikTok campaign performance from ${range.startDate} to ${range.endDate}...`
      );

      const performanceData = await this.reportingClient.getCampaignPerformance(
        this.config.tiktok.advertiserId,
        range.startDate,
        range.endDate,
        this.config.currency || 'USD'
      );

      if (performanceData.length === 0) {
        console.log('No data found for the specified date range');
        return {
          success: true,
          rowsSynced: 0,
          dateRange: range,
          duration: Date.now() - startTime,
        };
      }

      // 2. Transform to BigQuery format
      const rows = performanceData.map((row) => this.transformRow(row));

      // 3. Load into BigQuery (upsert to handle duplicates)
      const result = await this.bigqueryLoader.upsertRows(
        'TIKTOK',
        rows,
        ['date', 'advertiser_id', 'campaign_id'] // Dedup keys
      );

      const duration = Date.now() - startTime;

      if (!result.success) {
        return {
          success: false,
          rowsSynced: result.rowsInserted,
          dateRange: range,
          duration,
          error: `Failed to load ${result.errors?.length || 0} rows`,
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
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Transform TikTok campaign performance to BigQuery row format
   */
  private transformRow(row: TikTokCampaignPerformance): Record<string, unknown> {
    return {
      date: row.date,
      advertiser_id: row.advertiserId,
      campaign_id: row.campaignId,
      campaign_name: row.campaignName,
      impressions: row.impressions,
      clicks: row.clicks,
      spend: row.spend,
      conversions: row.conversions,
      conversion_value: row.conversionValue,
      currency: row.currency,
    };
  }

  /**
   * Validate synced data
   */
  async validate(dateRange: { startDate: string; endDate: string }): Promise<{
    rowCount: number;
    sampleRows: unknown[];
  }> {
    const rowCount = await this.bigqueryLoader.getRowCount(
      'TIKTOK',
      dateRange.startDate,
      dateRange.endDate
    );

    const sampleRows = await this.bigqueryLoader.query(`
      SELECT *
      FROM \`${this.config.bigquery.projectId}.${this.config.bigquery.datasetId}.${TABLE_NAMES.TIKTOK}\`
      WHERE date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      LIMIT 10
    `);

    return { rowCount, sampleRows };
  }
}
