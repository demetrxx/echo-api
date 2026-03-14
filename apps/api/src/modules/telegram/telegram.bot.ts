import { autoRetry } from '@grammyjs/auto-retry';
import { hydrateFiles } from '@grammyjs/files';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Bot, webhookCallback } from 'grammy';

import { TelegramConfig } from '@/config';

import { CommunityCommand } from './commands';
import { NoteCommand } from './commands/note.command';
import { AuthMiddleware, HandleErrorsMiddleware } from './middleware';
import { TelegramService } from './telegram.service';
import { BotContext } from './types';

@Injectable()
export class TelegramBot implements OnModuleDestroy {
  private readonly logger = new Logger(TelegramBot.name);
  private _bot: Bot<BotContext>;
  private _webhookHandler: ReturnType<typeof webhookCallback>;

  constructor(
    @Inject(TelegramConfig.KEY)
    private readonly config: TelegramConfig,
    private readonly communityCommand: CommunityCommand,
    private readonly authMiddleware: AuthMiddleware,
    private readonly handleErrorsMiddleware: HandleErrorsMiddleware,
    private readonly telegramService: TelegramService,
    private readonly noteCommand: NoteCommand,
  ) {}

  get bot() {
    return this._bot;
  }

  get webhookHandler() {
    return this._webhookHandler;
  }

  startBot() {
    this._bot = new Bot<BotContext>(this.config.token);
    this.bot.api.config.use(hydrateFiles(this.bot.token));

    // Auto retry
    this.bot.api.config.use(
      autoRetry({
        maxRetryAttempts: 2,
        maxDelaySeconds: 60,
      }),
    );

    // Middleware
    this.authMiddleware.register(this.bot);
    this.handleErrorsMiddleware.register(this.bot);

    // Commands
    this.noteCommand.register(this.bot);

    this.bot.on('message:text', (ctx) => this.respondToUser(ctx as BotContext));
    this.bot.on('message:voice', (ctx) =>
      this.respondToUser(ctx as BotContext),
    );

    const commands = [
      {
        command: 'start',
        description: 'Start the bot',
      },
      {
        command: 'note',
        description: 'Create new note',
      },
      {
        command: 'clear',
        description: 'Clear conversation',
      },
    ];

    this.bot.api.setMyCommands(commands);

    this.bot.api.setWebhook(this.config.webhookUrl);

    const logger = this.logger;

    this.bot.catch((err) => {
      const ctx = err.ctx;
      logger.error('❌ Error while handling update', {
        update_id: ctx.update.update_id,
        error: err.error,
      });
    });

    this._webhookHandler = webhookCallback(this.bot, 'fastify');

    return this.bot;
  }

  private async respondToUser(ctx: BotContext) {
    if (ctx.message.text?.startsWith('/')) {
      return;
    }

    const { isNew } = await this.telegramService.addNoteItem(ctx);

    const text = isNew ? 'New note created' : 'Added to existing note';

    ctx.reply(`💡Echo: ${text}`);
  }

  onModuleDestroy() {
    this._bot.stop();
  }
}
