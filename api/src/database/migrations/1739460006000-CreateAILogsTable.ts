import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAILogsTable1739460006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai_logs',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'integer', isNullable: false },
          { name: 'feature', type: 'varchar', isNullable: false },
          { name: 'model', type: 'varchar', isNullable: false },
          { name: 'prompt_tokens', type: 'integer', default: 0 },
          { name: 'completion_tokens', type: 'integer', default: 0 },
          { name: 'total_tokens', type: 'integer', default: 0 },
          { name: 'cost', type: 'decimal', precision: 10, scale: 6, default: 0 },
          { name: 'duration_ms', type: 'integer', isNullable: true },
          { name: 'success', type: 'boolean', default: true },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
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
            AND tc.table_name = 'ai_logs' AND kcu.column_name = 'user_id'
        ) THEN
          ALTER TABLE "ai_logs" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_ai_logs_user_id" ON "ai_logs"("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_ai_logs_feature" ON "ai_logs"("feature")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_ai_logs_model" ON "ai_logs"("model")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_ai_logs_created_at" ON "ai_logs"("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ai_logs');
  }
}
