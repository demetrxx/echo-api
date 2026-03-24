import {
  PlatformType,
  PostEntity,
  PostStatus,
  PostType,
  PostVersionAction,
  PostVersionEntity,
} from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

import { ProfileDto } from '@/api/app/profiles';
import { ThemeDto } from '@/api/app/themes';

export class PostDto {
  @ApiProperty({
    description: 'Post identifier',
    example: 'post-123',
  })
  id: string;

  @ApiProperty({
    description: 'Post title',
    example: 'My first post',
  })
  title: string;

  @ApiProperty({
    description: 'Post status',
    enum: PostStatus,
    example: PostStatus.Draft,
  })
  status: PostStatus;

  @ApiProperty({ type: ThemeDto })
  theme: ThemeDto;

  @ApiProperty({ type: ProfileDto })
  profile: ProfileDto;

  @ApiProperty({
    description: 'Post platform',
    enum: PlatformType,
    example: PlatformType.Telegram,
  })
  platform: PlatformType;

  @ApiProperty({
    description: 'Post creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  static mapFromEntity(e: PostEntity, _version?: PostVersionEntity): PostDto {
    return {
      id: e.id,
      title: e.title,
      theme: e.theme ? ThemeDto.mapFromEntity(e.theme) : null,
      profile: e.profile ? ProfileDto.mapFromEntity(e.profile) : null,
      platform: e.platform,
      status: e.status,
      createdAt: e.createdAt,
    };
  }
}

export class PostVersionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  versionNo: number;

  @ApiProperty()
  action: PostVersionAction;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  static mapFromEntity(e: PostVersionEntity): PostVersionDto {
    return {
      id: e.id,
      versionNo: e.versionNo,
      action: e.action,
      text: e.text,
      createdAt: e.createdAt,
    };
  }
}

export class PostVersionDetailsDto extends PostVersionDto {
  @ApiProperty({ required: false })
  intent: string | null;

  static mapFromEntity(e: PostVersionEntity): PostVersionDetailsDto {
    return {
      ...PostVersionDto.mapFromEntity(e),
      intent: e.intent ?? null,
    };
  }
}

export class PostDetailsDto extends PostDto {
  @ApiProperty({ enum: PostType })
  postType: PostType;

  @ApiProperty({ enum: PlatformType })
  platform: PlatformType;

  @ApiProperty()
  themeId: string;

  @ApiProperty({ required: false })
  generationId: string | null;

  @ApiProperty({ required: false })
  finalVersionId: string | null;

  @ApiProperty({ type: PostVersionDto })
  currentVersion: PostVersionDto;

  static mapFromEntity(
    e: PostEntity,
    version: PostVersionEntity,
  ): PostDetailsDto {
    return {
      ...super.mapFromEntity(e),
      postType: e.postType,
      platform: e.platform,
      themeId: e.themeId,
      generationId: e.generationId ?? null,
      finalVersionId: e.finalVersionId ?? null,
      currentVersion: PostVersionDto.mapFromEntity(version),
    };
  }
}

export class PostGeneratingDto extends PostDto {
  @ApiProperty({ enum: PostType })
  postType: PostType;

  @ApiProperty({ enum: PlatformType })
  platform: PlatformType;

  @ApiProperty()
  themeId: string;

  @ApiProperty({ required: false })
  finalVersionId: string | null;

  static mapFromEntity(e: PostEntity): PostGeneratingDto {
    return {
      ...super.mapFromEntity(e),
      postType: e.postType,
      platform: e.platform,
      themeId: e.themeId,
      finalVersionId: e.finalVersionId ?? null,
    };
  }
}

export class PostContextChunkDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idx: number;

  @ApiProperty()
  text: string;

  @ApiProperty({ required: false })
  headingPath: string | null;

  @ApiProperty()
  documentId: string;

  @ApiProperty({ required: false })
  documentTitle: string | null;
}

export class PostContextSnippetDto {
  @ApiProperty({ enum: ['bullets', 'excerpt'] })
  mode: 'bullets' | 'excerpt';

  @ApiProperty({ required: false, nullable: true })
  excerpt?: string | null;

  @ApiProperty({ type: [String] })
  bullets: string[];

  @ApiProperty({ required: false, nullable: true })
  quote: string | null;
}

export class PostContextDto {
  @ApiProperty()
  chunks: { id: string; text: string }[];

  @ApiProperty()
  spanId: string;

  @ApiProperty({ required: false, nullable: true })
  snippet?: PostContextSnippetDto | null;
}

export class PostContextResponseDto {
  @ApiProperty({ type: PostDetailsDto })
  post: PostDetailsDto;

  @ApiProperty({ type: [PostContextDto] })
  contexts: PostContextDto[];
}

export class GeneratePostResponseDto {
  @ApiProperty({ type: PostDetailsDto })
  post: PostDetailsDto;
}

export class GeneratePostStartResponseDto {
  @ApiProperty()
  generationId: string;

  @ApiProperty()
  postId: string;
}
