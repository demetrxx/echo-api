import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { VoiceModule } from '@/modules/voice';

import { VoicesAppController } from './voices.controller';

@Module({
  imports: [AuthModule, VoiceModule],
  controllers: [VoicesAppController],
})
export class VoicesApiModule {}
