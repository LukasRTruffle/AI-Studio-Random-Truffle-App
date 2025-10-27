/**
 * BigQuery Loader
 *
 * Batch insert ad platform data into BigQuery
 */

import { BigQuery } from '@google-cloud/bigquery';
import { TABLE_NAMES, type BigQueryDatasetConfig } from './bigquery-schemas';

/**
 * Row data for insertion
 */
export interface BigQueryRow {
  [key: string]: unknown;
}

/**
 * Insert result
 */
export interface InsertResult {
  success: boolean;
  rowsInserted: number;
  errors?: Array<{
    row: number;
    errors: unknown[];
  }>;
}

/**
 * BigQuery Loader
 *
 * Handles batch insertions with deduplication and error handling
 */
export class BigQueryLoader {
  private bigquery: BigQuery;
  private config: BigQueryDatasetConfig;

  constructor(config: BigQueryDatasetConfig) {
    this.config = config;
    this.bigquery = new BigQuery({
      projectId: config.projectId,
    });
  }

  /**
   * Insert rows into a table
   *
   * Uses streaming insert for real-time data
   */
  async insertRows(
    tableName: keyof typeof TABLE_NAMES,
    rows: BigQueryRow[]
  ): Promise<InsertResult> {
    if (rows.length === 0) {
      return { success: true, rowsInserted: 0 };
    }

    const dataset = this.bigquery.dataset(this.config.datasetId);
    const table = dataset.table(TABLE_NAMES[tableName]);

    try {
      // Add ingestion timestamp to all rows
      const rowsWithTimestamp = rows.map((row) => ({
        ...row,
        ingested_at: new Date().toISOString(),
      }));

      // Insert rows
      await table.insert(rowsWithTimestamp, {
        skipInvalidRows: false, // Fail on any invalid row
        ignoreUnknownValues: false, // Fail on unknown fields
      });

      return {
        success: true,
        rowsInserted: rows.length,
      };
    } catch (error) {
      // Check if it's a partial failure
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'PartialFailureError'
      ) {
        const partialError = error as { errors?: unknown[] };
        return {
          success: false,
          rowsInserted: rows.length - (partialError.errors?.length || 0),
          errors: partialError.errors as Array<{ row: number; errors: unknown[] }>,
        };
      }

      // Complete failure
      throw error;
    }
  }

  /**
   * Batch load rows via insert (for large datasets)
   *
   * Uses batch insert which is efficient for bulk loads
   */
  async batchLoadRows(
    tableName: keyof typeof TABLE_NAMES,
    rows: BigQueryRow[]
  ): Promise<InsertResult> {
    if (rows.length === 0) {
      return { success: true, rowsInserted: 0 };
    }

    const dataset = this.bigquery.dataset(this.config.datasetId);
    const table = dataset.table(TABLE_NAMES[tableName]);

    try {
      // Add ingestion timestamp
      const rowsWithTimestamp = rows.map((row) => ({
        ...row,
        ingested_at: new Date().toISOString(),
      }));

      // Insert rows (handles batching automatically)
      await table.insert(rowsWithTimestamp, {
        skipInvalidRows: false, // Fail on any invalid row
        ignoreUnknownValues: false, // Fail on unknown fields
      });

      return {
        success: true,
        rowsInserted: rows.length,
      };
    } catch (error) {
      // Check if it's a partial failure
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'PartialFailureError'
      ) {
        const partialError = error as unknown as {
          errors: Array<{ row: unknown; errors: unknown[] }>;
        };
        return {
          success: false,
          rowsInserted: rows.length - partialError.errors.length,
          errors: partialError.errors.map((err, index) => ({
            row: index,
            errors: err.errors,
          })),
        };
      }

      throw error;
    }
  }

  /**
   * Upsert rows (insert or update based on date + id)
   *
   * Uses MERGE statement for deduplication
   */
  async upsertRows(
    tableName: keyof typeof TABLE_NAMES,
    rows: BigQueryRow[],
    keyFields: string[] // Fields to match on (e.g., ['date', 'campaign_id'])
  ): Promise<InsertResult> {
    if (rows.length === 0) {
      return { success: true, rowsInserted: 0 };
    }

    // Build MERGE statement
    const tempTableName = `${TABLE_NAMES[tableName]}_temp_${Date.now()}`;
    const dataset = this.bigquery.dataset(this.config.datasetId);

    try {
      // 1. Create temporary table with new data
      const tempTable = dataset.table(tempTableName);
      await tempTable.create({
        schema: await this.getTableSchema(tableName),
      });

      // 2. Insert rows into temp table (directly, not through insertRows method)
      const rowsWithTimestamp = rows.map((row) => ({
        ...row,
        ingested_at: new Date().toISOString(),
      }));
      await tempTable.insert(rowsWithTimestamp);

      // 3. MERGE temp table into main table
      const matchConditions = keyFields
        .map((field) => `target.${field} = source.${field}`)
        .join(' AND ');

      const updateFields = Object.keys(rows[0])
        .filter((field) => !keyFields.includes(field))
        .map((field) => `target.${field} = source.${field}`)
        .join(', ');

      const mergeSQL = `
        MERGE \`${this.config.projectId}.${this.config.datasetId}.${TABLE_NAMES[tableName]}\` AS target
        USING \`${this.config.projectId}.${this.config.datasetId}.${tempTableName}\` AS source
        ON ${matchConditions}
        WHEN MATCHED THEN
          UPDATE SET ${updateFields}
        WHEN NOT MATCHED THEN
          INSERT ROW
      `;

      await this.bigquery.query(mergeSQL);

      // 4. Delete temp table
      await tempTable.delete();

      return {
        success: true,
        rowsInserted: rows.length,
      };
    } catch (error) {
      // Clean up temp table on error
      try {
        await dataset.table(tempTableName).delete();
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Get table schema
   */
  private async getTableSchema(tableName: keyof typeof TABLE_NAMES): Promise<unknown> {
    const dataset = this.bigquery.dataset(this.config.datasetId);
    const table = dataset.table(TABLE_NAMES[tableName]);
    const [metadata] = await table.getMetadata();
    return metadata.schema;
  }

  /**
   * Query table (for validation)
   */
  async query<T = unknown>(sql: string): Promise<T[]> {
    const [rows] = await this.bigquery.query(sql);
    return rows as T[];
  }

  /**
   * Get row count for a date range
   */
  async getRowCount(
    tableName: keyof typeof TABLE_NAMES,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM \`${this.config.projectId}.${this.config.datasetId}.${TABLE_NAMES[tableName]}\`
      WHERE date BETWEEN '${startDate}' AND '${endDate}'
    `;

    const rows = await this.query<{ count: number }>(sql);
    return rows[0]?.count || 0;
  }

  /**
   * Delete rows for a date range (for re-syncing)
   */
  async deleteRowsForDateRange(
    tableName: keyof typeof TABLE_NAMES,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const sql = `
      DELETE FROM \`${this.config.projectId}.${this.config.datasetId}.${TABLE_NAMES[tableName]}\`
      WHERE date BETWEEN '${startDate}' AND '${endDate}'
    `;

    const [job] = await this.bigquery.createQueryJob({ query: sql });
    const [jobResult] = await job.getMetadata();

    return parseInt(jobResult.statistics?.query?.numDmlAffectedRows || '0', 10);
  }
}
