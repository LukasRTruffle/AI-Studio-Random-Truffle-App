import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Tenants Controller
 *
 * REST API for tenant workspace management
 * Protected with Auth0 JWT + Role-Based Access Control
 */
@Controller('tenants')
@UseGuards(RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Create a new tenant workspace
   * POST /api/tenants
   * Requires: admin or superadmin role
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'superadmin')
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  /**
   * Get all tenants
   * GET /api/tenants
   * Requires: any authenticated user
   */
  @Get()
  @Roles('user', 'admin', 'superadmin')
  findAll() {
    return this.tenantsService.findAll();
  }

  /**
   * Get one tenant by ID
   * GET /api/tenants/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  /**
   * Get tenant stats
   * GET /api/tenants/:id/stats
   */
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.tenantsService.getStats(id);
  }

  /**
   * Update a tenant
   * PATCH /api/tenants/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  /**
   * Soft delete a tenant (mark as inactive)
   * DELETE /api/tenants/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  /**
   * Hard delete a tenant (permanent)
   * DELETE /api/tenants/:id/hard
   */
  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  hardRemove(@Param('id') id: string) {
    return this.tenantsService.hardRemove(id);
  }
}
