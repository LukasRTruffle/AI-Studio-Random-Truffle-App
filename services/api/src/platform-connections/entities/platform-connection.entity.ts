import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

/**
 * Platform Connection Entity
 *
 * Stores OAuth credentials for ad platforms (Google Ads, Meta, TikTok)
 */
@Entity('platform_connections')
export class PlatformConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'varchar', length: 50 })
  platform: 'google-ads' | 'meta' | 'tiktok';

  @Column({ type: 'varchar', length: 255 })
  accountId: string;

  @Column({ type: 'varchar', length: 255 })
  accountName: string;

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    currency?: string;
    timezone?: string;
    accountStatus?: string;
    permissions?: string[];
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
