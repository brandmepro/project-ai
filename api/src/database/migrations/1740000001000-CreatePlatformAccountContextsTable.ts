import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePlatformAccountContextsTable1740000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_account_contexts" CASCADE`);
    await queryRunner.createTable(
      new Table({
        name: 'platform_account_contexts',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'int' },
          { name: 'platform', type: 'varchar', length: '50' },
          { name: 'account_handle', type: 'varchar', length: '255', isNullable: true },
          { name: 'account_name', type: 'varchar', length: '255', isNullable: true },
          { name: 'account_bio', type: 'text', isNullable: true },
          { name: 'profile_image_url', type: 'varchar', isNullable: true },
          { name: 'followers_count', type: 'int', default: 0 },
          { name: 'following_count', type: 'int', default: 0 },
          { name: 'audience_demographics', type: 'jsonb', default: "'{}'"},
          { name: 'audience_description', type: 'text', isNullable: true },
          { name: 'performance_metrics', type: 'jsonb', default: "'{}'"},
          { name: 'historical_data', type: 'jsonb', default: "'{}'"},
          { name: 'content_strategy', type: 'jsonb', default: "'{}'"},
          { name: 'successful_campaigns', type: 'text[]', default: "'{}'"},
          { name: 'content_preferences', type: 'text[]', default: "'{}'"},
          { name: 'optimal_posting_schedule', type: 'text', isNullable: true },
          { name: 'high_performing_topics', type: 'text[]', default: "'{}'"},
          { name: 'low_performing_topics', type: 'text[]', default: "'{}'"},
          { name: 'average_engagement_rate', type: 'float', default: 0 },
          { name: 'best_content_format', type: 'varchar', length: '50', isNullable: true },
          { name: 'top_hashtags', type: 'text[]', default: "'{}'"},
          { name: 'learnings_notes', type: 'text', isNullable: true },
          { name: 'ab_test_results', type: 'jsonb', default: "'{}'"},
          { name: 'custom_context', type: 'jsonb', default: "'{}'"},
          { name: 'last_synced_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      false, // already dropped above
    );

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
            AND tc.table_name = 'platform_account_contexts' AND kcu.column_name = 'user_id'
        ) THEN
          ALTER TABLE "platform_account_contexts" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_PLATFORM_CONTEXTS_USER_ID" ON "platform_account_contexts"("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_PLATFORM_CONTEXTS_PLATFORM" ON "platform_account_contexts"("platform")`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_PLATFORM_CONTEXTS_USER_PLATFORM" ON "platform_account_contexts"("user_id", "platform")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platform_account_contexts');
  }
}
