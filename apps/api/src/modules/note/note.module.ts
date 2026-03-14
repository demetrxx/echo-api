import { Module } from '@nestjs/common';

import { FileModule } from '@/modules/file';
import { LlmModule } from '@/modules/llm';

import { NoteService } from './note.service';

@Module({
  imports: [LlmModule, FileModule],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
