import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessProfile } from './entities/business-profile.entity';
import { PlatformAccountContext } from './entities/platform-account-context.entity';
import { AIMemory } from './entities/ai-memory.entity';
import { ContextTemplate } from './entities/context-template.entity';
import { EmbeddingService } from './services/embedding.service';
import { MemoryManagerService } from './services/memory-manager.service';
import { ContextBuilderService } from './services/context-builder.service';
import { ContextController } from './context.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessProfile,
      PlatformAccountContext,
      AIMemory,
      ContextTemplate,
    ]),
  ],
  controllers: [ContextController],
  providers: [
    EmbeddingService,
    MemoryManagerService,
    ContextBuilderService,
  ],
  exports: [
    EmbeddingService,
    MemoryManagerService,
    ContextBuilderService,
  ],
})
export class ContextModule {}
