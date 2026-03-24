import { RouteTree } from '@nestjs/core';

import { FilesApiModule } from './files';
import { NotesApiModule } from './notes';
import { PostsApiModule } from './posts';
import { ProfilesApiModule } from './profiles';
import { StrategiesApiModule } from './strategies';
import { ThemesApiModule } from './themes';
import { UserApiModule } from './user';

const routes: [string, any][] = [
  ['files', FilesApiModule],
  ['notes', NotesApiModule],
  ['posts', PostsApiModule],
  ['profiles', ProfilesApiModule],
  ['user', UserApiModule],
  ['themes', ThemesApiModule],
  ['strategies', StrategiesApiModule],
];

export const appApiRoutes: RouteTree = {
  path: '/',
  children: routes.map(([path, module]) => ({ path, module })),
};
