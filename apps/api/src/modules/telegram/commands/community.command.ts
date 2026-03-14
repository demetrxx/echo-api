import { Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';

import { BotContext } from '../types';

const communityChannel = '@aera_chat';

@Injectable()
export class CommunityCommand {
  private readonly logger = new Logger(CommunityCommand.name);

  register(bot: Bot<BotContext>) {
    bot.command('community', this.community);
  }

  async community(ctx: BotContext) {
    try {
      await ctx.reply(
        `💋 Join our community and share your experience with Aera: ${communityChannel}`,
      );
    } catch (error) {
      this.logger.error('Support community error:', error);
      await ctx.reply(
        '💡SYSTEM: An error occurred while processing your request',
      );
    }
  }
}
