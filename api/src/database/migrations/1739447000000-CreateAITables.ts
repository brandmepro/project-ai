import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAITables1739447000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create AI Task Categories table
    await queryRunner.createTable(
      new Table({
        name: 'ai_task_categories',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'key',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'typical_token_range',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'recommended_models',
            type: 'text[]',
            default: "'{}'",
          },
          {
            name: 'requires_vision',
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

    // Create AI Models table
    await queryRunner.createTable(
      new Table({
        name: 'ai_models',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'model_id',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'provider',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'context_window',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'max_output_tokens',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'supports_vision',
            type: 'boolean',
            default: false,
          },
          {
            name: 'supports_function_calling',
            type: 'boolean',
            default: false,
          },
          {
            name: 'supports_json_mode',
            type: 'boolean',
            default: false,
          },
          {
            name: 'supports_streaming',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_recommended',
            type: 'boolean',
            default: false,
          },
          {
            name: 'priority_rank',
            type: 'integer',
            default: 10,
          },
          {
            name: 'use_cases',
            type: 'text[]',
            default: "'{}'",
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

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_ai_models_provider" ON "ai_models"("provider")`);
    await queryRunner.query(`CREATE INDEX "idx_ai_models_is_active" ON "ai_models"("is_active")`);
    await queryRunner.query(`CREATE INDEX "idx_ai_models_is_recommended" ON "ai_models"("is_recommended")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ai_models');
    await queryRunner.dropTable('ai_task_categories');
  }
}
