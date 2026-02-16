import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessProfile } from './entities/business-profile.entity';
import { PlatformAccountContext } from './entities/platform-account-context.entity';
import { AIMemory } from './entities/ai-memory.entity';
import { ContextTemplate } from './entities/context-template.entity';
import { MemoryManagerService } from './services/memory-manager.service';
import { ContextBuilderService } from './services/context-builder.service';
import {
  CreateBusinessProfileDto,
  UpdateBusinessProfileDto,
  CreateMemoryDto,
  SearchMemoriesDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  ContextPreviewDto,
} from './dto/context.dto';

@Controller('api/v1/context')
@UseGuards(JwtAuthGuard)
export class ContextController {
  constructor(
    @InjectRepository(BusinessProfile)
    private businessProfileRepository: Repository<BusinessProfile>,
    @InjectRepository(PlatformAccountContext)
    private platformContextRepository: Repository<PlatformAccountContext>,
    @InjectRepository(ContextTemplate)
    private templateRepository: Repository<ContextTemplate>,
    private memoryManager: MemoryManagerService,
    private contextBuilder: ContextBuilderService,
  ) {}

  // ============ BUSINESS PROFILE ============

  @Get('profile')
  async getBusinessProfile(@Req() req) {
    const userId = req.user.userId;
    const profile = await this.businessProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      return { message: 'No business profile found. Please create one.' };
    }

    return profile;
  }

  @Post('profile')
  async createBusinessProfile(
    @Req() req,
    @Body() dto: CreateBusinessProfileDto,
  ) {
    const userId = req.user.userId;

    // Check if profile already exists
    const existing = await this.businessProfileRepository.findOne({
      where: { userId },
    });

    if (existing) {
      return {
        error: 'Business profile already exists. Use PUT to update.',
      };
    }

    const profile = this.businessProfileRepository.create({
      ...dto,
      userId,
      completenessScore: this.calculateCompletenessScore(dto),
    });

    await this.businessProfileRepository.save(profile);

    return {
      message: 'Business profile created successfully',
      profile,
    };
  }

  @Put('profile')
  async updateBusinessProfile(
    @Req() req,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    const userId = req.user.userId;

    let profile = await this.businessProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      // Create if doesn't exist
      profile = this.businessProfileRepository.create({
        ...dto,
        userId,
        completenessScore: this.calculateCompletenessScore(dto),
      });
    } else {
      // Update
      Object.assign(profile, dto);
      profile.completenessScore = this.calculateCompletenessScore(dto);
    }

    await this.businessProfileRepository.save(profile);

    return {
      message: 'Business profile updated successfully',
      profile,
    };
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBusinessProfile(@Req() req) {
    const userId = req.user.userId;
    await this.businessProfileRepository.delete({ userId });
  }

  // ============ MEMORIES ============

  @Get('memories')
  async getMemories(@Req() req, @Query() query: SearchMemoriesDto) {
    const userId = req.user.userId;

    const results = await this.memoryManager.searchMemories({
      userId,
      ...query,
    });

    return {
      memories: results.map((r) => ({
        ...r.memory,
        relevanceScore: r.relevanceScore,
        similarity: r.similarity,
      })),
      total: results.length,
    };
  }

  @Get('memories/stats')
  async getMemoryStats(@Req() req) {
    const userId = req.user.userId;
    return this.memoryManager.getMemoryStats(userId);
  }

  @Post('memories')
  async createMemory(@Req() req, @Body() dto: CreateMemoryDto) {
    const userId = req.user.userId;

    const memory = await this.memoryManager.createMemory({
      ...dto,
      userId,
    });

    return {
      message: 'Memory created successfully',
      memory,
    };
  }

  @Delete('memories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMemory(@Req() req, @Param('id') id: string) {
    await this.memoryManager.deleteMemory(id);
  }

  @Post('memories/:id/feedback')
  async provideFeedback(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { type: 'positive' | 'negative' },
  ) {
    await this.memoryManager.updateMemoryImportance(id, body.type);

    return {
      message: 'Feedback recorded successfully',
    };
  }

  @Post('memories/prune')
  async pruneMemories(@Req() req) {
    const userId = req.user.userId;
    const pruned = await this.memoryManager.pruneMemories(userId);

    return {
      message: `Pruned ${pruned} old/irrelevant memories`,
      prunedCount: pruned,
    };
  }

  // ============ TEMPLATES ============

  @Get('templates')
  async getTemplates(@Req() req, @Query('category') category?: string) {
    const userId = req.user.userId;

    const where: any = { userId, isActive: true };
    if (category) {
      where.category = category;
    }

    const templates = await this.templateRepository.find({
      where,
      order: {
        priority: 'DESC',
        effectivenessScore: 'DESC',
      },
    });

    return { templates };
  }

  @Post('templates')
  async createTemplate(@Req() req, @Body() dto: CreateTemplateDto) {
    const userId = req.user.userId;

    const template = this.templateRepository.create({
      ...dto,
      userId,
    });

    await this.templateRepository.save(template);

    return {
      message: 'Template created successfully',
      template,
    };
  }

  @Put('templates/:id')
  async updateTemplate(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    const template = await this.templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      return { error: 'Template not found' };
    }

    Object.assign(template, dto);
    await this.templateRepository.save(template);

    return {
      message: 'Template updated successfully',
      template,
    };
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(@Req() req, @Param('id') id: string) {
    await this.templateRepository.delete(id);
  }

  // ============ PLATFORM CONTEXTS ============

  @Get('platform/:platform')
  async getPlatformContext(@Req() req, @Param('platform') platform: string) {
    const userId = req.user.userId;

    const context = await this.platformContextRepository.findOne({
      where: { userId, platform: platform as any },
    });

    if (!context) {
      return { message: 'No platform context found' };
    }

    return context;
  }

  @Post('platform/:platform')
  async updatePlatformContext(
    @Req() req,
    @Param('platform') platform: string,
    @Body() body: any,
  ) {
    const userId = req.user.userId;

    const existingContext = await this.platformContextRepository.findOne({
      where: { userId, platform: platform as any },
    });

    if (!existingContext) {
      // Create new context
      const newEntity = this.platformContextRepository.create({
        userId,
        platform: platform as any,
        ...body,
      });
      const savedContext = await this.platformContextRepository.save(newEntity);

      return {
        message: 'Platform context updated successfully',
        context: savedContext,
      };
    } else {
      // Update existing context
      Object.assign(existingContext, body);
      const updatedContext = await this.platformContextRepository.save(existingContext);

      return {
        message: 'Platform context updated successfully',
        context: updatedContext,
      };
    }
  }

  // ============ CONTEXT PREVIEW ============

  @Post('preview')
  async getContextPreview(@Req() req, @Body() dto: ContextPreviewDto) {
    const userId = req.user.userId;

    const result = await this.contextBuilder.buildContext({
      userId,
      taskType: dto.taskType,
      platform: dto.platform,
      additionalContext: dto.additionalContext,
      maxTokens: dto.maxTokens || 800,
    });

    return {
      context: result.contextString,
      tokensUsed: result.tokensUsed,
      metadata: result.metadata,
      memoriesUsed: result.memoriesUsed.length,
      templatesUsed: result.templatesUsed.length,
    };
  }

  @Get('preview/demo')
  async getDemoPreview(@Req() req, @Query('taskType') taskType: string) {
    const userId = req.user.userId;

    if (!taskType) {
      return { error: 'taskType query parameter is required' };
    }

    const result = await this.contextBuilder.buildContext({
      userId,
      taskType: taskType as any,
      maxTokens: 800,
    });

    return {
      context: result.contextString,
      tokensUsed: result.tokensUsed,
      metadata: result.metadata,
    };
  }

  // ============ HELPERS ============

  private calculateCompletenessScore(profile: any): number {
    const fields = [
      'businessName',
      'businessType',
      'description',
      'tagline',
      'uniqueSellingPoints',
      'brandVoice',
      'targetAudience',
      'products',
      'brandValues',
    ];

    let filledFields = 0;
    const totalFields = fields.length;

    fields.forEach((field) => {
      const value = profile[field];
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          filledFields++;
        } else if (typeof value === 'object' && Object.keys(value).length > 0) {
          filledFields++;
        } else if (typeof value === 'string' && value.trim().length > 0) {
          filledFields++;
        }
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  }
}
