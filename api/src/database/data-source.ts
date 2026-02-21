import * as path from 'path';
import { DataSource } from 'typeorm';
import { loadApiEnv } from '../config/load-env';

loadApiEnv();

const useRemote = process.env.USE_REMOTE_DB === 'true';
// Railway auto-injects DATABASE_URL when a Postgres service is in the same project.
// Fall back to SUPABASE_DATABASE_URL for backward compatibility.
const remoteUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

/**
 * When TypeORM receives `url:`, it passes `connectionString` to the pg Pool.
 * pg parses the URL internally and the `family` option in `extra` is silently
 * ignored — DNS resolves with family=0 (both), so Railway's IPv6-only DNS path
 * returns an AAAA record causing ENETUNREACH.
 *
 * Fix: parse the URL ourselves and pass discrete host/port/user/pass/db params.
 * pg then receives `family: 4` as a direct Pool option and honours it.
 */
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

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...buildConnectionConfig(),

  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',

  synchronize: false,
  logging: true,
  logger: 'advanced-console',

  extra: {
    family: 4, // Force IPv4 — pg only resolves A records, never AAAA
  },
});
