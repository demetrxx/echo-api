import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse } from '@/common/utils';
import { Protected, User } from '@/modules/auth';
import { IdeaService } from '@/modules/idea';

import {
  GetIdeasQueryParams,
  IdeaDto,
  SuggestIdeasRequestDto,
  UpdateIdeaRequestDto,
} from './dtos';
import {
  GetIdeasOpenApi,
  SuggestIdeasOpenApi,
  UpdateIdeaOpenApi,
} from './ideas.openapi';

@ApiTags('App / Ideas')
@ApiExtraModels(PaginatedResponse)
@Controller()
@Protected()
export class IdeasAppController {
  constructor(private readonly ideaService: IdeaService) {}

  @GetIdeasOpenApi()
  @Get()
  async getMany(
    @User() user: User,
    @Query() query: GetIdeasQueryParams,
  ): Promise<PaginatedResponse<IdeaDto>> {
    const { data, total, skip, take } = await this.ideaService.getMany(
      user.id,
      query,
    );

    return {
      total,
      data: data.map(IdeaDto.mapFromEntity),
      skip,
      take,
    };
  }

  @SuggestIdeasOpenApi()
  @Post()
  async suggest(@Body() body: SuggestIdeasRequestDto, @User() user: User) {
    const { count, ...dto } = body;
    const ideas = await this.ideaService.suggest(user.id, dto, count);

    return ideas.map(IdeaDto.mapFromEntity);
  }

  @UpdateIdeaOpenApi()
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateIdeaRequestDto,
    @User() user: User,
  ) {
    const idea = await this.ideaService.updateOne(id, user.id, body);
    return IdeaDto.mapFromEntity(idea);
  }
}
