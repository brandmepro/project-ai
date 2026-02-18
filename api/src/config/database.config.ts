import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useRemoteDB = process.env.USE_REMOTE_DB === 'true';

  const synchronize = process.env.DB_SYNCHRONIZE === 'true';
  const migrationsRun = process.env.DB_MIGRATIONS_RUN === 'true';
  const logging = process.env.DB_LOGGING === 'true';

  if (!isDevelopment && synchronize) {
    console.warn('⚠️  WARNING: DB_SYNCHRONIZE is true in production! This is dangerous!');
  }

  const remoteUrl = process.env.SUPABASE_DATABASE_URL;

  const displayHost = useRemoteDB
    ? (remoteUrl ? new URL(remoteUrl).hostname : process.env.LOCAL_DATABASE_HOST)
    : (process.env.LOCAL_DATABASE_HOST || 'localhost');

  const displayDb = useRemoteDB
    ? (remoteUrl ? new URL(remoteUrl).pathname.replace('/', '') : 'postgres')
    : (process.env.LOCAL_DATABASE_NAME || 'businesspro');

  console.log(`🔌 Connecting to ${useRemoteDB ? 'REMOTE Supabase (Session Pooler)' : 'LOCAL PostgreSQL'}...`);
  console.log(`   Host: ${displayHost} | DB: ${displayDb}`);

  const shared = {
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    autoLoadEntities: true as const,
    synchronize,
    migrationsRun,
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    logging,
    extra: {
      max: useRemoteDB ? 5 : 10,
      min: 1,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
    },
  };

  if (useRemoteDB && remoteUrl) {
    return {
      type: 'postgres',
      url: remoteUrl,
      schema: 'public',
      ssl: { rejectUnauthorized: false },
      poolSize: 5,
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
    poolSize: 10,
    ...shared,
  };
});
