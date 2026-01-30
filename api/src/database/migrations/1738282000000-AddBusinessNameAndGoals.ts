import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBusinessNameAndGoals1738282000000 implements MigrationInterface {
  name = 'AddBusinessNameAndGoals1738282000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add business_name column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "business_name" varchar
    `);

    // Add content_goals column as text array with default empty array
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "content_goals" text[] DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove content_goals column
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "content_goals"
    `);

    // Remove business_name column
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "business_name"
    `);
  }
}
