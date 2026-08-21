import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { AppError } from '@/common/errors/app-error';
import { PaginatedResponse } from '@/common/utils';
import { User } from '@/modules/auth';
import { QaProtected } from '@/modules/qa';
import { QaRunService } from '@/modules/qa/execution/qa-run.service';
import { QaReviewService } from '@/modules/qa/reviews/qa-review.service';

import {
  CompleteQaRunRequestDto,
  CreateQaAiReviewRequestDto,
  CreateQaRunRequestDto,
  ExecuteQaStepRequestDto,
  GetQaRunsQueryParams,
  SelectQaStepRequestDto,
  UpsertQaHumanReviewRequestDto,
} from './dtos';
import { QaRunDto } from './dtos/response.dtos';
import {
  CancelQaRunOpenApi,
  CompleteQaRunOpenApi,
  ContinueQaRunOpenApi,
  CreateQaAiReviewOpenApi,
  CreateQaRunOpenApi,
  ExecuteQaStepOpenApi,
  GetQaRunOpenApi,
  ListQaRunsOpenApi,
  RetryQaStepOpenApi,
  SelectQaStepOpenApi,
  SkipQaStepOpenApi,
  UpsertQaHumanReviewOpenApi,
} from './qa.openapi';

@ApiTags('Admin / QA')
@ApiExtraModels(PaginatedResponse, QaRunDto)
@Controller('runs')
@QaProtected()
export class QaRunsController {
  constructor(
    private readonly runService: QaRunService,
    private readonly reviewService: QaReviewService,
  ) {}

  @ListQaRunsOpenApi()
  @Get()
  async list(@Query() query: GetQaRunsQueryParams) {
    const { data, total, skip, take } = await this.runService.getMany(query);

    return {
      total,
      data: data.map(QaRunDto.mapFromEntity),
      skip,
      take,
    };
  }

  @CreateQaRunOpenApi()
  @Post()
  async create(@Body() body: CreateQaRunRequestDto, @User() user: User) {
    if (body.kind === 'guided') {
      if (!body.flowKey) {
        throw new AppError(
          'QA_CAPABILITY_UNKNOWN',
          'flowKey is required for guided runs',
        );
      }

      const run = await this.runService.createGuided(user.id, {
        profileId: body.profileId,
        flowKey: body.flowKey,
        initialInput: body.initialInput ?? body.input,
        systemVersionId: body.systemVersionId,
        caseId: body.caseId,
      });
      return QaRunDto.mapFromEntity(run);
    }

    if (!body.capabilityKey) {
      throw new AppError(
        'QA_CAPABILITY_UNKNOWN',
        'capabilityKey is required for atomic runs',
      );
    }

    const run = await this.runService.createAtomic(user.id, {
      profileId: body.profileId,
      capabilityKey: body.capabilityKey,
      input: body.input,
      contextPreview: body.contextPreview,
      systemVersionId: body.systemVersionId,
      caseId: body.caseId,
    });

    return QaRunDto.mapFromEntity(run);
  }

  @GetQaRunOpenApi()
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return QaRunDto.mapFromEntity(await this.runService.getOne(id));
  }

  @ExecuteQaStepOpenApi()
  @Post(':id/steps/current/execute')
  async execute(
    @Param('id') id: string,
    @Body() body: ExecuteQaStepRequestDto,
  ) {
    const run = await this.runService.executeCurrent(id, body ?? {});
    return QaRunDto.mapFromEntity(run);
  }

  @RetryQaStepOpenApi()
  @Post(':id/steps/current/retry')
  async retry(@Param('id') id: string) {
    return QaRunDto.mapFromEntity(await this.runService.retryCurrent(id));
  }

  @SelectQaStepOpenApi()
  @Post(':id/steps/current/select')
  async select(@Param('id') id: string, @Body() body: SelectQaStepRequestDto) {
    return QaRunDto.mapFromEntity(
      await this.runService.selectCurrent(id, body.selection),
    );
  }

  @SkipQaStepOpenApi()
  @Post(':id/steps/current/skip')
  async skip(@Param('id') id: string) {
    return QaRunDto.mapFromEntity(await this.runService.skipCurrent(id));
  }

  @ContinueQaRunOpenApi()
  @Post(':id/continue')
  async continueRun(@Param('id') id: string) {
    return QaRunDto.mapFromEntity(await this.runService.continueRun(id));
  }

  @CompleteQaRunOpenApi()
  @Post(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body() body: CompleteQaRunRequestDto,
  ) {
    return QaRunDto.mapFromEntity(await this.runService.complete(id, body.reason));
  }

  @CancelQaRunOpenApi()
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return QaRunDto.mapFromEntity(await this.runService.cancel(id));
  }

  @CreateQaAiReviewOpenApi()
  @Post(':id/reviews/ai')
  async createAiReview(
    @Param('id') id: string,
    @Body() body: CreateQaAiReviewRequestDto,
  ) {
    return this.reviewService.createAiReview(id, body?.stepKey);
  }

  @UpsertQaHumanReviewOpenApi()
  @Put(':id/reviews/human')
  async upsertHumanReview(
    @Param('id') id: string,
    @Body() body: UpsertQaHumanReviewRequestDto,
    @User() user: User,
  ) {
    return this.reviewService.upsertHumanReview(id, user.id, body);
  }
}
