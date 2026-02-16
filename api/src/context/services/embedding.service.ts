import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

/**
 * Embedding Service
 * Generates vector embeddings using OpenAI's text-embedding-3-small model
 * Cost: $0.00002 per 1M tokens (extremely cheap)
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI;
  private readonly model = 'text-embedding-3-small';
  private readonly dimensions = 1536; // Default dimensions for text-embedding-3-small
  private embeddingCache: Map<string, number[]> = new Map();
  private readonly maxCacheSize = 1000;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found. Embedding service will not work.');
      return;
    }

    this.openai = new OpenAI({ apiKey });
    this.logger.log('Embedding service initialized with text-embedding-3-small');
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text);
    if (this.embeddingCache.has(cacheKey)) {
      this.logger.debug(`Cache hit for text: ${text.substring(0, 50)}...`);
      return {
        embedding: this.embeddingCache.get(cacheKey)!,
        model: this.model,
        usage: { promptTokens: 0, totalTokens: 0 }, // Cached, no tokens used
      };
    }

    try {
      const startTime = Date.now();
      
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
        dimensions: this.dimensions,
      });

      const embedding = response.data[0].embedding;
      const duration = Date.now() - startTime;

      // Cache the result
      this.cacheEmbedding(cacheKey, embedding);

      this.logger.log(
        `Generated embedding in ${duration}ms, tokens: ${response.usage.total_tokens}`,
      );

      return {
        embedding,
        model: this.model,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch (more efficient)
   */
  async generateBatchEmbeddings(texts: string[]): Promise<BatchEmbeddingResult> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
    }

    if (texts.length === 0) {
      return {
        embeddings: [],
        model: this.model,
        usage: { promptTokens: 0, totalTokens: 0 },
      };
    }

    // Check cache for each text
    const embeddings: number[][] = [];
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];

    texts.forEach((text, index) => {
      const cacheKey = this.getCacheKey(text);
      if (this.embeddingCache.has(cacheKey)) {
        embeddings[index] = this.embeddingCache.get(cacheKey)!;
      } else {
        uncachedTexts.push(text);
        uncachedIndices.push(index);
      }
    });

    // If all cached, return immediately
    if (uncachedTexts.length === 0) {
      this.logger.debug(`All ${texts.length} embeddings found in cache`);
      return {
        embeddings,
        model: this.model,
        usage: { promptTokens: 0, totalTokens: 0 },
      };
    }

    try {
      const startTime = Date.now();
      
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: uncachedTexts,
        dimensions: this.dimensions,
      });

      const duration = Date.now() - startTime;

      // Fill in uncached embeddings
      response.data.forEach((item, i) => {
        const embedding = item.embedding;
        const originalIndex = uncachedIndices[i];
        embeddings[originalIndex] = embedding;
        
        // Cache the result
        const cacheKey = this.getCacheKey(uncachedTexts[i]);
        this.cacheEmbedding(cacheKey, embedding);
      });

      this.logger.log(
        `Generated ${uncachedTexts.length} embeddings in ${duration}ms, tokens: ${response.usage.total_tokens}`,
      );

      return {
        embeddings,
        model: this.model,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to generate batch embeddings: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   * Returns value between -1 and 1 (higher = more similar)
   */
  cosineSimilarity(embeddingA: number[], embeddingB: number[]): number {
    if (embeddingA.length !== embeddingB.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < embeddingA.length; i++) {
      dotProduct += embeddingA[i] * embeddingB[i];
      normA += embeddingA[i] * embeddingA[i];
      normB += embeddingB[i] * embeddingB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find most similar embeddings from a list
   */
  findMostSimilar(
    queryEmbedding: number[],
    embeddings: { id: string; embedding: number[]; metadata?: any }[],
    topK: number = 5,
  ): Array<{ id: string; similarity: number; metadata?: any }> {
    const similarities = embeddings.map((item) => ({
      id: item.id,
      similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
      metadata: item.metadata,
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
    this.logger.log('Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.embeddingCache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0, // Would need to track hits/misses for accurate rate
    };
  }

  /**
   * Private: Generate cache key from text
   */
  private getCacheKey(text: string): string {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${hash}_${text.length}`;
  }

  /**
   * Private: Cache embedding with LRU eviction
   */
  private cacheEmbedding(key: string, embedding: number[]): void {
    // Simple LRU: if cache is full, delete oldest entry
    if (this.embeddingCache.size >= this.maxCacheSize) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    
    this.embeddingCache.set(key, embedding);
  }
}
