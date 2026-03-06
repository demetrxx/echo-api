import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { ProfileModule } from '@/modules/profile';

import { ProfilesAppController } from './profiles.controller';

@Module({
  imports: [AuthModule, ProfileModule],
  controllers: [ProfilesAppController],
})
export class ProfilesApiModule {}
