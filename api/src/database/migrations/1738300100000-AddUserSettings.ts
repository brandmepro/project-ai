import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSettings1738300100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "business_description" text,
      ADD COLUMN IF NOT EXISTS "avatar_url" varchar,
      ADD COLUMN IF NOT EXISTS "subscription_plan" varchar DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS "preferences" jsonb DEFAULT '{"language": "english", "tone": "friendly", "autoSave": true, "darkMode": false}',
      ADD COLUMN IF NOT EXISTS "notification_settings" jsonb DEFAULT '{"email": true, "push": true, "contentReady": true, "weeklyReport": true, "aiSuggestions": true}',
      ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "two_factor_secret" varchar;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "business_description",
      DROP COLUMN IF EXISTS "avatar_url",
      DROP COLUMN IF EXISTS "subscription_plan",
      DROP COLUMN IF EXISTS "preferences",
      DROP COLUMN IF EXISTS "notification_settings",
      DROP COLUMN IF EXISTS "two_factor_enabled",
      DROP COLUMN IF EXISTS "two_factor_secret";
    `);
  }
}
