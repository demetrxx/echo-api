import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';

import { RedisConfig } from '@/config';

import { REDIS_CLIENT } from './redis.tokens';
import { RedisService } from './redis.service';
import { RedisServiceFactory } from './redis.service-factory';

@Module({
  imports: [ConfigModule.forFeature(RedisConfig)],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [RedisConfig.KEY],
      useFactory: (redisConfig: RedisConfig) =>
        new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          ...(redisConfig.password && { password: redisConfig.password }),
          ...(redisConfig.username && { username: redisConfig.username }),
        }),
    },
    RedisService,
    RedisServiceFactory,
  ],
  exports: [RedisService, RedisServiceFactory],
})
export class RedisModule {}
