import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAIMemoriesTable1740000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE memory_category AS ENUM (
          'preference', 'performance_insight', 'style_preference', 'business_info',
          'audience_insight', 'correction', 'success_pattern', 'avoid_pattern',
          'seasonal', 'campaign', 'general'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE memory_source AS ENUM (
          'user_feedback', 'user_edit', 'performance_data',
          'user_input', 'auto_learning', 'system'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS ai_memories CASCADE`);
    await queryRunner.query(`
      CREATE TABLE ai_memories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        summary TEXT,
        category memory_category DEFAULT 'general',
        source memory_source DEFAULT 'auto_learning',
        embedding JSONB,
        importance FLOAT DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
        usage_count INTEGER DEFAULT 0,
        last_used_at TIMESTAMP,
        tags TEXT[] DEFAULT '{}',
        related_platform VARCHAR(100),
        related_task_type VARCHAR(100),
        context_metadata JSONB DEFAULT '{}',
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        is_pinned BOOLEAN DEFAULT FALSE,
        superseded_by TEXT,
        positive_feedback_count INTEGER DEFAULT 0,
        negative_feedback_count INTEGER DEFAULT 0,
        effectiveness_score FLOAT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        verified_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_AI_MEMORIES_USER_ID" ON ai_memories(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_AI_MEMORIES_CATEGORY" ON ai_memories(user_id, category)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_AI_MEMORIES_IMPORTANCE" ON ai_memories(user_id, importance)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_AI_MEMORIES_ACTIVE" ON ai_memories(is_active) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_AI_MEMORIES_PINNED" ON ai_memories(is_pinned) WHERE is_pinned = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_AI_MEMORIES_RELATED" ON ai_memories(related_platform, related_task_type)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_AI_MEMORIES_EMBEDDING" ON ai_memories USING gin(embedding)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ai_memories`);
    await queryRunner.query(`DROP TYPE IF EXISTS memory_source`);
    await queryRunner.query(`DROP TYPE IF EXISTS memory_category`);
  }
}
