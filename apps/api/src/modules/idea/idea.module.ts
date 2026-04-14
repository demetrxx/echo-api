import { Module } from '@nestjs/common';

import { LlmModule } from '@/modules/llm';

import { IdeaService } from './idea.service';
import { IdeaGeneratorService } from './idea-generator.service';

@Module({
  imports: [LlmModule],
  providers: [IdeaService, IdeaGeneratorService],
  exports: [IdeaService],
})
export class IdeaModule {}
