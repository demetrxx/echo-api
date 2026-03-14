import { Module } from '@nestjs/common';

import { CronApiModule } from './cron';
import { TelegramApiModule } from './telegram';

@Module({
  imports: [CronApiModule, TelegramApiModule],
  controllers: [],
})
export class InternalApiModule {}
