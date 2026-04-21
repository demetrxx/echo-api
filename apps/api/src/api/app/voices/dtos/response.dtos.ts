import { VoiceEntity } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class VoiceDto {
  @ApiProperty({ description: 'Voice identifier', example: 'voice-123' })
  id: string;

  @ApiProperty({ description: 'Voice name', example: 'Default' })
  name: string;

  @ApiProperty({ description: 'Tone of voice', type: [String] })
  tov: string;

  @ApiProperty({ description: 'Voice creation date' })
  createdAt: Date;

  static mapFromEntity(e: VoiceEntity): VoiceDto {
    return {
      id: e.id,
      name: e.name,
      tov: e.tov ?? '',
      createdAt: e.createdAt,
    };
  }
}

export class VoiceDetailsDto extends VoiceDto {
  @ApiProperty({ type: [String] })
  examples: string[];

  static mapFromEntity(e: VoiceEntity): VoiceDetailsDto {
    return {
      ...VoiceDto.mapFromEntity(e),
      examples: e.examples ?? [],
    };
  }
}
