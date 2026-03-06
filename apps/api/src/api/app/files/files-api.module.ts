import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { FileModule } from '@/modules/file';

import { FilesController } from './files.controller';

@Module({
  imports: [AuthModule, FileModule],
  controllers: [FilesController],
})
export class FilesApiModule {}
