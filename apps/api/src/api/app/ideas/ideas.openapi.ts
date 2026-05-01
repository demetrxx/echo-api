import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { IdeaDto } from '@/api/app/ideas/dtos';
import { ApiPaginatedResponse } from '@/common/utils';

export const GetIdeasOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get ideas',
      description: 'Retrieve a paginated list of ideas',
    }),
    ApiPaginatedResponse(IdeaDto),
  );

export const SuggestIdeasOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Suggest ideas',
      description: 'Suggest ideas from the provided context',
    }),
    ApiOkResponse({
      description: 'Ideas suggested successfully',
      type: [IdeaDto],
    }),
  );

export const UpdateIdeaOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update idea',
      description: 'Update an idea',
    }),
    ApiOkResponse({
      description: 'Idea updated successfully',
      type: IdeaDto,
    }),
  );
