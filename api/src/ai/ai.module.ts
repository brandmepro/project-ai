import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { ModelSelectionService } from './services/model-selection.service';
import { FeedbackService } from './services/feedback.service';
import { AIGatewayService } from './services/ai-gateway.service';
import { ModelOptimizerService } from './services/model-optimizer.service';
import { AILog } from './entities/ai-log.entity';
import { AIModel } from './entities/ai-model.entity';
import { AITaskCategory } from './entities/ai-task-category.entity';
import { AIUserPreference } from './entities/ai-user-preference.entity';
import { AIUserFeedback } from './entities/ai-user-feedback.entity';
import { ContextModule } from '../context/context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AILog,
      AIModel,
      AITaskCategory,
      AIUserPreference,
      AIUserFeedback,
    ]),
    ContextModule,
  ],
  providers: [
    AIGatewayService,
    ModelOptimizerService,
    AIService,
    ModelSelectionService,
    FeedbackService,
  ],
  controllers: [AIController],
  exports: [AIService, ModelSelectionService, FeedbackService, AIGatewayService, ModelOptimizerService],
})
export class AIModule {}
