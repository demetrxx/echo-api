import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { LlmModule } from '@/modules/llm';

import { ServicesController } from './services.controller';

@Module({
  imports: [AuthModule, LlmModule],
  controllers: [ServicesController],
})
export class ServicesApiModule {}
