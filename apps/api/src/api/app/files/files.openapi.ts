import { applyDecorators } from '@nestjs/common';
import { ApiConsumes, ApiOkResponse } from '@nestjs/swagger';

import { FileDto } from './dtos';

export const GetSignedUrlOpenApi = applyDecorators(
  ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
        },
      },
    },
  }),
);

export const UploadOpenApi = applyDecorators(
  ApiConsumes('multipart/form-data'),
  ApiOkResponse({
    type: FileDto,
  }),
);

export const SignUploadOpenApi = applyDecorators(
  ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        presigned: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
            },
            fields: {
              type: 'object',
            },
          },
        },
        file: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
  }),
);

export const UploadCompleteOpenApi = applyDecorators(
  ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
      },
    },
  }),
);
