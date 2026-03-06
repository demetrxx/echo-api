import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetThemesQueryParams extends PaginationSortingQuery {}

export class CreateThemeRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  defaultAngle: string;
}

export class UpdateThemeRequestDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  defaultAngleId?: string;
}

export class CreateAngleRequestDto {
  @ApiProperty()
  @IsString()
  name: string;
}
