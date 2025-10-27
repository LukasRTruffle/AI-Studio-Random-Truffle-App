import { IsString, IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreatePlatformConnectionDto {
  @IsUUID()
  tenantId: string;

  @IsEnum(['google-ads', 'meta', 'tiktok'])
  platform: 'google-ads' | 'meta' | 'tiktok';

  @IsString()
  accountId: string;

  @IsString()
  accountName: string;

  @IsString()
  accessToken: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsOptional()
  expiresAt?: Date;

  @IsObject()
  @IsOptional()
  metadata?: {
    currency?: string;
    timezone?: string;
    accountStatus?: string;
    permissions?: string[];
  };
}
