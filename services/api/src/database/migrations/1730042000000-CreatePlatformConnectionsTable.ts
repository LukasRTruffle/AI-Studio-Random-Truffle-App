import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePlatformConnectionsTable1730042000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'platform_connections',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'platform',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'accountId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'accountName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'accessToken',
            type: 'text',
          },
          {
            name: 'refreshToken',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    // Add foreign key to tenants table
    await queryRunner.createForeignKey(
      'platform_connections',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      })
    );

    // Create index for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_platform_connections_tenant_platform
      ON platform_connections (tenantId, platform)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platform_connections');
  }
}
