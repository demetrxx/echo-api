import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '../guards';

export function Protected() {
  const guards: any[] = [AuthGuard];

  const decorators = [UseGuards(...guards), ApiBearerAuth()];

  return applyDecorators(...decorators);
}
