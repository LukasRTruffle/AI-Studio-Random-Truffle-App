/**
 * TikTok Segments API Client
 *
 * Manages custom audience segments (similar to Google Customer Match / Meta Custom Audiences)
 * Documentation: https://business-api.tiktok.com/portal/docs?id=1739940506015746
 */

import type {
  TikTokAdvertiserId,
  TikTokSegmentId,
  CreateSegmentRequest,
  SegmentResponse,
  UploadIdentifiersRequest,
  UploadIdentifiersResponse,
  TikTokApiResponse,
} from './types';

const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3';

export class TikTokSegmentsClient {
  constructor(private readonly accessToken: string) {}

  /**
   * Create a new custom audience segment
   */
  async createSegment(request: CreateSegmentRequest): Promise<SegmentResponse> {
    const response = await fetch(`${TIKTOK_API_URL}/dmp/custom_audience/create/`, {
      method: 'POST',
      headers: {
        'Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        advertiser_id: request.advertiserId,
        custom_audience_name: request.name,
        description: request.description || '',
        segment_type: request.segmentType || 'CUSTOMAUDIENCE',
      }),
    });

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TikTokApiResponse<{
      custom_audience_id: string;
      custom_audience_name: string;
    }>;

    if (data.code !== 0) {
      throw new Error(`TikTok API error: ${data.message}`);
    }

    return {
      segmentId: data.data.custom_audience_id,
      name: data.data.custom_audience_name,
      status: 'CALCULATING',
    };
  }

  /**
   * Upload hashed identifiers to a segment (batch operation)
   *
   * @param request - Upload request with identifiers
   * @returns Upload result with counts
   *
   * Note: Identifiers must be SHA-256 hashed before upload
   * TikTok supports: EMAIL, PHONE, IDFA (iOS), GAID (Android)
   */
  async uploadIdentifiers(request: UploadIdentifiersRequest): Promise<UploadIdentifiersResponse> {
    // TikTok has batch size limit of 10,000 per request
    const BATCH_SIZE = 10000;
    const batches = this.chunkArray(request.identifiers, BATCH_SIZE);

    let totalUploaded = 0;
    let totalInvalid = 0;

    for (const batch of batches) {
      const response = await fetch(`${TIKTOK_API_URL}/dmp/custom_audience/update/`, {
        method: 'POST',
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advertiser_id: request.advertiserId,
          custom_audience_id: request.segmentId,
          action: 'ADD',
          id_type: request.identifierType,
          id_list: batch,
        }),
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status} ${await response.text()}`);
      }

      const data = (await response.json()) as TikTokApiResponse<{
        audience_id: string;
        matched_count: number;
        invalid_count: number;
      }>;

      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      totalUploaded += data.data.matched_count;
      totalInvalid += data.data.invalid_count;
    }

    return {
      segmentId: request.segmentId,
      uploadedCount: totalUploaded,
      invalidCount: totalInvalid,
    };
  }

  /**
   * Remove identifiers from a segment
   */
  async removeIdentifiers(request: UploadIdentifiersRequest): Promise<UploadIdentifiersResponse> {
    const response = await fetch(`${TIKTOK_API_URL}/dmp/custom_audience/update/`, {
      method: 'POST',
      headers: {
        'Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        advertiser_id: request.advertiserId,
        custom_audience_id: request.segmentId,
        action: 'REMOVE',
        id_type: request.identifierType,
        id_list: request.identifiers,
      }),
    });

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TikTokApiResponse<{
      audience_id: string;
      removed_count: number;
    }>;

    if (data.code !== 0) {
      throw new Error(`TikTok API error: ${data.message}`);
    }

    return {
      segmentId: request.segmentId,
      uploadedCount: data.data.removed_count,
      invalidCount: 0,
    };
  }

  /**
   * Get segment details
   */
  async getSegment(
    _advertiserId: TikTokAdvertiserId,
    segmentId: TikTokSegmentId
  ): Promise<SegmentResponse> {
    const response = await fetch(`${TIKTOK_API_URL}/dmp/custom_audience/list/`, {
      method: 'GET',
      headers: {
        'Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TikTokApiResponse<{
      custom_audiences: Array<{
        custom_audience_id: string;
        custom_audience_name: string;
        audience_size: number;
        status: string;
        create_time: number;
      }>;
    }>;

    if (data.code !== 0) {
      throw new Error(`TikTok API error: ${data.message}`);
    }

    const segment = data.data.custom_audiences.find((s) => s.custom_audience_id === segmentId);

    if (!segment) {
      throw new Error(`Segment ${segmentId} not found`);
    }

    return {
      segmentId: segment.custom_audience_id,
      name: segment.custom_audience_name,
      size: segment.audience_size,
      status: this.mapStatus(segment.status),
      createTime: new Date(segment.create_time * 1000).toISOString(),
    };
  }

  /**
   * List all segments for an advertiser
   */
  async listSegments(advertiserId: TikTokAdvertiserId): Promise<SegmentResponse[]> {
    const response = await fetch(
      `${TIKTOK_API_URL}/dmp/custom_audience/list/?advertiser_id=${advertiserId}`,
      {
        method: 'GET',
        headers: {
          'Access-Token': this.accessToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TikTokApiResponse<{
      custom_audiences: Array<{
        custom_audience_id: string;
        custom_audience_name: string;
        audience_size: number;
        status: string;
        create_time: number;
      }>;
    }>;

    if (data.code !== 0) {
      throw new Error(`TikTok API error: ${data.message}`);
    }

    return data.data.custom_audiences.map((segment) => ({
      segmentId: segment.custom_audience_id,
      name: segment.custom_audience_name,
      size: segment.audience_size,
      status: this.mapStatus(segment.status),
      createTime: new Date(segment.create_time * 1000).toISOString(),
    }));
  }

  /**
   * Delete a segment
   */
  async deleteSegment(advertiserId: TikTokAdvertiserId, segmentId: TikTokSegmentId): Promise<void> {
    const response = await fetch(`${TIKTOK_API_URL}/dmp/custom_audience/delete/`, {
      method: 'POST',
      headers: {
        'Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        advertiser_id: advertiserId,
        custom_audience_ids: [segmentId],
      }),
    });

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as TikTokApiResponse<Record<string, never>>;

    if (data.code !== 0) {
      throw new Error(`TikTok API error: ${data.message}`);
    }
  }

  /**
   * Utility: Chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Map TikTok status to normalized status
   */
  private mapStatus(status: string): 'CALCULATING' | 'READY' | 'FAILED' {
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'CALCULATING';
      case 'VALID':
      case 'AVAILABLE':
        return 'READY';
      case 'FAILED':
      case 'INVALID':
        return 'FAILED';
      default:
        return 'CALCULATING';
    }
  }
}
