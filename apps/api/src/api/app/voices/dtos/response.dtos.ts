import { PlatformType, VoiceEntity, VoiceExampleEntity } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class VoiceDto {
  @ApiProperty({ description: 'Voice identifier', example: 'voice-123' })
  id: string;

  @ApiProperty({ description: 'Voice name', example: 'Default' })
  name: string;

  @ApiProperty({
    description: 'Platforms',
    type: [PlatformType],
    enum: PlatformType,
    enumName: 'platform_type_enum',
  })
  platforms: PlatformType[];

  @ApiProperty({ description: 'Tone of voice', type: [String] })
  tov: string;

  @ApiProperty({ description: 'Examples count', example: 10 })
  examplesCount: number;

  @ApiProperty({ description: 'Voice creation date' })
  createdAt: Date;

  static mapFromEntity(e: VoiceEntity & { examplesCount?: number }): VoiceDto {
    return {
      id: e.id,
      name: e.name,
      platforms: e.platforms,
      examplesCount: e.examplesCount,
      tov: e.tov ?? '',
      createdAt: e.createdAt,
    };
  }
}

export class VoiceExampleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  platform: PlatformType;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  static mapFromEntity(e: VoiceExampleEntity): VoiceExampleDto {
    return {
      id: e.id,
      platform: e.platform,
      text: e.text,
      createdAt: e.createdAt,
    };
  }
}

export class VoiceDetailsDto extends VoiceDto {
  @ApiProperty({ description: 'Rules', type: [String] })
  rules: string[];

  @ApiProperty({ description: 'Avoid rules', type: [String] })
  avoidRules: string[];

  @ApiProperty({ description: 'Evidence preferences', type: String })
  evidencePreferences: string;

  @ApiProperty({ description: 'Examples', type: [VoiceExampleDto] })
  examples: VoiceExampleDto[];

  static mapFromEntity(e: VoiceEntity): VoiceDetailsDto {
    return {
      ...VoiceDto.mapFromEntity(e),
      examples: e.examples.map((example) =>
        VoiceExampleDto.mapFromEntity(example),
      ),
      rules: e.rules ?? [],
      avoidRules: e.avoidRules ?? [],
      evidencePreferences: e.evidencePreferences ?? '',
    };
  }
}
