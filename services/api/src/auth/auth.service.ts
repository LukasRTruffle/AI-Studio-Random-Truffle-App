/**
 * Auth Service for Random Truffle API
 *
 * Handles authentication logic with Okta OIDC
 */

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createOktaClient, type OktaClient, type OktaUser } from '@random-truffle/auth';
import { SessionEntity } from './entities/session.entity';
import type { AuthResponseDto, UserResponseDto, SessionResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private oktaClient: OktaClient;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>
  ) {
    // Initialize Okta client
    this.oktaClient = createOktaClient({
      domain: this.configService.get<string>('OKTA_DOMAIN') || '',
      clientId: this.configService.get<string>('OKTA_CLIENT_ID') || '',
      clientSecret: this.configService.get<string>('OKTA_CLIENT_SECRET') || '',
      issuer: this.configService.get<string>('OKTA_ISSUER') || '',
      redirectUri: this.configService.get<string>('OKTA_REDIRECT_URI') || '',
      scopes: ['openid', 'profile', 'email'],
    });
  }

  /**
   * Get authorization URL for OAuth login
   *
   * @returns Authorization URL
   */
  getAuthorizationUrl(): string {
    return this.oktaClient.getAuthorizationUrl();
  }

  /**
   * Handle OAuth callback and create session
   *
   * @param code - Authorization code from Okta
   * @param userAgent - User agent string
   * @param ipAddress - Client IP address
   * @returns Auth response with tokens
   */
  async handleCallback(
    code: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponseDto> {
    this.logger.log('Handling OAuth callback');

    try {
      // Exchange code for tokens
      const tokens = await this.oktaClient.exchangeCodeForTokens(code);

      // Verify ID token and extract user
      const payload = await this.oktaClient.verifyIdToken(tokens.idToken);
      const user = this.oktaClient.extractUser(payload);

      // Create session in database
      const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
      await this.createSession(
        user,
        tokens.accessToken,
        tokens.idToken,
        tokens.refreshToken,
        expiresAt,
        userAgent,
        ipAddress
      );

      this.logger.log(`Session created for user ${user.sub}`);

      return {
        user: this.mapToUserResponse(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      this.logger.error('Failed to handle callback', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Verify access token and get user
   *
   * @param accessToken - Access token
   * @returns User information
   */
  async verifyToken(accessToken: string): Promise<OktaUser> {
    try {
      const payload = await this.oktaClient.verifyAccessToken(accessToken);
      return this.oktaClient.extractUser(payload);
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Refresh access token
   *
   * @param refreshToken - Refresh token
   * @returns New access token and expiration
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const tokens = await this.oktaClient.refreshAccessToken(refreshToken);

      // Update session with new tokens
      const session = await this.sessionRepository.findOne({
        where: { refreshToken },
      });

      if (session) {
        session.accessToken = tokens.accessToken;
        session.idToken = tokens.idToken;
        session.expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
        session.lastAccessedAt = new Date();
        await this.sessionRepository.save(session);
      }

      return {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  /**
   * Logout user and revoke tokens
   *
   * @param accessToken - Access token
   */
  async logout(accessToken: string): Promise<void> {
    try {
      // Revoke token in Okta
      await this.oktaClient.revokeToken(accessToken, 'access_token');

      // Delete session from database
      await this.sessionRepository.delete({ accessToken });

      this.logger.log('User logged out successfully');
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw new Error('Failed to logout');
    }
  }

  /**
   * Get current user from access token
   *
   * @param accessToken - Access token
   * @returns User information
   */
  async getCurrentUser(accessToken: string): Promise<UserResponseDto> {
    const user = await this.verifyToken(accessToken);
    return this.mapToUserResponse(user);
  }

  /**
   * Get user session
   *
   * @param accessToken - Access token
   * @returns Session information
   */
  async getSession(accessToken: string): Promise<SessionResponseDto | null> {
    const session = await this.sessionRepository.findOne({
      where: { accessToken },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
      lastAccessedAt: session.lastAccessedAt.toISOString(),
    };
  }

  /**
   * Create session in database
   *
   * @param user - Okta user
   * @param accessToken - Access token
   * @param idToken - ID token
   * @param refreshToken - Refresh token
   * @param expiresAt - Expiration date
   * @param userAgent - User agent
   * @param ipAddress - IP address
   * @returns Session entity
   */
  private async createSession(
    user: OktaUser,
    accessToken: string,
    idToken: string,
    refreshToken: string | undefined,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string
  ): Promise<SessionEntity> {
    const session = this.sessionRepository.create({
      userId: user.sub,
      accessToken,
      refreshToken: refreshToken || null,
      idToken,
      expiresAt,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Map Okta user to user response DTO
   *
   * @param user - Okta user
   * @returns User response DTO
   */
  private mapToUserResponse(user: OktaUser): UserResponseDto {
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.picture,
      roles: user.roles || ['user'],
      tenantId: user.tenantId,
    };
  }

  /**
   * Clean up expired sessions (should be called periodically)
   */
  async cleanupExpiredSessions(): Promise<void> {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} expired sessions`);
  }
}
