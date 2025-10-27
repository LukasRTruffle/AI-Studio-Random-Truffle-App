/**
 * Meta Marketing API v22.0 Types
 *
 * Documentation: https://developers.facebook.com/docs/marketing-api/reference/v22.0
 */

/**
 * Meta OAuth configuration
 */
export interface MetaOAuthConfig {
  appId: string; // Meta App ID
  appSecret: string; // Meta App Secret
  redirectUri: string; // OAuth redirect URI
}

/**
 * Meta OAuth tokens
 */
export interface MetaOAuthTokens {
  accessToken: string;
  tokenType: 'bearer';
  expiresIn?: number; // Seconds until token expires
}

/**
 * Meta ad account ID
 * Format: act_123456789
 */
export type MetaAdAccountId = string;

/**
 * Meta Custom Audience ID
 */
export type MetaCustomAudienceId = string;

/**
 * Meta user identifier types
 */
export type MetaIdentifierType =
  | 'EMAIL'
  | 'PHONE'
  | 'MADID'
  | 'FN'
  | 'LN'
  | 'FI'
  | 'DOBY'
  | 'DOBM'
  | 'DOBD'
  | 'GEN'
  | 'CT'
  | 'ST'
  | 'ZIP'
  | 'COUNTRY';

/**
 * Meta user identifier (hashed)
 */
export interface MetaUserIdentifier {
  [key: string]: string; // e.g., { EMAIL: "hashed_email", PHONE: "hashed_phone" }
}

/**
 * Custom Audience subtype
 */
export type CustomAudienceSubtype =
  | 'CUSTOM'
  | 'WEBSITE'
  | 'APP'
  | 'OFFLINE_CONVERSION'
  | 'CLAIM'
  | 'PARTNER'
  | 'MANAGED'
  | 'VIDEO'
  | 'LOOKALIKE'
  | 'ENGAGEMENT'
  | 'DATA_SET'
  | 'BAG_OF_ACCOUNTS'
  | 'STUDY_RULE_AUDIENCE'
  | 'FOX';

/**
 * Custom Audience customer file source
 */
export type CustomerFileSource =
  | 'USER_PROVIDED_ONLY'
  | 'PARTNER_PROVIDED_ONLY'
  | 'BOTH_USER_AND_PARTNER_PROVIDED';

/**
 * Create Custom Audience request
 */
export interface CreateCustomAudienceRequest {
  adAccountId: MetaAdAccountId;
  name: string;
  description?: string;
  subtype: CustomAudienceSubtype;
  customerFileSource?: CustomerFileSource;
}

/**
 * Custom Audience response
 */
export interface CustomAudienceResponse {
  id: MetaCustomAudienceId;
  name: string;
  description?: string;
  subtype: CustomAudienceSubtype;
  approximateCount?: number;
  deliveryStatus?: {
    code: number;
    description: string;
  };
}

/**
 * Add users to Custom Audience request
 */
export interface AddUsersRequest {
  adAccountId: MetaAdAccountId;
  customAudienceId: MetaCustomAudienceId;
  schema: MetaIdentifierType[];
  data: string[][]; // Array of arrays (each inner array is a user)
}

/**
 * Add users to Custom Audience response
 */
export interface AddUsersResponse {
  audienceId: MetaCustomAudienceId;
  sessionId: string;
  numReceived: number;
  numInvalidEntries: number;
  invalidEntryExamples?: {
    [key: string]: string;
  };
}

/**
 * Insights API breakdowns
 */
export type InsightsBreakdown =
  | 'age'
  | 'gender'
  | 'country'
  | 'region'
  | 'dma'
  | 'impression_device'
  | 'publisher_platform'
  | 'platform_position'
  | 'device_platform';

/**
 * Insights API time increment
 */
export type InsightsTimeIncrement = 'all_days' | 'monthly' | number; // number = days (1-90)

/**
 * Insights API request
 */
export interface InsightsRequest {
  adAccountId: MetaAdAccountId;
  datePreset?:
    | 'today'
    | 'yesterday'
    | 'this_month'
    | 'last_month'
    | 'this_quarter'
    | 'lifetime'
    | 'last_3d'
    | 'last_7d'
    | 'last_14d'
    | 'last_28d'
    | 'last_30d'
    | 'last_90d'
    | 'last_week_mon_sun'
    | 'last_week_sun_sat'
    | 'last_quarter'
    | 'last_year'
    | 'this_week_mon_today'
    | 'this_week_sun_today'
    | 'this_year';
  timeRange?: {
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
  };
  level: 'account' | 'campaign' | 'adset' | 'ad';
  fields: string[]; // e.g., ['impressions', 'clicks', 'spend', 'actions']
  breakdowns?: InsightsBreakdown[];
  timeIncrement?: InsightsTimeIncrement;
  filtering?: Array<{
    field: string;
    operator:
      | 'EQUAL'
      | 'NOT_EQUAL'
      | 'GREATER_THAN'
      | 'GREATER_THAN_OR_EQUAL'
      | 'LESS_THAN'
      | 'LESS_THAN_OR_EQUAL'
      | 'IN'
      | 'NOT_IN'
      | 'CONTAIN'
      | 'NOT_CONTAIN'
      | 'IN_RANGE'
      | 'NOT_IN_RANGE';
    value: string | string[];
  }>;
}

/**
 * Insights API response (single row)
 */
export interface InsightsRow {
  date_start: string;
  date_stop: string;
  account_id?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  impressions?: string;
  clicks?: string;
  spend?: string;
  reach?: string;
  frequency?: string;
  cpm?: string;
  cpc?: string;
  ctr?: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  action_values?: Array<{
    action_type: string;
    value: string;
  }>;
  cost_per_action_type?: Array<{
    action_type: string;
    value: string;
  }>;
  [key: string]: unknown;
}

/**
 * Insights API response
 */
export interface InsightsResponse {
  data: InsightsRow[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

/**
 * Meta API error response
 */
export interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
    fbtrace_id: string;
  };
}

/**
 * Meta campaign performance data (for BigQuery)
 */
export interface MetaCampaignPerformance {
  date: string;
  accountId: string;
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spend: number; // In account currency
  conversions: number;
  conversionValue: number;
  currency: string;
}
