import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix, { exclude: ['/', 'health'] });

  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Business Pro API')
    .setDescription('AI-driven social media automation platform for local businesses')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile management')
    .addTag('AI', 'AI content generation and model selection')
    .addTag('Content', 'Content management (coming soon)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    customSiteTitle: 'Business Pro API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    jsonDocumentUrl: `${apiPrefix}/docs-json`,
  });

  // Railway injects $PORT dynamically — never hardcode a port in Railway Variables.
  // Binding to 0.0.0.0 is required; Railway's proxy won't reach 127.0.0.1.
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://0.0.0.0:${port}/${apiPrefix}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);

  const useRemoteDB = configService.get<string>('USE_REMOTE_DB') === 'true';
  const dbLabel = useRemoteDB ? 'Supabase (Remote)' : 'PostgreSQL (Local)';

  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      const opts = dataSource.options as any;
      const dbName = opts.database || (opts.url ? new URL(opts.url).pathname.replace('/', '') : 'unknown');
      logger.log(`Database connected successfully - ${dbLabel} | DB: ${dbName}`);
    } else {
      logger.warn(`Database not initialized - ${dbLabel}`);
    }
  } catch (err) {
    logger.error(`Database connection FAILED - ${dbLabel} | ${err.message}`);
  }
}

bootstrap();
