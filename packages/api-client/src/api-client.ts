import type { User, CreateUserDto, UpdateUserDto, ApiResponse } from '@random-truffle/types';
import type { AgentRequest, AgentResponse } from '@random-truffle/agents';
import { API_CONFIG } from '@random-truffle/core';

export class ApiClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | undefined>;

  constructor(baseUrl?: string, getAccessToken?: () => Promise<string | undefined>) {
    this.baseUrl = baseUrl || API_CONFIG.BASE_URL;
    this.getAccessToken = getAccessToken;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add authorization header if available
      if (this.getAccessToken) {
        const token = await this.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: {
            code: error.code || 'API_ERROR',
            message: error.message || 'An error occurred',
            details: error.details,
          },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  // User endpoints
  async getUsers(tenantId?: string): Promise<ApiResponse<User[]>> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    return this.fetch<User[]>(`/users${params}`);
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.fetch<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserDto): Promise<ApiResponse<User>> {
    return this.fetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<ApiResponse<User>> {
    return this.fetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async getHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.fetch('/health');
  }

  // Agent endpoints
  async invokeAgent(request: AgentRequest): Promise<ApiResponse<AgentResponse>> {
    return this.fetch<AgentResponse>('/agents/invoke', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
