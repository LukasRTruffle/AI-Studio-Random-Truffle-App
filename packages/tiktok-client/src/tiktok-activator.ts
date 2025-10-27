/**
 * TikTok Activator
 *
 * Extends BaseActivator for TikTok Custom Audiences (Segments)
 */

import { BaseActivator, type BaseActivatorConfig } from '@random-truffle/activation';
import type {
  ChannelConfig,
  UserIdentifier,
  ActivationResult,
  ActivationChannelStatus,
} from '@random-truffle/activation';
import { TikTokSegmentsClient } from './segments-api';
import type { TikTokIdentifierType } from './types';

/**
 * TikTok Activator
 *
 * Activates audiences to TikTok Custom Audiences (Segments)
 */
export class TikTokActivator extends BaseActivator {
  private client: TikTokSegmentsClient;

  constructor(config: BaseActivatorConfig) {
    super(config);
    this.client = new TikTokSegmentsClient(config.accessToken);
  }

  /**
   * Pre-flight checks for TikTok activation
   */
  protected async preflightCheck(
    config: ChannelConfig,
    identifiers: UserIdentifier[]
  ): Promise<void> {
    // Warn if too few identifiers
    if (identifiers.length < 1000) {
      console.warn(
        `Low identifier count (${identifiers.length}). TikTok recommends at least 1,000 identifiers for good match rates.`
      );
    }

    // Check minimum required (TikTok requires at least 1,000 for custom audiences)
    if (identifiers.length < 1000) {
      throw new Error(
        `TikTok requires at least 1,000 identifiers. Received: ${identifiers.length}`
      );
    }

    // TikTok supports only one identifier type per audience
    const types = new Set(identifiers.map((id) => id.type));
    if (types.size > 1) {
      throw new Error(
        `TikTok requires all identifiers to be the same type. Found: ${Array.from(types).join(', ')}`
      );
    }

    // Validate identifier type is supported by TikTok
    const idType = identifiers[0].type;
    const supportedTypes = ['email', 'phone', 'idfa', 'gaid'];
    if (!supportedTypes.includes(idType)) {
      throw new Error(
        `Unsupported identifier type for TikTok: ${idType}. Supported: ${supportedTypes.join(', ')}`
      );
    }

    // Validate advertiser ID format (TikTok uses numeric IDs)
    if (!/^\d+$/.test(config.accountId)) {
      throw new Error(`Invalid TikTok Advertiser ID format: ${config.accountId}. Must be numeric.`);
    }
  }

  /**
   * Create Custom Audience Segment on TikTok
   */
  protected async createAudience(
    config: ChannelConfig,
    _identifiers: UserIdentifier[]
  ): Promise<string> {
    const segment = await this.client.createSegment({
      advertiserId: config.accountId,
      name: config.audienceName,
      description: 'Audience created by Random Truffle',
      segmentType: 'CUSTOMAUDIENCE',
    });

    return segment.segmentId;
  }

  /**
   * Upload identifiers to Custom Audience Segment
   */
  protected async uploadIdentifiers(
    platformAudienceId: string,
    identifiers: UserIdentifier[]
  ): Promise<ActivationResult> {
    // Map identifier type to TikTok format
    const idType = this.mapIdentifierType(identifiers[0].type);

    // Extract hashed values (identifiers are already normalized and hashed)
    const hashedValues = identifiers
      .map((id) => id.hashedValue)
      .filter((v): v is string => v !== null && v !== undefined);

    // Upload to TikTok
    const result = await this.client.uploadIdentifiers({
      advertiserId: this.config.accountId,
      segmentId: platformAudienceId,
      identifierType: idType,
      identifiers: hashedValues,
    });

    const matchedUsers = result.uploadedCount;
    const totalSent = result.uploadedCount + result.invalidCount;
    const matchRate = totalSent > 0 ? (matchedUsers / totalSent) * 100 : 0;

    return {
      success: result.invalidCount === 0,
      platformAudienceId,
      matchedUserCount: matchedUsers,
      matchRate,
    };
  }

  /**
   * Delete Custom Audience Segment from TikTok
   */
  async deleteAudience(platformAudienceId: string): Promise<boolean> {
    try {
      await this.client.deleteSegment(this.config.accountId, platformAudienceId);
      return true;
    } catch (error) {
      console.error(
        `Failed to delete TikTok Custom Audience: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return false;
    }
  }

  /**
   * Get activation status
   */
  async getStatus(platformAudienceId: string): Promise<ActivationChannelStatus> {
    try {
      const segment = await this.client.getSegment(this.config.accountId, platformAudienceId);

      // Map TikTok status to activation status
      let status: ActivationChannelStatus['status'];
      switch (segment.status) {
        case 'READY':
          status = 'active';
          break;
        case 'CALCULATING':
          status = 'processing';
          break;
        case 'FAILED':
          status = 'failed';
          break;
        default:
          status = 'pending_approval';
      }

      return {
        channel: 'tiktok',
        accountId: this.config.accountId,
        platformAudienceId: segment.segmentId,
        audienceName: segment.name,
        status,
        matchedUserCount: segment.size,
        lastSyncedAt: new Date(),
      };
    } catch (error) {
      return {
        channel: 'tiktok',
        accountId: this.config.accountId,
        platformAudienceId,
        audienceName: 'Unknown',
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
    try {
      // Add identifiers
      let addResult: ActivationResult | undefined;
      if (identifiersToAdd.length > 0) {
        addResult = await this.uploadIdentifiers(platformAudienceId, identifiersToAdd);
      }

      // Remove identifiers
      if (identifiersToRemove && identifiersToRemove.length > 0) {
        const idType = this.mapIdentifierType(identifiersToRemove[0].type);
        const hashedValues = identifiersToRemove
          .map((id) => id.hashedValue)
          .filter((v): v is string => v !== null && v !== undefined);

        await this.client.removeIdentifiers({
          advertiserId: this.config.accountId,
          segmentId: platformAudienceId,
          identifierType: idType,
          identifiers: hashedValues,
        });
      }

      return addResult || { success: true, platformAudienceId };
    } catch (error) {
      return {
        success: false,
        platformAudienceId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Map internal identifier type to TikTok format
   */
  private mapIdentifierType(type: string): TikTokIdentifierType {
    switch (type.toLowerCase()) {
      case 'email':
        return 'EMAIL';
      case 'phone':
        return 'PHONE';
      case 'idfa':
        return 'IDFA';
      case 'gaid':
        return 'GAID';
      default:
        throw new Error(`Unsupported identifier type for TikTok: ${type}`);
    }
  }
}
