import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse } from '@/common/utils';
import { Protected, User } from '@/modules/auth';
import { PostService } from '@/modules/post';

import {
  CreatePostRequestDto,
  EditPostTextRequestDto,
  GetPostsQueryParams,
  PostDetailsDto,
  PostDto,
  PostVersionDto,
  RefinePostRequestDto,
  UpdatePostRequestDto,
} from './dtos';
import {
  CreatePostOpenApi,
  EditPostTextOpenApi,
  GetPostOpenApi,
  GetPostsOpenApi,
  GetPostVersionOpenApi,
  GetPostVersionsOpenApi,
  RefinePostOpenApi,
  UpdatePostOpenApi,
} from './posts.openapi';

@ApiTags('App / Posts')
@ApiExtraModels(PaginatedResponse)
@Controller()
@Protected()
export class PostsAppController {
  constructor(private readonly postService: PostService) {}

  @RefinePostOpenApi()
  @Post(':id/refine')
  async refine(
    @Param('id') id: string,
    @Body() body: RefinePostRequestDto,
    @User() user: User,
  ) {
    const post = await this.postService.refine(id, user.id, body);
    return PostDetailsDto.mapFromEntity(post);
  }

  @CreatePostOpenApi()
  @Post()
  async create(@Body() body: CreatePostRequestDto, @User() user: User) {
    const post = await this.postService.create(user.id, body);
    return PostDetailsDto.mapFromEntity(post);
  }

  @GetPostsOpenApi()
  @Get()
  async getMany(
    @User() user: User,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedResponse<PostDto>> {
    const { data, total, skip, take } = await this.postService.getMany(
      user.id,
      query,
    );

    return {
      total,
      data: data.map((i) => PostDto.mapFromEntity(i)),
      skip,
      take,
    };
  }

  @GetPostOpenApi()
  @Get(':id')
  async getOne(@Param('id') id: string, @User() user: User) {
    const post = await this.postService.getOne(id, user.id);
    return PostDetailsDto.mapFromEntity(post);
  }

  @GetPostVersionsOpenApi()
  @Get(':id/versions')
  async getVersions(@Param('id') id: string, @User() user: User) {
    const versions = await this.postService.listVersions(id, user.id);
    return versions.map(PostVersionDto.mapFromEntity);
  }

  @GetPostVersionOpenApi()
  @Get(':id/versions/:versionId')
  async getVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @User() user: User,
  ) {
    const version = await this.postService.getVersion(id, versionId, user.id);
    return PostVersionDto.mapFromEntity(version);
  }

  @UpdatePostOpenApi()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePostRequestDto,
    @User() user: User,
  ) {
    await this.postService.updateOne(id, user.id, body);
    return { success: true };
  }

  @EditPostTextOpenApi()
  @Post(':id/edit-text')
  async editText(
    @Param('id') id: string,
    @Body() body: EditPostTextRequestDto,
    @User() user: User,
  ) {
    await this.postService.editText(id, user.id, body);
    return { success: true };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: User) {
    await this.postService.deleteOne(id, user.id);
    return { success: true };
  }
}
