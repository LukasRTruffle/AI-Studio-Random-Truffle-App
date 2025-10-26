import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidUUID,
  isSafeSQLString,
  isEmpty,
  isNullOrUndefined,
  validateRequired,
  isValidUrl,
  isValidDomain,
} from '../utils/validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('123e4567e89b12d3a456426614174000')).toBe(false);
    });
  });

  describe('isSafeSQLString', () => {
    it('should return true for safe SQL strings', () => {
      expect(isSafeSQLString('SELECT * FROM users WHERE id = 1')).toBe(true);
      expect(isSafeSQLString('SELECT name, email FROM users')).toBe(true);
      expect(isSafeSQLString('UPDATE users SET name = "test"')).toBe(true);
    });

    it('should return false for dangerous SQL patterns', () => {
      expect(isSafeSQLString('SELECT * FROM users; DROP TABLE users;')).toBe(false);
      expect(isSafeSQLString('DELETE FROM users WHERE 1=1')).toBe(false);
      expect(isSafeSQLString('TRUNCATE TABLE users')).toBe(false);
      expect(isSafeSQLString('ALTER TABLE users ADD COLUMN')).toBe(false);
      expect(isSafeSQLString('CREATE TABLE malicious')).toBe(false);
      expect(isSafeSQLString('GRANT ALL ON users')).toBe(false);
      expect(isSafeSQLString('REVOKE ALL ON users')).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty('\t\n')).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(' hello ')).toBe(false);
      expect(isEmpty('0')).toBe(false);
    });
  });

  describe('isNullOrUndefined', () => {
    it('should return true for null or undefined', () => {
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for other values', () => {
      expect(isNullOrUndefined('')).toBe(false);
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined(false)).toBe(false);
      expect(isNullOrUndefined({})).toBe(false);
      expect(isNullOrUndefined([])).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should return valid when all required fields are present', () => {
      const obj = { name: 'John', email: 'john@example.com' };
      const result = validateRequired(obj, ['name', 'email']);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should return invalid when required fields are missing', () => {
      const obj = { name: 'John' };
      const result = validateRequired(obj, ['name', 'email']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['email']);
    });

    it('should detect empty string fields as missing', () => {
      const obj = { name: '', email: 'john@example.com' };
      const result = validateRequired(obj, ['name', 'email']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['name']);
    });

    it('should detect null/undefined fields as missing', () => {
      const obj = { name: null, email: undefined, age: 25 };
      const result = validateRequired(obj, ['name', 'email', 'age']);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('name');
      expect(result.missing).toContain('email');
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('isValidDomain', () => {
    it('should return true for valid domains', () => {
      expect(isValidDomain('example.com')).toBe(true);
      expect(isValidDomain('sub.example.com')).toBe(true);
      expect(isValidDomain('example.co.uk')).toBe(true);
      expect(isValidDomain('a.b.c.example.com')).toBe(true);
    });

    it('should return false for invalid domains', () => {
      expect(isValidDomain('not a domain')).toBe(false);
      expect(isValidDomain('https://example.com')).toBe(false);
      expect(isValidDomain('.example.com')).toBe(false);
      expect(isValidDomain('example')).toBe(false);
      expect(isValidDomain('')).toBe(false);
    });
  });
});
