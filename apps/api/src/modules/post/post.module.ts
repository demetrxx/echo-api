import { Module } from '@nestjs/common';

import { PostService } from './post.service';
import { PostStore } from './post.store';

@Module({
  providers: [PostStore, PostService],
  exports: [PostStore, PostService],
})
export class PostModule {}
