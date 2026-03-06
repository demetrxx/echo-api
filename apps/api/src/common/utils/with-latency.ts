import { Logger } from '@nestjs/common';

export async function withLatency<T>(
  name: string,
  promise: Promise<T>,
): Promise<Promise<T>> {
  const t0 = Date.now();
  const result = await promise;
  const latency = Date.now() - t0;
  Logger.debug(`${name} took ${latency}ms`);
  return result;
}
