import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Tenant Entity
 *
 * Multi-tenant workspace for Random Truffle
 * Each tenant is an isolated workspace with its own users, audiences, and activations
 */
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  industry: string;

  @Column({ type: 'varchar', length: 50 })
  teamSize: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primaryGoal: string;

  @Column({ type: 'simple-array', nullable: true })
  platforms: string[];

  @Column({ type: 'boolean', default: false })
  hasGA4: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    timezone?: string;
    currency?: string;
    language?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations will be added as we build more features
  // @OneToMany(() => User, user => user.tenant)
  // users: User[];

  // @OneToMany(() => Integration, integration => integration.tenant)
  // integrations: Integration[];
}
