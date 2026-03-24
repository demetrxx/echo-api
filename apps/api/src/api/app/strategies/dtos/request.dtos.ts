import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetStrategyQueryParams extends PaginationSortingQuery {}

export class UpdateStrategyRequestDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class MessageAgentRequestDto {
  @ApiProperty()
  @IsString()
  message: string;
}
