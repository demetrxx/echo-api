import { RouteTree } from '@nestjs/core';

import { UsersApiModule } from './users';

export const adminApiRoutes: RouteTree = {
  path: '/admin',
  children: [
    {
      path: 'users',
      module: UsersApiModule,
    },
  ],
};
