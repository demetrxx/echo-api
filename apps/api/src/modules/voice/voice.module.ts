import { Module } from '@nestjs/common';

import { IdeaModule } from '../idea/idea.module';
import { LlmModule } from '../llm/llm.module';
import { PostModule } from '../post/post.module';
import { VoiceService } from './voice.service';
import { VoiceCalibrationService } from './voice-calibration.service';

@Module({
  imports: [LlmModule, PostModule, IdeaModule],
  providers: [VoiceService, VoiceCalibrationService],
  exports: [VoiceService, VoiceCalibrationService],
})
export class VoiceModule {}
