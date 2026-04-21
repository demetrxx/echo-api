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
import { VoiceService } from '@/modules/voice';

import {
  CreateVoiceRequestDto,
  GetVoicesQueryParams,
  UpdateVoiceRequestDto,
  VoiceDetailsDto,
  VoiceDto,
} from './dtos';
import {
  CreateVoiceOpenApi,
  DeleteVoiceOpenApi,
  GetVoiceOpenApi,
  GetVoicesOpenApi,
  UpdateVoiceOpenApi,
} from './voices.openapi';

@ApiTags('App / Voices')
@ApiExtraModels(PaginatedResponse)
@Controller()
@Protected()
export class VoicesAppController {
  constructor(private readonly voiceService: VoiceService) {}

  @GetVoicesOpenApi()
  @Get()
  async getMany(
    @Query() query: GetVoicesQueryParams,
    @User() user: User,
  ): Promise<PaginatedResponse<VoiceDto>> {
    const { data, total, skip, take } = await this.voiceService.getMany(
      user.id,
      query,
    );

    return {
      total,
      data: data.map(VoiceDto.mapFromEntity),
      skip,
      take,
    };
  }

  @GetVoiceOpenApi()
  @Get(':id')
  async getOne(@Param('id') id: string, @User() user: User) {
    const voice = await this.voiceService.getOne(id, user.id);
    return VoiceDetailsDto.mapFromEntity(voice);
  }

  @CreateVoiceOpenApi()
  @Post()
  async create(@Body() body: CreateVoiceRequestDto, @User() user: User) {
    const voice = await this.voiceService.create(user.id, body);
    return VoiceDetailsDto.mapFromEntity(voice);
  }

  @UpdateVoiceOpenApi()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateVoiceRequestDto,
    @User() user: User,
  ) {
    await this.voiceService.updateOne(id, user.id, body);
    const voice = await this.voiceService.getOne(id, user.id);
    return VoiceDetailsDto.mapFromEntity(voice);
  }

  @DeleteVoiceOpenApi()
  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: User) {
    await this.voiceService.deleteOne(id, user.id);
    return { success: true };
  }
}
