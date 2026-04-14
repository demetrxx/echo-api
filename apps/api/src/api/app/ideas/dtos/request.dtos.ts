import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetIdeasQueryParams extends PaginationSortingQuery {}

export class SuggestIdeasRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  themeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notesBased?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  forNoteId?: string;

  @ApiProperty({ required: false, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  count: number = 5;
}
