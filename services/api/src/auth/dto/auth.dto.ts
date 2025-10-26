/**
 * DTOs for Authentication API
 */

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * OAuth callback DTO
 */
export class AuthCallbackDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  state?: string;
}

/**
 * Refresh token DTO
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

/**
 * User response DTO
 */
export interface UserResponseDto {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  roles: string[];
  tenantId?: string;
}

/**
 * Auth response DTO
 */
export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Session response DTO
 */
export interface SessionResponseDto {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  lastAccessedAt: string;
}
