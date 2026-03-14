import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InternalConfig } from '@/config';
import { TelegramModule } from '@/modules/telegram';

import { TelegramController } from './telegram.controller';

@Module({
  imports: [ConfigModule.forFeature(InternalConfig), TelegramModule],
  controllers: [TelegramController],
})
export class TelegramApiModule {}
