import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.tokens';
import { RedisService } from './redis.service';

@Injectable()
export class RedisServiceFactory {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  create(prefix: string): RedisService {
    return new RedisService(this.client, prefix);
  }
}
