import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthGuard } from './guards';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthGuard, AuthService],
  exports: [AuthGuard, AuthService, JwtModule],
})
export class AuthModule {}
