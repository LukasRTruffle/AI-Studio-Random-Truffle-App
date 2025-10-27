import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformConnection } from './entities/platform-connection.entity';
import { CreatePlatformConnectionDto } from './dto/create-platform-connection.dto';

@Injectable()
export class PlatformConnectionsService {
  constructor(
    @InjectRepository(PlatformConnection)
    private readonly connectionRepository: Repository<PlatformConnection>
  ) {}

  /**
   * Create a new platform connection
   */
  async create(dto: CreatePlatformConnectionDto): Promise<PlatformConnection> {
    const connection = this.connectionRepository.create(dto);
    return this.connectionRepository.save(connection);
  }

  /**
   * Get all connections for a tenant
   */
  async findByTenant(tenantId: string): Promise<PlatformConnection[]> {
    return this.connectionRepository.find({
      where: { tenantId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific connection
   */
  async findOne(id: string): Promise<PlatformConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { id },
    });

    if (!connection) {
      throw new NotFoundException(`Platform connection ${id} not found`);
    }

    return connection;
  }

  /**
   * Get connection by tenant and platform
   */
  async findByTenantAndPlatform(
    tenantId: string,
    platform: 'google-ads' | 'meta' | 'tiktok'
  ): Promise<PlatformConnection | null> {
    return this.connectionRepository.findOne({
      where: { tenantId, platform, isActive: true },
    });
  }

  /**
   * Update access token (for token refresh)
   */
  async updateToken(
    id: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): Promise<PlatformConnection> {
    const connection = await this.findOne(id);

    connection.accessToken = accessToken;
    if (refreshToken) connection.refreshToken = refreshToken;
    if (expiresAt) connection.expiresAt = expiresAt;

    return this.connectionRepository.save(connection);
  }

  /**
   * Deactivate a connection
   */
  async deactivate(id: string): Promise<void> {
    const connection = await this.findOne(id);
    connection.isActive = false;
    await this.connectionRepository.save(connection);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(connection: PlatformConnection): boolean {
    if (!connection.expiresAt) return false;
    return new Date() >= connection.expiresAt;
  }
}
