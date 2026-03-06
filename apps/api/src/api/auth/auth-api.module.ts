import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';

import { AuthController } from './auth.controller';

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
})
export class AuthApiModule {}
