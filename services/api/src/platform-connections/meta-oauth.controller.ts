import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PlatformConnectionsService } from './platform-connections.service';

/**
 * Meta OAuth Controller
 *
 * Handles OAuth 2.0 flow for Meta (Facebook) Marketing API
 * Documentation: https://developers.facebook.com/docs/marketing-api/overview/authorization
 */
@Controller('auth/meta')
export class MetaOAuthController {
  constructor(private readonly platformConnectionsService: PlatformConnectionsService) {}

  /**
   * Initiate Meta OAuth flow
   * Redirects user to Meta authorization page
   */
  @Get('authorize')
  async authorize(@Query('tenant_id') tenantId: string, @Res() res: Response) {
    const clientId = process.env.META_APP_ID;
    const redirectUri = `${process.env.API_URL || 'http://localhost:3001'}/auth/meta/callback`;

    if (!clientId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Meta App ID not configured',
        message: 'Please set META_APP_ID in environment variables',
      });
    }

    // Meta OAuth scopes needed for ad management
    const scopes = ['ads_management', 'ads_read', 'business_management', 'read_insights'].join(',');

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('state', tenantId); // Pass tenant ID via state
    authUrl.searchParams.set('response_type', 'code');

    return res.redirect(authUrl.toString());
  }

  /**
   * OAuth callback handler
   * Exchanges authorization code for access token
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') tenantId: string,
    @Res() res: Response
  ) {
    if (!code) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'No authorization code received',
      });
    }

    try {
      // Exchange code for access token
      const tokenData = await this.exchangeCodeForToken(code);

      // Get ad accounts accessible with this token
      const adAccounts = await this.getAdAccounts(tokenData.access_token);

      if (adAccounts.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'No ad accounts found',
          message: 'This Meta account has no advertising accounts.',
        });
      }

      // Store connection for first ad account (user can add more later)
      const primaryAccount = adAccounts[0];
      await this.platformConnectionsService.create({
        tenantId,
        platform: 'meta',
        accountId: String(primaryAccount.account_id),
        accountName: primaryAccount.name,
        accessToken: tokenData.access_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        metadata: {
          currency: primaryAccount.currency,
          timezone: primaryAccount.timezone_name,
          accountStatus: String(primaryAccount.account_status),
        },
      });

      // Redirect back to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/connections/ad-platforms?status=success&platform=meta&account=${primaryAccount.name}`
      );
    } catch (error) {
      console.error('Meta OAuth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/connections/ad-platforms?status=error&platform=meta&message=${encodeURIComponent(errorMessage)}`
      );
    }
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const clientId = process.env.META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.API_URL || 'http://localhost:3001'}/auth/meta/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('META_APP_ID and META_APP_SECRET must be configured');
    }

    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const response = await fetch(tokenUrl.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Failed to exchange code for token');
    }

    return data;
  }

  /**
   * Get ad accounts accessible with access token
   */
  private async getAdAccounts(accessToken: string): Promise<
    Array<{
      account_id: string;
      name: string;
      currency: string;
      timezone_name: string;
      account_status: number;
    }>
  > {
    const url = new URL('https://graph.facebook.com/v18.0/me/adaccounts');
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('fields', 'account_id,name,currency,timezone_name,account_status');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Failed to fetch ad accounts');
    }

    return data.data || [];
  }
}
