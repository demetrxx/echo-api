import { Module } from '@nestjs/common';

import { ProfileModule } from '../profile';
import { PostService } from './post.service';

@Module({
  imports: [ProfileModule],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
