import { Module } from '@nestjs/common';

import { LlmModule } from '../llm/llm.module';
import { VoiceService } from './voice.service';
import { VoiceCalibrationService } from './voice-calibration.service';

@Module({
  imports: [LlmModule],
  providers: [VoiceService, VoiceCalibrationService],
  exports: [VoiceService, VoiceCalibrationService],
})
export class VoiceModule {}
