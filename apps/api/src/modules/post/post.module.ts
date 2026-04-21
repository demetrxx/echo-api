import { Module } from '@nestjs/common';

import { LlmModule } from '@/modules/llm';

import { VoiceModule } from '../voice';
import { PostService } from './post.service';
import { PostRefineService } from './post-refine.service';

@Module({
  imports: [VoiceModule, LlmModule],
  providers: [PostService, PostRefineService],
  exports: [PostService],
})
export class PostModule {}
