import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIMemory, MemoryCategory, MemorySource } from '../entities/ai-memory.entity';
import { EmbeddingService } from './embedding.service';

export interface CreateMemoryDto {
  userId: number;
  content: string;
  summary?: string;
  category?: MemoryCategory;
  source?: MemorySource;
  importance?: number;
  tags?: string[];
  relatedPlatform?: string;
  relatedTaskType?: string;
  expiresAt?: Date;
  isPinned?: boolean;
  contextMetadata?: Record<string, any>;
}

export interface SearchMemoriesDto {
  userId: number;
  query?: string;
  category?: MemoryCategory;
  relatedPlatform?: string;
  relatedTaskType?: string;
  minImportance?: number;
  limit?: number;
  includeInactive?: boolean;
}

export interface MemorySearchResult {
  memory: AIMemory;
  similarity?: number;
  relevanceScore: number;
}

/**
 * Memory Manager Service
 * Manages AI memories with semantic search and auto-learning capabilities
 */
@Injectable()
export class MemoryManagerService {
  private readonly logger = new Logger(MemoryManagerService.name);

  constructor(
    @InjectRepository(AIMemory)
    private memoryRepository: Repository<AIMemory>,
    private embeddingService: EmbeddingService,
  ) {}

  /**
   * Create a new memory with embedding
   */
  async createMemory(dto: CreateMemoryDto): Promise<AIMemory> {
    try {
      // Generate embedding for the content
      const { embedding } = await this.embeddingService.generateEmbedding(dto.content);

      // Create memory entity
      const memory = this.memoryRepository.create({
        userId: dto.userId,
        content: dto.content,
        summary: dto.summary || this.generateSummary(dto.content),
        category: dto.category || MemoryCategory.GENERAL,
        source: dto.source || MemorySource.AUTO_LEARNING,
        importance: dto.importance || 0.5,
        tags: dto.tags || [],
        relatedPlatform: dto.relatedPlatform,
        relatedTaskType: dto.relatedTaskType,
        expiresAt: dto.expiresAt,
        isPinned: dto.isPinned || false,
        embedding,
        contextMetadata: dto.contextMetadata || {},
      });

      const savedMemory = await this.memoryRepository.save(memory);
      
      this.logger.log(
        `Created memory for user ${dto.userId}, category: ${memory.category}, importance: ${memory.importance}`,
      );

      return savedMemory;
    } catch (error) {
      this.logger.error(`Failed to create memory: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search memories semantically using query
   */
  async searchMemories(dto: SearchMemoriesDto): Promise<MemorySearchResult[]> {
    try {
      // Build base query
      const queryBuilder = this.memoryRepository
        .createQueryBuilder('memory')
        .where('memory.userId = :userId', { userId: dto.userId })
        .andWhere('memory.isActive = true');

      if (!dto.includeInactive) {
        queryBuilder.andWhere('(memory.expiresAt IS NULL OR memory.expiresAt > :now)', {
          now: new Date(),
        });
      }

      if (dto.category) {
        queryBuilder.andWhere('memory.category = :category', { category: dto.category });
      }

      if (dto.relatedPlatform) {
        queryBuilder.andWhere('memory.relatedPlatform = :platform', {
          platform: dto.relatedPlatform,
        });
      }

      if (dto.relatedTaskType) {
        queryBuilder.andWhere('memory.relatedTaskType = :taskType', {
          taskType: dto.relatedTaskType,
        });
      }

      if (dto.minImportance) {
        queryBuilder.andWhere('memory.importance >= :minImportance', {
          minImportance: dto.minImportance,
        });
      }

      // Get all matching memories
      const memories = await queryBuilder.getMany();

      if (memories.length === 0) {
        return [];
      }

      // If query provided, do semantic search
      if (dto.query) {
        const { embedding: queryEmbedding } = await this.embeddingService.generateEmbedding(
          dto.query,
        );

        // Calculate similarity for each memory
        const results = memories
          .filter((memory) => memory.embedding && memory.embedding.length > 0)
          .map((memory) => {
            const similarity = this.embeddingService.cosineSimilarity(
              queryEmbedding,
              memory.embedding,
            );

            // Calculate relevance score (combines similarity, importance, and usage)
            const usageBoost = Math.min(memory.usageCount / 100, 0.2); // Max 20% boost
            const pinnedBoost = memory.isPinned ? 0.3 : 0;
            const relevanceScore = similarity * 0.5 + memory.importance * 0.3 + usageBoost + pinnedBoost;

            return {
              memory,
              similarity,
              relevanceScore,
            };
          })
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, dto.limit || 10);

        return results;
      } else {
        // No query - sort by importance and usage
        const results = memories
          .map((memory) => {
            const usageBoost = Math.min(memory.usageCount / 100, 0.2);
            const pinnedBoost = memory.isPinned ? 0.5 : 0;
            const relevanceScore = memory.importance * 0.7 + usageBoost + pinnedBoost;

            return {
              memory,
              relevanceScore,
            };
          })
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, dto.limit || 10);

        return results;
      }
    } catch (error) {
      this.logger.error(`Failed to search memories: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get memories by category
   */
  async getMemoriesByCategory(
    userId: number,
    category: MemoryCategory,
    limit: number = 10,
  ): Promise<AIMemory[]> {
    return this.memoryRepository.find({
      where: {
        userId,
        category,
        isActive: true,
      },
      order: {
        importance: 'DESC',
        usageCount: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get pinned memories (always included in context)
   */
  async getPinnedMemories(userId: number): Promise<AIMemory[]> {
    return this.memoryRepository.find({
      where: {
        userId,
        isPinned: true,
        isActive: true,
      },
      order: {
        importance: 'DESC',
      },
    });
  }

  /**
   * Update memory usage tracking
   */
  async recordMemoryUsage(memoryId: string): Promise<void> {
    try {
      await this.memoryRepository.increment(
        { id: memoryId },
        'usageCount',
        1,
      );
      
      await this.memoryRepository.update(
        { id: memoryId },
        { lastUsedAt: new Date() },
      );
    } catch (error) {
      this.logger.error(`Failed to record memory usage: ${error.message}`);
    }
  }

  /**
   * Update memory importance based on feedback
   */
  async updateMemoryImportance(
    memoryId: string,
    feedbackType: 'positive' | 'negative',
  ): Promise<void> {
    try {
      const memory = await this.memoryRepository.findOne({ where: { id: memoryId } });
      if (!memory) {
        return;
      }

      if (feedbackType === 'positive') {
        memory.positiveFeedbackCount++;
        memory.importance = Math.min(memory.importance + 0.05, 1.0);
      } else {
        memory.negativeFeedbackCount++;
        memory.importance = Math.max(memory.importance - 0.1, 0.0);
      }

      // Calculate effectiveness score
      const totalFeedback = memory.positiveFeedbackCount + memory.negativeFeedbackCount;
      if (totalFeedback > 0) {
        memory.effectivenessScore = memory.positiveFeedbackCount / totalFeedback;
      }

      await this.memoryRepository.save(memory);
      
      this.logger.log(
        `Updated memory ${memoryId} importance to ${memory.importance} (${feedbackType} feedback)`,
      );
    } catch (error) {
      this.logger.error(`Failed to update memory importance: ${error.message}`);
    }
  }

  /**
   * Learn from user correction/edit
   */
  async learnFromCorrection(
    userId: number,
    originalContent: string,
    correctedContent: string,
    context: {
      platform?: string;
      taskType?: string;
      category?: MemoryCategory;
    },
  ): Promise<AIMemory> {
    const memoryContent = `User prefers: "${correctedContent}" over "${originalContent}"`;
    
    return this.createMemory({
      userId,
      content: memoryContent,
      summary: `Correction: ${correctedContent.substring(0, 100)}...`,
      category: context.category || MemoryCategory.CORRECTION,
      source: MemorySource.USER_EDIT,
      importance: 0.7, // Corrections are fairly important
      relatedPlatform: context.platform,
      relatedTaskType: context.taskType,
      tags: ['user_correction', 'learning'],
    });
  }

  /**
   * Learn from performance data
   */
  async learnFromPerformance(
    userId: number,
    content: string,
    performanceMetric: number,
    context: {
      platform?: string;
      taskType?: string;
    },
  ): Promise<AIMemory | null> {
    // Only create memory for exceptional performance (high or low)
    if (performanceMetric < 0.3 || performanceMetric > 0.8) {
      const isSuccess = performanceMetric > 0.8;
      const category = isSuccess ? MemoryCategory.SUCCESS_PATTERN : MemoryCategory.AVOID_PATTERN;
      
      return this.createMemory({
        userId,
        content,
        category,
        source: MemorySource.PERFORMANCE_DATA,
        importance: isSuccess ? 0.8 : 0.6,
        relatedPlatform: context.platform,
        relatedTaskType: context.taskType,
        tags: isSuccess ? ['high_performance', 'success'] : ['low_performance', 'avoid'],
      });
    }

    return null;
  }

  /**
   * Prune old and irrelevant memories
   */
  async pruneMemories(userId: number): Promise<number> {
    try {
      const now = new Date();

      // Deactivate expired memories
      const expiredResult = await this.memoryRepository.update(
        {
          userId,
          isActive: true,
          expiresAt: { $lte: now } as any,
        },
        { isActive: false },
      );

      // Deactivate low-importance, unused memories (not pinned)
      const lowValueMemories = await this.memoryRepository
        .createQueryBuilder('memory')
        .where('memory.userId = :userId', { userId })
        .andWhere('memory.isActive = true')
        .andWhere('memory.isPinned = false')
        .andWhere('memory.importance < 0.2')
        .andWhere('memory.usageCount < 3')
        .andWhere('memory.createdAt < :cutoff', {
          cutoff: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days old
        })
        .getMany();

      if (lowValueMemories.length > 0) {
        await this.memoryRepository.update(
          { id: { $in: lowValueMemories.map((m) => m.id) } as any },
          { isActive: false },
        );
      }

      const totalPruned = (expiredResult.affected || 0) + lowValueMemories.length;
      
      if (totalPruned > 0) {
        this.logger.log(`Pruned ${totalPruned} memories for user ${userId}`);
      }

      return totalPruned;
    } catch (error) {
      this.logger.error(`Failed to prune memories: ${error.message}`, error.stack);
      return 0;
    }
  }

  /**
   * Delete memory permanently
   */
  async deleteMemory(memoryId: string): Promise<void> {
    await this.memoryRepository.delete(memoryId);
    this.logger.log(`Deleted memory ${memoryId}`);
  }

  /**
   * Get memory statistics for user
   */
  async getMemoryStats(userId: number): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
    avgImportance: number;
  }> {
    const memories = await this.memoryRepository.find({
      where: { userId },
    });

    const active = memories.filter((m) => m.isActive);
    const byCategory: Record<string, number> = {};

    active.forEach((memory) => {
      byCategory[memory.category] = (byCategory[memory.category] || 0) + 1;
    });

    const avgImportance =
      active.reduce((sum, m) => sum + m.importance, 0) / (active.length || 1);

    return {
      total: memories.length,
      active: active.length,
      byCategory,
      avgImportance,
    };
  }

  /**
   * Private: Generate summary from content
   */
  private generateSummary(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength - 3) + '...';
  }
}
