import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBusinessProfilesTable1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop first so a previously synced UUID-id version is replaced with serial.
    await queryRunner.query(`DROP TABLE IF EXISTS "business_profiles" CASCADE`);
    await queryRunner.createTable(
      new Table({
        name: 'business_profiles',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'int', isUnique: true },
          { name: 'business_name', type: 'varchar', length: '255' },
          { name: 'business_type', type: 'varchar', length: '100' },
          { name: 'description', type: 'text' },
          { name: 'tagline', type: 'text', isNullable: true },
          { name: 'elevator_pitch', type: 'text', isNullable: true },
          { name: 'products', type: 'jsonb', default: "'[]'" },
          { name: 'services_offered', type: 'text[]', default: "'{}'"},
          { name: 'unique_selling_points', type: 'text[]', default: "'{}'"},
          { name: 'brand_voice', type: 'jsonb', default: "'{}'"},
          { name: 'brand_assets', type: 'jsonb', isNullable: true },
          { name: 'brand_values', type: 'text[]', default: "'{}'"},
          { name: 'target_audience', type: 'text', isNullable: true },
          { name: 'audience_age_range', type: 'varchar', length: '100', isNullable: true },
          { name: 'audience_interests', type: 'text[]', default: "'{}'"},
          { name: 'audience_location', type: 'varchar', length: '100', isNullable: true },
          { name: 'business_goals', type: 'text[]', default: "'{}'"},
          { name: 'success_metrics', type: 'text[]', default: "'{}'"},
          { name: 'marketing_objectives', type: 'text', isNullable: true },
          { name: 'competitors', type: 'text[]', default: "'{}'"},
          { name: 'market_position', type: 'text', isNullable: true },
          { name: 'content_themes', type: 'text[]', default: "'{}'"},
          { name: 'content_avoid_topics', type: 'text[]', default: "'{}'"},
          { name: 'content_frequency_preference', type: 'text', isNullable: true },
          { name: 'additional_context', type: 'text', isNullable: true },
          { name: 'custom_fields', type: 'jsonb', default: "'{}'"},
          { name: 'completeness_score', type: 'int', default: 0 },
          { name: 'is_verified', type: 'boolean', default: false },
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
            AND tc.table_name = 'business_profiles' AND kcu.column_name = 'user_id'
        ) THEN
          ALTER TABLE "business_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_BUSINESS_PROFILES_USER_ID" ON "business_profiles"("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_BUSINESS_PROFILES_COMPLETENESS" ON "business_profiles"("completeness_score")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('business_profiles');
  }
}
