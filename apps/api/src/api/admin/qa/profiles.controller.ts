import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse } from '@/common/utils';
import { QaProtected } from '@/modules/qa';
import { QaProfileService } from '@/modules/qa/profiles/qa-profile.service';
import { QaSeedAssistantService } from '@/modules/qa/profiles/qa-seed-assistant.service';

import {
  CreateQaProfileRequestDto,
  GetQaProfilesQueryParams,
  PatchQaProfileRequestDto,
  RematerializeQaProfileRequestDto,
  SeedAssistantMessageRequestDto,
} from './dtos';
import { QaProfileDto, QaProfileListItemDto } from './dtos/response.dtos';
import {
  CreateQaProfileOpenApi,
  GetQaMaterializationOpenApi,
  GetQaProfileOpenApi,
  ListQaProfilesOpenApi,
  MaterializeQaProfileOpenApi,
  PatchQaProfileOpenApi,
  RematerializeQaProfileOpenApi,
  SeedAssistantOpenApi,
} from './qa.openapi';

@ApiTags('Admin / QA')
@ApiExtraModels(PaginatedResponse, QaProfileListItemDto, QaProfileDto)
@Controller('profiles')
@QaProtected()
export class QaProfilesController {
  constructor(
    private readonly profileService: QaProfileService,
    private readonly seedAssistant: QaSeedAssistantService,
  ) {}

  @ListQaProfilesOpenApi()
  @Get()
  async list(@Query() query: GetQaProfilesQueryParams) {
    const { data, total, skip, take } = await this.profileService.getMany(query);

    return {
      total,
      data: data.map((profile) =>
        QaProfileListItemDto.mapFromEntity(
          profile,
          this.profileService.definitionCounts(profile.definition),
        ),
      ),
      skip,
      take,
    };
  }

  @CreateQaProfileOpenApi()
  @Post()
  async create(@Body() body: CreateQaProfileRequestDto) {
    const profile = await this.profileService.create(body);
    return QaProfileDto.mapFromEntity(
      profile,
      this.profileService.definitionCounts(profile.definition),
    );
  }

  @GetQaMaterializationOpenApi()
  @Get(':id/materialization')
  async materialization(@Param('id') id: string) {
    return this.profileService.materialization(id);
  }

  @GetQaProfileOpenApi()
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const profile = await this.profileService.getOne(id);
    return QaProfileDto.mapFromEntity(
      profile,
      this.profileService.definitionCounts(profile.definition),
    );
  }

  @PatchQaProfileOpenApi()
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() body: PatchQaProfileRequestDto) {
    const profile = await this.profileService.patch(id, body);
    return QaProfileDto.mapFromEntity(
      profile,
      this.profileService.definitionCounts(profile.definition),
    );
  }

  @MaterializeQaProfileOpenApi()
  @Post(':id/materialize')
  async materialize(@Param('id') id: string) {
    const profile = await this.profileService.materialize(id);
    return QaProfileDto.mapFromEntity(
      profile,
      this.profileService.definitionCounts(profile.definition),
    );
  }

  @RematerializeQaProfileOpenApi()
  @Post(':id/rematerialize')
  async rematerialize(
    @Param('id') id: string,
    @Body() body: RematerializeQaProfileRequestDto,
  ) {
    const profile = await this.profileService.rematerialize(id, body.confirm);
    return QaProfileDto.mapFromEntity(
      profile,
      this.profileService.definitionCounts(profile.definition),
    );
  }

  @SeedAssistantOpenApi()
  @Post(':id/seed-assistant/messages')
  async sendSeedAssistantMessage(
    @Param('id') id: string,
    @Body() body: SeedAssistantMessageRequestDto,
  ) {
    return this.seedAssistant.propose({
      profileId: id,
      message: body.message,
      selectedPaths: body.selectedPaths,
      currentDraftRevision: body.currentDraftRevision,
    });
  }
}
