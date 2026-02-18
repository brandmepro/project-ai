import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

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

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  const useRemoteDB = configService.get<string>('USE_REMOTE_DB') === 'true';
  const dbLabel = useRemoteDB ? 'Supabase (Remote)' : 'PostgreSQL (Local)';
  const dbName = useRemoteDB ? 'postgres' : configService.get<string>('LOCAL_DATABASE_NAME') || 'businesspro';

  logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`Database connected successfully - ${dbLabel} | DB: ${dbName}`);
}

bootstrap();
