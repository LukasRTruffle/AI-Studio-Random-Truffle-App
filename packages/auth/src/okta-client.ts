/**
 * Okta Client for backend authentication
 *
 * Handles JWT verification and token validation using Okta JWT Verifier
 */

import OktaJwtVerifier from '@okta/jwt-verifier';
import type { OktaConfig, JWTPayload, OktaUser } from './types';

export class OktaClient {
  private verifier: OktaJwtVerifier;
  private config: OktaConfig;

  constructor(config: OktaConfig) {
    this.config = config;

    // Initialize Okta JWT Verifier
    this.verifier = new OktaJwtVerifier({
      issuer: config.issuer,
      clientId: config.clientId,
      assertClaims: {
        aud: config.clientId,
      },
    });
  }

  /**
   * Verify access token
   *
   * @param accessToken - Access token to verify
   * @returns JWT payload if valid
   * @throws Error if token is invalid or expired
   */
  async verifyAccessToken(accessToken: string): Promise<JWTPayload> {
    try {
      const jwt = await this.verifier.verifyAccessToken(accessToken, 'api://default');

      return jwt.claims as JWTPayload;
    } catch (error) {
      throw new Error(
        `Failed to verify access token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify ID token
   *
   * @param idToken - ID token to verify
   * @returns JWT payload if valid
   * @throws Error if token is invalid or expired
   */
  async verifyIdToken(idToken: string): Promise<JWTPayload> {
    try {
      const jwt = await this.verifier.verifyIdToken(idToken, this.config.clientId, 'id_token');

      return jwt.claims as JWTPayload;
    } catch (error) {
      throw new Error(
        `Failed to verify ID token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract user information from JWT payload
   *
   * @param payload - JWT payload
   * @returns User information
   */
  extractUser(payload: JWTPayload): OktaUser {
    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      given_name: payload.given_name,
      family_name: payload.family_name,
      name: payload.name,
      nickname: payload.nickname,
      picture: payload.picture,
      roles: payload.roles || ['user'],
      tenantId: payload.tenantId,
    };
  }

  /**
   * Check if token is expired
   *
   * @param payload - JWT payload
   * @returns True if expired
   */
  isTokenExpired(payload: JWTPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Get authorization URL for login
   *
   * @returns Authorization URL
   */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      scope: (this.config.scopes || ['openid', 'profile', 'email']).join(' '),
      redirect_uri: this.config.redirectUri,
      state: this.generateState(),
    });

    return `https://${this.config.domain}/oauth2/v1/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   *
   * @param code - Authorization code from callback
   * @returns Token response
   */
  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    const response = await fetch(`https://${this.config.domain}/oauth2/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - Refresh token
   * @returns New access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    idToken: string;
    expiresIn: number;
  }> {
    const response = await fetch(`https://${this.config.domain}/oauth2/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh access token: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Revoke token (logout)
   *
   * @param token - Access or refresh token
   * @param tokenTypeHint - 'access_token' or 'refresh_token'
   */
  async revokeToken(
    token: string,
    tokenTypeHint: 'access_token' | 'refresh_token' = 'access_token'
  ): Promise<void> {
    const response = await fetch(`https://${this.config.domain}/oauth2/v1/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        token,
        token_type_hint: tokenTypeHint,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to revoke token: ${error}`);
    }
  }

  /**
   * Generate state parameter for CSRF protection
   *
   * @returns Random state string
   */
  private generateState(): string {
    return Buffer.from(crypto.randomBytes(32)).toString('base64url');
  }
}

/**
 * Create Okta client instance
 *
 * @param config - Okta configuration
 * @returns OktaClient instance
 */
export function createOktaClient(config: OktaConfig): OktaClient {
  return new OktaClient(config);
}
