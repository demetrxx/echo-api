import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';

import { AdminUsersController } from './users.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController],
})
export class UsersApiModule {}
