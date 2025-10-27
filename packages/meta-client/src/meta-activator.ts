/**
 * Meta Activator
 *
 * Extends BaseActivator for Meta Custom Audiences
 */

import { BaseActivator, type BaseActivatorConfig } from '@random-truffle/activation';
import type {
  ChannelConfig,
  UserIdentifier,
  ActivationResult,
  ActivationChannelStatus,
} from '@random-truffle/activation';
import { MetaCustomAudiencesClient } from './custom-audiences';
import type { MetaUserIdentifier, MetaIdentifierType } from './types';

/**
 * Meta Activator
 *
 * Activates audiences to Meta Custom Audiences
 */
export class MetaActivator extends BaseActivator {
  private client: MetaCustomAudiencesClient;

  constructor(config: BaseActivatorConfig) {
    super(config);
    this.client = new MetaCustomAudiencesClient(config.accessToken);
  }

  /**
   * Pre-flight checks for Meta activation
   */
  protected async preflightCheck(
    config: ChannelConfig,
    identifiers: UserIdentifier[]
  ): Promise<void> {
    // Warn if too few identifiers
    if (identifiers.length < 100) {
      console.warn(
        `Low identifier count (${identifiers.length}). Meta recommends at least 100 identifiers for good match rates.`
      );
    }

    // Check minimum required (Meta requires at least 20)
    if (identifiers.length < 20) {
      throw new Error(`Meta requires at least 20 identifiers. Received: ${identifiers.length}`);
    }

    // Meta supports multiple identifier types in the same audience
    // No restriction needed (unlike Google Ads)

    // Validate account ID format (must start with "act_")
    if (!config.accountId.startsWith('act_')) {
      throw new Error(
        `Invalid Meta Ad Account ID format: ${config.accountId}. Must start with "act_"`
      );
    }
  }

  /**
   * Create Custom Audience on Meta
   */
  protected async createAudience(
    config: ChannelConfig,
    _identifiers: UserIdentifier[]
  ): Promise<string> {
    const audience = await this.client.createCustomAudience({
      adAccountId: config.accountId,
      name: config.audienceName,
      subtype: 'CUSTOM',
      customerFileSource: 'USER_PROVIDED_ONLY',
    });

    return audience.id;
  }

  /**
   * Upload identifiers to Custom Audience
   */
  protected async uploadIdentifiers(
    platformAudienceId: string,
    identifiers: UserIdentifier[]
  ): Promise<ActivationResult> {
    // Convert to Meta format (hashed identifiers are already normalized)
    const metaIdentifiers: MetaUserIdentifier[] = identifiers.map((id) => {
      const metaId: MetaUserIdentifier = {};

      switch (id.type) {
        case 'email':
          metaId.EMAIL = id.hashedValue || '';
          break;
        case 'phone':
          metaId.PHONE = id.hashedValue || '';
          break;
        case 'mobile_ad_id':
          metaId.MADID = id.hashedValue || '';
          break;
        default:
          throw new Error(`Unsupported identifier type for Meta: ${id.type}`);
      }

      return metaId;
    });

    // Upload in batches (Meta recommends 10,000 per batch)
    const results = await this.client.uploadIdentifiers(
      '', // adAccountId not needed for upload
      platformAudienceId,
      metaIdentifiers,
      10000
    );

    // Aggregate results
    const totalReceived = results.reduce((sum, r) => sum + r.numReceived, 0);
    const totalInvalid = results.reduce((sum, r) => sum + r.numInvalidEntries, 0);
    const matchedUsers = totalReceived - totalInvalid;

    return {
      success: totalInvalid === 0,
      platformAudienceId,
      matchedUserCount: matchedUsers,
      matchRate: totalReceived > 0 ? (matchedUsers / totalReceived) * 100 : 0,
    };
  }

  /**
   * Delete Custom Audience from Meta
   */
  async deleteAudience(platformAudienceId: string): Promise<boolean> {
    try {
      await this.client.deleteCustomAudience(platformAudienceId);
      return true;
    } catch (error) {
      console.error(
        `Failed to delete Meta Custom Audience: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return false;
    }
  }

  /**
   * Get activation status
   */
  async getStatus(platformAudienceId: string): Promise<ActivationChannelStatus> {
    try {
      const audience = await this.client.getCustomAudience(platformAudienceId);

      // Meta delivery status codes:
      // 200 = Normal
      // 300 = Pending (processing)
      // 400 = Error
      const deliveryCode = audience.deliveryStatus?.code || 0;

      let status: ActivationChannelStatus['status'];
      if (deliveryCode === 200) {
        status = 'active';
      } else if (deliveryCode === 300) {
        status = 'processing';
      } else if (deliveryCode === 400) {
        status = 'failed';
      } else {
        status = 'pending_approval';
      }

      return {
        channel: 'meta',
        accountId: this.config.accountId,
        platformAudienceId: audience.id,
        audienceName: audience.name,
        status,
        matchedUserCount: audience.approximateCount,
        lastSyncedAt: new Date(),
      };
    } catch (error) {
      return {
        channel: 'meta',
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
        const metaIdentifiers: MetaUserIdentifier[] = identifiersToRemove.map((id) => {
          const metaId: MetaUserIdentifier = {};
          switch (id.type) {
            case 'email':
              metaId.EMAIL = id.hashedValue || '';
              break;
            case 'phone':
              metaId.PHONE = id.hashedValue || '';
              break;
            case 'mobile_ad_id':
              metaId.MADID = id.hashedValue || '';
              break;
          }
          return metaId;
        });

        const schema = Object.keys(metaIdentifiers[0]) as MetaIdentifierType[];
        const data = metaIdentifiers.map((id) => schema.map((key) => id[key]));

        await this.client.removeUsers({
          adAccountId: this.config.accountId,
          customAudienceId: platformAudienceId,
          schema,
          data,
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
}
