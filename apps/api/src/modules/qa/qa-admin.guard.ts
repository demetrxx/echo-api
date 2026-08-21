import { UserEntity } from '@app/db';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { QaConfig } from '@/config';
import { AuthenticatedPersonFastifyRequest } from '@/modules/auth/types';

@Injectable()
export class QaAdminGuard implements CanActivate {
  constructor(
    @Inject(QaConfig.KEY)
    private readonly qaConfig: QaConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedPersonFastifyRequest>();
    const user = request.user as UserEntity | undefined;

    if (!user) {
      throw new ForbiddenException('Admin access required');
    }

    if (user.isQaSandbox) {
      throw new ForbiddenException('Sandbox users cannot operate AI-QA');
    }

    const allowlist = this.qaConfig.adminEmails;
    if (!allowlist.length) {
      throw new ForbiddenException('QA admin allowlist is empty');
    }

    if (!allowlist.includes(user.email.toLowerCase())) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
