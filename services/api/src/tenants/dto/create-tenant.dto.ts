import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

/**
 * DTO for creating a new tenant workspace
 */
export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  teamSize: string;

  @IsString()
  @IsOptional()
  primaryGoal?: string;

  @IsArray()
  @IsOptional()
  platforms?: string[];

  @IsBoolean()
  @IsOptional()
  hasGA4?: boolean;

  @IsOptional()
  settings?: {
    timezone?: string;
    currency?: string;
    language?: string;
  };
}
