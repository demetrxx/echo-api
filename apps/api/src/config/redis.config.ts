import { ConfigType, registerAs } from '@nestjs/config';

export const RedisConfig = registerAs('redis', () => {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  // Parse Redis URL if provided
  let host = 'localhost';
  let port = 6379;
  let password: string | undefined;
  let username: string | undefined;

  if (url && url.startsWith('redis://')) {
    try {
      const parsedUrl = new URL(url);
      host = parsedUrl.hostname;
      port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 6379;
      username = parsedUrl.username || undefined;
      password = parsedUrl.password || undefined;
    } catch (e) {
      // If URL parsing fails, use defaults
      console.warn('Failed to parse REDIS_URL, using defaults');
    }
  }

  return {
    url,
    host,
    port,
    password,
    username,
  };
});

export type RedisConfig = ConfigType<typeof RedisConfig>;
