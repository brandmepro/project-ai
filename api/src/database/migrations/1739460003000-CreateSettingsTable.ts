import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSettingsTable1739460003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'settings',
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
          // AI Settings
          {
            name: 'ai_priority',
            type: 'varchar',
            default: "'balanced'",
          },
          {
            name: 'auto_enhance',
            type: 'boolean',
            default: true,
          },
          {
            name: 'smart_hashtags',
            type: 'boolean',
            default: true,
          },
          {
            name: 'caption_length',
            type: 'varchar',
            default: "'medium'",
          },
          {
            name: 'emoji_usage',
            type: 'varchar',
            default: "'moderate'",
          },
          {
            name: 'visual_style',
            type: 'varchar',
            default: "'clean'",
          },
          {
            name: 'content_notifications',
            type: 'boolean',
            default: true,
          },
          {
            name: 'experimental_features',
            type: 'boolean',
            default: false,
          },
          // Preferences
          {
            name: 'theme',
            type: 'varchar',
            default: "'auto'",
          },
          {
            name: 'language',
            type: 'varchar',
            default: "'english'",
          },
          {
            name: 'timezone',
            type: 'varchar',
            default: "'UTC'",
          },
          {
            name: 'auto_save',
            type: 'boolean',
            default: true,
          },
          {
            name: 'dark_mode',
            type: 'boolean',
            default: false,
          },
          // Scheduling
          {
            name: 'auto_scheduling',
            type: 'boolean',
            default: true,
          },
          {
            name: 'min_buffer_hours',
            type: 'integer',
            default: 2,
          },
          {
            name: 'max_posts_per_day',
            type: 'integer',
            default: 10,
          },
          // Analytics
          {
            name: 'track_clicks',
            type: 'boolean',
            default: true,
          },
          {
            name: 'track_visits',
            type: 'boolean',
            default: true,
          },
          {
            name: 'include_reach',
            type: 'boolean',
            default: true,
          },
          {
            name: 'store_drafts',
            type: 'boolean',
            default: true,
          },
          {
            name: 'cache_content',
            type: 'boolean',
            default: true,
          },
          // Privacy
          {
            name: 'share_analytics',
            type: 'varchar',
            default: "'private'",
          },
          {
            name: 'api_logs',
            type: 'boolean',
            default: false,
          },
          {
            name: 'debug_mode',
            type: 'boolean',
            default: false,
          },
          {
            name: 'beta_features',
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
      'settings',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create index
    await queryRunner.query(`CREATE INDEX "idx_settings_user_id" ON "settings"("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('settings');
  }
}
