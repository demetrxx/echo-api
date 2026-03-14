import { FileDir, FileEntity, FileStatus } from '@app/db';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { S3Config } from '@/config';

import { StorageService } from './storage.service';

@Injectable()
export class FileService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    @Inject(S3Config.KEY)
    private readonly config: S3Config,
  ) {}

  async create(params: { mime: string; fileName?: string; folder: FileDir }) {
    const { mime, folder, fileName } = params;

    const fileId = uuid();
    const extension = fileName?.split('.').pop();
    const uniqueFileName = `${fileId}.${extension}`;

    const path = `/${folder}/${uniqueFileName}`;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    return fileRepository.save({
      id: fileId,
      path,
      mime,
      url:
        folder === FileDir.Public
          ? `${this.config.cloudFrontUrl}/${uniqueFileName}`
          : null,
      dir: folder,
      ogName: params.fileName,
      uploadedAt: new Date(),
      status: FileStatus.PENDING,
      name: uniqueFileName,
    });
  }

  async createPresignedPost(params: {
    mime: string;
    fileName?: string;
    folder: FileDir;
  }) {
    const file = await this.create(params);

    const presigned = await this.storageService.signPostUrl(
      file.path,
      file.mime,
    );

    return { presigned, file };
  }

  async markUploaded(params: { fileId: string }) {
    const { fileId } = params;

    await this.dataSource.manager.transaction(async (ds) => {
      const fileRepository = ds.getRepository(FileEntity);

      const file = await fileRepository.findOne({
        where: {
          id: fileId,
        },
      });

      if (!file) {
        throw new BadRequestException('File not found');
      }

      await fileRepository.update(
        { id: fileId },
        { status: FileStatus.UPLOADED },
      );
    });
  }

  async uploadOne(params: {
    folder: FileDir;
    mime: string;
    buffer: Buffer;
    fileName: string;
  }) {
    const { folder, mime, buffer, fileName } = params;

    const extension = fileName.split('.').pop();

    const fileId = uuid();
    const uniqueFileName = `${fileId}.${extension}`;
    const path = `/${folder}/${fileName}`;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    const fileEntity = await fileRepository.save({
      id: fileId,
      path,
      mime,
      dir: folder,
      name: uniqueFileName,
      ogName: fileName,
      status: FileStatus.UPLOADED,
      uploadedAt: new Date(),
    });
    await this.storageService.upload(path, buffer);

    return fileEntity;
  }

  async uploadOneWithStream(params: {
    folder: FileDir;
    file: Buffer;
    fileName: string;
    mime: string;
  }) {
    const { folder, file, fileName, mime } = params;

    const fileId = uuid();

    const path = `/${folder}/${fileId}`;

    const fileRepository = this.dataSource.getRepository(FileEntity);
    const fileEntity = await fileRepository.save({
      id: fileId,
      path,
      mime,
      name: fileName,
      status: FileStatus.UPLOADED,
      uploadedAt: new Date(),
    });
    await this.storageService.upload(path, file);

    return fileEntity;
  }

  async getOne(fileId: string): Promise<FileEntity | null> {
    const fileRepository = this.dataSource.getRepository(FileEntity);

    return fileRepository.findOne({
      where: { id: fileId },
    });
  }

  async getSignedUrl(params: { fileId: string }) {
    const { fileId } = params;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    const file = await fileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new BadRequestException();
    }

    return this.storageService.signGetUrl(file);
  }

  async deleteOne(params: { fileId: string }) {
    const { fileId } = params;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    const file = await fileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new BadRequestException();
    }

    await this.storageService.delete(file.path);
    await fileRepository.delete({ id: file.id });

    return file;
  }

  async getBuffer(path: string): Promise<Buffer> {
    return this.storageService.getBuffer(path);
  }
}
