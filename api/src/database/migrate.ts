/**
 * Standalone migration runner for Railway's preDeployCommand.
 *
 * Railway runs this BEFORE the main process starts, so the HTTP server
 * doesn't exist yet and no health check is active. Migrations complete
 * fully before the app starts, keeping startup fast and health checks clean.
 *
 * Usage (Railway preDeployCommand):
 *   node api/dist/database/migrate.js
 */
import * as path from 'path';
import { DataSource } from 'typeorm';
import { loadApiEnv } from '../config/load-env';
import { getActiveRemoteDb, RemoteDatabase } from '../config/remote-database.enum';

loadApiEnv();

const useRemote = process.env.USE_REMOTE_DB === 'true';

function buildConnectionConfig() {
  if (useRemote) {
    const { target, definition, url } = getActiveRemoteDb();

    // On Railway CI the internal DATABASE_URL always wins (it's auto-injected).
    // For other remotes, the registered env var is used.
    const resolvedUrl =
      target === RemoteDatabase.RAILWAY
        ? (process.env.DATABASE_URL || url)   // prefer Railway's auto-injected var
        : url;

    if (!resolvedUrl) {
      console.warn(
        `[migrate] REMOTE_DB_TARGET="${target}" but ${definition.envVar} is not set. ` +
        `Falling back to local PostgreSQL.`,
      );
    } else {
      console.log(`[migrate] Remote DB → ${definition.label}`);
      const u = new URL(resolvedUrl.split('?')[0]);
      return {
        host:     u.hostname,
        port:     parseInt(u.port || '5432', 10),
        username: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.replace(/^\//, ''),
        ssl:      definition.ssl ? { rejectUnauthorized: false } : false,
        extra:    { family: 4 },
      };
    }
  }

  console.log(`[migrate] Local DB → ${process.env.LOCAL_DATABASE_HOST || 'localhost'}`);
  return {
    host:     process.env.LOCAL_DATABASE_HOST     || 'localhost',
    port:     parseInt(process.env.LOCAL_DATABASE_PORT || '5432', 10),
    username: process.env.LOCAL_DATABASE_USER     || 'postgres',
    password: process.env.LOCAL_DATABASE_PASSWORD || 'postgres',
    database: process.env.LOCAL_DATABASE_NAME     || 'businesspro',
    ssl:      false,
    extra:    {},
  };
}

const MigrateDataSource = new DataSource({
  type:                'postgres',
  ...(buildConnectionConfig() as any),
  entities:            [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations:          [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize:         false,
  logging:             true,
});

async function runMigrations() {
  const { target, definition } = getActiveRemoteDb();
  const label = useRemote ? `Remote (${definition.label})` : 'Local PostgreSQL';

  console.log('=== Migration Runner ===');
  console.log(`DB mode  : ${label}`);
  if (useRemote) console.log(`DB target: ${target} → ${definition.envVar}`);

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
