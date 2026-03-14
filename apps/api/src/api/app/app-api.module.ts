import { Module } from '@nestjs/common';

import { FilesApiModule } from './files';
import { NotesApiModule } from './notes';
import { PostsApiModule } from './posts';
import { ProfilesApiModule } from './profiles';
import { ThemesApiModule } from './themes';
import { UserApiModule } from './user';

@Module({
  imports: [
    FilesApiModule,
    NotesApiModule,
    UserApiModule,
    PostsApiModule,
    ProfilesApiModule,
    ThemesApiModule,
  ],
  providers: [],
  controllers: [],
})
export class AppApiModule {}
