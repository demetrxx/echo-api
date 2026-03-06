import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';

export enum FileStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
}

export enum S3Folder {
  FILES = 'files',
}

@Entity('file', {
  comment: 'File stored in S3',
})
export class FileEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.UPLOADED,
    comment: 'Whether the file is pending upload or already uploaded',
  })
  status: FileStatus;

  @Column({
    type: 'varchar',
    comment: 'Path in S3 "<dirName>/<fileId>", e.g. /files/1234567890',
  })
  path: string;

  @Column({
    type: 'varchar',
    comment: 'Public URL of the file',
    nullable: true,
  })
  url: string | null;

  @Column({
    type: 'varchar',
    comment: 'Original file name',
  })
  name: string;

  @Column({
    type: 'varchar',
    comment: 'MIME type of the file',
  })
  mime: string;

  @Column({
    type: 'enum',
    enum: S3Folder,
    comment: 'Directory in S3 where the file is stored',
  })
  dir: S3Folder;
}
