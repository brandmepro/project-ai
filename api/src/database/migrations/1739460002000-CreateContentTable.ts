import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateContentTable1739460002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'content',
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
          },
          {
            name: 'caption',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'hashtags',
            type: 'text[]',
            default: "'{}'",
          },
          {
            name: 'platform',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'draft'",
          },
          {
            name: 'business_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'content_goal',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'language',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'visual_style',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'scheduled_for',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
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
      'content',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_content_user_id" ON "content"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_content_status" ON "content"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_content_platform" ON "content"("platform")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('content');
  }
}
