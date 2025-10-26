/**
 * Auth Controller for Random Truffle API
 *
 * REST endpoints for authentication
 */

import {
  Controller,
  Get,
  Post,
  Query,
  Headers,
  Redirect,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthCallbackDto, RefreshTokenDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Initiate OAuth login
   *
   * GET /api/auth/login
   *
   * Redirects to Okta authorization page with social login options
   */
  @Public()
  @Get('login')
  @Redirect()
  login() {
    const authorizationUrl = this.authService.getAuthorizationUrl();
    return { url: authorizationUrl, statusCode: HttpStatus.FOUND };
  }

  /**
   * OAuth callback handler
   *
   * GET /api/auth/callback?code=xxx
   *
   * Handles OAuth redirect from Okta after successful login
   */
  @Public()
  @Get('callback')
  async callback(@Query() query: AuthCallbackDto, @Req() req: Request) {
    const { code } = query;

    if (!code) {
      throw new UnauthorizedException('Authorization code is missing');
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = (req.ip || req.socket.remoteAddress) as string;

    const authResponse = await this.authService.handleCallback(code, userAgent, ipAddress);

    return {
      success: true,
      data: authResponse,
    };
  }

  /**
   * Get current user
   *
   * GET /api/auth/me
   *
   * Returns current user information from access token
   */
  @Get('me')
  async getCurrentUser(@Headers('authorization') authorization: string) {
    const accessToken = this.extractToken(authorization);
    const user = await this.authService.getCurrentUser(accessToken);

    return {
      success: true,
      data: user,
    };
  }

  /**
   * Get current session
   *
   * GET /api/auth/session
   *
   * Returns current session information
   */
  @Get('session')
  async getSession(@Headers('authorization') authorization: string) {
    const accessToken = this.extractToken(authorization);
    const session = await this.authService.getSession(accessToken);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    return {
      success: true,
      data: session,
    };
  }

  /**
   * Refresh access token
   *
   * POST /api/auth/refresh
   *
   * Refreshes access token using refresh token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Query() dto: RefreshTokenDto) {
    const tokens = await this.authService.refreshAccessToken(dto.refreshToken);

    return {
      success: true,
      data: tokens,
    };
  }

  /**
   * Logout
   *
   * POST /api/auth/logout
   *
   * Revokes tokens and deletes session
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authorization: string) {
    const accessToken = this.extractToken(authorization);
    await this.authService.logout(accessToken);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Extract bearer token from authorization header
   *
   * @param authorization - Authorization header
   * @returns Access token
   */
  private extractToken(authorization: string | undefined): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return parts[1];
  }
}
