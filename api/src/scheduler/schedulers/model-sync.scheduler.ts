import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ModelSyncService } from '../services/model-sync.service';

@Injectable()
export class ModelSyncScheduler {
  private readonly logger = new Logger(ModelSyncScheduler.name);
  private readonly cronExpression: string;
  private readonly isEnabled: boolean;

  constructor(
    private readonly modelSyncService: ModelSyncService,
    private readonly configService: ConfigService,
  ) {
    // Get CRON expression from environment or use default (every day at 2 AM)
    this.cronExpression =
      this.configService.get<string>('MODEL_SYNC_CRON_SCHEDULE') ||
      CronExpression.EVERY_DAY_AT_2AM;

    // Check if sync is enabled
    this.isEnabled =
      this.configService.get<string>('MODEL_SYNC_ENABLED') !== 'false';

    if (this.isEnabled) {
      this.logger.log(
        `AI Model Sync Scheduler initialized with cron: ${this.cronExpression}`,
      );
    } else {
      this.logger.warn('AI Model Sync Scheduler is DISABLED');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'sync-ai-models',
    timeZone: 'UTC',
  })
  async handleCronModelSync() {
    if (!this.isEnabled) {
      return;
    }

    this.logger.log('Starting scheduled AI models synchronization...');
    const startTime = Date.now();

    try {
      const result = await this.modelSyncService.syncModels();
      const duration = Date.now() - startTime;

      this.logger.log(
        `✅ AI Models sync completed successfully in ${duration}ms`,
      );
      this.logger.log(
        `📊 Stats: ${result.total} total, ${result.created} created, ${result.updated} updated, ${result.failed} failed`,
      );

      // Log sync statistics
      const stats = await this.modelSyncService.getSyncStats();
      this.logger.log(
        `📈 Database Stats: ${stats.activeModels} active models, ${stats.inactiveModels} inactive models`,
      );
    } catch (error: any) {
      this.logger.error('❌ Scheduled AI models sync failed', error?.stack);
    }
  }

  /**
   * Manual sync trigger (can be called via API endpoint)
   */
  async triggerManualSync(): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    this.logger.log('Manual AI models sync triggered');

    try {
      const result = await this.modelSyncService.syncModels();
      return {
        success: true,
        result,
      };
    } catch (error: any) {
      this.logger.error('Manual AI models sync failed', error?.stack);
      return {
        success: false,
        error: error?.message,
      };
    }
  }

}

