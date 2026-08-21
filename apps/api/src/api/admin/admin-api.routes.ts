import { RouteTree } from '@nestjs/core';

import { QaApiModule } from './qa';
import { UsersApiModule } from './users';

export const adminApiRoutes: RouteTree = {
  path: '/admin',
  children: [
    {
      path: 'users',
      module: UsersApiModule,
    },
    {
      path: 'qa',
      module: QaApiModule,
    },
  ],
};
