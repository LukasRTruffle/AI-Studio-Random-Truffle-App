import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPercentage,
  formatFileSize,
  truncate,
  toTitleCase,
  toSnakeCase,
  toCamelCase,
} from '../utils/formatting';

describe('formatting utilities', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(42)).toBe('42');
    });

    it('should handle decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD by default', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format other currencies', () => {
      expect(formatCurrency(1000, 'EUR')).toContain('1,000');
      expect(formatCurrency(1000, 'MXN')).toContain('1,000');
    });
  });

  describe('formatDate', () => {
    it('should format dates as ISO string (YYYY-MM-DD)', () => {
      const date = new Date('2025-10-26T12:00:00Z');
      expect(formatDate(date)).toBe('2025-10-26');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime in human-readable format', () => {
      const date = new Date('2025-10-26T12:00:00Z');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('2025');
      expect(formatted).toContain('Oct');
      expect(formatted).toContain('26');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "just now" for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const past = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      expect(formatRelativeTime(past)).toBe('5 minutes ago');
    });

    it('should return hours ago', () => {
      const past = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      expect(formatRelativeTime(past)).toBe('2 hours ago');
    });

    it('should return days ago', () => {
      const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      expect(formatRelativeTime(past)).toBe('3 days ago');
    });

    it('should return formatted date for older dates', () => {
      const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const formatted = formatRelativeTime(past);
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with default 1 decimal', () => {
      expect(formatPercentage(50)).toBe('50.0%');
      expect(formatPercentage(33.333)).toBe('33.3%');
    });

    it('should format percentages with custom decimals', () => {
      expect(formatPercentage(33.333, 2)).toBe('33.33%');
      expect(formatPercentage(100, 0)).toBe('100%');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500.0 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
    });

    it('should format terabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1.0 TB');
    });
  });

  describe('truncate', () => {
    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings with ellipsis', () => {
      expect(truncate('hello world test', 10)).toBe('hello w...');
    });

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });
  });

  describe('toTitleCase', () => {
    it('should convert strings to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
      expect(toTitleCase('hello')).toBe('Hello');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
      expect(toSnakeCase('firstName')).toBe('first_name');
      expect(toSnakeCase('getUserById')).toBe('get_user_by_id');
    });

    it('should handle already snake_case strings', () => {
      expect(toSnakeCase('hello')).toBe('hello');
    });
  });

  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld');
      expect(toCamelCase('first_name')).toBe('firstName');
      expect(toCamelCase('get_user_by_id')).toBe('getUserById');
    });

    it('should handle already camelCase strings', () => {
      expect(toCamelCase('hello')).toBe('hello');
    });
  });
});
