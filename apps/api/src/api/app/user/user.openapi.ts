import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { UserDto } from './dtos';

export const GetUserOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user details',
      description: 'Retrieve detailed information about the current user',
    }),
    ApiOkResponse({
      description: 'User details retrieved successfully',
      type: UserDto,
    }),
  );

export const UpdateUserOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update user',
      description: 'Update the current user',
    }),
    ApiOkResponse({
      description: 'User updated successfully',
      type: 'object',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
        },
      },
    }),
  );
