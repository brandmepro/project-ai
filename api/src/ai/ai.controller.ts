import { Controller, Post, Get, Body, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AIService } from './ai.service';
import { ModelSelectionService } from './services/model-selection.service';
import { FeedbackService } from './services/feedback.service';
import { TaskRequestDto } from './dto/task-request.dto';
import { FeedbackDto } from './dto/feedback.dto';
import {
  GenerateIdeasRequest,
  GenerateCaptionRequest,
  GenerateHooksRequest,
  GenerateHashtagsRequest,
  AITaskCategory,
} from '@businesspro/ai';

@ApiTags('AI')
@ApiBearerAuth('JWT-auth')
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
    @CurrentUser('id') userId: string,
    @Body() request: TaskRequestDto,
  ) {
    return this.aiService.generateWithTask(userId, request);
  }

  @Post('select-model')
  @ApiOperation({ summary: 'Get best model for a task without executing' })
  @ApiResponse({ status: 200, description: 'Model selected' })
  async selectModel(
    @CurrentUser('id') userId: string,
    @Body() request: Pick<TaskRequestDto, 'category' | 'priority' | 'complexity'>,
  ) {
    return this.modelSelectionService.selectBestModel(userId, {
      ...request,
      prompt: '',
    });
  }

  @Get('models/:category')
  @ApiOperation({ summary: 'Get available models for category' })
  @ApiResponse({ status: 200, description: 'Models returned' })
  async getModelsForCategory(@Param('category') category: AITaskCategory) {
    return this.modelSelectionService.getModelsForCategory(category);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit feedback on AI output' })
  @ApiResponse({ status: 200, description: 'Feedback recorded' })
  async recordFeedback(
    @CurrentUser('id') userId: string,
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
    @CurrentUser('id') userId: string,
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
    @CurrentUser('id') userId: string,
    @Body() request: GenerateIdeasRequest,
  ) {
    return this.aiService.generateIdeas(userId, request);
  }

  @Post('generate/caption')
  @ApiOperation({ summary: 'Generate social media caption' })
  @ApiResponse({ status: 200, description: 'Caption generated' })
  async generateCaption(
    @CurrentUser('id') userId: string,
    @Body() request: GenerateCaptionRequest,
  ) {
    return this.aiService.generateCaption(userId, request);
  }

  @Post('generate/hooks')
  @ApiOperation({ summary: 'Generate attention-grabbing hooks' })
  @ApiResponse({ status: 200, description: 'Hooks generated' })
  async generateHooks(
    @CurrentUser('id') userId: string,
    @Body() request: GenerateHooksRequest,
  ) {
    return this.aiService.generateHooks(userId, request);
  }

  @Post('generate/hashtags')
  @ApiOperation({ summary: 'Generate SEO hashtags' })
  @ApiResponse({ status: 200, description: 'Hashtags generated' })
  async generateHashtags(
    @CurrentUser('id') userId: string,
    @Body() request: GenerateHashtagsRequest,
  ) {
    return this.aiService.generateHashtags(userId, request);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get AI suggestions for timing and trends' })
  @ApiResponse({ status: 200, description: 'Suggestions returned' })
  async getSuggestions(
    @CurrentUser('id') userId: string,
    @Query('businessType') businessType: string,
    @Query('goal') goal: string,
  ) {
    return this.aiService.getSuggestions(userId, businessType, goal);
  }
}
