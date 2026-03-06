import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { PostModule } from '@/modules/post';

import { PostsAppController } from './posts.controller';

@Module({
  imports: [AuthModule, PostModule],
  controllers: [PostsAppController],
})
export class PostsApiModule {}
