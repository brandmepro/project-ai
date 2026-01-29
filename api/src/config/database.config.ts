import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const synchronize = process.env.DB_SYNCHRONIZE === 'true';
    const migrationsRun = process.env.DB_MIGRATIONS_RUN === 'true';
    const logging = process.env.DB_LOGGING === 'true';

    if (!isDevelopment && synchronize) {
      console.warn('⚠️  WARNING: DB_SYNCHRONIZE is true in production! This is dangerous!');
    }

    return {
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'businesspro',
      
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
