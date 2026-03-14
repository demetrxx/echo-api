import { RouteTree } from '@nestjs/core';

import { CronApiModule } from './cron';
import { TelegramApiModule } from './telegram';

export const internalApiRoutes: RouteTree = {
  path: '/internal',
  children: [
    {
      path: 'cron',
      module: CronApiModule,
    },
    {
      path: 'telegram',
      module: TelegramApiModule,
    },
  ],
};
