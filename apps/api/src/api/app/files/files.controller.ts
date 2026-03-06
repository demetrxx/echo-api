import { S3Folder } from '@app/db';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Protected } from '@/modules/auth';
import { FileService } from '@/modules/file';

import { FileDto, PostFileRequestDto, SignUploadDto } from './dtos';
import {
  GetSignedUrlOpenApi,
  SignUploadOpenApi,
  UploadCompleteOpenApi,
} from './files.openapi';

@ApiTags('Files')
@Protected()
@Controller()
export class FilesController {
  constructor(private readonly fileService: FileService) {}

  @GetSignedUrlOpenApi
  @Get(':fileId/signed-url')
  getSignedUrl(@Param('fileId') fileId: string) {
    return this.fileService.getSignedUrl({ fileId });
  }

  @SignUploadOpenApi
  @Post('upload-url')
  async signUpload(@Body() dto: SignUploadDto) {
    return this.fileService.createPresignedPost({
      mime: dto.mime,
      folder: dto.folder,
      fileName: dto.fileName,
    });
  }

  @UploadCompleteOpenApi
  @Patch(':fileId/mark-uploaded')
  async uploadComplete(@Param('fileId') fileId: string) {
    await this.fileService.markUploaded({ fileId });
    return { success: true };
  }

  // @UploadOpenApi
  // @Post('static')
  async uploadStatic(@Body() body: PostFileRequestDto) {
    if (!body.file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only images are allowed');
    }

    const buffer = await body.file.toBuffer();

    const file = await this.fileService.uploadOne({
      mime: body.file.mimetype,
      fileName: body.file.filename,
      buffer,
      folder: S3Folder.FILES,
    });

    return FileDto.mapFromEntity(file);
  }

  // @UploadOpenApi
  // @Post('files')
  async uploadFiles(@Body() body: PostFileRequestDto) {
    const buffer = await body.file.toBuffer();

    const file = await this.fileService.uploadOne({
      mime: body.file.mimetype,
      fileName: body.file.filename,
      buffer,
      folder: S3Folder.FILES,
    });

    return FileDto.mapFromEntity(file);
  }
}
