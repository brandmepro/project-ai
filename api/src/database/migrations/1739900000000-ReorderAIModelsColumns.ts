import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReorderAIModelsColumns1739900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing table and recreate with correct column order
    await queryRunner.query(`DROP TABLE IF EXISTS ai_models CASCADE`);
    
    await queryRunner.query(`
      CREATE TABLE ai_models (
        id SERIAL PRIMARY KEY,
        model_id VARCHAR NOT NULL UNIQUE,
        model_name VARCHAR NOT NULL,
        provider VARCHAR NOT NULL,
        version VARCHAR,
        capabilities TEXT[] DEFAULT '{}',
        supports_streaming BOOLEAN DEFAULT false,
        supports_json_mode BOOLEAN DEFAULT false,
        supports_function_calling BOOLEAN DEFAULT false,
        supports_vision BOOLEAN DEFAULT false,
        supports_image_gen BOOLEAN DEFAULT false,
        supports_video_gen BOOLEAN DEFAULT false,
        supports_web_search BOOLEAN DEFAULT false,
        max_tokens INTEGER,
        context_window INTEGER,
        available_providers TEXT[] DEFAULT '{}',
        latency_ms DECIMAL(10, 2),
        throughput_tps INTEGER,
        cost_bucket VARCHAR NOT NULL,
        cost_per_1m_input DECIMAL(10, 4),
        cost_per_1m_output DECIMAL(10, 4),
        cache_read_cost_per_1m DECIMAL(10, 4),
        cache_write_cost_per_1m DECIMAL(10, 4),
        image_gen_cost DECIMAL(10, 4),
        video_gen_cost DECIMAL(10, 4),
        web_search_cost DECIMAL(10, 4),
        overall_quality_score DECIMAL(3, 2),
        reliability_score DECIMAL(3, 2),
        is_active BOOLEAN DEFAULT true,
        is_recommended BOOLEAN DEFAULT false,
        priority_rank INTEGER DEFAULT 0,
        description TEXT,
        use_cases TEXT[] DEFAULT '{}',
        limitations TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deprecated_at TIMESTAMP
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_ai_models_provider ON ai_models(provider)`);
    await queryRunner.query(`CREATE INDEX idx_ai_models_is_active ON ai_models(is_active)`);
    await queryRunner.query(`CREATE INDEX idx_ai_models_cost_bucket ON ai_models(cost_bucket)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ai_models CASCADE`);
  }
}
