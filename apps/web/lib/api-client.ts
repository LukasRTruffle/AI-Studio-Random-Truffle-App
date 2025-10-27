/**
 * API Client for Random Truffle Backend
 *
 * Centralized API client for making requests to the NestJS backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Tenant API Client
 */
export const tenantsApi = {
  /**
   * Create a new tenant
   */
  create: async (data: {
    name: string;
    industry: string;
    teamSize: string;
    primaryGoal?: string;
    platforms?: string[];
    hasGA4?: boolean;
  }) => {
    return apiFetch('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all tenants
   */
  list: async () => {
    return apiFetch('/tenants', {
      method: 'GET',
    });
  },

  /**
   * Get a specific tenant
   */
  get: async (id: string) => {
    return apiFetch(`/tenants/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update a tenant
   */
  update: async (
    id: string,
    data: Partial<{
      name: string;
      industry: string;
      teamSize: string;
      primaryGoal: string;
      platforms: string[];
      hasGA4: boolean;
    }>
  ) => {
    return apiFetch(`/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a tenant
   */
  delete: async (id: string) => {
    return apiFetch(`/tenants/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Platform Connections API Client
 */
export const platformsApi = {
  /**
   * Get OAuth URL for Meta
   */
  getMetaAuthUrl: (tenantId: string) => {
    return `${API_BASE_URL}/auth/meta/authorize?tenant_id=${tenantId}`;
  },

  /**
   * Get all connections for a tenant
   */
  list: async (tenantId: string) => {
    return apiFetch(`/platform-connections?tenant_id=${tenantId}`, {
      method: 'GET',
    });
  },
};

/**
 * Activation API Client
 */
export const activationApi = {
  /**
   * Activate audience to platforms
   */
  activate: async (data: {
    audienceId: string;
    channels: Array<{
      channel: 'google-ads' | 'meta' | 'tiktok';
      accountId: string;
      audienceName: string;
    }>;
    identifiers: Array<{
      type: string;
      value: string;
      hashedValue?: string;
    }>;
  }) => {
    return apiFetch('/activation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
