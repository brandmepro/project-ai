import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds extra columns to ai_task_categories and ai_models that were missing
 * from the initial CreateAITables migration.
 *
 * NOTE: AI model data is intentionally NOT seeded here.
 * The ModelSyncScheduler cron job (runs at 2 AM UTC daily) fetches and upserts
 * the full model list from the Vercel AI Gateway automatically.
 * Trigger it manually via POST /api/v1/scheduler/sync-models if you need
 * an immediate seed after a fresh database setup.
 */
export class SeedAIModels1739448000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add extra metadata columns to ai_task_categories
    await queryRunner.query(`
      ALTER TABLE "ai_task_categories"
      ADD COLUMN IF NOT EXISTS "required_capabilities"  TEXT[]       DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "preferred_capabilities" TEXT[]       DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "default_priority"       VARCHAR,
      ADD COLUMN IF NOT EXISTS "default_complexity"     VARCHAR,
      ADD COLUMN IF NOT EXISTS "typical_max_tokens"     INTEGER,
      ADD COLUMN IF NOT EXISTS "typical_temperature"    DECIMAL(4,2),
      ADD COLUMN IF NOT EXISTS "tags"                   TEXT[]       DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "is_active"              BOOLEAN      DEFAULT true
    `);

    // Add pricing, capability, and performance columns to ai_models
    await queryRunner.query(`
      ALTER TABLE "ai_models"
      ADD COLUMN IF NOT EXISTS "version"                   VARCHAR,
      ADD COLUMN IF NOT EXISTS "cost_bucket"               VARCHAR,
      ADD COLUMN IF NOT EXISTS "capabilities"              TEXT[]        DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "metadata"                  JSONB         DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "latency_ms"                DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS "throughput_tps"            INTEGER,
      ADD COLUMN IF NOT EXISTS "cost_per_1m_input"         DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS "cost_per_1m_output"        DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS "cache_read_cost_per_1m"    DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS "cache_write_cost_per_1m"   DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS "image_gen_cost"            DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS "video_gen_cost"            DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS "web_search_cost"           DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS "supports_image_gen"        BOOLEAN       DEFAULT false,
      ADD COLUMN IF NOT EXISTS "supports_video_gen"        BOOLEAN       DEFAULT false,
      ADD COLUMN IF NOT EXISTS "supports_web_search"       BOOLEAN       DEFAULT false,
      ADD COLUMN IF NOT EXISTS "available_providers"       TEXT[]        DEFAULT '{}'
    `);

    // Drop stale cost columns from original schema
    await queryRunner.query(`
      ALTER TABLE "ai_models"
      DROP COLUMN IF EXISTS "cost_per_1k_input",
      DROP COLUMN IF EXISTS "cost_per_1k_output",
      DROP COLUMN IF EXISTS "average_speed_ms"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ai_models"
      DROP COLUMN IF EXISTS "version",
      DROP COLUMN IF EXISTS "cost_bucket",
      DROP COLUMN IF EXISTS "capabilities",
      DROP COLUMN IF EXISTS "metadata",
      DROP COLUMN IF EXISTS "latency_ms",
      DROP COLUMN IF EXISTS "throughput_tps",
      DROP COLUMN IF EXISTS "cost_per_1m_input",
      DROP COLUMN IF EXISTS "cost_per_1m_output",
      DROP COLUMN IF EXISTS "cache_read_cost_per_1m",
      DROP COLUMN IF EXISTS "cache_write_cost_per_1m",
      DROP COLUMN IF EXISTS "image_gen_cost",
      DROP COLUMN IF EXISTS "video_gen_cost",
      DROP COLUMN IF EXISTS "web_search_cost",
      DROP COLUMN IF EXISTS "supports_image_gen",
      DROP COLUMN IF EXISTS "supports_video_gen",
      DROP COLUMN IF EXISTS "supports_web_search",
      DROP COLUMN IF EXISTS "available_providers"
    `);

    await queryRunner.query(`
      ALTER TABLE "ai_task_categories"
      DROP COLUMN IF EXISTS "required_capabilities",
      DROP COLUMN IF EXISTS "preferred_capabilities",
      DROP COLUMN IF EXISTS "default_priority",
      DROP COLUMN IF EXISTS "default_complexity",
      DROP COLUMN IF EXISTS "typical_max_tokens",
      DROP COLUMN IF EXISTS "typical_temperature",
      DROP COLUMN IF EXISTS "tags",
      DROP COLUMN IF EXISTS "is_active"
    `);
  }
}
