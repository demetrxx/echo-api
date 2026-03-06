import { RouteTree } from '@nestjs/core';

import { AuthApiModule } from './auth-api.module';

export const authApiRoutes: RouteTree = {
  path: '/auth',
  module: AuthApiModule,
};
