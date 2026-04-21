import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@/common/utils';

import { VoiceDetailsDto, VoiceDto } from './dtos';

export const GetVoicesOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get voices',
      description: 'Retrieve a list of all voices',
    }),
    ApiPaginatedResponse(VoiceDto),
  );

export const GetVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get voice details',
      description: 'Retrieve detailed information about a specific voice',
    }),
    ApiOkResponse({
      description: 'Voice details retrieved successfully',
      type: VoiceDetailsDto,
    }),
  );

export const CreateVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create voice',
      description: 'Create a new voice',
    }),
    ApiOkResponse({
      description: 'Voice created successfully',
      type: VoiceDetailsDto,
    }),
  );

export const UpdateVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update voice',
      description: 'Update an existing voice',
    }),
    ApiOkResponse({
      description: 'Voice updated successfully',
      type: VoiceDetailsDto,
    }),
  );

export const DeleteVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete voice',
      description: 'Delete an existing voice',
    }),
    ApiOkResponse({
      description: 'Voice deleted successfully',
    }),
  );
