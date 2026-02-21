import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSubscriptionsTable1739460001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'integer', isNullable: false, isUnique: true },
          { name: 'plan', type: 'varchar', default: "'free'" },
          { name: 'status', type: 'varchar', default: "'active'" },
          { name: 'billing_cycle', type: 'varchar', isNullable: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'currency', type: 'varchar', default: "'USD'" },
          { name: 'trial_ends_at', type: 'timestamp', isNullable: true },
          { name: 'current_period_start', type: 'timestamp', isNullable: true },
          { name: 'current_period_end', type: 'timestamp', isNullable: true },
          { name: 'cancel_at_period_end', type: 'boolean', default: false },
          { name: 'canceled_at', type: 'timestamp', isNullable: true },
          { name: 'stripe_customer_id', type: 'varchar', isNullable: true },
          { name: 'stripe_subscription_id', type: 'varchar', isNullable: true },
          { name: 'payment_method', type: 'varchar', isNullable: true },
          { name: 'last_payment_at', type: 'timestamp', isNullable: true },
          { name: 'next_payment_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
            AND tc.table_name = 'subscriptions' AND kcu.column_name = 'user_id'
        ) THEN
          ALTER TABLE "subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_subscriptions_user_id" ON "subscriptions"("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_subscriptions_status" ON "subscriptions"("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
  }
}
