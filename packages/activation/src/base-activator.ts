/**
 * Base Activator for Random Truffle
 *
 * Abstract base class for platform-specific activators
 */

import type {
  ActivationChannel,
  ActivationChannelStatus,
  ChannelConfig,
  UserIdentifier,
} from './types';
import { IdentifierHasher } from './identifier-hasher';

/**
 * Activation result from platform
 */
export interface ActivationResult {
  success: boolean;
  platformAudienceId?: string;
  matchRate?: number;
  matchedUserCount?: number;
  errorMessage?: string;
  processingTime?: number;
}

/**
 * Base configuration for all activators
 */
export interface BaseActivatorConfig {
  channel: ActivationChannel;
  accessToken: string;
  accountId: string;
}

/**
 * Abstract Base Activator
 *
 * Provides common functionality for all platform activators:
 * - Identifier hashing and validation
 * - Batch processing
 * - Retry logic
 * - Status tracking
 */
export abstract class BaseActivator {
  protected config: BaseActivatorConfig;
  protected hasher: IdentifierHasher;
  protected maxRetries: number = 3;
  protected retryDelayMs: number = 1000;

  constructor(config: BaseActivatorConfig) {
    this.config = config;
    this.hasher = new IdentifierHasher();
  }

  /**
   * Activate an audience to the platform
   *
   * Main entry point for activation. Handles:
   * 1. Identifier validation and hashing
   * 2. Batch processing
   * 3. Platform-specific upload
   * 4. Status tracking
   */
  async activate(
    channelConfig: ChannelConfig,
    identifiers: UserIdentifier[]
  ): Promise<ActivationChannelStatus> {
    const status: ActivationChannelStatus = {
      channel: this.config.channel,
      accountId: channelConfig.accountId,
      audienceName: channelConfig.audienceName,
      status: 'processing',
      processingStartedAt: new Date(),
    };

    try {
      // Step 1: Validate identifiers
      const validationErrors = this.validateIdentifiers(identifiers);
      if (validationErrors.length > 0) {
        throw new Error(`Identifier validation failed: ${validationErrors.join(', ')}`);
      }

      // Step 2: Hash identifiers
      const hashedIdentifiers = this.hasher.hashIdentifiers(identifiers);

      // Step 3: Platform-specific pre-flight checks
      await this.preflightCheck(channelConfig, hashedIdentifiers);

      // Step 4: Create audience on platform
      const platformAudienceId = await this.createAudience(channelConfig, hashedIdentifiers);

      status.platformAudienceId = platformAudienceId;

      // Step 5: Upload identifiers in batches
      const uploadResult = await this.uploadIdentifiers(platformAudienceId, hashedIdentifiers);

      // Step 6: Update status
      status.status = uploadResult.success ? 'active' : 'failed';
      status.matchRate = uploadResult.matchRate;
      status.matchedUserCount = uploadResult.matchedUserCount;
      status.errorMessage = uploadResult.errorMessage;
      status.processingCompletedAt = new Date();

      return status;
    } catch (error) {
      status.status = 'failed';
      status.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      status.processingCompletedAt = new Date();
      return status;
    }
  }

  /**
   * Validate all identifiers before hashing
   */
  protected validateIdentifiers(identifiers: UserIdentifier[]): string[] {
    const errors: string[] = [];

    for (let i = 0; i < identifiers.length; i++) {
      const result = IdentifierHasher.validate(identifiers[i]);
      if (!result.valid) {
        errors.push(`Identifier ${i}: ${result.error}`);
      }
    }

    return errors;
  }

  /**
   * Retry wrapper for platform API calls
   */
  protected async retry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < retries) {
          // Exponential backoff
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Split identifiers into chunks for batch processing
   */
  protected chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Platform-specific pre-flight checks
   * Override in subclasses to implement platform-specific validation
   */
  protected abstract preflightCheck(
    config: ChannelConfig,
    identifiers: UserIdentifier[]
  ): Promise<void>;

  /**
   * Create audience on platform
   * Returns platform-specific audience ID
   */
  protected abstract createAudience(
    config: ChannelConfig,
    identifiers: UserIdentifier[]
  ): Promise<string>;

  /**
   * Upload identifiers to platform audience
   * Handles batch processing and returns aggregated result
   */
  protected abstract uploadIdentifiers(
    platformAudienceId: string,
    identifiers: UserIdentifier[]
  ): Promise<ActivationResult>;

  /**
   * Get activation status from platform
   * Used to check processing progress
   */
  abstract getStatus(platformAudienceId: string): Promise<ActivationChannelStatus>;

  /**
   * Update audience on platform (add/remove identifiers)
   */
  abstract updateAudience(
    platformAudienceId: string,
    identifiersToAdd: UserIdentifier[],
    identifiersToRemove?: UserIdentifier[]
  ): Promise<ActivationResult>;

  /**
   * Delete audience from platform
   */
  abstract deleteAudience(platformAudienceId: string): Promise<boolean>;
}
