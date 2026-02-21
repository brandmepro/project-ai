import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePlatformsTable1739460005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'platforms',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'integer', isNullable: false },
          { name: 'platform', type: 'varchar', isNullable: false },
          { name: 'platform_user_id', type: 'varchar', isNullable: true },
          { name: 'platform_username', type: 'varchar', isNullable: true },
          { name: 'access_token', type: 'text', isNullable: true },
          { name: 'refresh_token', type: 'text', isNullable: true },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'is_connected', type: 'boolean', default: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'auto_crosspost', type: 'boolean', default: false },
          { name: 'tag_location', type: 'boolean', default: false },
          { name: 'last_sync_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
            AND tc.table_name = 'platforms' AND kcu.column_name = 'user_id'
        ) THEN
          ALTER TABLE "platforms" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_platform'
        ) THEN
          ALTER TABLE "platforms" ADD CONSTRAINT "uq_user_platform" UNIQUE ("user_id", "platform");
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_platforms_user_id" ON "platforms"("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_platforms_platform" ON "platforms"("platform")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platforms');
  }
}
