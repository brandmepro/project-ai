import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAILogsTable1739460006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop first so a previously-synced schema (with different columns) is replaced cleanly.
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_logs" CASCADE`);

    await queryRunner.createTable(
      new Table({
        name: 'ai_logs',
        columns: [
          { name: 'id',                   type: 'serial',          isPrimary: true },
          { name: 'user_id',              type: 'integer',         isNullable: false },
          { name: 'organization_id',      type: 'integer',         isNullable: true },
          { name: 'feature',              type: 'varchar',  length: '100',  isNullable: false },
          { name: 'model_enum',           type: 'varchar',  length: '50',   isNullable: false },
          { name: 'provider',             type: 'varchar',  length: '50',   isNullable: true },
          { name: 'model_name',           type: 'varchar',  length: '100',  isNullable: true },
          { name: 'cost_bucket',          type: 'varchar',  length: '20',   isNullable: false },
          { name: 'estimated_cost_usd',   type: 'decimal',  precision: 10, scale: 4, isNullable: true },
          { name: 'prompt_tokens',        type: 'integer',         isNullable: true },
          { name: 'completion_tokens',    type: 'integer',         isNullable: true },
          { name: 'total_tokens',         type: 'integer',         isNullable: true },
          { name: 'input_data',           type: 'jsonb',           isNullable: true },
          { name: 'output_data',          type: 'jsonb',           isNullable: true },
          { name: 'duration_ms',          type: 'integer',         isNullable: true },
          { name: 'status',               type: 'varchar',         isNullable: false, default: "'success'" },
          { name: 'error_message',        type: 'text',            isNullable: true },
          { name: 'category_key',         type: 'varchar',         isNullable: true },
          { name: 'task_priority',        type: 'varchar',         isNullable: true },
          { name: 'task_complexity',      type: 'varchar',         isNullable: true },
          { name: 'selected_by',          type: 'varchar',         isNullable: false, default: "'auto'" },
          { name: 'confidence_score',     type: 'decimal',  precision: 3, scale: 2, isNullable: true },
          { name: 'created_at',           type: 'timestamp',       isNullable: false, default: 'now()' },
        ],
      }),
      false, // already dropped above — no need for ifNotExists
    );

    // Foreign keys
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

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_ai_logs_user_id"    ON "ai_logs"("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_ai_logs_feature"    ON "ai_logs"("feature")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_ai_logs_model_enum" ON "ai_logs"("model_enum")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_ai_logs_created_at" ON "ai_logs"("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_logs" CASCADE`);
  }
}
