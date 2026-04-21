import {
  ChatMessage,
  PlatformType,
  StrategyConversationEntity,
  StrategyEntity,
  StrategySnapshot,
  StrategyStage,
  StrategyStatus,
} from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

import { ThemeDto } from '@/api/app/themes';
import { VoiceDto } from '@/api/app/voices';

export class StrategyDto {
  @ApiProperty({
    description: 'Strategy identifier',
    example: 'strategy-123',
  })
  id: string;

  @ApiProperty({
    description: 'Strategy name',
    example: 'My strategy',
  })
  name: string;

  @ApiProperty({
    description: 'Strategy status',
    example: StrategyStatus.Draft,
    enum: StrategyStatus,
  })
  status: StrategyStatus;

  @ApiProperty({
    description: 'Strategy voice',
  })
  voice: VoiceDto;

  @ApiProperty({
    description: 'Strategy themes',
  })
  themes: ThemeDto[];

  @ApiProperty({
    description: 'Strategy goals',
  })
  goals: string[];

  @ApiProperty({
    description: 'Strategy problems',
  })
  problems: string[];

  @ApiProperty({
    description: 'Strategy channels',
  })
  platforms: PlatformType[];

  @ApiProperty({
    description: 'Strategy audience',
  })
  audience: string;

  @ApiProperty({
    description: 'Strategy stage',
    enum: StrategyStage,
    example: StrategyStage.Diagnose,
  })
  stage: StrategyStage;

  @ApiProperty({
    description: 'Strategy creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Strategy last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  static mapFromEntity(e: StrategyEntity): StrategyDto {
    return {
      id: e.id,
      name: e.name,
      stage: e.stage,
      status: e.status,
      platforms: e.snapshot.platforms,
      goals: e.snapshot.goals,
      problems: e.snapshot.problems,
      audience: e.snapshot.audience,
      themes: e.themes.map((theme) => ThemeDto.mapFromEntity(theme.theme)),
      voice: e.voice ? VoiceDto.mapFromEntity(e.voice) : null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}

export class StrategyConversationDto {
  @ApiProperty({
    description: 'Strategy conversation history',
  })
  history: ChatMessage[];

  static mapFromEntity(e: StrategyConversationEntity): StrategyConversationDto {
    return {
      history: e.history,
    };
  }
}

export class StrategyDetailsDto extends StrategyDto {
  @ApiProperty({
    description: 'Strategy snapshot',
  })
  snapshot: StrategySnapshot;

  @ApiProperty({
    description: 'Strategy conversation',
  })
  conversation: StrategyConversationDto;

  static mapFromEntity(e: StrategyEntity): StrategyDetailsDto {
    return {
      ...super.mapFromEntity(e),
      snapshot: e.snapshot,
      conversation: StrategyConversationDto.mapFromEntity(e.conversation),
    };
  }
}
