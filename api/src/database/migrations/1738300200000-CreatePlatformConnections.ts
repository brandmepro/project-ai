import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlatformConnections1738300200000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum type exists, if not create it
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_enum') THEN
          CREATE TYPE "platform_enum" AS ENUM (
            'instagram',
            'facebook',
            'whatsapp',
            'google-business'
          );
        END IF;
      END $$;
    `);

    // Create table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_connections" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "platform" "platform_enum" NOT NULL,
        "is_connected" boolean DEFAULT false,
        "access_token" varchar,
        "refresh_token" varchar,
        "token_expires_at" timestamp,
        "platform_data" jsonb DEFAULT '{}',
        "connected_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_platform_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "unique_user_platform" UNIQUE ("user_id", "platform")
      );
    `);

    // Create index if not exists
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_platform_connections_user_id" ON "platform_connections"("user_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_platform_connections_user_id";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "platform_connections";
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "platform_enum";
    `);
  }
}
