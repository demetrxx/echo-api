import {
  PlatformType,
  VoiceCalibrationEntity,
  VoiceCalibrationStep,
  VoiceCalibrationType,
  VoiceData,
  VoiceEntity,
  VoiceExampleEntity,
  VoiceStatus,
} from '@app/db';
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

  @ApiProperty({ description: 'Tone of voice' })
  data: VoiceData;

  @ApiProperty({ description: 'Examples count', example: 10 })
  examplesCount: number;

  @ApiProperty({ description: 'Voice status', example: VoiceStatus.Created })
  status: VoiceStatus;

  @ApiProperty({ description: 'Voice creation date' })
  updatedAt: Date;

  static mapFromEntity(e: VoiceEntity & { examplesCount?: number }): VoiceDto {
    return {
      id: e.id,
      name: e.name,
      status: e.status,
      platforms: e.platforms,
      examplesCount: e.examplesCount,
      data: e.data,
      updatedAt: e.createdAt,
    };
  }
}

export class VoiceExampleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  static mapFromEntity(e: VoiceExampleEntity): VoiceExampleDto {
    return {
      id: e.id,
      text: e.text,
      createdAt: e.createdAt,
    };
  }
}

export class VoiceDetailsDto extends VoiceDto {
  @ApiProperty({ description: 'Examples', type: [VoiceExampleDto] })
  examples: VoiceExampleDto[];

  static mapFromEntity(e: VoiceEntity): VoiceDetailsDto {
    return {
      ...VoiceDto.mapFromEntity(e),
      examples: e.examples.map((example) =>
        VoiceExampleDto.mapFromEntity(example),
      ),
    };
  }
}

export class VoiceCalibrationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  step: VoiceCalibrationStep;

  @ApiProperty()
  voice: VoiceDetailsDto;

  @ApiProperty()
  updatedAt: Date;

  static mapFromEntity(e: VoiceCalibrationEntity): VoiceCalibrationDto {
    return {
      id: e.id,
      voice: VoiceDetailsDto.mapFromEntity(e.voice),
      step: e.data.steps[e.data.steps.length - 1],
      updatedAt: e.updatedAt,
    };
  }
}

export class RegenerateCalibrationRequestDto {
  @ApiProperty({
    description: 'Calibration type',
    enum: VoiceCalibrationType,
    enumName: 'voice_calibration_type_enum',
  })
  type: VoiceCalibrationType;
}
