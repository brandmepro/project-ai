import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSettings1739347200000 implements MigrationInterface {
  name = 'AddUserSettings1739347200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add ai_settings column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "ai_settings" jsonb DEFAULT '{
        "aiPriority": "balanced",
        "autoEnhance": true,
        "smartHashtags": true,
        "contentNotifications": true,
        "experimentalFeatures": false,
        "visualStyle": "clean",
        "captionLength": "medium",
        "emojiUsage": "moderate"
      }'::jsonb
    `);

    // Add scheduling_settings column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "scheduling_settings" jsonb DEFAULT '{
        "autoScheduling": true,
        "optimizeTiming": true,
        "minBuffer": 2,
        "maxPostsPerDay": 3,
        "postingSchedule": {
          "monday": ["09:00", "14:00", "19:00"],
          "tuesday": ["09:00", "14:00", "19:00"],
          "wednesday": ["09:00", "14:00", "19:00"],
          "thursday": ["09:00", "14:00", "19:00"],
          "friday": ["09:00", "14:00", "19:00"],
          "saturday": ["11:00", "17:00"],
          "sunday": ["11:00", "17:00"]
        }
      }'::jsonb
    `);

    // Add analytics_settings column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "analytics_settings" jsonb DEFAULT '{
        "weeklyReportDay": "monday",
        "includeReach": true,
        "includeEngagement": true,
        "includeGrowth": true,
        "includeTopPosts": true,
        "trackClicks": true,
        "trackVisits": true,
        "trackDemographics": false
      }'::jsonb
    `);

    // Add privacy_settings column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "privacy_settings" jsonb DEFAULT '{
        "storeDrafts": true,
        "cacheContent": true,
        "analyticsCollection": true,
        "profileVisibility": "public",
        "shareAnalytics": "team"
      }'::jsonb
    `);

    // Add advanced_settings column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "advanced_settings" jsonb DEFAULT '{
        "debugMode": false,
        "apiLogs": false,
        "betaFeatures": false,
        "aiModelTesting": false,
        "imageQuality": "high",
        "cacheDuration": 7
      }'::jsonb
    `);

    // Add platform_preferences column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "platform_preferences" jsonb DEFAULT '{
        "autoCrosspost": true,
        "platformOptimizations": true,
        "tagLocation": false
      }'::jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "platform_preferences"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "advanced_settings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "privacy_settings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "analytics_settings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "scheduling_settings"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "ai_settings"`);
  }
}
