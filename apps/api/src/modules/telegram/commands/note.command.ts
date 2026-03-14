import { Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';

import { NoteService } from '@/modules/note';
import { TelegramService } from '@/modules/telegram/telegram.service';

import { BotContext } from '../types';

@Injectable()
export class NoteCommand {
  private readonly logger = new Logger(NoteCommand.name);

  constructor(private readonly telegramService: TelegramService) {}

  register(bot: Bot<BotContext>) {
    bot.command('note', (ctx) => this.note(ctx));
  }

  async note(ctx: BotContext) {
    console.log('note');
    await this.telegramService.createNote(ctx);

    await ctx.reply(
      '💡 Echo: Send texts, links, images, files, and voice notes to save them in your private note.',
    );
  }
}
