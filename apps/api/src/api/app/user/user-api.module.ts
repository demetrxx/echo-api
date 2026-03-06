import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { UserModule } from '@/modules/user';

import { UserAppController } from './user.controller';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [UserAppController],
})
export class UserApiModule {}
