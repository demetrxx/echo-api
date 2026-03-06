import { UserEntity, UserStatus } from '@app/db';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AuthConfig } from '@/config';

import { UN_PROTECT_KEY } from '../decorators';
import { AuthenticatedPersonFastifyRequest } from '../types';

function extractBearerToken(header: string | undefined) {
  const [type, token] = header ? header.split(' ') : [];

  return type === 'Bearer' ? token : null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUnProtectedDecoratorSpecified =
      this.reflector.getAllAndOverride<boolean>(UN_PROTECT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (isUnProtectedDecoratorSpecified) {
      return true;
    }

    const type = context.getType();

    if (type === 'http') {
      return this.handleHttp(context);
    }

    return false;
  }

  private async handleHttp(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedPersonFastifyRequest>();
    const jwt = extractBearerToken(request.headers.authorization);

    if (!jwt) {
      throw new UnauthorizedException();
    }

    const authConfig = this.configService.get<AuthConfig>('auth');
    if (!authConfig) {
      throw new UnauthorizedException();
    }

    const looksLikeJwt = jwt.split('.').length === 3;
    let user: UserEntity | null = null;

    if (!looksLikeJwt && authConfig.emailAuthEnabled) {
      const userRepository = this.dataSource.getRepository(UserEntity);
      user = await userRepository.findOne({
        where: {
          email: jwt,
          status: UserStatus.Active,
        },
      });
    } else {
      if (!authConfig.accessSecret) {
        throw new UnauthorizedException();
      }

      try {
        const payload = await this.jwtService.verifyAsync<{
          sub: string;
          email: string;
          typ: string;
        }>(jwt, { secret: authConfig.accessSecret });

        if (payload.typ !== 'access') {
          throw new UnauthorizedException();
        }

        const userRepository = this.dataSource.getRepository(UserEntity);
        user = await userRepository.findOne({
          where: {
            id: payload.sub,
            status: UserStatus.Active,
          },
        });
      } catch {
        throw new UnauthorizedException();
      }
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    request.token = jwt;
    request.user = user;

    return true;
  }
}
