/**
 * Authentication Types for Random Truffle
 */

/**
 * Okta configuration
 */
export interface OktaConfig {
  /**
   * Okta domain (e.g., 'dev-12345678.okta.com')
   */
  domain: string;

  /**
   * Client ID from Okta application
   */
  clientId: string;

  /**
   * Client secret from Okta application
   */
  clientSecret: string;

  /**
   * Issuer URI (e.g., 'https://dev-12345678.okta.com/oauth2/default')
   */
  issuer: string;

  /**
   * Redirect URI after successful login
   */
  redirectUri: string;

  /**
   * Post logout redirect URI
   */
  postLogoutRedirectUri?: string;

  /**
   * OAuth scopes
   */
  scopes?: string[];
}

/**
 * User information from Okta ID token
 */
export interface OktaUser {
  /**
   * Unique user identifier (sub claim)
   */
  sub: string;

  /**
   * Email address
   */
  email: string;

  /**
   * Email verified
   */
  email_verified?: boolean;

  /**
   * Given name (first name)
   */
  given_name?: string;

  /**
   * Family name (last name)
   */
  family_name?: string;

  /**
   * Full name
   */
  name?: string;

  /**
   * Nickname
   */
  nickname?: string;

  /**
   * Profile picture URL
   */
  picture?: string;

  /**
   * User roles (custom claim)
   */
  roles?: string[];

  /**
   * Tenant ID (custom claim for multi-tenancy)
   */
  tenantId?: string;
}

/**
 * JWT payload after verification
 */
export interface JWTPayload extends OktaUser {
  /**
   * Issued at timestamp
   */
  iat: number;

  /**
   * Expiration timestamp
   */
  exp: number;

  /**
   * Issuer
   */
  iss: string;

  /**
   * Audience
   */
  aud: string;

  /**
   * Authorization server
   */
  auth_time?: number;
}

/**
 * Session data stored in database
 */
export interface Session {
  /**
   * Session ID (UUID)
   */
  id: string;

  /**
   * User ID
   */
  userId: string;

  /**
   * Access token
   */
  accessToken: string;

  /**
   * Refresh token (optional)
   */
  refreshToken?: string;

  /**
   * ID token
   */
  idToken: string;

  /**
   * Token expiration timestamp
   */
  expiresAt: Date;

  /**
   * Session created at
   */
  createdAt: Date;

  /**
   * Session last accessed
   */
  lastAccessedAt: Date;

  /**
   * User agent
   */
  userAgent?: string;

  /**
   * IP address
   */
  ipAddress?: string;
}

/**
 * User roles
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

/**
 * Auth guard options
 */
export interface AuthGuardOptions {
  /**
   * Required roles (if any)
   */
  roles?: UserRole[];

  /**
   * Allow if user has any of the roles (OR logic)
   * Default: false (AND logic - user must have all roles)
   */
  allowAny?: boolean;
}

/**
 * Auth request (extends Express Request)
 */
export interface AuthRequest {
  /**
   * Authenticated user
   */
  user?: OktaUser;

  /**
   * Session
   */
  session?: Session;

  /**
   * Access token
   */
  accessToken?: string;
}
