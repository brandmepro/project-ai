import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateContentTable1739460002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'content',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'integer', isNullable: false },
          { name: 'caption', type: 'text', isNullable: false },
          { name: 'hashtags', type: 'text[]', default: "'{}'"},
          { name: 'platform', type: 'varchar', isNullable: false },
          { name: 'status', type: 'varchar', default: "'draft'" },
          { name: 'business_type', type: 'varchar', isNullable: true },
          { name: 'content_goal', type: 'varchar', isNullable: true },
          { name: 'tone', type: 'varchar', isNullable: true },
          { name: 'language', type: 'varchar', isNullable: true },
          { name: 'visual_style', type: 'varchar', isNullable: true },
          { name: 'scheduled_for', type: 'timestamp', isNullable: true },
          { name: 'published_at', type: 'timestamp', isNullable: true },
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
            AND tc.table_name = 'content' AND kcu.column_name = 'user_id'
        ) THEN
          ALTER TABLE "content" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_content_user_id" ON "content"("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_content_status" ON "content"("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_content_platform" ON "content"("platform")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('content');
  }
}
