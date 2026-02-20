/**
 * Standalone migration runner for Railway's preDeployCommand.
 *
 * Root cause of ENETUNREACH on Railway: pg calls getaddrinfo with AI_ALL,
 * which returns BOTH A and AAAA records. pg iterates them starting with the
 * IPv6 address. Railway containers have no IPv6 route → ENETUNREACH.
 *
 * Fix: resolve the Supabase hostname to IPv4 ourselves (dns.lookup family:4)
 * BEFORE creating the DataSource. pg receives a raw IPv4 address as `host`
 * and skips DNS entirely — so it can never pick an IPv6 address.
 */
import * as dns from 'dns';
import * as path from 'path';
import { promisify } from 'util';
import { DataSource } from 'typeorm';
import { loadApiEnv } from '../config/load-env';

loadApiEnv();

const dnsLookup = promisify(dns.lookup);

async function resolveIPv4(hostname: string): Promise<string> {
  try {
    const result = await dnsLookup(hostname, { family: 4 });
    console.log(`DNS: ${hostname} → ${result.address} (IPv4)`);
    return result.address;
  } catch (err: any) {
    console.warn(`IPv4 DNS lookup failed for ${hostname} (${err.message}), falling back to hostname`);
    return hostname;
  }
}

async function runMigrations() {
  console.log('=== Migration Runner ===');

  const useRemote = process.env.USE_REMOTE_DB === 'true';
  const remoteUrl  = process.env.SUPABASE_DATABASE_URL;

  console.log(`DB mode : ${useRemote ? 'Supabase (Direct)' : 'Local PostgreSQL'}`);

  let connectionConfig: Record<string, any>;

  if (useRemote && remoteUrl) {
    const u = new URL(remoteUrl);
    // Resolve the Supabase hostname to IPv4 before pg opens a socket.
    const ipv4Host = await resolveIPv4(u.hostname);

    connectionConfig = {
      host: ipv4Host,
      port: parseInt(u.port || '5432', 10),
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ''),
      ssl: { rejectUnauthorized: false },
    };
  } else {
    connectionConfig = {
      host: process.env.LOCAL_DATABASE_HOST || 'localhost',
      port: parseInt(process.env.LOCAL_DATABASE_PORT || '5432', 10),
      username: process.env.LOCAL_DATABASE_USER || 'postgres',
      password: process.env.LOCAL_DATABASE_PASSWORD || 'postgres',
      database: process.env.LOCAL_DATABASE_NAME || 'businesspro',
    };
  }

  const MigrateDataSource = new DataSource({
    type: 'postgres',
    ...(connectionConfig as any),
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: true,
  });

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
