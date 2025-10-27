/**
 * Auth Service for Random Truffle API
 *
 * Handles authentication logic with Okta OIDC
 */

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Okta imports disabled until Phase 1 - auth package has type errors
// import { createOktaClient, type OktaClient, type OktaUser } from '@random-truffle/auth';
import { SessionEntity } from './entities/session.entity';
import type { AuthResponseDto, UserResponseDto, SessionResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // private oktaClient: OktaClient; // Disabled until Phase 1

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>
  ) {
    // Okta client initialization disabled until Phase 1
    // this.oktaClient = createOktaClient({
    //   domain: this.configService.get<string>('OKTA_DOMAIN') || '',
    //   clientId: this.configService.get<string>('OKTA_CLIENT_ID') || '',
    //   clientSecret: this.configService.get<string>('OKTA_CLIENT_SECRET') || '',
    //   issuer: this.configService.get<string>('OKTA_ISSUER') || '',
    //   redirectUri: this.configService.get<string>('OKTA_REDIRECT_URI') || '',
    //   scopes: ['openid', 'profile', 'email'],
    // });
    this.logger.warn(
      'Auth service is using placeholder implementation - Okta OIDC will be implemented in Phase 1'
    );
  }

  /**
   * Get authorization URL for OAuth login
   * TODO: Implement in Phase 1
   *
   * @returns Authorization URL
   */
  getAuthorizationUrl(): string {
    // return this.oktaClient.getAuthorizationUrl();
    throw new UnauthorizedException('Authentication not yet implemented - Phase 1');
  }

  /**
   * Handle OAuth callback and create session
   * TODO: Implement in Phase 1
   *
   * @param code - Authorization code from Okta
   * @param userAgent - User agent string
   * @param ipAddress - Client IP address
   * @returns Auth response with tokens
   */
  async handleCallback(
    _code: string,
    _userAgent?: string,
    _ipAddress?: string
  ): Promise<AuthResponseDto> {
    throw new UnauthorizedException(
      'Authentication not yet implemented - Phase 1. Use Auth0 for POC demo.'
    );
  }

  /**
   * Verify access token and get user
   * TODO: Implement in Phase 1
   *
   * @param accessToken - Access token
   * @returns User information
   */
  async verifyToken(_accessToken: string): Promise<UserResponseDto> {
    throw new UnauthorizedException(
      'Authentication not yet implemented - Phase 1. Use Auth0 for POC demo.'
    );
  }

  /**
   * Refresh access token
   * TODO: Implement in Phase 1
   *
   * @param refreshToken - Refresh token
   * @returns New access token and expiration
   */
  async refreshAccessToken(_refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    throw new UnauthorizedException(
      'Authentication not yet implemented - Phase 1. Use Auth0 for POC demo.'
    );
  }

  /**
   * Logout user and revoke tokens
   * TODO: Implement in Phase 1
   *
   * @param accessToken - Access token
   */
  async logout(_accessToken: string): Promise<void> {
    throw new UnauthorizedException(
      'Authentication not yet implemented - Phase 1. Use Auth0 for POC demo.'
    );
  }

  /**
   * Get current user from access token
   * TODO: Implement in Phase 1
   *
   * @param accessToken - Access token
   * @returns User information
   */
  async getCurrentUser(accessToken: string): Promise<UserResponseDto> {
    return this.verifyToken(accessToken);
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
