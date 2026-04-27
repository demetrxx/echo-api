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
import { VoiceCalibrationService, VoiceService } from '@/modules/voice';

import {
  AddExamplesRequestDto,
  AddFeedbackRequestDto,
  CreateVoiceRequestDto,
  DeleteExamplesRequestDto,
  GetVoicesQueryParams,
  RegenerateCalibrationRequestDto,
  UpdateNoteRequestDto,
  UpdateVoiceRequestDto,
  VoiceCalibrationDto,
  VoiceDetailsDto,
  VoiceDto,
} from './dtos';
import {
  AddExamplesOpenApi,
  AddFeedbackOpenApi,
  CalibrateVoiceOpenApi,
  CreateVoiceOpenApi,
  DeleteExamplesOpenApi,
  DeleteVoiceOpenApi,
  GetCalibrationOpenApi,
  GetVoiceOpenApi,
  GetVoicesOpenApi,
  RegenerateCalibrationOpenApi,
  UpdateNoteOpenApi,
  UpdateVoiceOpenApi,
} from './voices.openapi';

@ApiTags('App / Voices')
@ApiExtraModels(PaginatedResponse)
@Controller()
@Protected()
export class VoicesAppController {
  constructor(
    private readonly voiceService: VoiceService,
    private readonly voiceCalibrationService: VoiceCalibrationService,
  ) {}

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

  @AddExamplesOpenApi()
  @Post(':id/examples')
  async addExamples(
    @Param('id') id: string,
    @Body() body: AddExamplesRequestDto,
    @User() user: User,
  ) {
    await this.voiceService.addExamples(id, user.id, body);
    const voice = await this.voiceService.getOne(id, user.id);
    return VoiceDetailsDto.mapFromEntity(voice);
  }

  @DeleteExamplesOpenApi()
  @Delete(':id/examples')
  async deleteExamples(
    @Param('id') id: string,
    @Body() body: DeleteExamplesRequestDto,
    @User() user: User,
  ) {
    await this.voiceService.deleteExamples(id, user.id, body.exampleIds);
    return { success: true };
  }

  // calibration
  @GetCalibrationOpenApi()
  @Get(':id/calibration')
  async getCalibration(@Param('id') id: string, @User() user: User) {
    const calibration = await this.voiceCalibrationService.getOne(id, user.id);
    return VoiceCalibrationDto.mapFromEntity(calibration);
  }

  @CalibrateVoiceOpenApi()
  @Post(':id/calibration/start')
  async calibrateVoice(@Param('id') id: string, @User() user: User) {
    await this.voiceCalibrationService.start(id, user.id);
    const voice = await this.voiceService.getOne(id, user.id);
    return VoiceDetailsDto.mapFromEntity(voice);
  }

  @AddFeedbackOpenApi()
  @Post(':id/calibration/feedback')
  async addFeedback(
    @Param('id') id: string,
    @User() user: User,
    @Body() body: AddFeedbackRequestDto,
  ) {
    const voice = await this.voiceCalibrationService.addFeedback(
      id,
      user.id,
      body.value,
    );
    return VoiceCalibrationDto.mapFromEntity(voice);
  }

  @RegenerateCalibrationOpenApi()
  @Post(':id/calibration/regenerate')
  async regenerateCalibration(
    @Param('id') id: string,
    @User() user: User,
    @Body() body: RegenerateCalibrationRequestDto,
  ) {
    await this.voiceCalibrationService.calibrate(id, user.id, body.type);
    const calibration = await this.voiceCalibrationService.getOne(id, user.id);
    return VoiceCalibrationDto.mapFromEntity(calibration);
  }

  @UpdateNoteOpenApi()
  @Post(':id/calibration/note')
  async updateNote(
    @Param('id') id: string,
    @User() user: User,
    @Body() body: UpdateNoteRequestDto,
  ) {
    await this.voiceCalibrationService.updateNote(id, user.id, body.note);
    const calibration = await this.voiceCalibrationService.getOne(id, user.id);
    return VoiceCalibrationDto.mapFromEntity(calibration);
  }
}
