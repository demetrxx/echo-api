import { PlatformType, ProfileEntity } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({ description: 'Profile identifier', example: 'profile-123' })
  id: string;

  @ApiProperty({ description: 'Profile name', example: 'Default' })
  name: string;

  @ApiProperty({ description: 'Tone of voice', type: [String] })
  tov: string[];

  @ApiProperty({
    description: 'Default platforms',
    enum: PlatformType,
    isArray: true,
  })
  isDefaultFor: PlatformType[];

  @ApiProperty({ description: 'Profile creation date' })
  createdAt: Date;

  static mapFromEntity(e: ProfileEntity): ProfileDto {
    return {
      id: e.id,
      name: e.name,
      tov: e.tov ?? [],
      isDefaultFor: e.isDefaultFor ?? [],
      createdAt: e.createdAt,
    };
  }
}

export class ProfileDetailsDto extends ProfileDto {
  @ApiProperty({ required: false })
  prompt: string | null;

  @ApiProperty({ type: [String] })
  tov: string[];

  @ApiProperty({ type: [String] })
  examples: string[];

  static mapFromEntity(e: ProfileEntity): ProfileDetailsDto {
    return {
      ...ProfileDto.mapFromEntity(e),
      prompt: e.prompt ?? null,
      tov: e.tov ?? [],
      examples: e.examples ?? [],
    };
  }
}
