import { Module } from '@nestjs/common';

import { LlmModule } from '../llm/llm.module';
import { VoiceService } from './voice.service';

@Module({
  imports: [LlmModule],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
