import { PlatformType, PostStatus } from '@app/db';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetPostsQueryParams extends PaginationSortingQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  themeId?: string;

  @ApiProperty({ required: false, enum: PostStatus })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({ required: false, enum: PlatformType })
  @IsOptional()
  @IsEnum(PlatformType)
  platform?: PlatformType;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  profileId?: string;
}

export class CreatePostRequestDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  themeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ideaId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional()
  @IsUUID('4', { each: true })
  @IsOptional()
  noteIds?: string[];
}

export class UpdatePostRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, enum: PostStatus })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  currentVersionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  themeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PlatformType)
  platform?: PlatformType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  @IsOptional()
  noteIds?: string[];
}

export class EditPostTextRequestDto {
  @ApiProperty()
  @IsString()
  text: string;
}
