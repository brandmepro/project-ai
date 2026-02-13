import { Controller, Post, Get, Body, Query, UseGuards, Param, Sse } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AIService } from './ai.service';
import { ModelSelectionService } from './services/model-selection.service';
import { FeedbackService } from './services/feedback.service';
import { TaskRequestDto } from './dto/task-request.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { AITaskCategory } from './types/ai-types';
import { Observable } from 'rxjs';

// Temporary DTOs until we fix the AI gateway
class GenerateIdeasRequest { businessType: string; platforms: string[]; contentGoal: string; tone: string; language: string; visualStyle: string; context?: string; }
class GenerateCaptionRequest { businessType: string; platform: string; contentGoal: string; tone: string; language: string; context?: string; imageUrl?: string; videoUrl?: string; }
class GenerateHooksRequest { businessType: string; contentType: string; goal: string; language?: string; }
class GenerateHashtagsRequest { caption: string; businessType: string; platform: string; language: string; }

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private aiService: AIService,
    private modelSelectionService: ModelSelectionService,
    private feedbackService: FeedbackService,
  ) {}

  @Post('generate/task')
  @ApiOperation({ summary: 'Generate content with intelligent model selection' })
  @ApiResponse({ status: 200, description: 'Content generated successfully' })
  async generateWithTask(
    @CurrentUser('id') userId: number,
    @Body() request: TaskRequestDto,
  ) {
    return this.aiService.generateWithTask(userId, request);
  }

  @Post('select-model')
  @ApiOperation({ summary: 'Get best model for a task without executing' })
  @ApiResponse({ status: 200, description: 'Model selected' })
  async selectModel(
    @CurrentUser('id') userId: number,
    @Body() request: { taskCategory?: string; requiresVision?: boolean; prioritizeCost?: boolean },
  ) {
    return this.modelSelectionService.selectModel(request);
  }

  @Get('models/:capability')
  @ApiOperation({ summary: 'Get available models for capability' })
  @ApiResponse({ status: 200, description: 'Models returned' })
  async getModelsByCapability(@Param('capability') capability: string) {
    return this.modelSelectionService.getModelsByCapability(capability);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit feedback on AI output' })
  @ApiResponse({ status: 200, description: 'Feedback recorded' })
  async recordFeedback(
    @CurrentUser('id') userId: number,
    @Body() feedback: FeedbackDto,
  ) {
    await this.feedbackService.recordFeedback(
      userId,
      feedback.aiLogId,
      feedback.modelId,
      feedback.category,
      feedback.feedbackType,
      feedback.qualityRating,
      feedback.reason,
    );

    return { message: 'Feedback recorded successfully' };
  }

  @Get('preferences/:category')
  @ApiOperation({ summary: 'Get user preferred models for category' })
  @ApiResponse({ status: 200, description: 'Preferences returned' })
  async getUserPreferences(
    @CurrentUser('id') userId: number,
    @Param('category') category: AITaskCategory,
  ) {
    return this.feedbackService.getTopModelsForUser(userId, category, 5);
  }

  @Get('stats/:modelId/:category')
  @ApiOperation({ summary: 'Get model statistics' })
  @ApiResponse({ status: 200, description: 'Stats returned' })
  async getModelStats(
    @Param('modelId') modelId: string,
    @Param('category') category: AITaskCategory,
  ) {
    return this.feedbackService.getModelStats(modelId, category);
  }

  @Post('generate/ideas')
  @ApiOperation({ summary: 'Generate 5 content ideas/storylines' })
  @ApiResponse({ status: 200, description: 'Ideas generated' })
  async generateIdeas(
    @CurrentUser('id') userId: number,
    @Body() request: GenerateIdeasRequest,
  ) {
    return this.aiService.generateIdeas(userId, request);
  }

  @Post('generate/caption')
  @ApiOperation({ summary: 'Generate social media caption' })
  @ApiResponse({ status: 200, description: 'Caption generated' })
  async generateCaption(
    @CurrentUser('id') userId: number,
    @Body() request: GenerateCaptionRequest,
  ) {
    return this.aiService.generateCaption(userId, request);
  }

  @Post('generate/hooks')
  @ApiOperation({ summary: 'Generate attention-grabbing hooks' })
  @ApiResponse({ status: 200, description: 'Hooks generated' })
  async generateHooks(
    @CurrentUser('id') userId: number,
    @Body() request: GenerateHooksRequest,
  ) {
    return this.aiService.generateHooks(userId, request);
  }

  @Post('generate/hashtags')
  @ApiOperation({ summary: 'Generate SEO hashtags' })
  @ApiResponse({ status: 200, description: 'Hashtags generated' })
  async generateHashtags(
    @CurrentUser('id') userId: number,
    @Body() request: GenerateHashtagsRequest,
  ) {
    return this.aiService.generateHashtags(userId, request);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get AI suggestions for timing and trends' })
  @ApiResponse({ status: 200, description: 'Suggestions returned' })
  async getSuggestions(
    @CurrentUser('id') userId: number,
    @Query('businessType') businessType: string,
    @Query('goal') goal: string,
  ) {
    return this.aiService.getSuggestions(userId, businessType, goal);
  }

  @Sse('stream/caption')
  @ApiOperation({ summary: 'Stream AI caption generation in real-time' })
  @ApiResponse({ status: 200, description: 'Caption stream started' })
  async streamCaption(
    @CurrentUser('id') userId: number,
    @Body() request: GenerateCaptionRequest,
  ): Promise<Observable<MessageEvent>> {
    return new Observable(subscriber => {
      (async () => {
        try {
          for await (const chunk of this.aiService.streamCaption(userId, request)) {
            subscriber.next({ data: chunk } as MessageEvent);
          }
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get AI usage analytics for user' })
  @ApiResponse({ status: 200, description: 'Analytics returned' })
  async getAnalytics(
    @CurrentUser('id') userId: number,
    @Query('days') days?: number,
  ) {
    return this.aiService.getAIAnalytics(userId, days ? parseInt(days as any) : 30);
  }
}
