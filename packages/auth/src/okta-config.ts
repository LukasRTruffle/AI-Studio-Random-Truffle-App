import { OktaAuth } from '@okta/okta-auth-js';

/**
 * Okta configuration
 *
 * Environment variables required:
 * - NEXT_PUBLIC_OKTA_DOMAIN: Your Okta domain (e.g., dev-12345.okta.com)
 * - NEXT_PUBLIC_OKTA_CLIENT_ID: Your Okta application client ID
 * - NEXT_PUBLIC_OKTA_REDIRECT_URI: Redirect URI after login (e.g., http://localhost:3000/login/callback)
 */
export const oktaConfig = {
  clientId: process.env.NEXT_PUBLIC_OKTA_CLIENT_ID || '',
  issuer: `https://${process.env.NEXT_PUBLIC_OKTA_DOMAIN}/oauth2/default`,
  redirectUri: process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI || 'http://localhost:3000/login/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true, // Enable PKCE for security
  disableHttpsCheck: process.env.NODE_ENV === 'development', // Only for local dev
};

/**
 * Create and export OktaAuth instance
 */
export const oktaAuth = new OktaAuth(oktaConfig);

/**
 * Check if Okta is properly configured
 */
export function isOktaConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_OKTA_DOMAIN &&
    process.env.NEXT_PUBLIC_OKTA_CLIENT_ID &&
    process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI
  );
}

/**
 * Get Okta configuration status
 */
export function getOktaConfigStatus(): {
  configured: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_OKTA_DOMAIN) {
    missing.push('NEXT_PUBLIC_OKTA_DOMAIN');
  }
  if (!process.env.NEXT_PUBLIC_OKTA_CLIENT_ID) {
    missing.push('NEXT_PUBLIC_OKTA_CLIENT_ID');
  }
  if (!process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI) {
    missing.push('NEXT_PUBLIC_OKTA_REDIRECT_URI');
  }

  return {
    configured: missing.length === 0,
    missing,
  };
}
