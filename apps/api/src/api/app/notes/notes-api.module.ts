import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { NoteModule } from '@/modules/note';

import { NotesAppController } from './notes.controller';

@Module({
  imports: [AuthModule, NoteModule],
  controllers: [NotesAppController],
})
export class NotesApiModule {}
