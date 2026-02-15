import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AIModel } from '../ai/entities/ai-model.entity';
import { ModelSyncService } from './services/model-sync.service';
import { ModelSyncScheduler } from './schedulers/model-sync.scheduler';
import { SchedulerController } from './scheduler.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([AIModel]),
  ],
  controllers: [SchedulerController],
  providers: [ModelSyncService, ModelSyncScheduler],
  exports: [ModelSyncService, ModelSyncScheduler],
})
export class SchedulerModule {}
