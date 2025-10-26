import { describe, it, expect } from 'vitest';
import {
  UserRole,
  AudienceStatus,
  ActivationChannel,
  ActivationStatus,
  AgentStatus,
  type User,
  type Tenant,
  type Audience,
  type Activation,
  type CreateUserDto,
  type ApiResponse,
  type PaginatedResponse,
} from '../index';

describe('type definitions', () => {
  describe('UserRole enum', () => {
    it('should have correct values', () => {
      expect(UserRole.USER).toBe('user');
      expect(UserRole.ADMIN).toBe('admin');
      expect(UserRole.SUPERADMIN).toBe('superadmin');
    });
  });

  describe('AudienceStatus enum', () => {
    it('should have correct values', () => {
      expect(AudienceStatus.DRAFT).toBe('draft');
      expect(AudienceStatus.BUILDING).toBe('building');
      expect(AudienceStatus.READY).toBe('ready');
      expect(AudienceStatus.ERROR).toBe('error');
    });
  });

  describe('ActivationChannel enum', () => {
    it('should have correct values', () => {
      expect(ActivationChannel.GOOGLE_ADS).toBe('google_ads');
      expect(ActivationChannel.META).toBe('meta');
      expect(ActivationChannel.TIKTOK).toBe('tiktok');
    });
  });

  describe('ActivationStatus enum', () => {
    it('should have correct values', () => {
      expect(ActivationStatus.PENDING).toBe('pending');
      expect(ActivationStatus.SYNCING).toBe('syncing');
      expect(ActivationStatus.ACTIVE).toBe('active');
      expect(ActivationStatus.PAUSED).toBe('paused');
      expect(ActivationStatus.ERROR).toBe('error');
    });
  });

  describe('AgentStatus enum', () => {
    it('should have correct values', () => {
      expect(AgentStatus.PENDING).toBe('pending');
      expect(AgentStatus.RUNNING).toBe('running');
      expect(AgentStatus.COMPLETED).toBe('completed');
      expect(AgentStatus.FAILED).toBe('failed');
    });
  });

  describe('User type', () => {
    it('should be usable for creating user objects', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe(UserRole.USER);
    });
  });

  describe('Tenant type', () => {
    it('should be usable for creating tenant objects', () => {
      const tenant: Tenant = {
        id: '123',
        name: 'Test Tenant',
        domain: 'test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(tenant.id).toBe('123');
      expect(tenant.domain).toBe('test.com');
    });
  });

  describe('Audience type', () => {
    it('should be usable for creating audience objects', () => {
      const audience: Audience = {
        id: '123',
        name: 'Test Audience',
        description: 'Test description',
        tenantId: 'tenant-1',
        createdBy: 'user-1',
        sql: 'SELECT * FROM users',
        status: AudienceStatus.READY,
        size: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(audience.id).toBe('123');
      expect(audience.status).toBe(AudienceStatus.READY);
      expect(audience.size).toBe(1000);
    });
  });

  describe('Activation type', () => {
    it('should be usable for creating activation objects', () => {
      const activation: Activation = {
        id: '123',
        audienceId: 'aud-1',
        channel: ActivationChannel.GOOGLE_ADS,
        platformAccountId: 'acc-1',
        status: ActivationStatus.ACTIVE,
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(activation.channel).toBe(ActivationChannel.GOOGLE_ADS);
      expect(activation.status).toBe(ActivationStatus.ACTIVE);
    });
  });

  describe('DTO types', () => {
    it('should be usable for CreateUserDto', () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        tenantId: 'tenant-1',
      };

      expect(dto.email).toBe('test@example.com');
      expect(dto.role).toBe(UserRole.USER);
    });
  });

  describe('API Response types', () => {
    it('should be usable for successful ApiResponse', () => {
      const response: ApiResponse<User> = {
        success: true,
        data: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.USER,
          tenantId: 'tenant-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      expect(response.success).toBe(true);
      expect(response.data?.id).toBe('123');
    });

    it('should be usable for error ApiResponse', () => {
      const response: ApiResponse<User> = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      };

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('PaginatedResponse type', () => {
    it('should be usable for paginated data', () => {
      const response: PaginatedResponse<User> = {
        data: [],
        total: 100,
        page: 1,
        pageSize: 20,
        totalPages: 5,
      };

      expect(response.total).toBe(100);
      expect(response.totalPages).toBe(5);
    });
  });
});
