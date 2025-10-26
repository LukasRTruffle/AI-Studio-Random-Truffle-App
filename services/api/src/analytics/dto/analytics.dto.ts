import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';

export enum GroupBy {
  DATE = 'date',
  DEVICE = 'device',
  COUNTRY = 'country',
  TRAFFIC_SOURCE = 'traffic_source',
}

export enum CurrencyCode {
  USD = 'USD',
  MXN = 'MXN',
  COP = 'COP',
}

export class GetKPIsDto {
  @IsString()
  startDate: string; // YYYY-MM-DD

  @IsString()
  endDate: string; // YYYY-MM-DD

  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;
}

export class GetSessionTrendsDto {
  @IsString()
  startDate: string; // YYYY-MM-DD

  @IsString()
  endDate: string; // YYYY-MM-DD

  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class GetAudienceMetricsDto {
  @IsString()
  audienceId: string;

  @IsString()
  startDate: string; // YYYY-MM-DD

  @IsString()
  endDate: string; // YYYY-MM-DD
}
