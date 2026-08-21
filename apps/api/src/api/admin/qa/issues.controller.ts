import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse } from '@/common/utils';
import { User } from '@/modules/auth';
import { QaProtected } from '@/modules/qa';
import { QaIssueService } from '@/modules/qa/issues/qa-issue.service';

import {
  CreateQaIssueRequestDto,
  GetQaIssuesQueryParams,
  PatchQaIssueRequestDto,
} from './dtos';
import { QaIssueDto } from './dtos/response.dtos';
import {
  CreateQaIssueOpenApi,
  ListQaIssuesOpenApi,
  PatchQaIssueOpenApi,
} from './qa.openapi';

@ApiTags('Admin / QA')
@ApiExtraModels(PaginatedResponse, QaIssueDto)
@Controller('issues')
@QaProtected()
export class QaIssuesController {
  constructor(private readonly issueService: QaIssueService) {}

  @ListQaIssuesOpenApi()
  @Get()
  async list(@Query() query: GetQaIssuesQueryParams) {
    const { data, total, skip, take } = await this.issueService.getMany(query);
    return {
      total,
      data: data.map(QaIssueDto.mapFromEntity),
      skip,
      take,
    };
  }

  @CreateQaIssueOpenApi()
  @Post()
  async create(@Body() body: CreateQaIssueRequestDto, @User() user: User) {
    return QaIssueDto.mapFromEntity(
      await this.issueService.create(user.id, body),
    );
  }

  @PatchQaIssueOpenApi()
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() body: PatchQaIssueRequestDto) {
    return QaIssueDto.mapFromEntity(await this.issueService.patch(id, body));
  }
}
