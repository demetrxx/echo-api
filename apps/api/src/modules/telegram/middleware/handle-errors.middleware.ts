import { Injectable, Logger } from '@nestjs/common';
import { Bot, NextFunction } from 'grammy';

import { BotContext } from '../types';

@Injectable()
export class HandleErrorsMiddleware {
  private readonly logger = new Logger(HandleErrorsMiddleware.name);

  constructor() {}

  register(bot: Bot<BotContext>) {
    bot.use(this.handleErrorsMiddleware);
  }

  private async handleErrorsMiddleware(ctx: BotContext, next: NextFunction) {
    try {
      await next();
    } catch (err: any) {
      console.error(err);

      if (err.name === 'GrammyError') {
        if (err.error_code === 403) {
          console.log(`User ${ctx.chat?.id} blocked the bot.`);

          // await this.userService.updateBlockedStatus(ctx.chat?.id, true);
        } else {
          console.error('Telegram API error:', err.description);
        }
      }
    }
  }
}
