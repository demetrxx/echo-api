import { Module } from '@nestjs/common';

import { QaApiModule } from './qa';
import { UsersApiModule } from './users';

@Module({
  imports: [UsersApiModule, QaApiModule],
  controllers: [],
})
export class AdminApiModule {}
