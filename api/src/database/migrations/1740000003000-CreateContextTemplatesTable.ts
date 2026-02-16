import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContextTemplatesTable1740000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE template_category AS ENUM (
        'product',
        'service',
        'campaign',
        'seasonal',
        'promotion',
        'announcement',
        'event',
        'custom'
      )
    `);

    // Create table
    await queryRunner.query(`
      CREATE TABLE context_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category template_category DEFAULT 'custom',
        content TEXT NOT NULL,
        variables JSONB DEFAULT '{}',
        applicable_platforms TEXT[] DEFAULT '{}',
        applicable_task_types TEXT[] DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        usage_count INTEGER DEFAULT 0,
        last_used_at TIMESTAMP,
        effectiveness_score FLOAT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        is_favorite BOOLEAN DEFAULT FALSE,
        priority INTEGER DEFAULT 0,
        custom_metadata JSONB DEFAULT '{}',
        valid_from DATE,
        valid_until DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IDX_CONTEXT_TEMPLATES_USER_ID ON context_templates(user_id)`);
    await queryRunner.query(`CREATE INDEX IDX_CONTEXT_TEMPLATES_CATEGORY ON context_templates(category)`);
    await queryRunner.query(`CREATE INDEX IDX_CONTEXT_TEMPLATES_ACTIVE ON context_templates(is_active) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IDX_CONTEXT_TEMPLATES_PRIORITY ON context_templates(priority DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE context_templates`);
    await queryRunner.query(`DROP TYPE template_category`);
  }
}
