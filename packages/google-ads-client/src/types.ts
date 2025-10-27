/**
 * Google Ads API v22 Types for Random Truffle
 *
 * Customer Match, Reporting API, and BigQuery Data Transfer
 */

/**
 * Google Ads customer ID (10 digits, no hyphens)
 */
export type CustomerId = string;

/**
 * Customer Match upload key type
 */
export type UploadKeyType = 'CONTACT_INFO' | 'CRM_ID' | 'MOBILE_ADVERTISING_ID';

/**
 * Offline user data job type
 */
export type OfflineUserDataJobType = 'CUSTOMER_MATCH_USER_LIST' | 'CUSTOMER_MATCH_WITH_ATTRIBUTES';

/**
 * Job status
 */
export type JobStatus =
  | 'UNSPECIFIED'
  | 'UNKNOWN'
  | 'PENDING'
  | 'RUNNING'
  | 'DONE'
  | 'FAILED'
  | 'CANCELED';

/**
 * User identifier for Customer Match
 */
export interface GoogleAdsUserIdentifier {
  hashedEmail?: string; // SHA-256 hashed, normalized
  hashedPhoneNumber?: string; // SHA-256 hashed, E.164 format
  mobileId?: string; // SHA-256 hashed IDFA/AAID
  thirdPartyUserId?: string; // CRM ID
  addressInfo?: {
    hashedFirstName?: string;
    hashedLastName?: string;
    countryCode?: string;
    zipCode?: string;
  };
}

/**
 * User data for offline job
 */
export interface OfflineUserData {
  userIdentifiers: GoogleAdsUserIdentifier[];
  transactionAttribute?: {
    transactionDateTimeMicros?: string;
    transactionAmountMicros?: number;
    currencyCode?: string;
  };
}

/**
 * Customer Match user list configuration
 */
export interface CustomerMatchUserListConfig {
  name: string;
  description?: string;
  membershipLifeSpan: number; // 1-540 days (max as of April 2025)
  uploadKeyType: UploadKeyType;
  customerId: CustomerId;
}

/**
 * Offline user data job request
 */
export interface OfflineUserDataJobRequest {
  customerId: CustomerId;
  jobType: OfflineUserDataJobType;
  userListResourceName?: string; // For adding to existing list
  operations: OfflineUserDataOperation[];
  enablePartialFailure?: boolean;
  validateOnly?: boolean;
}

/**
 * Offline user data operation
 */
export interface OfflineUserDataOperation {
  create?: OfflineUserData;
  remove?: OfflineUserData;
}

/**
 * Offline user data job response
 */
export interface OfflineUserDataJobResponse {
  resourceName: string; // Format: customers/{customer_id}/offlineUserDataJobs/{job_id}
  status: JobStatus;
  type: OfflineUserDataJobType;
  failureReason?: string;
  stats?: {
    matchRatePercentage?: number;
    validIdentifiersCount?: number;
    invalidIdentifiersCount?: number;
  };
}

/**
 * Google Ads Reporting API query
 */
export interface GoogleAdsQuery {
  customerId: CustomerId;
  query: string; // GAQL (Google Ads Query Language)
  pageSize?: number;
  pageToken?: string;
}

/**
 * Campaign performance metrics
 */
export interface CampaignPerformance {
  date: string; // YYYY-MM-DD
  customerId: CustomerId;
  campaignId: string;
  campaignName: string;
  campaignStatus: 'ENABLED' | 'PAUSED' | 'REMOVED';
  impressions: number;
  clicks: number;
  costMicros: number; // Cost in micro currency units (divide by 1,000,000)
  conversions: number;
  conversionValue: number;
  allConversions: number;
  allConversionsValue: number;
  currency: string;
}

/**
 * Ad group performance metrics
 */
export interface AdGroupPerformance {
  date: string;
  customerId: CustomerId;
  campaignId: string;
  adGroupId: string;
  adGroupName: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
  conversionValue: number;
  currency: string;
}

/**
 * Google Ads OAuth configuration
 */
export interface GoogleAdsOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  developerToken: string; // Google Ads API developer token
}

/**
 * OAuth tokens
 */
export interface GoogleAdsOAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
}

/**
 * BigQuery Data Transfer configuration for Google Ads
 */
export interface BigQueryDataTransferConfig {
  projectId: string;
  datasetId: string;
  customerId: CustomerId;
  displayName: string;
  schedule?: string; // Cron expression (e.g., "every day 03:00")
  params: {
    customer_id: string;
  };
}

/**
 * Google Ads client configuration
 */
export interface GoogleAdsClientConfig {
  customerId: CustomerId;
  developerToken: string;
  accessToken: string;
  refreshToken?: string;
  loginCustomerId?: CustomerId; // For manager accounts
}

/**
 * Error response from Google Ads API
 */
export interface GoogleAdsError {
  code: number;
  message: string;
  status: string;
  details?: {
    requestId?: string;
    errors?: Array<{
      errorCode: string;
      message: string;
      location?: {
        fieldPathElements?: Array<{ fieldName: string }>;
      };
    }>;
  };
}
