import {
  PlatformType,
  PostEntity,
  PostStatus,
  PostVersionEntity,
  PostVersionType,
} from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

import { ThemeDto } from '@/api/app/themes';
import { VoiceDto } from '@/api/app/voices';

import { IdeaDto } from '../../ideas/dtos/response.dtos';
import { NoteDto } from '../../notes/dtos/response.dtos';

export class PostVersionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  versionNo: number;

  @ApiProperty()
  type: PostVersionType;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  static mapFromEntity(e: PostVersionEntity): PostVersionDto {
    return {
      id: e.id,
      versionNo: e.versionNo,
      type: e.type,
      text: e.text,
      createdAt: e.createdAt,
    };
  }
}

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

  @ApiProperty({ type: VoiceDto })
  voice: VoiceDto;

  @ApiProperty({
    description: 'Post platform',
    enum: PlatformType,
    example: PlatformType.Telegram,
  })
  platform: PlatformType;

  @ApiProperty({ type: PostVersionDto })
  currentVersion: PostVersionDto;

  @ApiProperty({ type: IdeaDto })
  idea: IdeaDto | null;

  @ApiProperty({
    description: 'Post creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  static mapFromEntity(e: PostEntity, _version?: PostVersionEntity): PostDto {
    return {
      id: e.id,
      title: e.title,
      idea: e.idea ? IdeaDto.mapFromEntity(e.idea) : null,
      theme: e.theme ? ThemeDto.mapFromEntity(e.theme) : null,
      voice: e.voice ? VoiceDto.mapFromEntity(e.voice) : null,
      currentVersion: PostVersionDto.mapFromEntity(e.currentVersion),
      platform: e.platform,
      status: e.status,
      createdAt: e.createdAt,
    };
  }
}

export class PostDetailsDto extends PostDto {
  @ApiProperty({ type: [NoteDto] })
  notes: NoteDto[];

  static mapFromEntity(e: PostEntity): PostDetailsDto {
    return {
      ...super.mapFromEntity(e),
      notes: e.notes.map((note) => NoteDto.mapFromEntity(note.note)),
    };
  }
}
