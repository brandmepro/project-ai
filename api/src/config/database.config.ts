import * as path from 'path';
import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

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
  const useRemoteDB = process.env.USE_REMOTE_DB === 'true';

  let synchronize = readBooleanEnv([
    'DB_SYNCHRONIZE',
    'DB_SYNC',
    'DB_SYNC_TEST',
    'DATABASE_SYNCHRONIZE',
  ]);
  const migrationsRun = readBooleanEnv([
    'DB_MIGRATIONS_RUN',
    'DB_MIGRATION_RUN',
    'DB_MIGRATION',
    'DATABASE_MIGRATIONS_RUN',
    'DATABASE_MIGRATION_RUN',
  ]);
  const logging = readBooleanEnv(['DB_LOGGING', 'DATABASE_LOGGING']);

  // CRITICAL: Never run both synchronize AND migrationsRun simultaneously.
  // Migrations create PostgreSQL ENUM types (e.g. memory_category, memory_source).
  // If synchronize also runs it will try to CREATE those same types again →
  // "ERROR: type already exists" → app crashes on a fresh database.
  // Migrations always win — they are explicit and version-controlled.
  if (synchronize && migrationsRun) {
    logger.error(
      '⛔ CONFLICT: DB_SYNCHRONIZE=true AND DB_MIGRATIONS_RUN=true cannot both be active! ' +
      'Disabling synchronize automatically. Set DB_SYNCHRONIZE=false in your .env to silence this warning.',
    );
    synchronize = false;
  }

  if (!isDevelopment && synchronize) {
    logger.warn('DB_SYNCHRONIZE is true in a non-development environment — this is dangerous!');
  }

  const remoteUrl = process.env.SUPABASE_DATABASE_URL;

  const displayHost = useRemoteDB
    ? (remoteUrl ? new URL(remoteUrl).hostname : process.env.LOCAL_DATABASE_HOST)
    : (process.env.LOCAL_DATABASE_HOST || 'localhost');

  const displayDb = useRemoteDB
    ? (remoteUrl ? new URL(remoteUrl).pathname.replace('/', '') : 'postgres')
    : (process.env.LOCAL_DATABASE_NAME || 'businesspro');

  logger.log(`Connecting to ${useRemoteDB ? 'REMOTE Supabase (Direct)' : 'LOCAL PostgreSQL'} | Host: ${displayHost} | DB: ${displayDb}`);

  // Remote (Supabase Direct): up to 10 persistent connections — Direct Connection supports
  // long-lived connections unlike the Session Pooler which drops idle ones after ~5 min.
  // Local: 10 — unconstrained local Postgres.
  const poolMax = useRemoteDB ? 10 : 10;
  const poolMin = useRemoteDB ? 2 : 1;

  // CRITICAL: TypeORM's internal glob resolver can silently find 0 files on Windows
  // when paths contain mixed separators (backslash from __dirname + forward-slash literals).
  // Always normalise to forward-slashes so the glob works on every OS.
  const toGlob = (...parts: string[]) =>
    path.join(...parts).replace(/\\/g, '/');

  const migrationsGlob = toGlob(__dirname, '..', 'database', 'migrations', '*{.ts,.js}');
  const entitiesGlob   = toGlob(__dirname, '..', '**', '*.entity{.ts,.js}');

  logger.log(`Migrations glob : ${migrationsGlob}`);
  logger.log(`Entities glob   : ${entitiesGlob}`);
  logger.log(`synchronize=${synchronize} | migrationsRun=${migrationsRun} | logging=${logging}`);

  const shared = {
    entities: [entitiesGlob],
    autoLoadEntities: true as const,
    synchronize,
    migrationsRun,
    migrations: [migrationsGlob],
    migrationsTableName: 'migrations', // explicit — matches data-source.ts
    migrationsTransactionMode: 'each' as const, // each migration in its own tx for safety
    logging,
    poolSize: poolMax,
    extra: {
      max: poolMax,
      min: poolMin,
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 600000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },
  };

  if (useRemoteDB && remoteUrl) {
    return {
      type: 'postgres',
      url: remoteUrl,
      schema: 'public',
      ssl: { rejectUnauthorized: false },
      ...shared,
    };
  }

  return {
    type: 'postgres',
    host: process.env.LOCAL_DATABASE_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_DATABASE_PORT || '5432', 10),
    username: process.env.LOCAL_DATABASE_USER || 'postgres',
    password: process.env.LOCAL_DATABASE_PASSWORD || 'postgres',
    database: process.env.LOCAL_DATABASE_NAME || 'businesspro',
    schema: 'public',
    ...shared,
  };
});
