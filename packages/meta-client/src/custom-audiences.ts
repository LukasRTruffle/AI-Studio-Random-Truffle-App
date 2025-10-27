/**
 * Meta Custom Audiences API
 *
 * Handles Custom Audience creation and user list uploads
 * Documentation: https://developers.facebook.com/docs/marketing-api/audiences/guides/custom-audiences
 */

import type {
  MetaAdAccountId,
  MetaCustomAudienceId,
  MetaUserIdentifier,
  MetaIdentifierType,
  CreateCustomAudienceRequest,
  CustomAudienceResponse,
  AddUsersRequest,
  AddUsersResponse,
  MetaApiError,
} from './types';

const META_API_VERSION = 'v22.0';
const META_GRAPH_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Meta Custom Audiences API Client
 */
export class MetaCustomAudiencesClient {
  constructor(private readonly accessToken: string) {}

  /**
   * Create a new Custom Audience
   *
   * @param request - Custom Audience creation request
   * @returns Created Custom Audience details
   */
  async createCustomAudience(
    request: CreateCustomAudienceRequest
  ): Promise<CustomAudienceResponse> {
    const body = {
      name: request.name,
      description: request.description || '',
      subtype: request.subtype,
      customer_file_source: request.customerFileSource || 'USER_PROVIDED_ONLY',
    };

    const response = await fetch(`${META_GRAPH_API_BASE}/${request.adAccountId}/customaudiences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = (await response.json()) as MetaApiError;
      throw new Error(
        `Failed to create Custom Audience: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = (await response.json()) as { id: string };

    // Fetch full details
    return this.getCustomAudience(data.id);
  }

  /**
   * Get Custom Audience details
   *
   * @param customAudienceId - Custom Audience ID
   * @returns Custom Audience details
   */
  async getCustomAudience(customAudienceId: MetaCustomAudienceId): Promise<CustomAudienceResponse> {
    const fields =
      'id,name,description,subtype,approximate_count_lower_bound,approximate_count_upper_bound,delivery_status';

    const response = await fetch(`${META_GRAPH_API_BASE}/${customAudienceId}?fields=${fields}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as MetaApiError;
      throw new Error(
        `Failed to fetch Custom Audience: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = (await response.json()) as {
      id: string;
      name: string;
      description?: string;
      subtype: string;
      approximate_count_lower_bound?: number;
      approximate_count_upper_bound?: number;
      delivery_status?: {
        code: number;
        description: string;
      };
    };

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      subtype: data.subtype as CustomAudienceResponse['subtype'],
      approximateCount: data.approximate_count_upper_bound,
      deliveryStatus: data.delivery_status,
    };
  }

  /**
   * Add users to Custom Audience
   *
   * @param request - Add users request
   * @returns Add users response
   */
  async addUsers(request: AddUsersRequest): Promise<AddUsersResponse> {
    // Meta requires data in CSV format (arrays of arrays)
    const payload = {
      schema: request.schema,
      data: request.data,
    };

    const response = await fetch(`${META_GRAPH_API_BASE}/${request.customAudienceId}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: JSON.stringify(payload),
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as MetaApiError;
      throw new Error(
        `Failed to add users to Custom Audience: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = (await response.json()) as {
      audience_id: string;
      session_id: string;
      num_received: number;
      num_invalid_entries: number;
      invalid_entry_examples?: {
        [key: string]: string;
      };
    };

    return {
      audienceId: data.audience_id,
      sessionId: data.session_id,
      numReceived: data.num_received,
      numInvalidEntries: data.num_invalid_entries,
      invalidEntryExamples: data.invalid_entry_examples,
    };
  }

  /**
   * Remove users from Custom Audience
   *
   * @param request - Remove users request (same format as add)
   * @returns Remove users response
   */
  async removeUsers(request: AddUsersRequest): Promise<AddUsersResponse> {
    const payload = {
      schema: request.schema,
      data: request.data,
    };

    const response = await fetch(`${META_GRAPH_API_BASE}/${request.customAudienceId}/users`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: JSON.stringify(payload),
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as MetaApiError;
      throw new Error(
        `Failed to remove users from Custom Audience: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = (await response.json()) as {
      audience_id: string;
      session_id: string;
      num_received: number;
      num_invalid_entries: number;
    };

    return {
      audienceId: data.audience_id,
      sessionId: data.session_id,
      numReceived: data.num_received,
      numInvalidEntries: data.num_invalid_entries,
    };
  }

  /**
   * Upload identifiers in batches
   *
   * Meta recommends batches of 10,000 users
   *
   * @param adAccountId - Ad Account ID
   * @param customAudienceId - Custom Audience ID
   * @param identifiers - Array of user identifiers (already hashed)
   * @param batchSize - Batch size (default: 10,000)
   * @returns Upload results
   */
  async uploadIdentifiers(
    adAccountId: MetaAdAccountId,
    customAudienceId: MetaCustomAudienceId,
    identifiers: MetaUserIdentifier[],
    batchSize: number = 10000
  ): Promise<AddUsersResponse[]> {
    const results: AddUsersResponse[] = [];

    // Determine schema from first identifier
    if (identifiers.length === 0) {
      return results;
    }

    const schema = Object.keys(identifiers[0]) as MetaIdentifierType[];

    // Process in batches
    for (let i = 0; i < identifiers.length; i += batchSize) {
      const batch = identifiers.slice(i, i + batchSize);

      // Convert to array format
      const data = batch.map((id) => schema.map((key) => id[key]));

      const result = await this.addUsers({
        adAccountId,
        customAudienceId,
        schema,
        data,
      });

      results.push(result);

      // Rate limiting: wait 100ms between batches
      if (i + batchSize < identifiers.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Delete Custom Audience
   *
   * @param customAudienceId - Custom Audience ID
   */
  async deleteCustomAudience(customAudienceId: MetaCustomAudienceId): Promise<void> {
    const response = await fetch(`${META_GRAPH_API_BASE}/${customAudienceId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as MetaApiError;
      throw new Error(
        `Failed to delete Custom Audience: ${error.error?.message || 'Unknown error'}`
      );
    }
  }

  /**
   * List Custom Audiences for an ad account
   *
   * @param adAccountId - Ad Account ID
   * @returns List of Custom Audiences
   */
  async listCustomAudiences(adAccountId: MetaAdAccountId): Promise<CustomAudienceResponse[]> {
    const fields =
      'id,name,description,subtype,approximate_count_lower_bound,approximate_count_upper_bound';

    const response = await fetch(
      `${META_GRAPH_API_BASE}/${adAccountId}/customaudiences?fields=${fields}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = (await response.json()) as MetaApiError;
      throw new Error(
        `Failed to list Custom Audiences: ${error.error?.message || 'Unknown error'}`
      );
    }

    const responseData = (await response.json()) as {
      data: Array<{
        id: string;
        name: string;
        description?: string;
        subtype: string;
        approximate_count_upper_bound?: number;
      }>;
    };

    return responseData.data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      subtype: item.subtype as CustomAudienceResponse['subtype'],
      approximateCount: item.approximate_count_upper_bound,
    }));
  }
}
