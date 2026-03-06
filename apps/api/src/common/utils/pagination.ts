import { Type } from '@nestjs/common';
import { ApiProperty, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { Type as TransformType } from 'class-transformer';
import { IsEnum, IsNumber, Max } from 'class-validator';

export class SortingQuery {
  @ApiProperty({ default: 'ASC', required: false, enum: ['ASC', 'DESC'] })
  @IsEnum(['ASC', 'DESC'])
  @TransformType(() => String)
  order: 'ASC' | 'DESC' = 'ASC';
}

export class ListQuery extends SortingQuery {
  @ApiProperty({ default: 10, required: false })
  @IsNumber()
  @Max(1000)
  @TransformType(() => Number)
  take: number = 10;

  @ApiProperty({ default: 0, required: false })
  @IsNumber()
  @TransformType(() => Number)
  skip: number = 0;
}

export class PaginationSortingQuery {
  @ApiProperty({
    default: 'createdAt',
    required: false,
    enum: ['createdAt', 'updatedAt'],
  })
  @IsEnum(['createdAt', 'updatedAt'])
  @TransformType(() => String)
  orderBy: 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiProperty({ default: 'DESC', required: false, enum: ['ASC', 'DESC'] })
  @IsEnum(['ASC', 'DESC'])
  @TransformType(() => String)
  order: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({ default: 10, required: false })
  @IsNumber()
  @Max(1000)
  @TransformType(() => Number)
  take: number = 10;

  @ApiProperty({ default: 0, required: false })
  @IsNumber()
  @TransformType(() => Number)
  skip: number = 0;
}

export class PaginatedResponse<T> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  data: T[];

  @ApiProperty()
  skip: number;

  @ApiProperty()
  take: number;
}

export const ApiPaginatedResponse = (type: Type) =>
  ApiResponse({
    status: '2XX',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponse) },
        {
          properties: {
            total: {
              type: 'number',
            },
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(type) },
            },
            skip: {
              type: 'number',
            },
            take: {
              type: 'number',
            },
          },
        },
      ],
    },
  });
