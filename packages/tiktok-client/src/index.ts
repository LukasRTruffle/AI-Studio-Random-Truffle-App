/**
 * TikTok Business API v1.3 Client
 */

export * from './types';
import type { TikTokOAuthConfig } from './types';

// Placeholder exports - to be implemented
export class TikTokOAuthClient {
  constructor(private config: TikTokOAuthConfig) {}
}

export class TikTokSegmentsClient {
  constructor(private accessToken: string) {}
}

export class TikTokReportingClient {
  constructor(private accessToken: string) {}
}

export class TikTokActivator {
  constructor(private config: unknown) {}
}
