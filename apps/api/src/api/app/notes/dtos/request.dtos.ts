import { NoteItemType } from '@app/db/entities';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetNotesQueryParams extends PaginationSortingQuery {}

export class CreateNoteRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsString()
  text: string;
}

export class UpdateNoteRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  text?: string;
}

class NoteItemMetaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  duration?: number;
}

export class CreateNoteItemRequestDto {
  @ApiProperty({ enum: NoteItemType })
  @IsEnum(NoteItemType)
  type: NoteItemType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  fileId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => NoteItemMetaDto)
  meta?: NoteItemMetaDto;
}

export class UpdateNoteItemRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  value?: string;
}
