import { ConfigType, registerAs } from '@nestjs/config';

export const TelegramConfig = registerAs('telegram', () => ({
  apiId: Number(process.env.TELEGRAM_API_ID),
  apiHash: process.env.TELEGRAM_API_HASH,
  session: process.env.TELEGRAM_SESSION,
}));

export type TelegramConfig = ConfigType<typeof TelegramConfig>;
