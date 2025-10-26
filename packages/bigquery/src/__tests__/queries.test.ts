import { describe, it, expect } from 'vitest';
import {
  buildAudienceSizeQuery,
  buildSessionTrendsQuery,
  buildDailyKPIsQuery,
  buildAudienceMetricsQuery,
  buildUserAttributesQuery,
  buildConversionFunnelQuery,
  replaceQueryVariables,
} from '../queries';
import { CurrencyCode } from '../types';

describe('Query Builders', () => {
  describe('buildAudienceSizeQuery', () => {
    it('should build audience size query with conditions', () => {
      const query = buildAudienceSizeQuery(
        'total_revenue > 100 AND country = "US"',
        '2025-01-01',
        '2025-01-31'
      );

      expect(query).toContain('COUNT(DISTINCT unified_user_id) as audience_size');
      expect(query).toContain('total_revenue > 100 AND country = "US"');
      expect(query).toContain("TIMESTAMP('2025-01-01')");
      expect(query).toContain("TIMESTAMP('2025-01-31')");
    });
  });

  describe('buildSessionTrendsQuery', () => {
    it('should build session trends query grouped by date', () => {
      const query = buildSessionTrendsQuery('2025-01-01', '2025-01-31', 'DATE');

      expect(query).toContain('COUNT(DISTINCT session_id) as total_sessions');
      expect(query).toContain('COUNT(DISTINCT unified_user_id) as total_users');
      expect(query).toContain("'>= '2025-01-01'");
      expect(query).toContain("<= '2025-01-31'");
    });

    it('should build session trends query grouped by device', () => {
      const query = buildSessionTrendsQuery('2025-01-01', '2025-01-31', 'DEVICE_CATEGORY');

      expect(query).toContain('device_category as dimension');
    });

    it('should build session trends query grouped by country', () => {
      const query = buildSessionTrendsQuery('2025-01-01', '2025-01-31', 'COUNTRY');

      expect(query).toContain('country as dimension');
    });
  });

  describe('buildDailyKPIsQuery', () => {
    it('should build daily KPIs query', () => {
      const query = buildDailyKPIsQuery('2025-01-01', '2025-01-31');

      expect(query).toContain('total_users');
      expect(query).toContain('total_sessions');
      expect(query).toContain('total_conversions');
      expect(query).toContain('total_revenue');
      expect(query).toContain("date >= '2025-01-01'");
    });

    it('should build daily KPIs query with currency filter', () => {
      const query = buildDailyKPIsQuery('2025-01-01', '2025-01-31', CurrencyCode.USD);

      expect(query).toContain("currency = 'USD'");
    });
  });

  describe('buildAudienceMetricsQuery', () => {
    it('should build audience metrics query', () => {
      const query = buildAudienceMetricsQuery('aud_123', '2025-01-01', '2025-01-31');

      expect(query).toContain("audience_id = 'aud_123'");
      expect(query).toContain('total_users');
      expect(query).toContain('active_users_7d');
      expect(query).toContain('total_revenue');
    });
  });

  describe('buildUserAttributesQuery', () => {
    it('should build user attributes query', () => {
      const query = buildUserAttributesQuery('user_123');

      expect(query).toContain("unified_user_id = 'user_123'");
      expect(query).toContain('total_sessions');
      expect(query).toContain('total_conversions');
      expect(query).toContain('total_revenue');
    });
  });

  describe('buildConversionFunnelQuery', () => {
    it('should build conversion funnel query', () => {
      const steps = ['page_view', 'add_to_cart', 'purchase'];
      const query = buildConversionFunnelQuery(steps, '2025-01-01', '2025-01-31');

      expect(query).toContain("event_name = 'page_view'");
      expect(query).toContain("event_name = 'add_to_cart'");
      expect(query).toContain("event_name = 'purchase'");
      expect(query).toContain('step_1_users');
      expect(query).toContain('step_2_users');
      expect(query).toContain('step_3_users');
    });
  });

  describe('replaceQueryVariables', () => {
    it('should replace project and dataset variables', () => {
      const query = 'SELECT * FROM `${projectId}.${datasetId}.table`';
      const replaced = replaceQueryVariables(query, 'my-project', 'my-dataset');

      expect(replaced).toBe('SELECT * FROM `my-project.my-dataset.table`');
    });

    it('should replace multiple occurrences', () => {
      const query =
        'SELECT * FROM `${projectId}.${datasetId}.table1` JOIN `${projectId}.${datasetId}.table2`';
      const replaced = replaceQueryVariables(query, 'proj', 'dataset');

      expect(replaced).toContain('proj.dataset.table1');
      expect(replaced).toContain('proj.dataset.table2');
    });
  });
});
