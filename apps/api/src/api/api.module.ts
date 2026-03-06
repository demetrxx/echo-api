import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';

import { AdminApiModule, adminApiRoutes } from './admin';
import { AppApiModule, appApiRoutes } from './app';
import { AuthApiModule, authApiRoutes } from './auth';
import { InternalApiModule, internalApiRoutes } from './internal';
import { RootController } from './root.controller';

const ROUTES: Routes = [
  adminApiRoutes,
  appApiRoutes,
  authApiRoutes,
  internalApiRoutes,
];

@Module({
  imports: [
    AdminApiModule,
    AppApiModule,
    AuthApiModule,
    InternalApiModule,
    RouterModule.register(ROUTES),
  ],
  controllers: [RootController],
})
export class ApiModule {}
