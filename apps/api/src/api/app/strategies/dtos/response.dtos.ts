import {
  StrategyCompletenessLevel,
  StrategyConversationEntity,
  StrategyEntity,
  StrategySnapshot,
  StrategyStatus,
} from '@app/db';
import { BaseMessageLike } from '@langchain/core/messages';
import { ApiProperty } from '@nestjs/swagger';

import { ProfileDto } from '@/api/app/profiles';

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
    description: 'Strategy completeness level',
    example: StrategyCompletenessLevel.Minimal,
    enum: StrategyCompletenessLevel,
  })
  completenessLevel: StrategyCompletenessLevel;

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
      status: e.status,
      completenessLevel: e.completenessLevel,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}

export class StrategyConversationDto {
  @ApiProperty({
    description: 'Strategy conversation history',
  })
  history: BaseMessageLike[];

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
    description: 'Strategy profile',
  })
  profile: ProfileDto;

  @ApiProperty({
    description: 'Strategy conversation',
  })
  conversation: StrategyConversationDto;

  static mapFromEntity(e: StrategyEntity): StrategyDetailsDto {
    return {
      ...super.mapFromEntity(e),
      snapshot: e.snapshot,
      profile: e.profile ? ProfileDto.mapFromEntity(e.profile) : null,
      conversation: StrategyConversationDto.mapFromEntity(e.conversation),
    };
  }
}
