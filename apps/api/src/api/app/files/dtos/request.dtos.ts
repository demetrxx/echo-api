import { FileDir } from '@app/db';
import { MultipartFile } from '@fastify/multipart';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsString } from 'class-validator';

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
  @IsString()
  mime: string;

  @ApiProperty()
  @IsString()
  fileName?: string;

  @ApiProperty()
  @IsEnum(FileDir)
  folder: FileDir;
}
