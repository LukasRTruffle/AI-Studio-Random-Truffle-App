/**
 * TikTok Business API v1.3 Types
 * Documentation: https://business-api.tiktok.com/portal/docs
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
  advertiserIds?: string[];
}

export type TikTokAdvertiserId = string;
export type TikTokSegmentId = string;
export type TikTokIdentifierType = 'EMAIL' | 'PHONE' | 'IDFA' | 'GAID';
export type SegmentType = 'CUSTOMAUDIENCE' | 'LOOKALIKE' | 'SAVED_AUDIENCE';

export interface CreateSegmentRequest {
  advertiserId: TikTokAdvertiserId;
  name: string;
  description?: string;
  segmentType?: SegmentType;
}

export interface SegmentResponse {
  segmentId: TikTokSegmentId;
  name: string;
  description?: string;
  size?: number;
  status?: 'CALCULATING' | 'READY' | 'FAILED';
  createTime?: string;
}

export interface UploadIdentifiersRequest {
  advertiserId: TikTokAdvertiserId;
  segmentId: TikTokSegmentId;
  identifierType: TikTokIdentifierType;
  identifiers: string[];
}

export interface UploadIdentifiersResponse {
  segmentId: TikTokSegmentId;
  uploadedCount: number;
  invalidCount: number;
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

export interface TikTokApiResponse<T> {
  code: number;
  message: string;
  request_id: string;
  data: T;
}
