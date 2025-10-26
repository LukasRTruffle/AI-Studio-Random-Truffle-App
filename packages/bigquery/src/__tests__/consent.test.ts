import { describe, it, expect } from 'vitest';
import {
  getConsentDefaults,
  buildConsentConfigScript,
  buildConsentUpdateScript,
  isAnalyticsConsentGranted,
  isAdvertisingConsentGranted,
  extractConsentStatusFromEvent,
  createConsentBannerConfig,
  validateConsentStatus,
} from '../consent';
import type { GA4ConsentStatus } from '../types';

describe('Consent Utilities', () => {
  describe('getConsentDefaults', () => {
    it('should return default consent configuration', () => {
      const defaults = getConsentDefaults();

      expect(defaults.ad_storage).toBe('denied');
      expect(defaults.analytics_storage).toBe('granted');
      expect(defaults.ad_user_data).toBe('denied');
      expect(defaults.ad_personalization).toBe('denied');
      expect(defaults.wait_for_update).toBe(500);
    });

    it('should return consent defaults for a specific region', () => {
      const defaults = getConsentDefaults('US');

      expect(defaults.region).toEqual(['US']);
    });
  });

  describe('buildConsentConfigScript', () => {
    it('should generate gtag consent config script', () => {
      const defaults = getConsentDefaults();
      const script = buildConsentConfigScript(defaults);

      expect(script).toContain("gtag('consent', 'default'");
      expect(script).toContain("'ad_storage': 'denied'");
      expect(script).toContain("'analytics_storage': 'granted'");
      expect(script).toContain("'wait_for_update': 500");
    });
  });

  describe('buildConsentUpdateScript', () => {
    it('should generate gtag consent update script', () => {
      const status: GA4ConsentStatus = {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        timestamp: Date.now(),
      };

      const script = buildConsentUpdateScript(status);

      expect(script).toContain("gtag('consent', 'update'");
      expect(script).toContain("'ad_storage': 'granted'");
      expect(script).toContain("'analytics_storage': 'granted'");
    });
  });

  describe('isAnalyticsConsentGranted', () => {
    it('should return true when analytics consent granted', () => {
      const status: GA4ConsentStatus = {
        ad_storage: 'denied',
        analytics_storage: 'granted',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        timestamp: Date.now(),
      };

      expect(isAnalyticsConsentGranted(status)).toBe(true);
    });

    it('should return false when analytics consent denied', () => {
      const status: GA4ConsentStatus = {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        timestamp: Date.now(),
      };

      expect(isAnalyticsConsentGranted(status)).toBe(false);
    });
  });

  describe('isAdvertisingConsentGranted', () => {
    it('should return true when all advertising consent granted', () => {
      const status: GA4ConsentStatus = {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        timestamp: Date.now(),
      };

      expect(isAdvertisingConsentGranted(status)).toBe(true);
    });

    it('should return false when any advertising consent denied', () => {
      const status: GA4ConsentStatus = {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'denied',
        ad_personalization: 'granted',
        timestamp: Date.now(),
      };

      expect(isAdvertisingConsentGranted(status)).toBe(false);
    });
  });

  describe('extractConsentStatusFromEvent', () => {
    it('should extract consent status from event params', () => {
      const eventParams = {
        consent_ad_storage: 'granted',
        consent_analytics_storage: 'granted',
        consent_ad_user_data: 'granted',
        consent_ad_personalization: 'granted',
      };

      const status = extractConsentStatusFromEvent(eventParams);

      expect(status).not.toBeNull();
      expect(status?.ad_storage).toBe('granted');
      expect(status?.analytics_storage).toBe('granted');
    });

    it('should return null for incomplete event params', () => {
      const eventParams = {
        consent_ad_storage: 'granted',
        // Missing other consent fields
      };

      const status = extractConsentStatusFromEvent(eventParams);

      expect(status).toBeNull();
    });
  });

  describe('createConsentBannerConfig', () => {
    it('should create consent banner configuration', () => {
      const config = createConsentBannerConfig();

      expect(config.title).toBe('Cookie Consent');
      expect(config.options).toHaveLength(4);
      expect(config.options[0].id).toBe('analytics_storage');
      expect(config.options[0].defaultChecked).toBe(true);
      expect(config.options[1].id).toBe('ad_storage');
      expect(config.options[1].defaultChecked).toBe(false);
    });
  });

  describe('validateConsentStatus', () => {
    it('should validate correct consent status', () => {
      const status: GA4ConsentStatus = {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        timestamp: Date.now(),
      };

      expect(validateConsentStatus(status)).toBe(true);
    });

    it('should reject invalid consent values', () => {
      const status = {
        ad_storage: 'invalid',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        timestamp: Date.now(),
      };

      expect(validateConsentStatus(status)).toBe(false);
    });

    it('should reject missing fields', () => {
      const status = {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        // Missing fields
      };

      expect(validateConsentStatus(status)).toBe(false);
    });
  });
});
