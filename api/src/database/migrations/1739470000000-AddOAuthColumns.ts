import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOAuthColumns1739470000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make password_hash nullable for OAuth users
    await queryRunner.changeColumn(
      'users',
      'password_hash',
      new TableColumn({
        name: 'password_hash',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add OAuth-related columns
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'google_id',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'oauth_provider',
        type: 'varchar',
        default: "'local'",
        comment: 'Authentication provider: local, google',
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'onboarding_completed',
        type: 'boolean',
        default: true,
        comment: 'Tracks if OAuth users have completed business info collection',
      }),
    );

    // Create index on google_id for faster lookups
    await queryRunner.query(
      `CREATE INDEX "idx_users_google_id" ON "users"("google_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "idx_users_google_id"`);

    // Remove OAuth columns
    await queryRunner.dropColumn('users', 'onboarding_completed');
    await queryRunner.dropColumn('users', 'oauth_provider');
    await queryRunner.dropColumn('users', 'google_id');

    // Revert password_hash to non-nullable
    await queryRunner.changeColumn(
      'users',
      'password_hash',
      new TableColumn({
        name: 'password_hash',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}
