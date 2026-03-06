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
import { ProfileService } from '@/modules/profile';

import {
  CreateProfileRequestDto,
  GetProfilesQueryParams,
  ProfileDetailsDto,
  ProfileDto,
  UpdateProfileRequestDto,
} from './dtos';
import {
  CreateProfileOpenApi,
  DeleteProfileOpenApi,
  GetProfileOpenApi,
  GetProfilesOpenApi,
  UpdateProfileOpenApi,
} from './profiles.openapi';

@ApiTags('App / Profiles')
@ApiExtraModels(PaginatedResponse)
@Controller()
@Protected()
export class ProfilesAppController {
  constructor(private readonly profileService: ProfileService) {}

  @GetProfilesOpenApi()
  @Get()
  async getMany(
    @Query() query: GetProfilesQueryParams,
    @User() user: User,
  ): Promise<PaginatedResponse<ProfileDto>> {
    const { data, total, skip, take } = await this.profileService.getMany(
      user.id,
      query,
    );

    return {
      total,
      data: data.map(ProfileDto.mapFromEntity),
      skip,
      take,
    };
  }

  @GetProfileOpenApi()
  @Get(':id')
  async getOne(@Param('id') id: string, @User() user: User) {
    const profile = await this.profileService.getOne(id, user.id);
    return ProfileDetailsDto.mapFromEntity(profile);
  }

  @CreateProfileOpenApi()
  @Post()
  async create(@Body() body: CreateProfileRequestDto, @User() user: User) {
    const profile = await this.profileService.create(user.id, body);
    return ProfileDetailsDto.mapFromEntity(profile);
  }

  @UpdateProfileOpenApi()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProfileRequestDto,
    @User() user: User,
  ) {
    await this.profileService.updateOne(id, user.id, body);
    const profile = await this.profileService.getOne(id, user.id);
    return ProfileDetailsDto.mapFromEntity(profile);
  }

  @DeleteProfileOpenApi()
  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: User) {
    await this.profileService.deleteOne(id, user.id);
    return { success: true };
  }
}
