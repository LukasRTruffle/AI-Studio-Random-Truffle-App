/**
 * Activation Types for Random Truffle
 *
 * Multi-channel audience activation to advertising platforms
 */

/**
 * Supported activation channels
 */
export type ActivationChannel = 'google-ads' | 'meta' | 'tiktok';

/**
 * Activation status
 */
export type ActivationStatus =
  | 'pending_approval' // Waiting for SuperAdmin approval (HITL)
  | 'approved' // Approved, ready to execute
  | 'rejected' // Rejected by SuperAdmin
  | 'processing' // Uploading to platform
  | 'active' // Successfully activated
  | 'failed' // Activation failed
  | 'paused' // Paused by user
  | 'expired'; // Past membership duration

/**
 * Identifier type for audience matching
 */
export type IdentifierType =
  | 'email' // SHA-256 hashed email
  | 'phone' // SHA-256 hashed phone (E.164 format)
  | 'mobile_ad_id' // SHA-256 hashed IDFA/AAID
  | 'crm_id'; // SHA-256 hashed CRM ID

/**
 * User identifier for activation
 */
export interface UserIdentifier {
  type: IdentifierType;
  value: string; // Raw value (will be hashed)
  hashedValue?: string; // SHA-256 hashed value
}

/**
 * Platform-specific configuration
 */
export interface ChannelConfig {
  channel: ActivationChannel;
  accountId: string; // customer_id, ad_account_id, advertiser_id
  audienceName: string; // Name on the platform
  membershipDurationDays?: number; // Google Ads: max 540
  complianceFlags?: {
    housing?: boolean; // Meta: housing ads compliance
    employment?: boolean; // Meta: employment ads compliance
    financial?: boolean; // Meta: financial services compliance
  };
}

/**
 * Activation request
 */
export interface ActivationRequest {
  audienceId: string; // Random Truffle audience ID
  channels: ChannelConfig[]; // Multi-channel support
  identifiers: UserIdentifier[]; // User identifiers to upload
  requiresApproval: boolean; // HITL flag
  requestedBy: {
    userId: string;
    tenantId: string;
    userRole: 'user' | 'admin' | 'superadmin';
  };
}

/**
 * Activation record
 */
export interface Activation {
  id: string; // UUID
  audienceId: string;
  status: ActivationStatus;
  channels: ActivationChannelStatus[];
  identifierCount: number;
  identifierTypes: IdentifierType[];
  requiresApproval: boolean;
  approvalStatus?: {
    approvedBy?: string;
    approvedAt?: Date;
    rejectedBy?: string;
    rejectedAt?: Date;
    rejectionReason?: string;
  };
  createdBy: string; // userId
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

/**
 * Per-channel activation status
 */
export interface ActivationChannelStatus {
  channel: ActivationChannel;
  accountId: string;
  audienceName: string;
  platformAudienceId?: string; // ID on the platform
  status: ActivationStatus;
  matchRate?: number; // % of identifiers matched (0-100)
  matchedUserCount?: number;
  errorMessage?: string;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  lastSyncedAt?: Date;
}

/**
 * Activation response
 */
export interface ActivationResponse {
  success: boolean;
  activation?: Activation;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Activation statistics
 */
export interface ActivationStats {
  totalActivations: number;
  activeActivations: number;
  failedActivations: number;
  avgMatchRate: number; // Average across all channels
  channelBreakdown: {
    channel: ActivationChannel;
    count: number;
    avgMatchRate: number;
  }[];
  identifierTypeBreakdown: {
    type: IdentifierType;
    count: number;
  }[];
}

/**
 * Connected account for a platform
 */
export interface ConnectedAccount {
  id: string;
  channel: ActivationChannel;
  accountId: string; // Platform account ID
  accountName: string; // Display name
  accessToken: string; // Encrypted, stored in Secret Manager
  refreshToken?: string;
  expiresAt: Date;
  tenantId: string;
  connectedBy: string; // userId
  connectedAt: Date;
  lastUsedAt?: Date;
}

/**
 * OAuth connection request
 */
export interface OAuthConnectionRequest {
  channel: ActivationChannel;
  authorizationCode: string;
  redirectUri: string;
  tenantId: string;
  userId: string;
}

/**
 * OAuth connection response
 */
export interface OAuthConnectionResponse {
  success: boolean;
  account?: ConnectedAccount;
  error?: {
    code: string;
    message: string;
  };
}
