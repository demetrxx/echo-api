import { Module } from '@nestjs/common';

import { LlmModule } from '@/modules/llm';

import { StrategyAgent } from './strategy.agent';
import { StrategyService } from './strategy.service';

@Module({
  imports: [LlmModule],
  providers: [StrategyService, StrategyAgent],
  exports: [StrategyService],
})
export class StrategyModule {}
