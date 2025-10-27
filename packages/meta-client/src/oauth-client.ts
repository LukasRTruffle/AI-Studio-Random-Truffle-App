/**
 * Meta OAuth 2.0 Client
 *
 * Handles OAuth flow for Meta Marketing API v22.0
 * Documentation: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 */

import type { MetaOAuthConfig, MetaOAuthTokens, MetaAdAccountId } from './types';

const META_API_VERSION = 'v22.0';
const META_GRAPH_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Meta OAuth 2.0 Client
 */
export class MetaOAuthClient {
  constructor(private readonly config: MetaOAuthConfig) {}

  /**
   * Generate authorization URL for OAuth flow
   *
   * @param state - CSRF protection token
   * @param scope - Permissions to request (default: ads_management, ads_read)
   * @returns Authorization URL to redirect user to
   */
  getAuthorizationUrl(
    state?: string,
    scope: string[] = ['ads_management', 'ads_read', 'business_management']
  ): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      scope: scope.join(','),
      response_type: 'code',
      ...(state && { state }),
    });

    return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   *
   * @param code - Authorization code from OAuth callback
   * @returns Access token
   */
  async getTokensFromCode(code: string): Promise<MetaOAuthTokens> {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      redirect_uri: this.config.redirectUri,
      code,
    });

    const response = await fetch(`${META_GRAPH_API_BASE}/oauth/access_token?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as { error: { message: string } };
      throw new Error(`Meta OAuth error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      token_type: 'bearer';
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Exchange short-lived token for long-lived token (60 days)
   *
   * @param shortLivedToken - Short-lived access token (expires in ~1 hour)
   * @returns Long-lived access token (expires in 60 days)
   */
  async getLongLivedToken(shortLivedToken: string): Promise<MetaOAuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const response = await fetch(`${META_GRAPH_API_BASE}/oauth/access_token?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as { error: { message: string } };
      throw new Error(`Meta OAuth error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      token_type: 'bearer';
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Get ad accounts accessible by the user
   *
   * @param accessToken - User access token
   * @returns List of ad account IDs
   */
  async getAccessibleAdAccounts(accessToken: string): Promise<MetaAdAccountId[]> {
    const response = await fetch(
      `${META_GRAPH_API_BASE}/me/adaccounts?fields=id,name,account_status`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = (await response.json()) as { error: { message: string } };
      throw new Error(`Failed to fetch ad accounts: ${error.error?.message || 'Unknown error'}`);
    }

    const data = (await response.json()) as {
      data: Array<{
        id: string;
        name: string;
        account_status: number;
      }>;
    };

    // Filter to active accounts only (status = 1)
    return data.data.filter((account) => account.account_status === 1).map((account) => account.id);
  }

  /**
   * Debug access token (check validity and expiration)
   *
   * @param accessToken - Access token to debug
   * @returns Token debug info
   */
  async debugToken(accessToken: string): Promise<{
    isValid: boolean;
    expiresAt?: number;
    scopes?: string[];
    userId?: string;
    appId?: string;
  }> {
    const params = new URLSearchParams({
      input_token: accessToken,
      access_token: `${this.config.appId}|${this.config.appSecret}`, // App access token
    });

    const response = await fetch(`${META_GRAPH_API_BASE}/debug_token?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return { isValid: false };
    }

    const data = (await response.json()) as {
      data: {
        is_valid: boolean;
        expires_at?: number;
        scopes?: string[];
        user_id?: string;
        app_id?: string;
      };
    };

    return {
      isValid: data.data.is_valid,
      expiresAt: data.data.expires_at,
      scopes: data.data.scopes,
      userId: data.data.user_id,
      appId: data.data.app_id,
    };
  }
}
