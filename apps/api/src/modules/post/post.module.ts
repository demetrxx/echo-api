import { Module } from '@nestjs/common';

import { LlmModule } from '@/modules/llm';

import { PostService } from './post.service';
import { PostRefineService } from './post-refine.service';

@Module({
  imports: [LlmModule],
  providers: [PostService, PostRefineService],
  exports: [PostService, PostRefineService],
})
export class PostModule {}
