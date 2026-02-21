import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthColumns1739470000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make password_hash nullable for OAuth users (no-op if already nullable)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`);

    // Add OAuth columns — IF NOT EXISTS makes each line a no-op if column already exists
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" varchar`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "oauth_provider" varchar DEFAULT 'local'`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT true`);

    // Unique constraint on google_id
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          WHERE t.relname = 'users' AND c.contype = 'u'
            AND c.conname LIKE '%google_id%'
        ) THEN
          ALTER TABLE "users" ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id");
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_users_google_id" ON "users"("google_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "onboarding_completed"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "oauth_provider"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "google_id"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`);
  }
}
