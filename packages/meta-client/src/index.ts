/**
 * Meta Marketing API v22.0 Client
 *
 * Exports:
 * - MetaOAuthClient: OAuth 2.0 flow
 * - MetaCustomAudiencesClient: Custom Audiences API
 * - MetaInsightsClient: Insights API (reporting)
 * - MetaActivator: Activation orchestrator
 * - Types: All Meta API types
 */

export { MetaOAuthClient } from './oauth-client';
export { MetaCustomAudiencesClient } from './custom-audiences';
export { MetaInsightsClient } from './insights-api';
export { MetaActivator } from './meta-activator';

export type {
  MetaOAuthConfig,
  MetaOAuthTokens,
  MetaAdAccountId,
  MetaCustomAudienceId,
  MetaIdentifierType,
  MetaUserIdentifier,
  CustomAudienceSubtype,
  CustomerFileSource,
  CreateCustomAudienceRequest,
  CustomAudienceResponse,
  AddUsersRequest,
  AddUsersResponse,
  InsightsBreakdown,
  InsightsTimeIncrement,
  InsightsRequest,
  InsightsRow,
  InsightsResponse,
  MetaApiError,
  MetaCampaignPerformance,
} from './types';
