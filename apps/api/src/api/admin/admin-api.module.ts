import { Module } from '@nestjs/common';

import { UsersApiModule } from './users';

@Module({
  imports: [UsersApiModule],
  controllers: [],
})
export class AdminApiModule {}
