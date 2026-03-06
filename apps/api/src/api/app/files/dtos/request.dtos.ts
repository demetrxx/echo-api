import { S3Folder } from '@app/db';
import { MultipartFile } from '@fastify/multipart';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsString } from 'class-validator';

import { MimeType } from '@/common/consts';

export class PostFileRequestDto {
  @ApiProperty({
    type: String,
    format: 'binary',
  })
  @IsObject()
  file: MultipartFile;
}

export class SignUploadDto {
  @ApiProperty()
  @IsEnum(MimeType)
  mime: MimeType;

  @ApiProperty()
  @IsString()
  fileName?: string;

  @ApiProperty()
  @IsEnum(S3Folder)
  folder: S3Folder;
}
