import * as path from 'path';
import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getActiveRemoteDb } from './remote-database.enum';

const logger = new Logger('DatabaseConfig');

const TRUE_VALUES = new Set(['true', '1', 'yes', 'on']);

function readBooleanEnv(keys: string[], fallback = false): boolean {
  for (const key of keys) {
    const raw = process.env[key];
    if (raw === undefined) continue;
    return TRUE_VALUES.has(raw.trim().toLowerCase());
  }
  return fallback;
}

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useRemoteDB   = process.env.USE_REMOTE_DB === 'true';

  let synchronize = readBooleanEnv([
    'DB_SYNCHRONIZE', 'DB_SYNC', 'DB_SYNC_TEST', 'DATABASE_SYNCHRONIZE',
  ]);
  const migrationsRun = readBooleanEnv([
    'DB_MIGRATIONS_RUN', 'DB_MIGRATION_RUN', 'DB_MIGRATION', 'DATABASE_MIGRATIONS_RUN',
  ]);
  const logging = readBooleanEnv(['DB_LOGGING', 'DATABASE_LOGGING']);

  // CRITICAL: synchronize + migrationsRun simultaneously causes "type already exists" errors.
  if (synchronize && migrationsRun) {
    logger.error(
      '⛔ CONFLICT: DB_SYNCHRONIZE=true AND DB_MIGRATIONS_RUN=true cannot both be active! ' +
      'Disabling synchronize. Set DB_SYNCHRONIZE=false to silence this warning.',
    );
    synchronize = false;
  }

  if (!isDevelopment && synchronize) {
    logger.warn('DB_SYNCHRONIZE is true in a non-development environment — this is dangerous!');
  }

  // ── Glob paths (forward-slashes prevent silent Windows failures) ──────────
  const toGlob = (...parts: string[]) => path.join(...parts).replace(/\\/g, '/');
  const migrationsGlob = toGlob(__dirname, '..', 'database', 'migrations', '*{.ts,.js}');
  const entitiesGlob   = toGlob(__dirname, '..', '**', '*.entity{.ts,.js}');

  logger.log(`Migrations glob : ${migrationsGlob}`);
  logger.log(`Entities glob   : ${entitiesGlob}`);
  logger.log(`synchronize=${synchronize} | migrationsRun=${migrationsRun} | logging=${logging}`);

  const shared = {
    entities:                [entitiesGlob],
    autoLoadEntities:        true as const,
    synchronize,
    migrationsRun,
    migrations:              [migrationsGlob],
    migrationsTableName:     'migrations',
    migrationsTransactionMode: 'each' as const,
    logging,
  };

  // ── Remote DB ─────────────────────────────────────────────────────────────
  if (useRemoteDB) {
    const { target, definition, url } = getActiveRemoteDb();

    // Railway auto-injects the Postgres service URL as DATABASE_URL (not RAILWAY_DATABASE_URL).
    // Use DATABASE_URL as a transparent fallback so Railway's internal wiring always wins
    // without needing to manually mirror the variable in the dashboard.
    const resolvedUrl = url || (target === 'railway' ? process.env.DATABASE_URL : undefined);

    if (!resolvedUrl) {
      logger.error(
        `⛔ REMOTE_DB_TARGET="${target}" but neither ${definition.envVar} nor DATABASE_URL is set. Falling back to local.`,
      );
    } else {
      const urlSource = url ? definition.envVar : 'DATABASE_URL (Railway auto-inject)';
      logger.log(`Connecting to REMOTE → ${definition.label} (${urlSource})`);

      const u = new URL(resolvedUrl.split('?')[0]); // strip query params before parsing
      return {
        type:     'postgres',
        host:     u.hostname,
        port:     parseInt(u.port || '5432', 10),
        username: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.replace(/^\//, ''),
        schema:   'public',
        ssl:      definition.ssl ? { rejectUnauthorized: false } : false,
        poolSize: 10,
        extra: {
          max:                         10,
          min:                         2,
          connectionTimeoutMillis:     30_000,
          idleTimeoutMillis:           600_000,
          keepAlive:                   true,
          keepAliveInitialDelayMillis: 10_000,
          family:                      4,   // prefer IPv4; avoids ENETUNREACH on Railway
        },
        ...shared,
      };
    }
  }

  // ── Local DB ──────────────────────────────────────────────────────────────
  logger.log(`Connecting to LOCAL PostgreSQL | Host: ${process.env.LOCAL_DATABASE_HOST || 'localhost'}`);
  return {
    type:     'postgres',
    host:     process.env.LOCAL_DATABASE_HOST     || 'localhost',
    port:     parseInt(process.env.LOCAL_DATABASE_PORT || '5432', 10),
    username: process.env.LOCAL_DATABASE_USER     || 'postgres',
    password: process.env.LOCAL_DATABASE_PASSWORD || 'postgres',
    database: process.env.LOCAL_DATABASE_NAME     || 'businesspro',
    schema:   'public',
    ssl:      false,
    poolSize: 10,
    extra: { max: 10, min: 1, connectionTimeoutMillis: 30_000 },
    ...shared,
  };
});
