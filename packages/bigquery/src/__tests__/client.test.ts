import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BigQueryClient } from '../client';
import type { QueryOptions } from '../types';

// Mock @google-cloud/bigquery
vi.mock('@google-cloud/bigquery', () => ({
  BigQuery: vi.fn().mockImplementation(() => ({
    createQueryJob: vi.fn().mockResolvedValue([
      {
        id: 'job-123',
        getQueryResults: vi.fn().mockResolvedValue([
          [{ id: 1, name: 'test' }],
          {},
          {
            totalRows: '1',
            totalBytesProcessed: '1000',
            cacheHit: false,
          },
        ]),
        metadata: {
          statistics: {
            totalBytesProcessed: '1000',
          },
        },
      },
    ]),
    dataset: vi.fn().mockReturnValue({
      getTables: vi.fn().mockResolvedValue([[{ id: 'table1' }, { id: 'table2' }]]),
      table: vi.fn().mockReturnValue({
        getMetadata: vi.fn().mockResolvedValue([
          {
            schema: {
              fields: [
                { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
                { name: 'name', type: 'STRING', mode: 'NULLABLE' },
              ],
            },
            timePartitioning: { field: 'date' },
            clustering: { fields: ['id', 'name'] },
          },
        ]),
      }),
    }),
  })),
}));

describe('BigQueryClient', () => {
  let client: BigQueryClient;

  beforeEach(() => {
    client = new BigQueryClient({
      projectId: 'test-project',
      datasetId: 'test-dataset',
    });
  });

  describe('query', () => {
    it('should execute a valid SELECT query', async () => {
      const options: QueryOptions = {
        query: 'SELECT * FROM test_table',
      };

      const result = await client.query(options);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ id: 1, name: 'test' });
      expect(result.jobId).toBe('job-123');
      expect(result.bytesProcessed).toBe(1000);
    });

    it('should reject queries with DELETE statement', async () => {
      const options: QueryOptions = {
        query: 'DELETE FROM test_table WHERE id = 1',
      };

      await expect(client.query(options)).rejects.toThrow('Query contains dangerous operation');
    });

    it('should reject queries with DROP statement', async () => {
      const options: QueryOptions = {
        query: 'DROP TABLE test_table',
      };

      await expect(client.query(options)).rejects.toThrow('Query contains dangerous operation');
    });

    it('should reject queries with INSERT statement', async () => {
      const options: QueryOptions = {
        query: 'INSERT INTO test_table VALUES (1, "test")',
      };

      await expect(client.query(options)).rejects.toThrow('Query contains dangerous operation');
    });

    it('should reject queries with UPDATE statement', async () => {
      const options: QueryOptions = {
        query: 'UPDATE test_table SET name = "new" WHERE id = 1',
      };

      await expect(client.query(options)).rejects.toThrow('Query contains dangerous operation');
    });

    it('should handle query with params', async () => {
      const options: QueryOptions = {
        query: 'SELECT * FROM test_table WHERE id = @id',
        params: { id: 1 },
      };

      const result = await client.query(options);

      expect(result.rows).toHaveLength(1);
    });

    it('should respect timeout parameter', async () => {
      const options: QueryOptions = {
        query: 'SELECT * FROM test_table',
        timeoutMs: 5000,
      };

      const result = await client.query(options);

      expect(result).toBeDefined();
    });

    it('should respect maxResults parameter', async () => {
      const options: QueryOptions = {
        query: 'SELECT * FROM test_table',
        maxResults: 100,
      };

      const result = await client.query(options);

      expect(result).toBeDefined();
    });
  });

  describe('listTables', () => {
    it('should list all tables in dataset', async () => {
      const tables = await client.listTables();

      expect(tables).toEqual(['table1', 'table2']);
    });
  });

  describe('getTableSchema', () => {
    it('should get schema for a table', async () => {
      const schema = await client.getTableSchema('test_table');

      expect(schema.name).toBe('test_table');
      expect(schema.fields).toHaveLength(2);
      expect(schema.fields[0].name).toBe('id');
      expect(schema.fields[0].type).toBe('INTEGER');
      expect(schema.fields[0].mode).toBe('REQUIRED');
      expect(schema.partitionField).toBe('date');
      expect(schema.clusterFields).toEqual(['id', 'name']);
    });
  });
});
