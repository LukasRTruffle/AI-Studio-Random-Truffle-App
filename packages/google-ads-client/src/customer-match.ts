/**
 * Google Ads Customer Match API Client
 *
 * Upload hashed user identifiers to create Customer Match audiences
 */

import type {
  CustomerId,
  CustomerMatchUserListConfig,
  GoogleAdsClientConfig,
  GoogleAdsUserIdentifier,
  OfflineUserDataJobRequest,
  OfflineUserDataJobResponse,
  GoogleAdsError,
} from './types';

/**
 * Customer Match API Client
 */
export class CustomerMatchClient {
  private config: GoogleAdsClientConfig;
  private baseUrl = 'https://googleads.googleapis.com/v22';

  constructor(config: GoogleAdsClientConfig) {
    this.config = config;
  }

  /**
   * Create a new Customer Match user list
   */
  async createUserList(
    listConfig: CustomerMatchUserListConfig
  ): Promise<{ resourceName: string; id: string }> {
    const userList = {
      name: listConfig.name,
      description: listConfig.description || '',
      membershipLifeSpan: listConfig.membershipLifeSpan, // Max 540 days as of April 2025
      crmBasedUserList: {
        uploadKeyType: listConfig.uploadKeyType,
        dataSourceType: 'FIRST_PARTY',
      },
    };

    const response = await this.makeRequest(
      `/customers/${listConfig.customerId}/userLists:mutate`,
      'POST',
      {
        operations: [
          {
            create: userList,
          },
        ],
      }
    );

    if (!response.results || response.results.length === 0) {
      throw new Error('Failed to create user list');
    }

    const resourceName = response.results[0].resourceName;
    const id = resourceName.split('/').pop() || '';

    return { resourceName, id };
  }

  /**
   * Create an offline user data job for uploading identifiers
   */
  async createOfflineUserDataJob(
    request: OfflineUserDataJobRequest
  ): Promise<OfflineUserDataJobResponse> {
    const jobConfig = {
      type: request.jobType,
      customerMatchUserListMetadata: request.userListResourceName
        ? {
            userList: request.userListResourceName,
          }
        : undefined,
    };

    const response = await this.makeRequest(
      `/customers/${request.customerId}/offlineUserDataJobs:create`,
      'POST',
      {
        job: jobConfig,
      }
    );

    return {
      resourceName: response.resourceName,
      status: 'PENDING',
      type: request.jobType,
    };
  }

  /**
   * Add operations to an offline user data job
   */
  async addOfflineUserDataJobOperations(
    customerId: CustomerId,
    jobResourceName: string,
    identifiers: GoogleAdsUserIdentifier[],
    enablePartialFailure: boolean = true
  ): Promise<void> {
    const operations = identifiers.map((identifier) => ({
      create: {
        userIdentifiers: [identifier],
      },
    }));

    await this.makeRequest(
      `/customers/${customerId}/offlineUserDataJobs:addOperations`,
      'POST',
      {
        resourceName: jobResourceName,
        enablePartialFailure,
        operations,
      }
    );
  }

  /**
   * Run an offline user data job
   */
  async runOfflineUserDataJob(
    jobResourceName: string
  ): Promise<void> {
    await this.makeRequest(
      `/${jobResourceName}:run`,
      'POST',
      {}
    );
  }

  /**
   * Get offline user data job status
   */
  async getOfflineUserDataJob(
    jobResourceName: string
  ): Promise<OfflineUserDataJobResponse> {
    const response = await this.makeRequest(
      `/${jobResourceName}`,
      'GET'
    );

    return {
      resourceName: response.resourceName,
      status: response.status,
      type: response.type,
      failureReason: response.failureReason,
      stats: response.matchRateRange
        ? {
            matchRatePercentage: response.matchRateRange,
          }
        : undefined,
    };
  }

  /**
   * Upload identifiers to Customer Match list (high-level method)
   *
   * This combines creating job, adding operations, and running the job
   */
  async uploadIdentifiers(
    customerId: CustomerId,
    userListResourceName: string,
    identifiers: GoogleAdsUserIdentifier[],
    batchSize: number = 5000 // Google Ads recommended batch size
  ): Promise<OfflineUserDataJobResponse> {
    // Step 1: Create job
    const job = await this.createOfflineUserDataJob({
      customerId,
      jobType: 'CUSTOMER_MATCH_USER_LIST',
      userListResourceName,
      operations: [],
    });

    // Step 2: Add operations in batches
    for (let i = 0; i < identifiers.length; i += batchSize) {
      const batch = identifiers.slice(i, i + batchSize);
      await this.addOfflineUserDataJobOperations(
        customerId,
        job.resourceName,
        batch
      );
    }

    // Step 3: Run job
    await this.runOfflineUserDataJob(job.resourceName);

    // Step 4: Return job info
    return job;
  }

  /**
   * Make authenticated request to Google Ads API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<any> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.accessToken}`,
      'developer-token': this.config.developerToken,
      'Content-Type': 'application/json',
    };

    // Add login-customer-id header for manager accounts
    if (this.config.loginCustomerId) {
      headers['login-customer-id'] = this.config.loginCustomerId;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = (await response.json()) as GoogleAdsError;
      throw new Error(
        `Google Ads API error: ${error.message || response.statusText} (${error.code})`
      );
    }

    return await response.json();
  }

  /**
   * Remove identifiers from Customer Match list
   */
  async removeIdentifiers(
    customerId: CustomerId,
    userListResourceName: string,
    identifiers: GoogleAdsUserIdentifier[]
  ): Promise<OfflineUserDataJobResponse> {
    // Create job for removal
    const job = await this.createOfflineUserDataJob({
      customerId,
      jobType: 'CUSTOMER_MATCH_USER_LIST',
      userListResourceName,
      operations: [],
    });

    // Add remove operations
    const operations = identifiers.map((identifier) => ({
      remove: {
        userIdentifiers: [identifier],
      },
    }));

    await this.makeRequest(
      `/customers/${customerId}/offlineUserDataJobs:addOperations`,
      'POST',
      {
        resourceName: job.resourceName,
        operations,
      }
    );

    // Run job
    await this.runOfflineUserDataJob(job.resourceName);

    return job;
  }

  /**
   * Get user list details
   */
  async getUserList(customerId: CustomerId, userListId: string): Promise<any> {
    const query = `
      SELECT
        user_list.id,
        user_list.name,
        user_list.description,
        user_list.membership_life_span,
        user_list.size_for_display,
        user_list.size_for_search,
        user_list.crm_based_user_list.upload_key_type
      FROM user_list
      WHERE user_list.id = ${userListId}
    `;

    const response = await this.makeRequest(
      `/customers/${customerId}/googleAds:search`,
      'POST',
      { query }
    );

    if (!response.results || response.results.length === 0) {
      throw new Error(`User list ${userListId} not found`);
    }

    return response.results[0].userList;
  }
}
