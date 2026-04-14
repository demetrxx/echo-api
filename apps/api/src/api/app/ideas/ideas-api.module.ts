import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { IdeaModule } from '@/modules/idea';

import { IdeasAppController } from './ideas.controller';

@Module({
  imports: [AuthModule, IdeaModule],
  controllers: [IdeasAppController],
})
export class IdeasApiModule {}
