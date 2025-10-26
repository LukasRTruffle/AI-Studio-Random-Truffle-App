/**
 * GA4 Consent Mode utilities for Random Truffle
 * Per ADR-008: Use GA4 Consent Mode, not custom consent registry
 */

import type { GA4ConsentStatus, GA4ConsentDefaults } from './types';
import { GA4_CONSENT_DEFAULTS } from './config';

/**
 * Get GA4 Consent Mode defaults
 * @param region Optional ISO 3166-2 region code
 * @returns Consent defaults for the region
 */
export function getConsentDefaults(region?: string): GA4ConsentDefaults {
  // In production, this would check region-specific consent requirements
  // For now, return global defaults
  return {
    ...GA4_CONSENT_DEFAULTS,
    region: region ? [region] : undefined,
  };
}

/**
 * Build GA4 consent configuration script
 * This generates the gtag.js consent configuration
 * @param defaults Consent defaults
 * @returns JavaScript code string for gtag consent configuration
 */
export function buildConsentConfigScript(defaults: GA4ConsentDefaults): string {
  return `
// GA4 Consent Mode Configuration
gtag('consent', 'default', {
  'ad_storage': '${defaults.ad_storage}',
  'analytics_storage': '${defaults.analytics_storage}',
  'ad_user_data': '${defaults.ad_user_data}',
  'ad_personalization': '${defaults.ad_personalization}',
  'wait_for_update': ${defaults.wait_for_update || 500}
});
  `.trim();
}

/**
 * Update consent status
 * This generates the gtag.js consent update call
 * @param status New consent status
 * @returns JavaScript code string for gtag consent update
 */
export function buildConsentUpdateScript(status: GA4ConsentStatus): string {
  return `
// Update consent status
gtag('consent', 'update', {
  'ad_storage': '${status.ad_storage}',
  'analytics_storage': '${status.analytics_storage}',
  'ad_user_data': '${status.ad_user_data}',
  'ad_personalization': '${status.ad_personalization}'
});
  `.trim();
}

/**
 * Check if consent is granted for analytics
 * @param status Consent status
 * @returns True if analytics consent is granted
 */
export function isAnalyticsConsentGranted(status: GA4ConsentStatus): boolean {
  return status.analytics_storage === 'granted';
}

/**
 * Check if consent is granted for advertising
 * @param status Consent status
 * @returns True if all advertising consent is granted
 */
export function isAdvertisingConsentGranted(status: GA4ConsentStatus): boolean {
  return (
    status.ad_storage === 'granted' &&
    status.ad_user_data === 'granted' &&
    status.ad_personalization === 'granted'
  );
}

/**
 * Get consent status from BigQuery GA4 export
 * GA4 exports include consent status in event parameters
 * @param eventParams Event parameters from GA4 export
 * @returns Consent status or null if not available
 */
export function extractConsentStatusFromEvent(
  eventParams: Record<string, unknown>
): GA4ConsentStatus | null {
  const adStorage = eventParams.consent_ad_storage as string | undefined;
  const analyticsStorage = eventParams.consent_analytics_storage as string | undefined;
  const adUserData = eventParams.consent_ad_user_data as string | undefined;
  const adPersonalization = eventParams.consent_ad_personalization as string | undefined;

  if (!adStorage || !analyticsStorage || !adUserData || !adPersonalization) {
    return null;
  }

  return {
    ad_storage: adStorage as 'granted' | 'denied',
    analytics_storage: analyticsStorage as 'granted' | 'denied',
    ad_user_data: adUserData as 'granted' | 'denied',
    ad_personalization: adPersonalization as 'granted' | 'denied',
    timestamp: Date.now(),
  };
}

/**
 * Create consent banner configuration
 * Returns configuration object for consent banner UI
 * @returns Consent banner configuration
 */
export function createConsentBannerConfig(): {
  title: string;
  description: string;
  options: Array<{
    id: string;
    label: string;
    required: boolean;
    defaultChecked: boolean;
  }>;
} {
  return {
    title: 'Cookie Consent',
    description:
      'We use cookies to improve your experience and analyze site usage. Choose your preferences below.',
    options: [
      {
        id: 'analytics_storage',
        label: 'Analytics Cookies',
        required: false,
        defaultChecked: true, // Per GA4_CONSENT_DEFAULTS
      },
      {
        id: 'ad_storage',
        label: 'Advertising Cookies',
        required: false,
        defaultChecked: false, // Per GA4_CONSENT_DEFAULTS
      },
      {
        id: 'ad_user_data',
        label: 'Ad User Data',
        required: false,
        defaultChecked: false, // Per GA4_CONSENT_DEFAULTS
      },
      {
        id: 'ad_personalization',
        label: 'Ad Personalization',
        required: false,
        defaultChecked: false, // Per GA4_CONSENT_DEFAULTS
      },
    ],
  };
}

/**
 * Validate consent status
 * @param status Consent status to validate
 * @returns True if valid, false otherwise
 */
export function validateConsentStatus(
  status: Partial<GA4ConsentStatus>
): status is GA4ConsentStatus {
  const validValues: Array<'granted' | 'denied'> = ['granted', 'denied'];

  return (
    !!status.ad_storage &&
    validValues.includes(status.ad_storage) &&
    !!status.analytics_storage &&
    validValues.includes(status.analytics_storage) &&
    !!status.ad_user_data &&
    validValues.includes(status.ad_user_data) &&
    !!status.ad_personalization &&
    validValues.includes(status.ad_personalization) &&
    typeof status.timestamp === 'number'
  );
}
