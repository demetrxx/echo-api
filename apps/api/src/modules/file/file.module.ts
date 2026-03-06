import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { S3Config } from '../../config';
import { FileService, StorageService } from './services';

@Module({
  imports: [ConfigModule.forFeature(S3Config)],
  controllers: [],
  providers: [FileService, StorageService],
  exports: [FileService, StorageService],
})
export class FileModule {}
