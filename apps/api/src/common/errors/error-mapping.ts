import { HttpStatus } from '@nestjs/common';

import type { AppErrorCode } from './app-error';

export const ERROR_HTTP_STATUS: Record<AppErrorCode, number> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  CONFLICT: HttpStatus.CONFLICT,
  VALIDATION: HttpStatus.UNPROCESSABLE_ENTITY,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  INTERNAL: HttpStatus.INTERNAL_SERVER_ERROR,
};
