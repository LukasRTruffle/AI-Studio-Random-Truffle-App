/**
 * Google Ads Activator
 *
 * Extends BaseActivator to implement Google Ads Customer Match activation
 */

import {
  BaseActivator,
  type BaseActivatorConfig,
  type ActivationResult,
  type ActivationChannelStatus,
} from '@random-truffle/activation';
import type {
  UserIdentifier,
  ChannelConfig,
} from '@random-truffle/activation';
import { CustomerMatchClient } from './customer-match';
import type {
  CustomerId,
  GoogleAdsClientConfig,
  GoogleAdsUserIdentifier,
  UploadKeyType,
} from './types';

/**
 * Google Ads specific configuration
 */
export interface GoogleAdsActivatorConfig extends BaseActivatorConfig {
  channel: 'google-ads';
  customerId: CustomerId;
  developerToken: string;
  refreshToken?: string;
  loginCustomerId?: CustomerId;
}

/**
 * Google Ads Activator
 */
export class GoogleAdsActivator extends BaseActivator {
  private customerMatchClient: CustomerMatchClient;
  private googleAdsConfig: GoogleAdsActivatorConfig;

  constructor(config: GoogleAdsActivatorConfig) {
    super(config);
    this.googleAdsConfig = config;

    const clientConfig: GoogleAdsClientConfig = {
      customerId: config.customerId,
      developerToken: config.developerToken,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      loginCustomerId: config.loginCustomerId,
    };

    this.customerMatchClient = new CustomerMatchClient(clientConfig);
  }

  /**
   * Platform-specific pre-flight checks
   */
  protected async preflightCheck(
    config: ChannelConfig,
    identifiers: UserIdentifier[]
  ): Promise<void> {
    // Check minimum identifier count (Google Ads doesn't have hard minimum, but warn if too few)
    if (identifiers.length < 100) {
      console.warn(
        `Low identifier count (${identifiers.length}). Match rate may be low with <100 identifiers.`
      );
    }

    // Validate membership duration (max 540 days as of April 2025)
    if (config.membershipDurationDays && config.membershipDurationDays > 540) {
      throw new Error(
        `Membership duration ${config.membershipDurationDays} exceeds maximum of 540 days`
      );
    }

    // Check all identifiers are same type (required by Google Ads)
    const types = new Set(identifiers.map((id) => id.type));
    if (types.size > 1) {
      throw new Error(
        `Google Ads requires all identifiers to be the same type. Found: ${Array.from(types).join(', ')}`
      );
    }
  }

  /**
   * Create audience on Google Ads
   */
  protected async createAudience(
    config: ChannelConfig,
    identifiers: UserIdentifier[]
  ): Promise<string> {
    // Determine upload key type from identifier type
    const uploadKeyType = this.getUploadKeyType(identifiers[0].type);

    // Create user list
    const { resourceName } = await this.customerMatchClient.createUserList({
      name: config.audienceName,
      description: `Created by Random Truffle on ${new Date().toISOString()}`,
      membershipLifeSpan: config.membershipDurationDays || 540, // Default to max
      uploadKeyType,
      customerId: this.googleAdsConfig.customerId,
    });

    return resourceName;
  }

  /**
   * Upload identifiers to Google Ads Customer Match
   */
  protected async uploadIdentifiers(
    platformAudienceId: string,
    identifiers: UserIdentifier[]
  ): Promise<ActivationResult> {
    const startTime = Date.now();

    try {
      // Convert to Google Ads format
      const googleAdsIdentifiers = identifiers.map((id) =>
        this.convertToGoogleAdsIdentifier(id)
      );

      // Upload in batches (Google Ads recommended: 5000 per batch)
      const job = await this.customerMatchClient.uploadIdentifiers(
        this.googleAdsConfig.customerId,
        platformAudienceId,
        googleAdsIdentifiers,
        5000
      );

      // Poll for job completion (with timeout)
      const finalJobStatus = await this.pollJobStatus(
        job.resourceName,
        60000 // 60 second timeout
      );

      const processingTime = Date.now() - startTime;

      return {
        success: finalJobStatus.status === 'DONE',
        platformAudienceId,
        matchRate: finalJobStatus.stats?.matchRatePercentage,
        matchedUserCount: finalJobStatus.stats?.validIdentifiersCount,
        errorMessage: finalJobStatus.failureReason,
        processingTime,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get activation status from Google Ads
   */
  async getStatus(platformAudienceId: string): Promise<ActivationChannelStatus> {
    try {
      // Extract user list ID from resource name
      const userListId = platformAudienceId.split('/').pop() || '';

      const userList = await this.customerMatchClient.getUserList(
        this.googleAdsConfig.customerId,
        userListId
      );

      return {
        channel: 'google-ads',
        accountId: this.googleAdsConfig.customerId,
        audienceName: userList.name,
        platformAudienceId,
        status: 'active',
        matchedUserCount: parseInt(userList.sizeForDisplay || '0', 10),
      };
    } catch (error) {
      return {
        channel: 'google-ads',
        accountId: this.googleAdsConfig.customerId,
        audienceName: '',
        platformAudienceId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update audience (add/remove identifiers)
   */
  async updateAudience(
    platformAudienceId: string,
    identifiersToAdd: UserIdentifier[],
    identifiersToRemove?: UserIdentifier[]
  ): Promise<ActivationResult> {
    const startTime = Date.now();

    try {
      // Add identifiers
      if (identifiersToAdd.length > 0) {
        const googleAdsIdentifiers = identifiersToAdd.map((id) =>
          this.convertToGoogleAdsIdentifier(id)
        );

        await this.customerMatchClient.uploadIdentifiers(
          this.googleAdsConfig.customerId,
          platformAudienceId,
          googleAdsIdentifiers
        );
      }

      // Remove identifiers
      if (identifiersToRemove && identifiersToRemove.length > 0) {
        const googleAdsIdentifiers = identifiersToRemove.map((id) =>
          this.convertToGoogleAdsIdentifier(id)
        );

        await this.customerMatchClient.removeIdentifiers(
          this.googleAdsConfig.customerId,
          platformAudienceId,
          googleAdsIdentifiers
        );
      }

      return {
        success: true,
        platformAudienceId,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Delete audience from Google Ads
   */
  async deleteAudience(_platformAudienceId: string): Promise<boolean> {
    // Note: Google Ads doesn't allow deleting user lists via API
    // You can only remove them via the UI
    // Return false to indicate this operation is not supported
    console.warn('Google Ads does not support deleting user lists via API');
    return false;
  }

  /**
   * Convert Random Truffle identifier to Google Ads format
   */
  private convertToGoogleAdsIdentifier(
    identifier: UserIdentifier
  ): GoogleAdsUserIdentifier {
    const googleAdsId: GoogleAdsUserIdentifier = {};

    switch (identifier.type) {
      case 'email':
        googleAdsId.hashedEmail = identifier.hashedValue;
        break;
      case 'phone':
        googleAdsId.hashedPhoneNumber = identifier.hashedValue;
        break;
      case 'mobile_ad_id':
        googleAdsId.mobileId = identifier.hashedValue;
        break;
      case 'crm_id':
        googleAdsId.thirdPartyUserId = identifier.hashedValue;
        break;
    }

    return googleAdsId;
  }

  /**
   * Get Google Ads upload key type from Random Truffle identifier type
   */
  private getUploadKeyType(identifierType: string): UploadKeyType {
    switch (identifierType) {
      case 'email':
      case 'phone':
        return 'CONTACT_INFO';
      case 'mobile_ad_id':
        return 'MOBILE_ADVERTISING_ID';
      case 'crm_id':
        return 'CRM_ID';
      default:
        throw new Error(`Unsupported identifier type: ${identifierType}`);
    }
  }

  /**
   * Poll job status until done or timeout
   */
  private async pollJobStatus(
    jobResourceName: string,
    timeoutMs: number = 60000
  ): Promise<any> {
    const startTime = Date.now();
    const pollIntervalMs = 2000; // Poll every 2 seconds

    while (Date.now() - startTime < timeoutMs) {
      const jobStatus = await this.customerMatchClient.getOfflineUserDataJob(
        jobResourceName
      );

      if (jobStatus.status === 'DONE' || jobStatus.status === 'FAILED') {
        return jobStatus;
      }

      await this.sleep(pollIntervalMs);
    }

    throw new Error('Job polling timeout');
  }
}
