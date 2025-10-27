/**
 * TikTok Business API v1.3 Types
 */

export interface TikTokOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export interface TikTokOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  refreshExpiresIn?: number;
  tokenType: 'bearer';
}

export type TikTokAdvertiserId = string;
export type TikTokSegmentId = string;

export interface CreateSegmentRequest {
  advertiserId: TikTokAdvertiserId;
  name: string;
  description?: string;
}

export interface SegmentResponse {
  segmentId: TikTokSegmentId;
  name: string;
  size?: number;
}

export interface UploadIdentifiersRequest {
  advertiserId: TikTokAdvertiserId;
  segmentId: TikTokSegmentId;
  identifierType: 'EMAIL' | 'PHONE' | 'IDFA' | 'GAID';
  identifiers: string[];
}

export interface TikTokCampaignPerformance {
  date: string;
  advertiserId: string;
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  currency: string;
}

export interface TikTokApiError {
  code: number;
  message: string;
  data?: unknown;
}
