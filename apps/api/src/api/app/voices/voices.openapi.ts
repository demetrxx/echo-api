import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@/common/utils';

import { VoiceCalibrationDto, VoiceDetailsDto, VoiceDto } from './dtos';

export const GetVoicesOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get voices',
      description: 'Retrieve a list of all voices',
    }),
    ApiPaginatedResponse(VoiceDto),
  );

export const GetVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get voice details',
      description: 'Retrieve detailed information about a specific voice',
    }),
    ApiOkResponse({
      description: 'Voice details retrieved successfully',
      type: VoiceDetailsDto,
    }),
  );

export const CreateVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create voice',
      description: 'Create a new voice',
    }),
    ApiOkResponse({
      description: 'Voice created successfully',
      type: VoiceDetailsDto,
    }),
  );

export const UpdateVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update voice',
      description: 'Update an existing voice',
    }),
    ApiOkResponse({
      description: 'Voice updated successfully',
      type: VoiceDetailsDto,
    }),
  );

export const DeleteVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete voice',
      description: 'Delete an existing voice',
    }),
    ApiOkResponse({
      description: 'Voice deleted successfully',
    }),
  );

export const AddExamplesOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Add examples to voice',
      description: 'Add examples to an existing voice',
    }),
    ApiOkResponse({
      description: 'Examples added successfully',
    }),
  );

export const DeleteExamplesOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete examples from voice',
      description: 'Delete examples from an existing voice',
    }),
    ApiOkResponse({
      description: 'Examples deleted successfully',
    }),
  );

export const GetCalibrationOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get voice calibration',
      description: 'Get the calibration for a specific voice',
    }),
    ApiOkResponse({
      description: 'Voice calibration retrieved successfully',
      type: VoiceCalibrationDto,
    }),
  );

export const CalibrateVoiceOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Calibrate voice',
      description: 'Calibrate an existing voice',
    }),
    ApiOkResponse({
      description: 'Voice calibrated successfully',
      type: VoiceDetailsDto,
    }),
  );

export const AddFeedbackOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Add feedback to voice calibration',
      description: 'Add feedback to the voice calibration',
    }),
    ApiOkResponse({
      description: 'Feedback added successfully',
      type: VoiceCalibrationDto,
    }),
  );

export const RegenerateCalibrationOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Regenerate voice calibration',
      description: 'Regenerate the voice calibration',
    }),
    ApiOkResponse({
      description: 'Voice calibration regenerated successfully',
      type: VoiceCalibrationDto,
    }),
  );

export const UpdateNoteOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update voice calibration note',
      description: 'Update the voice calibration note',
    }),
    ApiOkResponse({
      description: 'Voice calibration note updated successfully',
      type: VoiceCalibrationDto,
    }),
  );
