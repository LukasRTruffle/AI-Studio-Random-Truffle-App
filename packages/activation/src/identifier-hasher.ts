/**
 * Identifier Hasher for Random Truffle
 *
 * SHA-256 hashing of user identifiers for platform upload
 * Following Google Ads, Meta, and TikTok requirements
 */

import { createHash } from 'crypto';
import type { UserIdentifier, IdentifierType } from './types';

/**
 * Hash configuration
 */
export interface HashConfig {
  salt: string; // Tenant-specific salt
  normalize: boolean; // Whether to normalize before hashing (default: true)
}

/**
 * Default hash configuration
 */
const DEFAULT_CONFIG: HashConfig = {
  salt: '', // No salt by default (platforms don't support salted hashes)
  normalize: true,
};

/**
 * Identifier Hasher
 *
 * Normalizes and hashes user identifiers according to platform requirements
 */
export class IdentifierHasher {
  private config: HashConfig;

  constructor(config?: Partial<HashConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Hash a single identifier
   */
  hashIdentifier(identifier: UserIdentifier): UserIdentifier {
    const normalized = this.normalize(identifier.value, identifier.type);
    const hashed = this.hash(normalized);

    return {
      ...identifier,
      hashedValue: hashed,
    };
  }

  /**
   * Hash multiple identifiers
   */
  hashIdentifiers(identifiers: UserIdentifier[]): UserIdentifier[] {
    return identifiers.map((id) => this.hashIdentifier(id));
  }

  /**
   * Normalize identifier value according to platform requirements
   */
  private normalize(value: string, type: IdentifierType): string {
    if (!this.config.normalize) {
      return value;
    }

    switch (type) {
      case 'email':
        return this.normalizeEmail(value);
      case 'phone':
        return this.normalizePhone(value);
      case 'mobile_ad_id':
        return this.normalizeMobileAdId(value);
      case 'crm_id':
        return this.normalizeCrmId(value);
      default:
        return value.toLowerCase().trim();
    }
  }

  /**
   * Normalize email address
   * Requirements:
   * - Remove leading/trailing whitespace
   * - Convert to lowercase
   * - Remove dots in Gmail addresses (before @)
   * - Remove subaddressing (+ and everything after, before @)
   */
  private normalizeEmail(email: string): string {
    const normalized = email.toLowerCase().trim();

    // Extract local and domain parts
    const parts = normalized.split('@');
    if (parts.length !== 2) {
      return normalized; // Invalid email, return as-is
    }

    let local = parts[0];
    const domain = parts[1];

    // For Gmail, remove dots and subaddressing
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      // Remove dots
      local = local.replace(/\./g, '');

      // Remove subaddressing (+ and everything after)
      const plusIndex = local.indexOf('+');
      if (plusIndex !== -1) {
        local = local.substring(0, plusIndex);
      }
    }

    return `${local}@${domain}`;
  }

  /**
   * Normalize phone number
   * Requirements:
   * - Remove all non-digit characters
   * - Convert to E.164 format (+ and country code)
   * - For US numbers without country code, add +1
   */
  private normalizePhone(phone: string): string {
    // Remove all non-digit characters
    const normalized = phone.replace(/\D/g, '');

    // If starts with 1 and is 11 digits, assume US with country code
    if (normalized.startsWith('1') && normalized.length === 11) {
      return `+${normalized}`;
    }

    // If 10 digits, assume US without country code
    if (normalized.length === 10) {
      return `+1${normalized}`;
    }

    // If already has plus, return as-is
    if (phone.startsWith('+')) {
      return `+${normalized}`;
    }

    // Otherwise, return normalized digits with plus
    return `+${normalized}`;
  }

  /**
   * Normalize mobile advertising ID (IDFA/AAID)
   * Requirements:
   * - Remove hyphens
   * - Convert to lowercase
   */
  private normalizeMobileAdId(maid: string): string {
    return maid.toLowerCase().replace(/-/g, '');
  }

  /**
   * Normalize CRM ID
   * Requirements:
   * - Trim whitespace
   * - Convert to lowercase
   */
  private normalizeCrmId(crmId: string): string {
    return crmId.toLowerCase().trim();
  }

  /**
   * SHA-256 hash a normalized value
   */
  private hash(value: string): string {
    const input = this.config.salt ? `${value}${this.config.salt}` : value;
    return createHash('sha256').update(input).digest('hex');
  }

  /**
   * Validate identifier format before hashing
   */
  static validate(identifier: UserIdentifier): { valid: boolean; error?: string } {
    const { type, value } = identifier;

    switch (type) {
      case 'email':
        return this.validateEmail(value);
      case 'phone':
        return this.validatePhone(value);
      case 'mobile_ad_id':
        return this.validateMobileAdId(value);
      case 'crm_id':
        return this.validateCrmId(value);
      default:
        return { valid: false, error: 'Unknown identifier type' };
    }
  }

  /**
   * Validate email format
   */
  private static validateEmail(email: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
  }

  /**
   * Validate phone number format
   */
  private static validatePhone(phone: string): { valid: boolean; error?: string } {
    // Must have at least 10 digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return { valid: false, error: 'Phone number must have at least 10 digits' };
    }
    return { valid: true };
  }

  /**
   * Validate mobile advertising ID format
   */
  private static validateMobileAdId(maid: string): { valid: boolean; error?: string } {
    // IDFA: 8-4-4-4-12 hex digits
    // AAID: 8-4-4-4-12 hex digits
    const maidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (!maidRegex.test(maid)) {
      return { valid: false, error: 'Invalid mobile advertising ID format' };
    }
    return { valid: true };
  }

  /**
   * Validate CRM ID format
   */
  private static validateCrmId(crmId: string): { valid: boolean; error?: string } {
    if (!crmId || crmId.trim().length === 0) {
      return { valid: false, error: 'CRM ID cannot be empty' };
    }
    return { valid: true };
  }
}

/**
 * Export singleton hasher
 */
export const identifierHasher = new IdentifierHasher();
