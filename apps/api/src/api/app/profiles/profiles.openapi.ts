import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@/common/utils';

import { ProfileDetailsDto, ProfileDto } from './dtos';

export const GetProfilesOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get profiles',
      description: 'Retrieve a list of all profiles',
    }),
    ApiPaginatedResponse(ProfileDto),
  );

export const GetProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get profile details',
      description: 'Retrieve detailed information about a specific profile',
    }),
    ApiOkResponse({
      description: 'Profile details retrieved successfully',
      type: ProfileDetailsDto,
    }),
  );

export const CreateProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create profile',
      description: 'Create a new profile',
    }),
    ApiOkResponse({
      description: 'Profile created successfully',
      type: ProfileDetailsDto,
    }),
  );

export const UpdateProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update profile',
      description: 'Update an existing profile',
    }),
    ApiOkResponse({
      description: 'Profile updated successfully',
      type: ProfileDetailsDto,
    }),
  );

export const DeleteProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete profile',
      description: 'Delete an existing profile',
    }),
    ApiOkResponse({
      description: 'Profile deleted successfully',
    }),
  );
