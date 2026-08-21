import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { QaModule } from '@/modules/qa';

import { QaIssuesController } from './issues.controller';
import { QaProfilesController } from './profiles.controller';
import { QaCatalogController } from './qa.controller';
import { QaRunsController } from './runs.controller';

@Module({
  imports: [AuthModule, QaModule],
  controllers: [
    QaCatalogController,
    QaProfilesController,
    QaRunsController,
    QaIssuesController,
  ],
})
export class QaApiModule {}
