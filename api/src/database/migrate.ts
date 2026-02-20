/**
 * Standalone migration runner for Railway's preDeployCommand.
 *
 * Railway runs this BEFORE the main process starts, so the HTTP server
 * doesn't exist yet and no health check is active. Migrations complete
 * fully before the app starts, keeping startup fast and health checks clean.
 *
 * Usage (Railway preDeployCommand):
 *   node api/dist/database/migrate.js
 *
 * The same AppDataSource used by the NestJS app is reused here so both
 * always point to the same database and migrations table.
 */
import { AppDataSource } from './data-source';

async function runMigrations() {
  console.log('=== Migration Runner ===');
  console.log(`DB mode : ${process.env.USE_REMOTE_DB === 'true' ? 'Supabase (Direct)' : 'Local PostgreSQL'}`);

  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected.');

    const pending = await AppDataSource.showMigrations();
    if (!pending) {
      console.log('No pending migrations — nothing to do.');
    } else {
      console.log('Running pending migrations...');
      const executed = await AppDataSource.runMigrations({ transaction: 'each' });
      console.log(`✅ ${executed.length} migration(s) completed:`);
      executed.forEach(m => console.log(`   ✓ ${m.name}`));
    }

    await AppDataSource.destroy();
    console.log('=== Migration Runner done ===');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Migration failed:', err?.message || err);
    console.error(err?.stack);
    await AppDataSource.destroy().catch(() => {});
    process.exit(1);
  }
}

runMigrations();
