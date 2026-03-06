import { Readable } from 'node:stream';

import { FileEntity } from '@app/db';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  createPresignedPost,
  PresignedPostOptions,
} from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';

import { S3Config } from '../../../config';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    @Inject(S3Config.KEY)
    private readonly config: S3Config,
  ) {
    this.s3 = new S3Client({
      region: config.region,
      forcePathStyle: true, // required for MinIO
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
    this.bucket = this.config.bucket;
  }

  static getFileKey(path: string): string {
    return path[0] === '/' ? path.substring(1) : path;
  }

  async upload(path: string, file: Buffer) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: StorageService.getFileKey(path),
        Body: file,
      }),
    );
  }

  async get(path: string) {
    const { Body } = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: StorageService.getFileKey(path),
      }),
    );

    return Body as Readable;
  }

  async getBuffer(path: string): Promise<Buffer> {
    const stream = await this.get(path);
    return this.streamToBuffer(stream);
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async signGetUrl(
    file: FileEntity,
    options?: Omit<GetObjectCommandInput, 'Key' | 'Bucket'>,
  ) {
    const fileName = file.name;

    return getSignedUrl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.s3,
      new GetObjectCommand({
        ...options,
        Bucket: this.bucket,
        Key: StorageService.getFileKey(file.path),
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      }),
      { expiresIn: 60 * 15 },
    );
  }

  async signPostUrl(path: string, mime: string) {
    const params: PresignedPostOptions = {
      Bucket: this.bucket,
      Key: StorageService.getFileKey(path),
      Conditions: [
        [
          'content-length-range',
          0,
          1024 * 1024 * 1024, // 1GB
        ],
        ['eq', '$Content-Type', mime],
      ],
      Fields: {
        'Content-Type': mime,
      },
      Expires: 60 * 15,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return createPresignedPost(this.s3, params);
  }

  async delete(path: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: StorageService.getFileKey(path),
      }),
    );
  }
}
