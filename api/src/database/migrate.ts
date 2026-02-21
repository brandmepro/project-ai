/**
 * Standalone migration runner for Railway's preDeployCommand.
 *
 * Railway runs this BEFORE the main process starts, so the HTTP server
 * doesn't exist yet and no health check is active. Migrations complete
 * fully before the app starts, keeping startup fast and health checks clean.
 *
 * IMPORTANT: Supabase Direct Connection (db.xxx.supabase.co) is IPv6-only.
 * Railway has no outbound IPv6. Use the Session Pooler URL or enable the
 * Supabase IPv4 add-on in your project settings.
 *
 * Usage (Railway preDeployCommand):
 *   node api/dist/database/migrate.js
 */
import * as path from 'path';
import { DataSource } from 'typeorm';
import { loadApiEnv } from '../config/load-env';

loadApiEnv();

const useRemote = process.env.USE_REMOTE_DB === 'true';
const remoteUrl  = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

function buildConnectionConfig() {
  if (useRemote && remoteUrl) {
    const u = new URL(remoteUrl);
    return {
      host: u.hostname,
      port: parseInt(u.port || '5432', 10),
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ''),
      ssl: { rejectUnauthorized: false },
    };
  }
  return {
    host: process.env.LOCAL_DATABASE_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_DATABASE_PORT || '5432', 10),
    username: process.env.LOCAL_DATABASE_USER || 'postgres',
    password: process.env.LOCAL_DATABASE_PASSWORD || 'postgres',
    database: process.env.LOCAL_DATABASE_NAME || 'businesspro',
  };
}

const MigrateDataSource = new DataSource({
  type: 'postgres',
  ...(buildConnectionConfig() as any),
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  console.log('=== Migration Runner ===');
  console.log(`DB mode : ${useRemote ? 'Remote (Supabase)' : 'Local PostgreSQL'}`);

  try {
    console.log('Connecting to database...');
    await MigrateDataSource.initialize();
    console.log('Connected.');

    const pending = await MigrateDataSource.showMigrations();
    if (!pending) {
      console.log('No pending migrations — nothing to do.');
    } else {
      console.log('Running pending migrations...');
      const executed = await MigrateDataSource.runMigrations({ transaction: 'each' });
      console.log(`✅ ${executed.length} migration(s) completed:`);
      executed.forEach(m => console.log(`   ✓ ${m.name}`));
    }

    await MigrateDataSource.destroy();
    console.log('=== Migration Runner done ===');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Migration failed:', err?.message || err);
    console.error(err?.stack);
    await MigrateDataSource.destroy().catch(() => {});
    process.exit(1);
  }
}

runMigrations();
