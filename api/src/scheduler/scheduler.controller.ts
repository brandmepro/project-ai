import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ModelSyncScheduler } from './schedulers/model-sync.scheduler';
import { ModelSyncService } from './services/model-sync.service';

@ApiTags('scheduler')
@Controller('scheduler')
@ApiBearerAuth()
export class SchedulerController {
  constructor(
    private readonly modelSyncScheduler: ModelSyncScheduler,
    private readonly modelSyncService: ModelSyncService,
  ) {}

  @Post('sync-models')
  @Public()
  @ApiOperation({ summary: 'Manually trigger AI models synchronization' })
  @ApiResponse({
    status: 200,
    description: 'Models synchronization triggered successfully',
  })
  async triggerModelSync() {
    return this.modelSyncScheduler.triggerManualSync();
  }

  @Get('sync-stats')
  @Public()
  @ApiOperation({ summary: 'Get AI models sync statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns sync statistics',
  })
  async getSyncStats() {
    return this.modelSyncService.getSyncStats();
  }
}
