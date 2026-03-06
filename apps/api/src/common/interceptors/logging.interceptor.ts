import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AppError } from '@/common/errors/app-error';
import { ERROR_HTTP_STATUS } from '@/common/errors/error-mapping';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;

    this.logger.log(`Inbound request: ${method} ${url} from ${ip}`);

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;

          this.logger.log(
            `Response: ${method} ${url} - ${statusCode} - ${Date.now() - now}ms`,
          );
        },
        error: (err) => {
          if (err instanceof AppError) {
            const statusCode = ERROR_HTTP_STATUS[err.code] ?? 500;

            const parts = [err.code, err.message, err.details]
              .filter(Boolean)
              .join(' - ');

            this.logger.error(`AppError: ${parts}`);

            this.logger.error(
              `Response: ${method} ${url} - ${statusCode} - ${Date.now() - now}ms`,
            );
          } else {
            const statusCode = err.status || 500;

            this.logger.error(err);

            this.logger.error(
              `Response: ${method} ${url} - ${statusCode} - ${Date.now() - now}ms`,
            );
          }
        },
      }),
    );
  }
}
