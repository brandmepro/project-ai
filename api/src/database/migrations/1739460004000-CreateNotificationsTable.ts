import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateNotificationsTable1739460004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'push_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'content_ready',
            type: 'boolean',
            default: true,
          },
          {
            name: 'weekly_report',
            type: 'boolean',
            default: false,
          },
          {
            name: 'ai_suggestions',
            type: 'boolean',
            default: true,
          },
          {
            name: 'post_published',
            type: 'boolean',
            default: true,
          },
          {
            name: 'post_failed',
            type: 'boolean',
            default: true,
          },
          {
            name: 'new_features',
            type: 'boolean',
            default: false,
          },
          {
            name: 'marketing',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create index
    await queryRunner.query(`CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
