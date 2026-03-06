import { FileEntity, FileStatus } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty({
    description: 'File identifier',
    example: 'file-123',
  })
  id: string;

  @ApiProperty({
    description: 'File path',
    example: '/files/file-123',
  })
  path: string;

  @ApiProperty({
    description: 'File MIME type',
    example: 'text/csv',
  })
  mime: string;

  @ApiProperty({
    description: 'File status',
    enum: FileStatus,
    example: FileStatus.UPLOADED,
  })
  status: FileStatus;

  @ApiProperty({
    description: 'File name',
    example: 'document.csv',
  })
  name: string;

  @ApiProperty({
    description: 'File created date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  static mapFromEntity(entity: FileEntity): FileDto {
    return {
      id: entity.id,
      path: entity.path,
      mime: entity.mime,
      status: entity.status,
      name: entity.name,
      createdAt: entity.createdAt,
    };
  }
}
