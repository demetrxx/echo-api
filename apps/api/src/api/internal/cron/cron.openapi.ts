import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const CronOpenApi = applyDecorators(
  ApiOperation({ summary: 'Cron job' }),
  ApiUnauthorizedResponse(),
  ApiHeader({
    name: 'x-internal-secret',
    description: 'Internal secret',
    required: true,
  }),
  ApiOkResponse({ description: 'Cron job executed successfully.' }),
);

export function ExpirePaymentsOpenApi() {
  return applyDecorators(
    ApiOperation({
      summary: 'Expire stale payments',
      description:
        'Marks payments as EXPIRED if they are past their expiry time and in CREATED or PENDING status',
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or missing internal secret',
    }),
    ApiHeader({
      name: 'x-internal-secret',
      description: 'Internal secret for cron authentication',
      required: true,
    }),
    ApiOkResponse({
      description: 'Payments expired successfully',
      schema: {
        type: 'object',
        properties: {
          expiredCount: {
            type: 'number',
            description: 'Number of payments that were expired',
            example: 5,
          },
        },
      },
    }),
  );
}
