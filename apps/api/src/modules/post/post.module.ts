import { Module } from '@nestjs/common';

import { ProfileModule } from '../profile';
import { PostService } from './post.service';
import { PostStore } from './post.store';

@Module({
  imports: [ProfileModule],
  providers: [PostStore, PostService],
  exports: [PostStore, PostService],
})
export class PostModule {}
