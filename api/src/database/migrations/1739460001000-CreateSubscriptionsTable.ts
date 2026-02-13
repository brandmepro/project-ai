import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSubscriptionsTable1739460001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
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
            name: 'plan',
            type: 'varchar',
            default: "'free'",
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'active'",
          },
          {
            name: 'billing_cycle',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'USD'",
          },
          {
            name: 'trial_ends_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'current_period_start',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'current_period_end',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancel_at_period_end',
            type: 'boolean',
            default: false,
          },
          {
            name: 'canceled_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'stripe_customer_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripe_subscription_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_method',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'last_payment_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'next_payment_at',
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
      'subscriptions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_subscriptions_status" ON "subscriptions"("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
  }
}
