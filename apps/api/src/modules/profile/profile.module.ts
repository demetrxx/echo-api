import { Module } from '@nestjs/common';

import { ProfileService } from './profile.service';
import { ProfileStore } from './profile.store';

@Module({
  providers: [ProfileStore, ProfileService],
  exports: [ProfileStore, ProfileService],
})
export class ProfileModule {}
