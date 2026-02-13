import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';

export class CreatePlatformsTable1739460005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'platforms',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'platform',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'platform_user_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'platform_username',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'access_token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'refresh_token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_connected',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'auto_crosspost',
            type: 'boolean',
            default: false,
          },
          {
            name: 'tag_location',
            type: 'boolean',
            default: false,
          },
          {
            name: 'last_sync_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'platforms',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add unique constraint for user_id + platform
    await queryRunner.createUniqueConstraint(
      'platforms',
      new TableUnique({
        columnNames: ['user_id', 'platform'],
        name: 'uq_user_platform',
      }),
    );

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_platforms_user_id" ON "platforms"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_platforms_platform" ON "platforms"("platform")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platforms');
  }
}
