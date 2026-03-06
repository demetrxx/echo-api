import { PlatformType, PostStatus, PostType } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ required: false, enum: PostType })
  @IsOptional()
  @IsEnum(PostType)
  postType?: PostType;

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

export class GeneratePostRequestDto {
  @ApiProperty()
  @IsUUID()
  themeId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  angleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiProperty({ enum: PlatformType })
  @IsEnum(PlatformType)
  platform: PlatformType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  intent?: string;
}

export class UpdatePostRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, enum: PostStatus })
  @IsOptional()
  @IsEnum([PostStatus.Draft, PostStatus.Final, PostStatus.Archived])
  status?: PostStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  currentVersionId?: string;
}

export class GetPostContextQueryParams {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  versionId?: string;
}

export class EditPostTextRequestDto {
  @ApiProperty()
  @IsString()
  text: string;
}
