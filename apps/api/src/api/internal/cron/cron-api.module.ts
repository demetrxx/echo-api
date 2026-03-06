import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InternalConfig } from '@/config';

import { CronController } from './cron.controller';

@Module({
  imports: [ConfigModule.forFeature(InternalConfig)],
  controllers: [CronController],
})
export class CronApiModule {}
