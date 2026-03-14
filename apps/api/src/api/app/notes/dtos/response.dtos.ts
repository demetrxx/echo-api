import {
  NoteEntity,
  NoteItemEntity,
  NoteItemStatus,
  NoteItemType,
} from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

import { FileDto } from '@/api/app/files/dtos';

export class NoteItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NoteItemType })
  type: NoteItemType;

  @ApiProperty()
  value?: string;

  @ApiProperty({ enum: NoteItemStatus })
  status: NoteItemStatus;

  @ApiProperty({ required: false, nullable: true })
  meta: {
    duration?: number;
  } | null;

  @ApiProperty({ required: false, nullable: true })
  fileId: string | null;

  @ApiProperty({ required: false, nullable: true })
  file?: FileDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static mapFromEntity(entity: NoteItemEntity): NoteItemDto {
    return {
      id: entity.id,
      type: entity.type,
      value: entity.value,
      status: entity.status,
      meta: entity.meta,
      fileId: entity.fileId,
      file: entity.file ? FileDto.mapFromEntity(entity.file) : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class NoteDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  name: string | null;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static mapFromEntity(entity: NoteEntity): NoteDto {
    return {
      id: entity.id,
      name: entity.name,
      text: entity.text,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class NoteDetailsDto extends NoteDto {
  @ApiProperty({ type: [NoteItemDto] })
  items: NoteItemDto[];

  static mapFromEntity(
    entity: NoteEntity & { items?: NoteItemEntity[] },
  ): NoteDetailsDto {
    return {
      ...super.mapFromEntity(entity),
      items: (entity.items ?? []).map((item) =>
        NoteItemDto.mapFromEntity(item),
      ),
    };
  }
}
