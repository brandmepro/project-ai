/**
 * Standalone migration runner for Railway's preDeployCommand.
 *
 * Railway runs this BEFORE the main process starts so migrations complete
 * before the app boots and before health checks begin.
 *
 * URL resolution order for Railway target:
 *   1. DATABASE_URL           — auto-injected by Railway for a linked Postgres service
 *   2. RAILWAY_DATABASE_URL   — our custom var (must be a raw URL, NOT a ${{}} reference)
 *   3. PGHOST + PGPORT + …    — individual pg env vars Railway sometimes injects
 *
 * NOTE: ${{Postgres.DATABASE_URL}} reference variables are NOT resolved during
 * preDeployCommand — Railway only resolves them at main-container runtime.
 * Always store RAILWAY_DATABASE_URL as a raw connection string on the dashboard.
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

/** Returns the first env-var value that looks like a real postgres URL (not a ${{}} reference). */
function pickUrl(...candidates: Array<string | undefined>): string | undefined {
  for (const v of candidates) {
    if (v && v.startsWith('postgresql://') || v && v.startsWith('postgres://')) {
      return v;
    }
  }
  return undefined;
}

function buildConnectionConfig() {
  if (useRemote) {
    const { target, definition, url } = getActiveRemoteDb();

    let resolvedUrl: string | undefined;
    let urlSource   = definition.envVar;

    if (target === RemoteDatabase.RAILWAY) {
      // Try every variable Railway may inject, in priority order.
      resolvedUrl = pickUrl(
        process.env.DATABASE_URL,           // auto-injected by Railway (linked Postgres service)
        process.env.DATABASE_PRIVATE_URL,   // private-network variant
        url,                                // our RAILWAY_DATABASE_URL (must be a raw string)
        process.env.PGHOST
          ? `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE}`
          : undefined,
      );

      if (resolvedUrl === process.env.DATABASE_URL)         urlSource = 'DATABASE_URL';
      else if (resolvedUrl === process.env.DATABASE_PRIVATE_URL) urlSource = 'DATABASE_PRIVATE_URL';
      else if (resolvedUrl === url)                         urlSource = definition.envVar;
      else if (resolvedUrl)                                 urlSource = 'PGHOST/PGPORT/PGUSER/...';
    } else {
      resolvedUrl = url;
    }

    if (!resolvedUrl) {
      console.error(
        `[migrate] ⛔ REMOTE_DB_TARGET="${target}" but no valid DB URL found.\n` +
        `  Checked: DATABASE_URL, DATABASE_PRIVATE_URL, ${definition.envVar}, PGHOST.\n` +
        `  Make sure "${definition.envVar}" is set to a raw postgresql:// string on Railway\n` +
        `  (NOT a \${{}} reference — those don't resolve in preDeployCommand).\n` +
        `  Falling back to local PostgreSQL.`,
      );
    } else {
      console.log(`[migrate] Remote DB → ${definition.label}  (source: ${urlSource})`);
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
  if (useRemote) console.log(`DB target: ${target} → checking DATABASE_URL, DATABASE_PRIVATE_URL, ${definition.envVar}`);

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
