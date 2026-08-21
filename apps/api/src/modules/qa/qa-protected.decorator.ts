import { applyDecorators, UseGuards } from '@nestjs/common';

import { Protected } from '@/modules/auth';

import { QaAdminGuard } from './qa-admin.guard';

export function QaProtected() {
  return applyDecorators(Protected(), UseGuards(QaAdminGuard));
}
