/**
 * AI Prompts Configuration
 * 
 * Centralized prompt management for all AI features.
 * Modify prompts here without touching service logic.
 */

export interface PromptContext {
  businessType?: string;
  contentGoal?: string;
  tone?: string;
  language?: string;
  visualStyle?: string;
  platforms?: string[];
  context?: string;
  caption?: string;
  platform?: string;
  contentType?: string;
  goal?: string;
}

export class AIPrompts {
  /**
   * CONTENT IDEAS GENERATION
   */
  static getIdeasSystemPrompt(ctx: PromptContext): string {
    return `You are a social media marketing expert for local businesses in India.
Generate engaging, relevant content ideas that are culturally appropriate and trend-aware.
Focus on ${ctx.businessType} businesses.
Consider current trends, festivals, and local context.`;
  }

  static getIdeasPrompt(ctx: PromptContext): string {
    return `Generate 5 unique social media content ideas for a ${ctx.businessType} business.

Business Context:
- Platforms: ${ctx.platforms?.join(', ')}
- Content Goal: ${ctx.contentGoal}
- Tone: ${ctx.tone}
- Language: ${ctx.language}
- Visual Style: ${ctx.visualStyle}
${ctx.context ? `- Additional Context: ${ctx.context}` : ''}

For each idea, provide:
1. A catchy title (max 60 characters)
2. Brief description (2-3 sentences explaining the concept)
3. Engagement score (0-100 based on trend analysis and platform best practices)
4. 2-3 relevant tags (e.g., "Best for reach", "Trending hook", "High engagement", "Story-friendly")
5. Brief reasoning why this will work (consider timing, trends, and audience)

Respond with valid JSON in this exact format:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "...",
      "description": "...",
      "engagementScore": 85,
      "tags": ["Best for reach", "Trending hook"],
      "reasoning": "..."
    }
  ]
}`;
  }

  /**
   * CAPTION GENERATION
   */
  static getCaptionSystemPrompt(ctx: PromptContext): string {
    return `You are a social media copywriter expert for local businesses in India.
Write engaging captions in a ${ctx.tone} tone and ${ctx.language} language.
Keep captions concise, engaging, and culturally relevant.
Use appropriate emojis when suitable for the tone.
Include call-to-action when relevant.`;
  }

  static getCaptionPrompt(ctx: PromptContext): string {
    return `Write a compelling social media caption for a ${ctx.businessType} business.

Context:
- Business Type: ${ctx.businessType}
- Goal: ${ctx.contentGoal}
- Tone: ${ctx.tone}
- Language: ${ctx.language}
- Details: ${ctx.context}

Guidelines:
- Keep it concise but impactful
- Include a call-to-action if appropriate
- Use emojis sparingly based on tone (${ctx.tone})
- Make it authentic and relatable
- Consider the platform's best practices

Also provide 2 alternative captions with different approaches (one shorter, one with different hook).

Respond with valid JSON:
{
  "caption": "main caption here",
  "alternativeCaptions": ["alternative 1", "alternative 2"]
}`;
  }

  /**
   * HOOKS GENERATION
   */
  static getHooksSystemPrompt(ctx: PromptContext): string {
    return `You are an expert in creating viral social media hooks that grab attention in the first 3 seconds.
Generate hooks suitable for ${ctx.businessType} businesses in India.
Focus on ${ctx.language} language patterns and cultural references.`;
  }

  static getHooksPrompt(ctx: PromptContext): string {
    return `Generate 5 attention-grabbing hooks for ${ctx.contentType} content.

Business: ${ctx.businessType}
Goal: ${ctx.goal}
Language: ${ctx.language || 'English'}

Hooks should:
- Start with strong attention grabbers
- Be suitable for the first 3 seconds of a video or the opening line of a post
- Use proven patterns like: "POV:", "Did you know...", "The secret to...", "Stop scrolling if...", "This changed everything..."
- Be culturally relevant to Indian audience
- Match the business type and goal

Respond with valid JSON:
{
  "hooks": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"]
}`;
  }

  /**
   * HASHTAGS GENERATION
   */
  static getHashtagsSystemPrompt(ctx: PromptContext): string {
    return `You are a social media SEO expert specializing in hashtag optimization for ${ctx.platform}.
Generate relevant, trending, and niche hashtags for local businesses in India.
Consider current trends, searchability, and engagement potential.
Balance between high-volume and niche hashtags for optimal reach.`;
  }

  static getHashtagsPrompt(ctx: PromptContext): string {
    return `Generate 10 relevant hashtags for this content:

Caption: "${ctx.caption}"
Business: ${ctx.businessType}
Platform: ${ctx.platform}
Language: ${ctx.language}

Strategy:
- 2-3 broad hashtags (high volume, 100k+ posts) for reach
- 4-5 niche hashtags (10k-50k posts) for targeted audience
- 2-3 local/regional hashtags for local businesses
- Consider trending hashtags if relevant
- Ensure hashtags are searchable and not overly generic

Respond with valid JSON:
{
  "hashtags": ["hashtag1", "hashtag2", ...]
}

IMPORTANT: Do NOT include the # symbol in hashtags. Return only the text.`;
  }

  /**
   * CONTENT ENHANCEMENT (for editing scenarios)
   */
  static getEnhancementSystemPrompt(ctx: PromptContext): string {
    return `You are a content optimization expert.
Analyze the provided content and suggest improvements.
Focus on engagement, clarity, and platform best practices.`;
  }

  static getEnhancementPrompt(ctx: PromptContext): string {
    return `Analyze and enhance this content:

Original: "${ctx.context}"
Business: ${ctx.businessType}
Platform: ${ctx.platform}
Goal: ${ctx.contentGoal}

Provide:
1. Enhanced version
2. Specific improvements made
3. Estimated engagement impact

Respond with valid JSON:
{
  "enhanced": "...",
  "improvements": ["improvement 1", "improvement 2"],
  "estimatedImpact": "+15% engagement"
}`;
  }

  /**
   * IMAGE/VIDEO ANALYSIS (multimodal)
   */
  static getMediaAnalysisSystemPrompt(): string {
    return `You are an expert in analyzing visual content for social media.
Understand the image/video context and generate relevant captions and ideas.
Consider composition, colors, subjects, mood, and platform requirements.`;
  }

  static getMediaAnalysisPrompt(ctx: PromptContext): string {
    return `Analyze the provided image/video and generate:

Business: ${ctx.businessType}
Platform: ${ctx.platform}
Tone: ${ctx.tone}
Language: ${ctx.language}

Provide:
1. A compelling caption based on the visual content
2. 3 content ideas that could use this media
3. 5 relevant hashtags

Respond with valid JSON:
{
  "caption": "...",
  "ideas": ["idea 1", "idea 2", "idea 3"],
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;
  }
}
