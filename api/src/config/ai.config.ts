import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  gatewayApiKey: process.env.AI_GATEWAY_API_KEY,
  gatewayBaseUrl: process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1',
  gatewayName: process.env.AI_GATEWAY_NAME || 'businesspro-ai',
}));
