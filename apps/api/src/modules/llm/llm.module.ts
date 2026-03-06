import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmbeddingConfig, LlmConfig } from '../../config';
import { LlmService } from './llm.service';

@Module({
  imports: [ConfigModule.forFeature(LlmConfig), ConfigModule.forFeature(EmbeddingConfig)],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
