import { getDataSourceOptions } from '@app/db';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiModule } from '@/api';
import { TelegramModule } from '@/modules/telegram';

import { AuthConfig, RedisConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AuthConfig, RedisConfig],
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      useFactory: (redisConfig: RedisConfig) => ({
        connection: {
          host: redisConfig.host,
          port: redisConfig.port,
          ...(redisConfig.password && { password: redisConfig.password }),
          ...(redisConfig.username && { username: redisConfig.username }),
        },
      }),
      inject: [RedisConfig.KEY],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getDataSourceOptions(),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        const enabled = process.env.APP_THROTTLE_ENABLED;

        if (!enabled) {
          return [];
        }

        return [
          { name: 'short', ttl: 1000, limit: 3 },
          { name: 'medium', ttl: 10000, limit: 20 },
          { name: 'long', ttl: 60000, limit: 100 },
        ];
      },
    }),
    ApiModule,
    TelegramModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
