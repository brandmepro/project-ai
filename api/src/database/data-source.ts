import * as path from 'path';
import { DataSource } from 'typeorm';
import { loadApiEnv } from '../config/load-env';
import { getActiveRemoteDb } from '../config/remote-database.enum';

loadApiEnv();

const useRemote = process.env.USE_REMOTE_DB === 'true';

function buildConnectionConfig() {
  if (useRemote) {
    const { definition, url, target } = getActiveRemoteDb();
    const resolvedUrl = url || (target === 'railway' ? process.env.DATABASE_URL : undefined);

    if (!resolvedUrl) {
      console.warn(
        `[DataSource] REMOTE_DB_TARGET="${target}" but neither ${definition.envVar} nor DATABASE_URL is set. ` +
        `Falling back to local PostgreSQL.`,
      );
    } else {
      const urlSource = url ? definition.envVar : 'DATABASE_URL';
      console.log(`[DataSource] Remote DB → ${definition.label} (${urlSource})`);
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

  console.log(`[DataSource] Local DB → ${process.env.LOCAL_DATABASE_HOST || 'localhost'}`);
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

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(buildConnectionConfig() as any),
  entities:            [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations:          [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize:         false,
  logging:             true,
  logger:              'advanced-console',
});
