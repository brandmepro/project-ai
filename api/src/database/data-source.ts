import * as path from 'path';
import { DataSource } from 'typeorm';

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
});
