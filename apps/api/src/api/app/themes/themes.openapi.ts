import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ThemeDto } from '@/api/app/themes/dtos';
import { ApiPaginatedResponse } from '@/common/utils';

export const GetThemesOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get themes',
      description: 'Retrieve a list of all themes',
    }),
    ApiPaginatedResponse(ThemeDto),
  );
