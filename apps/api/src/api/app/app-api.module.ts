import { Module } from '@nestjs/common';

import { FilesApiModule } from './files';
import { IdeasApiModule } from './ideas';
import { NotesApiModule } from './notes';
import { PostsApiModule } from './posts';
import { ServicesApiModule } from './services';
import { StrategiesApiModule } from './strategies';
import { ThemesApiModule } from './themes';
import { UserApiModule } from './user';
import { VoicesApiModule } from './voices';

@Module({
  imports: [
    FilesApiModule,
    IdeasApiModule,
    NotesApiModule,
    UserApiModule,
    PostsApiModule,
    VoicesApiModule,
    ThemesApiModule,
    StrategiesApiModule,
    ServicesApiModule,
  ],
  providers: [],
  controllers: [],
})
export class AppApiModule {}
