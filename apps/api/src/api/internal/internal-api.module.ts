import { Module } from '@nestjs/common';

import { CronApiModule } from './cron';

@Module({
  imports: [CronApiModule],
  controllers: [],
})
export class InternalApiModule {}
