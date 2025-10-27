/**
 * Google Ads OAuth 2.0 Client
 *
 * Handles OAuth flow for Google Ads API access
 */

import { google } from 'googleapis';
import type { GoogleAdsOAuthConfig, GoogleAdsOAuthTokens } from './types';

/**
 * OAuth scopes required for Google Ads API
 */
const GOOGLE_ADS_SCOPES = [
  'https://www.googleapis.com/auth/adwords', // Google Ads API access
];

/**
 * Google Ads OAuth Client
 */
export class GoogleAdsOAuthClient {
  private oauth2Client: any;

  constructor(config: GoogleAdsOAuthConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  getAuthorizationUrl(state?: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: GOOGLE_ADS_SCOPES,
      state: state || '',
      prompt: 'consent', // Force consent screen to ensure refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<GoogleAdsOAuthTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to obtain access token or refresh token');
    }

    const expiresAt = new Date();
    if (tokens.expiry_date) {
      expiresAt.setTime(tokens.expiry_date);
    } else {
      // Default to 1 hour if not provided
      expiresAt.setHours(expiresAt.getHours() + 1);
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      scope: tokens.scope || GOOGLE_ADS_SCOPES.join(' '),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleAdsOAuthTokens> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    const expiresAt = new Date();
    if (credentials.expiry_date) {
      expiresAt.setTime(credentials.expiry_date);
    } else {
      expiresAt.setHours(expiresAt.getHours() + 1);
    }

    return {
      accessToken: credentials.access_token,
      refreshToken: refreshToken, // Keep existing refresh token
      expiresAt,
      scope: credentials.scope || GOOGLE_ADS_SCOPES.join(' '),
    };
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    await this.oauth2Client.revokeToken(accessToken);
  }

  /**
   * Get accessible customer accounts
   *
   * After OAuth, use this to list all customer accounts the user has access to
   */
  async getAccessibleCustomers(accessToken: string, developerToken: string): Promise<string[]> {
    const response = await fetch(
      'https://googleads.googleapis.com/v22/customers:listAccessibleCustomers',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
        },
      }
    );

    if (!response.ok) {
      const error = (await response.json()) as { error?: { message?: string } };
      throw new Error(`Failed to get accessible customers: ${error.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as { resourceNames?: string[] };
    return data.resourceNames || [];
  }
}
