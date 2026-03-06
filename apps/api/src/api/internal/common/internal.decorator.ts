import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { InternalGuard } from './internal.guard';

export enum ExternalService {
  CRON = 'CRON',
}

export function Internal(service: ExternalService) {
  const guards = [InternalGuard];

  const decorators = [UseGuards(...guards)];

  decorators.push(SetMetadata('service', service));

  return applyDecorators(...decorators);
}
