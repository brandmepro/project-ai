import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIUserFeedback } from '../entities/ai-user-feedback.entity';
import { AIUserPreference } from '../entities/ai-user-preference.entity';
import { AIModel } from '../entities/ai-model.entity';
import { FeedbackType, AITaskCategory } from '../types/ai-types';
import { MemoryManagerService } from '../../context/services/memory-manager.service';
import { MemoryCategory } from '../../context/entities/ai-memory.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(AIUserFeedback)
    private feedbackRepository: Repository<AIUserFeedback>,
    @InjectRepository(AIUserPreference)
    private preferenceRepository: Repository<AIUserPreference>,
    @InjectRepository(AIModel)
    private modelRepository: Repository<AIModel>,
    private memoryManager: MemoryManagerService,
  ) {}

  /**
   * Record user feedback and update preferences
   */
  async recordFeedback(
    userId: number,
    aiLogId: number,
    modelId: number,
    category: AITaskCategory,
    feedbackType: FeedbackType,
    qualityRating?: number,
    reason?: string,
    generatedContent?: string,
    editedContent?: string,
  ): Promise<void> {
    // Get model internal ID
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
    });

    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Save feedback
    await this.feedbackRepository.save({
      userId,
      aiLogId,
      modelId: model.id,
      categoryKey: category,
      feedbackType,
      qualityRating,
      reason,
    });

    // Update user preferences
    await this.updateUserPreference(
      userId,
      model.id,
      category,
      feedbackType,
      qualityRating,
    );

    // AUTO-LEARNING: Create memories from feedback
    await this.learnFromFeedback(
      userId,
      feedbackType,
      category,
      reason,
      generatedContent,
      editedContent,
    );
  }

  /**
   * Update user's preference for this model + category
   */
  private async updateUserPreference(
    userId: number,
    modelId: number,
    category: AITaskCategory,
    feedbackType: FeedbackType,
    qualityRating?: number,
  ): Promise<void> {
    let preference = await this.preferenceRepository.findOne({
      where: {
        userId,
        modelId,
        categoryKey: category,
      },
    });

    if (!preference) {
      preference = this.preferenceRepository.create({
        userId,
        modelId,
        categoryKey: category,
        preferenceScore: 0.5,
        totalInteractions: 0,
        likes: 0,
        dislikes: 0,
        regenerates: 0,
        skips: 0,
        averageQualityRating: null,
        totalRatings: 0,
        lastUsedAt: null,
      });
    }

    // Update counts
    preference.totalInteractions += 1;
    preference.lastUsedAt = new Date();

    switch (feedbackType) {
      case FeedbackType.LIKE:
        preference.likes += 1;
        break;
      case FeedbackType.DISLIKE:
        preference.dislikes += 1;
        break;
      case FeedbackType.REGENERATE:
        preference.regenerates += 1;
        break;
      case FeedbackType.SKIP:
        preference.skips += 1;
        break;
    }

    // Update quality rating
    if (qualityRating !== undefined && qualityRating > 0) {
      const currentAvg = preference.averageQualityRating || 0;
      const currentCount = preference.totalRatings;

      preference.averageQualityRating =
        (currentAvg * currentCount + qualityRating) / (currentCount + 1);
      preference.totalRatings += 1;
    }

    // Recalculate preference score
    preference.preferenceScore = this.calculatePreferenceScore(preference);

    await this.preferenceRepository.save(preference);
  }

  /**
   * Calculate preference score (0-1)
   */
  private calculatePreferenceScore(preference: AIUserPreference): number {
    const totalFeedback = preference.likes + preference.dislikes;

    if (totalFeedback === 0) return 0.5; // Neutral if no feedback

    // Like ratio (0-1)
    const likeRatio = preference.likes / totalFeedback;

    // Regenerate penalty (0-1, lower is better)
    const regeneratePenalty = Math.max(
      0,
      1 - preference.regenerates / preference.totalInteractions,
    );

    // Quality score (0-1)
    const qualityScore = preference.averageQualityRating
      ? preference.averageQualityRating / 5
      : 0.5;

    // Weighted combination
    const score = likeRatio * 0.5 + regeneratePenalty * 0.3 + qualityScore * 0.2;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get user's top models for a category
   */
  async getTopModelsForUser(
    userId: number,
    category: AITaskCategory,
    limit: number = 3,
  ): Promise<AIUserPreference[]> {
    return this.preferenceRepository.find({
      where: {
        userId,
        categoryKey: category,
      },
      order: {
        preferenceScore: 'DESC',
      },
      take: limit,
      relations: ['model'],
    });
  }

  /**
   * Get feedback stats for a model + category
   */
  async getModelStats(
    modelId: number,
    category: AITaskCategory,
  ): Promise<{
    totalFeedback: number;
    likes: number;
    dislikes: number;
    regenerates: number;
    averageQuality: number;
    likeRatio: number;
  }> {
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
    });

    if (!model) {
      throw new Error('Model not found');
    }

    const feedback = await this.feedbackRepository.find({
      where: {
        modelId: model.id,
        categoryKey: category,
      },
    });

    const likes = feedback.filter(f => f.feedbackType === FeedbackType.LIKE).length;
    const dislikes = feedback.filter(f => f.feedbackType === FeedbackType.DISLIKE).length;
    const regenerates = feedback.filter(f => f.feedbackType === FeedbackType.REGENERATE)
      .length;

    const qualityRatings = feedback
      .filter(f => f.qualityRating)
      .map(f => f.qualityRating);
    const averageQuality =
      qualityRatings.length > 0
        ? qualityRatings.reduce((a, b) => a + b, 0) / qualityRatings.length
        : 0;

    const totalFeedback = likes + dislikes;
    const likeRatio = totalFeedback > 0 ? likes / totalFeedback : 0;

    return {
      totalFeedback: feedback.length,
      likes,
      dislikes,
      regenerates,
      averageQuality,
      likeRatio,
    };
  }

  /**
   * AUTO-LEARNING: Learn from user feedback
   */
  private async learnFromFeedback(
    userId: number,
    feedbackType: FeedbackType,
    category: AITaskCategory,
    reason?: string,
    generatedContent?: string,
    editedContent?: string,
  ): Promise<void> {
    try {
      // Learn from user edits (corrections)
      if (editedContent && generatedContent && editedContent !== generatedContent) {
        await this.memoryManager.learnFromCorrection(
          userId,
          generatedContent,
          editedContent,
          {
            taskType: this.mapCategoryToTaskType(category),
            category: MemoryCategory.CORRECTION,
          },
        );
      }

      // Learn from negative feedback with reasons
      if (feedbackType === FeedbackType.DISLIKE && reason) {
        await this.memoryManager.createMemory({
          userId,
          content: `User dislikes: ${reason}`,
          category: MemoryCategory.AVOID_PATTERN,
          source: 'user_feedback' as any,
          importance: 0.7,
          relatedTaskType: this.mapCategoryToTaskType(category),
          tags: ['dislike', 'avoid', 'feedback'],
        });
      }

      // Learn from positive feedback patterns
      if (feedbackType === FeedbackType.LIKE && generatedContent) {
        // Extract patterns from successful content
        const patterns = this.extractSuccessPatterns(generatedContent, category);
        if (patterns) {
          await this.memoryManager.createMemory({
            userId,
            content: patterns,
            category: MemoryCategory.SUCCESS_PATTERN,
            source: 'user_feedback' as any,
            importance: 0.8,
            relatedTaskType: this.mapCategoryToTaskType(category),
            tags: ['like', 'success', 'feedback'],
          });
        }
      }

      // Learn from regenerates (indicates something was wrong)
      if (feedbackType === FeedbackType.REGENERATE && reason) {
        await this.memoryManager.createMemory({
          userId,
          content: `Content regenerated because: ${reason}`,
          category: MemoryCategory.PREFERENCE,
          source: 'user_feedback' as any,
          importance: 0.6,
          relatedTaskType: this.mapCategoryToTaskType(category),
          tags: ['regenerate', 'improvement'],
        });
      }
    } catch (error) {
      // Don't fail the feedback recording if learning fails
      console.error('Auto-learning from feedback failed:', error);
    }
  }

  /**
   * Extract success patterns from well-received content
   */
  private extractSuccessPatterns(content: string, category: AITaskCategory): string | null {
    if (!content) return null;

    const patterns: string[] = [];

    // Check for emoji usage
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 0) {
      patterns.push(`uses ${emojiCount === 1 ? 'minimal' : emojiCount <= 3 ? 'moderate' : 'heavy'} emoji usage`);
    }

    // Check for hashtags
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    if (hashtagCount > 0) {
      patterns.push(`includes ${hashtagCount} hashtags`);
    }

    // Check for questions
    if (content.includes('?')) {
      patterns.push('uses questions to engage');
    }

    // Check for call-to-action
    const ctaKeywords = ['click', 'shop', 'visit', 'follow', 'like', 'comment', 'share', 'tag'];
    if (ctaKeywords.some(kw => content.toLowerCase().includes(kw))) {
      patterns.push('includes call-to-action');
    }

    // Check content length
    if (content.length < 50) {
      patterns.push('prefers short, concise content');
    } else if (content.length > 200) {
      patterns.push('prefers detailed, longer content');
    }

    if (patterns.length === 0) return null;

    return `Successful ${category} content: ${patterns.join(', ')}`;
  }

  /**
   * Map task category to task type
   */
  private mapCategoryToTaskType(category: AITaskCategory): string {
    const mapping = {
      [AITaskCategory.CONTENT_IDEAS]: 'generate_ideas',
      [AITaskCategory.CONTENT_CAPTION]: 'caption_generation',
      [AITaskCategory.CONTENT_HOOKS]: 'hook_generation',
      [AITaskCategory.CONTENT_HASHTAGS]: 'hashtag_generation',
    };

    return mapping[category] || 'general';
  }
}
