import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAIGateway, getAIGateway, VercelAIGateway } from '@businesspro/ai';

@Injectable()
export class AIGatewayService implements OnModuleInit {
  private readonly logger = new Logger(AIGatewayService.name);
  private gateway: VercelAIGateway;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('ai.gatewayApiKey');
    const baseUrl = this.configService.get<string>('ai.gatewayBaseUrl');

    if (!apiKey) {
      this.logger.warn('AI_GATEWAY_API_KEY not found. AI features will not work.');
      return;
    }

    try {
      this.gateway = createAIGateway(apiKey, baseUrl);
      this.logger.log('Vercel AI Gateway initialized successfully');
      this.logger.log(`Base URL: ${baseUrl}`);
      this.logger.log(`API Key: ${apiKey.substring(0, 10)}...`);
    } catch (error) {
      this.logger.error('Failed to initialize AI Gateway', error.stack);
      throw error;
    }
  }

  getGateway(): VercelAIGateway {
    if (!this.gateway) {
      throw new Error('AI Gateway not initialized. Check AI_GATEWAY_API_KEY in your .env file.');
    }
    return this.gateway;
  }

  isReady(): boolean {
    return !!this.gateway;
  }
}
