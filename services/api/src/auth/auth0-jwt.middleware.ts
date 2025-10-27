/**
 * Auth0 JWT Verification Middleware
 *
 * Verifies JWT tokens from Auth0 on incoming API requests
 */

/* eslint-disable @typescript-eslint/no-namespace */

import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

interface JwtPayload {
  sub: string; // User ID
  email?: string;
  name?: string;
  'https://random-truffle.com/roles'?: string[];
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

// Extend Express Request to include user

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

@Injectable()
export class Auth0JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger(Auth0JwtMiddleware.name);
  private client: jwksClient.JwksClient | undefined;
  private domain: string | undefined;
  private audience: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.domain = this.configService.get<string>('AUTH0_DOMAIN');
    this.audience = this.configService.get<string>('AUTH0_AUDIENCE');

    if (!this.domain || !this.audience) {
      this.logger.warn('AUTH0_DOMAIN or AUTH0_AUDIENCE not configured - JWT verification disabled');
      return;
    }

    // Initialize JWKS client to fetch Auth0 public keys
    this.client = new jwksClient.JwksClient({
      jwksUri: `https://${this.domain}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
    });
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    // Skip auth for public endpoints
    if (this.isPublicEndpoint(req.path)) {
      return next();
    }

    // Skip if Auth0 not configured (development mode)
    if (!this.domain || !this.audience || !this.client) {
      this.logger.warn('Auth0 not configured - allowing request without authentication');
      return next();
    }

    try {
      // Extract token from Authorization header
      const token = this.extractToken(req);

      if (!token) {
        throw new UnauthorizedException('No authorization token provided');
      }

      // Verify and decode token
      const decoded = await this.verifyToken(token);

      // Attach user to request
      req.user = decoded;

      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('JWT verification failed:', errorMessage);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Extract JWT token from Authorization header
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Verify JWT token with Auth0 public key
   */
  private verifyToken(token: string): Promise<JwtPayload> {
    if (!this.client) {
      return Promise.reject(new Error('Auth0 client not initialized'));
    }

    return new Promise((resolve, reject) => {
      // Decode header to get key ID
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded || typeof decoded === 'string') {
        return reject(new Error('Invalid token format'));
      }

      const kid = decoded.header.kid;

      if (!this.client) {
        return reject(new Error('Auth0 client not initialized'));
      }

      // Get signing key from JWKS
      this.client.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(err);
        }

        if (!key) {
          return reject(new Error('No signing key found'));
        }

        const signingKey = key.getPublicKey();

        // Verify token
        jwt.verify(
          token,
          signingKey,
          {
            audience: this.audience,
            issuer: `https://${this.domain}/`,
            algorithms: ['RS256'],
          },
          (verifyErr, decoded) => {
            if (verifyErr) {
              return reject(verifyErr);
            }

            resolve(decoded as JwtPayload);
          }
        );
      });
    });
  }

  /**
   * Check if endpoint is public (doesn't require auth)
   */
  private isPublicEndpoint(path: string): boolean {
    const publicPaths = [
      '/api', // Root API info
      '/api/health', // Health check
      '/api/auth/meta/callback', // OAuth callbacks
    ];

    return publicPaths.some((publicPath) => path.startsWith(publicPath));
  }
}
