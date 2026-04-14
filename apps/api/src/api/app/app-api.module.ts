import { Module } from '@nestjs/common';

import { FilesApiModule } from './files';
import { IdeasApiModule } from './ideas';
import { NotesApiModule } from './notes';
import { PostsApiModule } from './posts';
import { ProfilesApiModule } from './profiles';
import { StrategiesApiModule } from './strategies';
import { ThemesApiModule } from './themes';
import { UserApiModule } from './user';

@Module({
  imports: [
    FilesApiModule,
    IdeasApiModule,
    NotesApiModule,
    UserApiModule,
    PostsApiModule,
    ProfilesApiModule,
    ThemesApiModule,
    StrategiesApiModule,
  ],
  providers: [],
  controllers: [],
})
export class AppApiModule {}
