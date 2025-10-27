/**
 * TikTok Business API v1.3 Client
 *
 * Exports:
 * - TikTokOAuthClient: OAuth 2.0 flow
 * - TikTokSegmentsClient: Custom Audiences (Segments) API
 * - TikTokReportingClient: Reporting API (campaign performance)
 * - TikTokActivator: Activation orchestrator
 * - Types: All TikTok API types
 */

export { TikTokOAuthClient } from './oauth-client';
export { TikTokSegmentsClient } from './segments-api';
export { TikTokReportingClient } from './reporting-api';
export { TikTokActivator } from './tiktok-activator';

export type {
  TikTokOAuthConfig,
  TikTokOAuthTokens,
  TikTokAdvertiserId,
  TikTokSegmentId,
  TikTokIdentifierType,
  SegmentType,
  CreateSegmentRequest,
  SegmentResponse,
  UploadIdentifiersRequest,
  UploadIdentifiersResponse,
  TikTokCampaignPerformance,
  TikTokApiError,
  TikTokApiResponse,
} from './types';
