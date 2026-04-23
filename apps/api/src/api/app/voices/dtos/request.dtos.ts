import { PlatformType } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetVoicesQueryParams extends PaginationSortingQuery {}

export class CreateVoiceRequestDto {
  @ApiProperty({ required: false, enum: PlatformType, isArray: true })
  @IsOptional()
  @IsEnum(PlatformType, { each: true })
  platforms: PlatformType[];
}

export class UpdateVoiceRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prompt?: string | null;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString()
  tov?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];

  @ApiProperty({ required: false, enum: PlatformType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(PlatformType, { each: true })
  isDefaultFor?: PlatformType[];
}
