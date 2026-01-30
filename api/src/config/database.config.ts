import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const useRemoteDB = process.env.USE_REMOTE_DB === 'true';
    
    const synchronize = process.env.DB_SYNCHRONIZE === 'true';
    const migrationsRun = process.env.DB_MIGRATIONS_RUN === 'true';
    const logging = process.env.DB_LOGGING === 'true';

    if (!isDevelopment && synchronize) {
      console.warn('⚠️  WARNING: DB_SYNCHRONIZE is true in production! This is dangerous!');
    }

    // Select database configuration based on USE_REMOTE_DB flag
    const dbConfig = useRemoteDB
      ? {
          host: process.env.REMOTE_DATABASE_HOST,
          port: parseInt(process.env.REMOTE_DATABASE_PORT || '5432', 10),
          username: process.env.REMOTE_DATABASE_USER,
          password: process.env.REMOTE_DATABASE_PASSWORD,
          database: process.env.REMOTE_DATABASE_NAME,
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {
          host: process.env.LOCAL_DATABASE_HOST || process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.LOCAL_DATABASE_PORT || process.env.DATABASE_PORT || '5432', 10),
          username: process.env.LOCAL_DATABASE_USER || process.env.DATABASE_USER || 'postgres',
          password: process.env.LOCAL_DATABASE_PASSWORD || process.env.DATABASE_PASSWORD || 'postgres',
          database: process.env.LOCAL_DATABASE_NAME || process.env.DATABASE_NAME || 'businesspro',
        };

    console.log(`🔌 Connecting to ${useRemoteDB ? 'REMOTE NeonDB' : 'LOCAL PostgreSQL'} database...`);
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);

    return {
      type: 'postgres',
      ...dbConfig,
      
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      
      synchronize,
      migrationsRun,
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      
      logging,
      
      poolSize: 10,
      extra: {
        max: 10,
        min: 2,
      },
    };
  },
);
