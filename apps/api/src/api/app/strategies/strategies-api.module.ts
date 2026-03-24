import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { StrategyModule } from '@/modules/strategy';

import { StrategiesAppController } from './strategies.controller';

@Module({
  imports: [AuthModule, StrategyModule],
  controllers: [StrategiesAppController],
})
export class StrategiesApiModule {}
