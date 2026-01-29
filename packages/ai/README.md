# @businesspro/ai

Centralized AI Gateway package for Business Pro. This package provides a unified interface to Vercel AI Gateway, abstracting away AI model complexity and ensuring consistent usage across all applications.

## Features

- ✅ **Single Source of Truth** - All AI models defined via enums
- ✅ **Easy Model Switching** - Change models globally by updating enum values
- ✅ **Cost Tracking** - Automatic cost bucket classification
- ✅ **Provider Agnostic** - Easy to switch between OpenAI, Anthropic, etc.
- ✅ **Type Safe** - Full TypeScript support
- ✅ **Vercel AI SDK** - Built on top of Vercel AI SDK v4

## Installation

```bash
# Already installed as a workspace package
# Just import it in your app
```

## Usage

### 1. Initialize the Gateway

```typescript
import { createAIGateway } from '@businesspro/ai';

// Initialize once at app startup
const gateway = createAIGateway(process.env.AI_GATEWAY_API_KEY);
```

### 2. Generate Text Completion

```typescript
import { getAIGateway, AIModel, AIFeature } from '@businesspro/ai';

const gateway = getAIGateway();

const { text, metadata } = await gateway.generateCompletion(
  {
    model: AIModel.LIGHT_MODEL,
    feature: AIFeature.GENERATE_CAPTION,
    maxTokens: 500,
    temperature: 0.7,
  },
  'Generate a caption for a coffee shop Instagram post',
  'You are a social media marketing expert for local businesses in India.',
);

console.log(text);
console.log('Cost:', metadata.costBucket); // 'low'
console.log('Tokens:', metadata.totalTokens);
```

### 3. Generate JSON Response

```typescript
import { getAIGateway, AIModel, AIFeature } from '@businesspro/ai';

const gateway = getAIGateway();

interface ContentIdeas {
  ideas: Array<{
    title: string;
    description: string;
    score: number;
  }>;
}

const { data, metadata } = await gateway.generateJSON<ContentIdeas>(
  {
    model: AIModel.HEAVY_MODEL,
    feature: AIFeature.GENERATE_IDEAS,
    maxTokens: 1500,
  },
  'Generate 5 Instagram content ideas for a cafe',
  'You are a social media expert. Respond with JSON only.',
);

console.log(data.ideas);
```

### 4. Stream Responses

```typescript
const gateway = getAIGateway();

const stream = gateway.streamCompletion(
  {
    model: AIModel.LIGHT_MODEL,
    feature: AIFeature.GENERATE_CAPTION,
  },
  'Write a caption for a gym promotion',
);

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

## Model Enums

### Available Models

```typescript
enum AIModel {
  // Heavy Models - Complex reasoning, story generation
  HEAVY_MODEL = 'openai:gpt-4o',
  
  // Light Models - Captions, hooks, hashtags
  LIGHT_MODEL = 'openai:gpt-4o-mini',
  
  // Vision Models - Image understanding
  VISION_MODEL = 'openai:gpt-4o',
}
```

### Switching Models Globally

To switch models across the entire application, simply update the enum values:

```typescript
// packages/ai/src/types/index.ts
export enum AIModel {
  HEAVY_MODEL = 'anthropic:claude-3-5-sonnet-20241022', // Changed!
  LIGHT_MODEL = 'anthropic:claude-3-5-haiku-20241022',  // Changed!
  VISION_MODEL = 'openai:gpt-4o',
}
```

That's it! All features using `AIModel.HEAVY_MODEL` will now use Claude instead of GPT-4.

## Cost Buckets

Automatic cost classification based on model type:

- **LOW**: Light models (captions, hashtags, rewrites)
- **MEDIUM**: Standard models
- **HIGH**: Heavy models (story generation, complex reasoning)

## Features

```typescript
enum AIFeature {
  GENERATE_IDEAS = 'generate_ideas',
  GENERATE_CAPTION = 'generate_caption',
  GENERATE_HOOKS = 'generate_hooks',
  GENERATE_HASHTAGS = 'generate_hashtags',
  GENERATE_SUGGESTIONS = 'generate_suggestions',
  ENGAGEMENT_ESTIMATE = 'engagement_estimate',
}
```

## Error Handling

```typescript
import { AIGatewayError } from '@businesspro/ai';

try {
  const result = await gateway.generateCompletion(config, prompt);
} catch (error) {
  if (error instanceof AIGatewayError) {
    console.error('AI Error:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Provider:', error.provider);
  }
}
```

## Best Practices

1. **Use Light Models When Possible** - Save costs for simple tasks
2. **Log All Requests** - Track usage via metadata
3. **Set Appropriate maxTokens** - Prevent runaway costs
4. **Handle Errors Gracefully** - AI requests can fail
5. **Cache When Possible** - Don't regenerate identical content

## Example: Generate Social Media Caption

```typescript
import { getAIGateway, AIModel, AIFeature } from '@businesspro/ai';

async function generateCaption(businessType: string, tone: string) {
  const gateway = getAIGateway();
  
  const systemPrompt = `You are a social media expert for local businesses in India. 
Generate engaging captions in a ${tone} tone for ${businessType} businesses.`;

  const prompt = `Create a caption for an Instagram post promoting today's special offer.`;

  const { text, metadata } = await gateway.generateCompletion(
    {
      model: AIModel.LIGHT_MODEL, // Low cost!
      feature: AIFeature.GENERATE_CAPTION,
      maxTokens: 300,
      temperature: 0.8,
    },
    prompt,
    systemPrompt,
  );

  console.log('Generated caption:', text);
  console.log('Cost bucket:', metadata.costBucket); // 'low'
  console.log('Tokens used:', metadata.totalTokens);
  
  return { caption: text, metadata };
}

// Usage
const result = await generateCaption('cafe', 'friendly');
```

## Environment Variables

Required in your app:

```env
AI_GATEWAY_API_KEY=vck_xxxxx
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1  # Optional
```

## Architecture

```
packages/ai/
├── src/
│   ├── types/
│   │   └── index.ts          # Enums, interfaces, types
│   ├── gateway/
│   │   └── vercel-ai-gateway.ts  # Gateway client
│   └── index.ts              # Public exports
├── package.json
├── tsconfig.json
└── README.md
```

## Building

```bash
cd packages/ai
npm run build
```

## Development

```bash
cd packages/ai
npm run dev  # Watch mode
```

## License

Private - Business Pro
