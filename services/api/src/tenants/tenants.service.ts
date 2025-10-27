import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/**
 * Tenants Service
 *
 * Manages multi-tenant workspaces
 */
@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>
  ) {}

  /**
   * Create a new tenant workspace
   */
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if tenant name already exists
    const existing = await this.tenantRepository.findOne({
      where: { name: createTenantDto.name },
    });

    if (existing) {
      throw new ConflictException(`Tenant with name "${createTenantDto.name}" already exists`);
    }

    // Create tenant
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      isActive: true,
      settings: createTenantDto.settings || {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
      },
    });

    return this.tenantRepository.save(tenant);
  }

  /**
   * Find all tenants
   */
  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one tenant by ID
   */
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return tenant;
  }

  /**
   * Find tenant by name
   */
  async findByName(name: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { name },
    });
  }

  /**
   * Update a tenant
   */
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Check for name conflicts if name is being updated
    if (updateTenantDto.name && updateTenantDto.name !== tenant.name) {
      const existing = await this.findByName(updateTenantDto.name);
      if (existing) {
        throw new ConflictException(`Tenant with name "${updateTenantDto.name}" already exists`);
      }
    }

    // Update tenant
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  /**
   * Soft delete a tenant (mark as inactive)
   */
  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    tenant.isActive = false;
    await this.tenantRepository.save(tenant);
  }

  /**
   * Hard delete a tenant (permanent)
   */
  async hardRemove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }

  /**
   * Get tenant stats
   */
  async getStats(id: string): Promise<{
    id: string;
    name: string;
    userCount: number;
    integrationCount: number;
    audienceCount: number;
    activationCount: number;
  }> {
    const tenant = await this.findOne(id);

    // TODO: Implement actual counts when those modules exist
    return {
      id: tenant.id,
      name: tenant.name,
      userCount: 0,
      integrationCount: 0,
      audienceCount: 0,
      activationCount: 0,
    };
  }
}
