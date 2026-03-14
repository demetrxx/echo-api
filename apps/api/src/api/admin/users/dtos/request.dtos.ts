import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

import { TransformBooleanString } from '@/common/decorators';
import { PaginationSortingQuery } from '@/common/utils';

export class GetUsersQueryParams extends PaginationSortingQuery {
  @ApiProperty({
    description: 'Search query (searches firstName, lastName, email)',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by users with unsettled buyback requests',
    required: false,
  })
  @IsOptional()
  @TransformBooleanString()
  hasUnsettled?: boolean;
}

export class InviteUserRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;
}

// export class UpdateUserRequestDto {
//   @ApiProperty()
//   @IsEnum(UserStatus)
//   @IsOptional()
//   status?: UserStatus;
// }
