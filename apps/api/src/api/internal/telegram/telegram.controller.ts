import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { TelegramBot } from '@/modules/telegram';

import { TelegramWebhookOpenApi } from './telegram.openapi';

@ApiTags('Internal / Cron')
@Controller('/')
export class TelegramController {
  constructor(private readonly telegramBot: TelegramBot) {}

  @TelegramWebhookOpenApi
  @Post('webhook')
  handle(@Req() req: Request, @Res() res: Response) {
    return this.telegramBot.webhookHandler(req, res);
  }

  @TelegramWebhookOpenApi
  @Post('webhook-moderator')
  handleModerator(@Req() req: Request, @Res() res: Response) {
    return this.telegramBot.webhookHandler(req, res);
  }
}
