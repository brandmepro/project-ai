import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEngagementToContent1738300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "content"
      ADD COLUMN IF NOT EXISTS "engagement" jsonb DEFAULT '{}';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "content"
      DROP COLUMN IF EXISTS "engagement";
    `);
  }
}
