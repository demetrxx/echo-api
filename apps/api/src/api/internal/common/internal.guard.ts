import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { InternalConfig } from '../../../config';
import { ExternalService } from './internal.decorator';

@Injectable()
export class InternalGuard implements CanActivate {
  constructor(
    @Inject(InternalConfig.KEY)
    private readonly config: InternalConfig,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType();

    const service = this.reflector.getAllAndOverride<ExternalService>(
      'service',
      [context.getHandler(), context.getClass()],
    );

    if (type === 'http') {
      return this.handleHttp(context, service);
    }

    return false;
  }

  private async handleHttp(
    context: ExecutionContext,
    service: ExternalService,
  ) {
    const request = context.switchToHttp().getRequest();
    const secret = request.headers['x-internal-secret'];

    if (!secret) {
      throw new UnauthorizedException();
    }

    switch (service) {
      case ExternalService.CRON:
        if (secret !== this.config.cronSecret) {
          throw new UnauthorizedException();
        }
        break;
    }

    return true;
  }
}
