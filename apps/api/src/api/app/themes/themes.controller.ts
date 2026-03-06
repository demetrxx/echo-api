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
import { ThemeService } from '@/modules/theme';

import {
  CreateThemeRequestDto,
  GetThemesQueryParams,
  ThemeDetailsWithRecentPostsDto,
  ThemeDto,
  UpdateThemeRequestDto,
} from './dtos';
import { GetThemesOpenApi } from './themes.openapi';

@ApiTags('App / Themes')
@ApiExtraModels(PaginatedResponse)
@Controller()
@Protected()
export class ThemesAppController {
  constructor(private readonly themeService: ThemeService) {}

  @GetThemesOpenApi()
  @Get()
  async getMany(
    @User() user: User,
    @Query() query: GetThemesQueryParams,
  ): Promise<PaginatedResponse<ThemeDto>> {
    const { data, total, skip, take } = await this.themeService.getMany(
      user.id,
      query,
    );

    return {
      total,
      data: data.map(ThemeDto.mapFromEntity),
      skip,
      take,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @User() user: User) {
    const theme = await this.themeService.getOne(id, user.id);
    return ThemeDetailsWithRecentPostsDto.mapFromEntity(theme);
  }

  @Post()
  async create(@Body() body: CreateThemeRequestDto, @User() user: User) {
    await this.themeService.create(user.id, body);
    return { success: true };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateThemeRequestDto,
    @User() user: User,
  ) {
    await this.themeService.updateOne(id, user.id, body);
    return { success: true };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: User) {
    await this.themeService.deleteOne(id, user.id);
    return { success: true };
  }
}
