import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import {
  GeneratePostStartResponseDto,
  PostContextResponseDto,
  PostDetailsDto,
  PostDto,
  PostVersionDetailsDto,
  PostVersionDto,
} from '@/api/app/posts/dtos';
import { ApiPaginatedResponse } from '@/common/utils';

export const GetPostsOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get posts',
      description: 'Retrieve a list of all posts',
    }),
    ApiPaginatedResponse(PostDto),
  );

export const GetPostOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get post details',
      description: 'Retrieve detailed information about a specific post',
    }),
    ApiOkResponse({
      description: 'Post details retrieved successfully',
      type: PostDetailsDto,
    }),
  );

export const GetPostVersionsOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get post versions',
      description: 'Retrieve all versions of a post',
    }),
    ApiOkResponse({
      description: 'Post versions retrieved successfully',
      type: [PostVersionDto],
    }),
  );

export const GetPostVersionOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get post version',
      description: 'Retrieve a specific post version',
    }),
    ApiOkResponse({
      description: 'Post version retrieved successfully',
      type: PostVersionDetailsDto,
    }),
  );

export const GetPostContextOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get post context',
      description: 'Retrieve context chunks used to generate the post',
    }),
    ApiOkResponse({
      description: 'Post context retrieved successfully',
      type: PostContextResponseDto,
    }),
  );

export const GeneratePostOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Generate post',
      description: 'Start post generation and return a generation id',
    }),
    ApiOkResponse({
      description: 'Post generation started',
      type: GeneratePostStartResponseDto,
    }),
  );

export const GeneratePostStreamOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Stream post generation',
      description: 'Server-sent events stream for post generation',
    }),
  );

export const UpdatePostOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update post',
      description: 'Update post metadata',
    }),
    ApiOkResponse({
      description: 'Post updated successfully',
    }),
  );

export const EditPostTextOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Edit post text',
      description: 'Edit the text of a post',
    }),
    ApiOkResponse({
      description: 'Post text edited successfully',
    }),
  );

export const RegeneratePostOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Regenerate post',
      description: 'Regenerate a post',
    }),
    ApiOkResponse({
      description: 'Post regenerated successfully',
    }),
  );
