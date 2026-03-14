import { TgUserEntity, UserEntity } from '@app/db';
import { Context } from 'grammy';

export interface BotContext extends Context {
  user: UserEntity;
  tgUser: TgUserEntity;
}
