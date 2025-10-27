/**
 * Meta Data Sync Job
 *
 * Syncs campaign performance data from Meta to BigQuery for MMM
 */

import { MetaInsightsClient, type MetaCampaignPerformance } from '@random-truffle/meta-client';
import { BigQueryLoader } from './bigquery-loader';
import type { BigQueryDatasetConfig } from './bigquery-schemas';
import { TABLE_NAMES } from './bigquery-schemas';

/**
 * Meta sync configuration
 */
export interface MetaSyncConfig {
  meta: {
    accessToken: string;
    adAccountId: string; // act_123456789
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
 * Meta Data Sync Job
 *
 * Fetches campaign performance from Meta and loads into BigQuery
 */
export class MetaSync {
  private insightsClient: MetaInsightsClient;
  private bigqueryLoader: BigQueryLoader;
  private config: MetaSyncConfig;

  constructor(config: MetaSyncConfig) {
    this.config = config;
    this.insightsClient = new MetaInsightsClient(config.meta.accessToken);
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
      // 1. Fetch campaign performance from Meta
      console.log(
        `Fetching Meta campaign performance from ${range.startDate} to ${range.endDate}...`
      );

      const performanceData = await this.insightsClient.getCampaignPerformance(
        this.config.meta.adAccountId,
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
        'META',
        rows,
        ['date', 'account_id', 'campaign_id'] // Dedup keys
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
   * Transform Meta campaign performance to BigQuery row format
   */
  private transformRow(row: MetaCampaignPerformance): Record<string, unknown> {
    return {
      date: row.date,
      account_id: row.accountId,
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
      'META',
      dateRange.startDate,
      dateRange.endDate
    );

    const sampleRows = await this.bigqueryLoader.query(`
      SELECT *
      FROM \`${this.config.bigquery.projectId}.${this.config.bigquery.datasetId}.${TABLE_NAMES.META}\`
      WHERE date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      LIMIT 10
    `);

    return { rowCount, sampleRows };
  }
}
