import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@/common/utils';

import { UserDto } from './dtos';

export const GetAllUsersOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all users',
      description: 'Retrieve a list of all users',
    }),
    ApiResponse({
      status: 200,
      description: 'Users retrieved successfully',
      type: [UserDto],
    }),
    ApiPaginatedResponse(UserDto),
  );

export const GetOneUserOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user details',
      description: 'Retrieve detailed information about a specific user',
    }),
    ApiResponse({
      status: 200,
      description: 'User details retrieved successfully',
      type: UserDto,
    }),
  );

export const InviteUserOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Invite user',
      description: 'Invite a new user to the platform',
    }),
    ApiResponse({
      status: 200,
      description: 'User invited successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          tempPassword: { type: 'string', example: 'temp123' },
        },
      },
    }),
  );

export const UpdateUserOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update user',
      description: 'Update an existing user',
    }),
    ApiResponse({
      status: 200,
      description: 'User updated successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
        },
      },
    }),
  );
