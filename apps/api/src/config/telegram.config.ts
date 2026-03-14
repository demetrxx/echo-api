import { ConfigType, registerAs } from '@nestjs/config';

export const TelegramConfig = registerAs('telegram', () => ({
  token: process.env.TELEGRAM_BOT_TOKEN,
  webhookUrl: process.env.APP_URL + '/internal/telegram/webhook',
  botId: Number(process.env.TELEGRAM_BOT_ID),
}));

export type TelegramConfig = ConfigType<typeof TelegramConfig>;
