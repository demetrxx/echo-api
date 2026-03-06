import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../errors/app-error';
import { ERROR_HTTP_STATUS } from '../errors/error-mapping';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest<FastifyRequest>();

    if (exception instanceof AppError) {
      const status =
        ERROR_HTTP_STATUS[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

      return res.status(status).send({
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
        meta: {
          path: req.url,
          method: req.method,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      return res.status(status).send({
        error: {
          code: 'HTTP_EXCEPTION',
          message:
            typeof payload === 'string'
              ? payload
              : ((payload as any).message ?? exception.message),
          details: typeof payload === 'object' ? payload : undefined,
        },
        meta: {
          path: req.url,
          method: req.method,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      error: { code: 'INTERNAL', message: 'Internal server error' },
      meta: {
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
