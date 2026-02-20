import * as path from 'path';
import { DataSource } from 'typeorm';
import { loadApiEnv } from '../config/load-env';

loadApiEnv();

const useRemote = process.env.USE_REMOTE_DB === 'true';
const remoteUrl = process.env.SUPABASE_DATABASE_URL;

const connectionConfig = useRemote && remoteUrl
  ? {
      url: remoteUrl,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.LOCAL_DATABASE_HOST || 'localhost',
      port: parseInt(process.env.LOCAL_DATABASE_PORT || '5432', 10),
      username: process.env.LOCAL_DATABASE_USER || 'postgres',
      password: process.env.LOCAL_DATABASE_PASSWORD || 'postgres',
      database: process.env.LOCAL_DATABASE_NAME || 'businesspro',
    };

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...connectionConfig,

  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',

  synchronize: false,
  logging: true,
  logger: 'advanced-console',

  // Force IPv4: Railway's network has no IPv6 route so DNS returning an
  // AAAA record causes ENETUNREACH. family:4 tells pg to only resolve A records.
  extra: {
    family: 4,
  },
});
