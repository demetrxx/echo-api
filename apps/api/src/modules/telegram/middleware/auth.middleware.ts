import { Inject, Injectable, Logger } from '@nestjs/common';
import { Bot, InlineKeyboard, NextFunction } from 'grammy';

import { TelegramConfig } from '@/config';

import { TelegramService } from '../telegram.service';
import { BotContext } from '../types';

@Injectable()
export class AuthMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly telegramService: TelegramService,
    @Inject(TelegramConfig.KEY)
    private readonly config: TelegramConfig,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.use((ctx, next) => this.authMiddleware(ctx, next));
  }

  private async authMiddleware(ctx: BotContext, next: NextFunction) {
    if (!ctx.from) {
      return;
    }

    if (ctx?.from.is_bot) {
      return;
    }

    this.logger.log('Auth middleware', ctx.from.id);

    try {
      const tgUser = await this.telegramService.findUser(ctx.from.id);

      // Show authentication screen
      if (!tgUser) {
        const kb = new InlineKeyboard();
        const url = new URL(`${process.env.WEB_APP_URL}/link-telegram`);
        url.searchParams.append('telegramId', ctx.from.id.toString());

        if (ctx.from.username) {
          url.searchParams.append('username', ctx.from.username);
        }

        kb.url('Connect account to Echo', url.toString());

        await ctx.reply('💡SYSTEM: Authenticate', {
          reply_markup: kb,
        });

        return;
      }

      this.telegramService.updateLastActivityAt(tgUser.id);

      ctx.user = tgUser.user;
      ctx.tgUser = tgUser;

      await next();
    } catch (e: any) {
      this.logger.error('Auth middleware error:', e);

      const isBlockedUpdate =
        ctx.myChatMember?.new_chat_member?.status === 'kicked';

      if (isBlockedUpdate) {
        return;
      }

      await ctx.reply('💡SYSTEM: Authentication failed');
    }
  }
}
