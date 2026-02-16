import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessProfile } from '../entities/business-profile.entity';
import { PlatformAccountContext } from '../entities/platform-account-context.entity';
import { ContextTemplate } from '../entities/context-template.entity';
import { MemoryManagerService } from './memory-manager.service';
import { MemoryCategory } from '../entities/ai-memory.entity';

export interface ContextBuildRequest {
  userId: number;
  taskType: 'generate_ideas' | 'caption_generation' | 'hook_generation' | 'hashtag_generation' | 'enhancement';
  platform?: string;
  additionalContext?: string;
  maxTokens?: number; // Token budget for context
}

export interface BuildContextResult {
  contextString: string;
  tokensUsed: number;
  memoriesUsed: string[]; // Memory IDs
  templatesUsed: string[]; // Template IDs
  metadata: {
    businessProfileIncluded: boolean;
    platformContextIncluded: boolean;
    pinnedMemoriesCount: number;
    relevantMemoriesCount: number;
    tier: 'core' | 'task_specific' | 'extended';
  };
}

/**
 * Context Builder Service
 * Builds optimized context strings for AI generation with token budget management
 */
@Injectable()
export class ContextBuilderService {
  private readonly logger = new Logger(ContextBuilderService.name);

  // Default token allocations by tier
  private readonly TOKEN_BUDGETS = {
    core: 200,           // Tier 1: Core business context (always included)
    taskSpecific: 400,   // Tier 2: Task-specific context
    extended: 800,       // Tier 3: Extended context (optional)
  };

  constructor(
    @InjectRepository(BusinessProfile)
    private businessProfileRepository: Repository<BusinessProfile>,
    @InjectRepository(PlatformAccountContext)
    private platformContextRepository: Repository<PlatformAccountContext>,
    @InjectRepository(ContextTemplate)
    private templateRepository: Repository<ContextTemplate>,
    private memoryManager: MemoryManagerService,
  ) {}

  /**
   * Build optimized context for AI generation
   */
  async buildContext(request: ContextBuildRequest): Promise<BuildContextResult> {
    try {
      const startTime = Date.now();
      const maxTokens = request.maxTokens || this.TOKEN_BUDGETS.extended;

      let contextString = '';
      let tokensUsed = 0;
      const memoriesUsed: string[] = [];
      const templatesUsed: string[] = [];
      const metadata = {
        businessProfileIncluded: false,
        platformContextIncluded: false,
        pinnedMemoriesCount: 0,
        relevantMemoriesCount: 0,
        tier: 'core' as 'core' | 'task_specific' | 'extended',
      };

      // TIER 1: Core Context (Always Included)
      const { coreContext, coreTokens, businessProfile } = await this.buildCoreContext(
        request.userId,
      );
      
      if (coreContext) {
        contextString += coreContext;
        tokensUsed += coreTokens;
        metadata.businessProfileIncluded = true;
      }

      // TIER 2: Task-Specific Context
      if (tokensUsed + this.TOKEN_BUDGETS.taskSpecific <= maxTokens) {
        const taskContext = await this.buildTaskSpecificContext(
          request.userId,
          request.taskType,
          request.platform,
          this.TOKEN_BUDGETS.taskSpecific,
        );

        if (taskContext.contextString) {
          contextString += '\n\n' + taskContext.contextString;
          tokensUsed += taskContext.tokensUsed;
          memoriesUsed.push(...taskContext.memoriesUsed);
          templatesUsed.push(...taskContext.templatesUsed);
          metadata.platformContextIncluded = taskContext.platformContextIncluded;
          metadata.relevantMemoriesCount = taskContext.memoriesCount;
          metadata.tier = 'task_specific';
        }
      }

      // TIER 3: Extended Context (if budget allows)
      if (tokensUsed + 200 <= maxTokens) { // Need at least 200 tokens for extended
        const extendedContext = await this.buildExtendedContext(
          request.userId,
          businessProfile,
          maxTokens - tokensUsed,
        );

        if (extendedContext.contextString) {
          contextString += '\n\n' + extendedContext.contextString;
          tokensUsed += extendedContext.tokensUsed;
          metadata.tier = 'extended';
        }
      }

      // Add additional context if provided
      if (request.additionalContext) {
        const additionalTokens = this.estimateTokens(request.additionalContext);
        if (tokensUsed + additionalTokens <= maxTokens) {
          contextString += '\n\nADDITIONAL CONTEXT:\n' + request.additionalContext;
          tokensUsed += additionalTokens;
        }
      }

      // Record memory usage
      for (const memoryId of memoriesUsed) {
        this.memoryManager.recordMemoryUsage(memoryId).catch((err) =>
          this.logger.error(`Failed to record memory usage: ${err.message}`),
        );
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Built context in ${duration}ms, tokens: ${tokensUsed}/${maxTokens}, tier: ${metadata.tier}`,
      );

      return {
        contextString: contextString.trim(),
        tokensUsed,
        memoriesUsed,
        templatesUsed,
        metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to build context: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Build Tier 1: Core Context
   */
  private async buildCoreContext(
    userId: number,
  ): Promise<{ coreContext: string; coreTokens: number; businessProfile?: BusinessProfile }> {
    const businessProfile = await this.businessProfileRepository.findOne({
      where: { userId },
    });

    if (!businessProfile) {
      return { coreContext: '', coreTokens: 0 };
    }

    // Build minimal but essential business context
    const contextParts: string[] = [
      'BUSINESS CONTEXT:',
      `${businessProfile.businessName} (${businessProfile.businessType})`,
    ];

    if (businessProfile.tagline) {
      contextParts.push(`Tagline: ${businessProfile.tagline}`);
    }

    if (businessProfile.description) {
      contextParts.push(`- ${businessProfile.description}`);
    }

    if (businessProfile.brandVoice?.tone) {
      contextParts.push(`Voice: ${businessProfile.brandVoice.tone}`);
    }

    if (businessProfile.targetAudience) {
      contextParts.push(`Audience: ${businessProfile.targetAudience}`);
    }

    // Top 3 USPs
    if (businessProfile.uniqueSellingPoints?.length > 0) {
      contextParts.push(
        `USPs: ${businessProfile.uniqueSellingPoints.slice(0, 3).join(', ')}`,
      );
    }

    const coreContext = contextParts.join('\n');
    const coreTokens = this.estimateTokens(coreContext);

    return { coreContext, coreTokens, businessProfile };
  }

  /**
   * Build Tier 2: Task-Specific Context
   */
  private async buildTaskSpecificContext(
    userId: number,
    taskType: string,
    platform?: string,
    tokenBudget: number = 400,
  ): Promise<{
    contextString: string;
    tokensUsed: number;
    memoriesUsed: string[];
    templatesUsed: string[];
    memoriesCount: number;
    platformContextIncluded: boolean;
  }> {
    const contextParts: string[] = [];
    let tokensUsed = 0;
    const memoriesUsed: string[] = [];
    const templatesUsed: string[] = [];
    let platformContextIncluded = false;

    // 1. Pinned memories (always include)
    const pinnedMemories = await this.memoryManager.getPinnedMemories(userId);
    
    if (pinnedMemories.length > 0) {
      contextParts.push('KEY MEMORIES:');
      
      for (const memory of pinnedMemories) {
        const memoryText = `- ${memory.content}`;
        const memoryTokens = this.estimateTokens(memoryText);
        
        if (tokensUsed + memoryTokens <= tokenBudget) {
          contextParts.push(memoryText);
          memoriesUsed.push(memory.id);
          tokensUsed += memoryTokens;
        }
      }
    }

    // 2. Relevant memories (semantic search)
    const taskQuery = this.getTaskQuery(taskType, platform);
    const relevantMemories = await this.memoryManager.searchMemories({
      userId,
      query: taskQuery,
      relatedTaskType: taskType,
      relatedPlatform: platform,
      minImportance: 0.3,
      limit: 5,
    });

    if (relevantMemories.length > 0 && contextParts.length === 0) {
      contextParts.push('RELEVANT INSIGHTS:');
    }

    for (const result of relevantMemories) {
      const memoryText = `- ${result.memory.content}`;
      const memoryTokens = this.estimateTokens(memoryText);
      
      if (tokensUsed + memoryTokens <= tokenBudget && !memoriesUsed.includes(result.memory.id)) {
        contextParts.push(memoryText);
        memoriesUsed.push(result.memory.id);
        tokensUsed += memoryTokens;
      }
    }

    // 3. Platform-specific context (if platform specified)
    if (platform) {
      const platformContext = await this.platformContextRepository.findOne({
        where: { userId, platform: platform as any },
      });

      if (platformContext) {
        const platformParts: string[] = [
          `\nPLATFORM: ${platform}`,
        ];

        if (platformContext.followersCount > 0) {
          platformParts.push(`- Followers: ${platformContext.followersCount.toLocaleString()}`);
        }

        if (platformContext.averageEngagementRate > 0) {
          platformParts.push(
            `- Avg Engagement: ${(platformContext.averageEngagementRate * 100).toFixed(1)}%`,
          );
        }

        if (platformContext.performanceMetrics?.bestPostingTimes?.length > 0) {
          platformParts.push(
            `- Best times: ${platformContext.performanceMetrics.bestPostingTimes.join(', ')}`,
          );
        }

        if (platformContext.highPerformingTopics?.length > 0) {
          platformParts.push(
            `- Top topics: ${platformContext.highPerformingTopics.slice(0, 3).join(', ')}`,
          );
        }

        const platformText = platformParts.join('\n');
        const platformTokens = this.estimateTokens(platformText);

        if (tokensUsed + platformTokens <= tokenBudget) {
          contextParts.push(platformText);
          tokensUsed += platformTokens;
          platformContextIncluded = true;
        }
      }
    }

    // 4. Relevant templates
    const templates = await this.templateRepository.find({
      where: {
        userId,
        isActive: true,
        applicableTaskTypes: { $contains: [taskType] } as any,
      },
      order: {
        priority: 'DESC',
        effectivenessScore: 'DESC',
      },
      take: 2,
    });

    for (const template of templates) {
      const templateText = `\nTEMPLATE (${template.name}):\n${template.content}`;
      const templateTokens = this.estimateTokens(templateText);

      if (tokensUsed + templateTokens <= tokenBudget) {
        contextParts.push(templateText);
        templatesUsed.push(template.id);
        tokensUsed += templateTokens;
      }
    }

    return {
      contextString: contextParts.join('\n'),
      tokensUsed,
      memoriesUsed,
      templatesUsed,
      memoriesCount: relevantMemories.length,
      platformContextIncluded,
    };
  }

  /**
   * Build Tier 3: Extended Context
   */
  private async buildExtendedContext(
    userId: number,
    businessProfile?: BusinessProfile,
    tokenBudget: number = 800,
  ): Promise<{ contextString: string; tokensUsed: number }> {
    if (!businessProfile) {
      return { contextString: '', tokensUsed: 0 };
    }

    const contextParts: string[] = ['EXTENDED CONTEXT:'];
    let tokensUsed = this.estimateTokens(contextParts[0]);

    // Brand values
    if (businessProfile.brandValues?.length > 0) {
      const valuesText = `Brand Values: ${businessProfile.brandValues.join(', ')}`;
      const valuesTokens = this.estimateTokens(valuesText);
      
      if (tokensUsed + valuesTokens <= tokenBudget) {
        contextParts.push(valuesText);
        tokensUsed += valuesTokens;
      }
    }

    // Products
    if (businessProfile.products?.length > 0) {
      const productsText = `Products:\n${businessProfile.products
        .filter((p) => p.highlight)
        .map((p) => `- ${p.name}${p.price ? ` (${p.price})` : ''}`)
        .join('\n')}`;
      const productsTokens = this.estimateTokens(productsText);

      if (tokensUsed + productsTokens <= tokenBudget) {
        contextParts.push(productsText);
        tokensUsed += productsTokens;
      }
    }

    // Content preferences
    if (businessProfile.brandVoice?.avoidWords?.length > 0) {
      const avoidText = `Avoid words: ${businessProfile.brandVoice.avoidWords.join(', ')}`;
      const avoidTokens = this.estimateTokens(avoidText);

      if (tokensUsed + avoidTokens <= tokenBudget) {
        contextParts.push(avoidText);
        tokensUsed += avoidTokens;
      }
    }

    if (businessProfile.brandVoice?.keywords?.length > 0) {
      const keywordsText = `Emphasize: ${businessProfile.brandVoice.keywords.join(', ')}`;
      const keywordsTokens = this.estimateTokens(keywordsText);

      if (tokensUsed + keywordsTokens <= tokenBudget) {
        contextParts.push(keywordsText);
        tokensUsed += keywordsTokens;
      }
    }

    // Brand assets (colors)
    if (businessProfile.brandAssets?.primaryColor || businessProfile.brandAssets?.secondaryColor) {
      const colorsText = `Brand colors: ${[
        businessProfile.brandAssets.primaryColor,
        businessProfile.brandAssets.secondaryColor,
      ]
        .filter(Boolean)
        .join(', ')}`;
      const colorsTokens = this.estimateTokens(colorsText);

      if (tokensUsed + colorsTokens <= tokenBudget) {
        contextParts.push(colorsText);
        tokensUsed += colorsTokens;
      }
    }

    return {
      contextString: contextParts.length > 1 ? contextParts.join('\n') : '',
      tokensUsed,
    };
  }

  /**
   * Generate task-specific query for memory search
   */
  private getTaskQuery(taskType: string, platform?: string): string {
    const queries = {
      generate_ideas: 'content ideas that work well, successful topics, trending themes',
      caption_generation: 'caption style preferences, tone, emoji usage, call-to-action',
      hook_generation: 'attention-grabbing hooks, opening lines that work',
      hashtag_generation: 'hashtag strategy, high-performing hashtags',
      enhancement: 'content improvements, optimization tips',
    };

    let query = queries[taskType] || 'general content preferences';
    
    if (platform) {
      query += ` for ${platform}`;
    }

    return query;
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get context preview (for debugging/UI)
   */
  async getContextPreview(request: ContextBuildRequest): Promise<BuildContextResult> {
    return this.buildContext(request);
  }
}
