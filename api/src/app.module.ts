import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AppController } from './app.controller';

// Config
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import aiConfig from './config/ai.config';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AIModule } from './ai/ai.module';
import { ContentModule } from './content/content.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PlatformsModule } from './platforms/platforms.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, aiConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Feature Modules
    AuthModule,
    UsersModule,
    SettingsModule,
    NotificationsModule,
    AIModule,
    ContentModule,
    AnalyticsModule,
    DashboardModule,
    PlatformsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    // Global Exception Filter - Proper error responses
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global JWT Guard - All routes protected by default
    // Use @Public() decorator to make routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
