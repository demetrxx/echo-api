import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const TelegramWebhookOpenApi = applyDecorators(
  ApiOperation({ summary: 'Telegram webhook' }),
  ApiUnauthorizedResponse(),
  ApiOkResponse({ description: 'Webhook received successfully.' }),
);
