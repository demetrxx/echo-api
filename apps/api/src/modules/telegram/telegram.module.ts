import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TelegramConfig } from '@/config';
import { FileModule } from '@/modules/file';
import { LlmModule } from '@/modules/llm';
import { NoteModule } from '@/modules/note';

import { CommunityCommand } from './commands';
import { NoteCommand } from './commands';
import { AuthMiddleware, HandleErrorsMiddleware } from './middleware';
import { TelegramBot } from './telegram.bot';
import { TelegramService } from './telegram.service';

@Module({
  controllers: [],
  imports: [ConfigModule.forFeature(TelegramConfig), NoteModule, FileModule],
  providers: [
    TelegramBot,
    CommunityCommand,
    AuthMiddleware,
    HandleErrorsMiddleware,
    TelegramService,
    NoteCommand,
  ],
  exports: [TelegramBot, TelegramService],
})
export class TelegramModule {}
