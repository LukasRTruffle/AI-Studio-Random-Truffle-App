/**
 * TikTok OAuth 2.0 Client
 * Documentation: https://business-api.tiktok.com/portal/docs?id=1738373164380162
 */

import type { TikTokOAuthConfig, TikTokOAuthTokens, TikTokAdvertiserId } from './types';

const TIKTOK_AUTH_URL = 'https://business-api.tiktok.com/open_api/v1.3';

export class TikTokOAuthClient {
  constructor(private readonly config: TikTokOAuthConfig) {}

  /**
   * Generate authorization URL for OAuth flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      app_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      ...(state && { state }),
    });

    return `${TIKTOK_AUTH_URL}/oauth2/authorize/?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getTokensFromCode(authCode: string): Promise<TikTokOAuthTokens> {
    const response = await fetch(`${TIKTOK_AUTH_URL}/oauth2/access_token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.config.appId,
        secret: this.config.appSecret,
        auth_code: authCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`TikTok OAuth error: ${await response.text()}`);
    }

    const data = (await response.json()) as {
      code: number;
      message: string;
      data: {
        access_token: string;
        advertiser_ids: string[];
        expires_in: number;
      };
    };

    if (data.code !== 0) {
      throw new Error(`TikTok OAuth error: ${data.message}`);
    }

    return {
      accessToken: data.data.access_token,
      tokenType: 'bearer',
      expiresIn: data.data.expires_in,
      advertiserIds: data.data.advertiser_ids,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TikTokOAuthTokens> {
    const response = await fetch(`${TIKTOK_AUTH_URL}/oauth2/refresh_token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.config.appId,
        secret: this.config.appSecret,
        refresh_token: refreshToken,
      }),
    });

    const data = (await response.json()) as {
      code: number;
      data: {
        access_token: string;
        expires_in: number;
        refresh_token: string;
        refresh_expires_in: number;
      };
    };

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresIn: data.data.expires_in,
      refreshExpiresIn: data.data.refresh_expires_in,
      tokenType: 'bearer',
    };
  }

  /**
   * Get accessible advertiser IDs
   */
  async getAdvertiserIds(accessToken: string): Promise<TikTokAdvertiserId[]> {
    const response = await fetch(`${TIKTOK_AUTH_URL}/oauth2/advertiser/get/`, {
      method: 'GET',
      headers: {
        'Access-Token': accessToken,
      },
    });

    const data = (await response.json()) as {
      code: number;
      data: { list: Array<{ advertiser_id: string }> };
    };

    return data.data.list.map((item) => item.advertiser_id);
  }
}
