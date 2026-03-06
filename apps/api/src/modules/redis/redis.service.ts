import { Inject, Injectable, OnModuleDestroy, Optional } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT, REDIS_PREFIX } from './redis.tokens';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    @Optional() @Inject(REDIS_PREFIX) private readonly prefix?: string,
  ) {}

  async onModuleDestroy(): Promise<void> {
    if (!this.prefix) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(this.buildKey(key));
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const redisKey = this.buildKey(key);
    if (ttlSeconds) {
      await this.client.set(redisKey, value, 'EX', ttlSeconds);
      return;
    }
    await this.client.set(redisKey, value);
  }

  async mget(keys: string[]): Promise<Array<string | null>> {
    const redisKeys = keys.map((key) => this.buildKey(key));
    return this.client.mget(redisKeys);
  }

  async del(key: string): Promise<number> {
    return this.client.del(this.buildKey(key));
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      throw new Error(`Invalid JSON stored at key: ${this.buildKey(key)}`);
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  private buildKey(key: string): string {
    if (!this.prefix) {
      return key;
    }
    return `${this.prefix}:${key}`;
  }
}
