import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1739460004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
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
            isUnique: true,
          },
          {
            name: 'push_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'content_ready',
            type: 'boolean',
            default: true,
          },
          {
            name: 'weekly_report',
            type: 'boolean',
            default: false,
          },
          {
            name: 'ai_suggestions',
            type: 'boolean',
            default: true,
          },
          {
            name: 'post_published',
            type: 'boolean',
            default: true,
          },
          {
            name: 'post_failed',
            type: 'boolean',
            default: true,
          },
          {
            name: 'new_features',
            type: 'boolean',
            default: false,
          },
          {
            name: 'marketing',
            type: 'boolean',
            default: false,
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

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
            AND tc.table_name = 'notifications' AND kcu.column_name = 'user_id'
        ) THEN
          ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
