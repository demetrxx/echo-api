import {
  QaIssueEntity,
  QaIssueSeverity,
  QaIssueStatus,
  QaProfileSegment,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AppError } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { QaRunService } from '../execution/qa-run.service';

@Injectable()
export class QaIssueService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly runService: QaRunService,
  ) {}

  async getMany(
    query: PaginationSortingQuery & {
      status?: QaIssueStatus;
      severity?: QaIssueSeverity;
      capability?: string;
      runId?: string;
      segment?: QaProfileSegment;
    },
  ) {
    const qb = this.dataSource
      .getRepository(QaIssueEntity)
      .createQueryBuilder('issue')
      .orderBy(`issue.${query.orderBy}`, query.order)
      .skip(query.skip)
      .take(query.take);

    if (query.status) {
      qb.andWhere('issue.status = :status', { status: query.status });
    }
    if (query.severity) {
      qb.andWhere('issue.severity = :severity', { severity: query.severity });
    }
    if (query.capability) {
      qb.andWhere('issue.capabilityKey = :capability', {
        capability: query.capability,
      });
    }
    if (query.runId) {
      qb.andWhere('issue.runId = :runId', { runId: query.runId });
    }
    if (query.segment) {
      qb.innerJoin('issue.run', 'run')
        .innerJoin('run.profile', 'profile')
        .andWhere('profile.segment = :segment', { segment: query.segment });
    }

    const [data, total] = await qb.getManyAndCount();
    return {
      total,
      data,
      skip: query.skip,
      take: query.take,
    };
  }

  async getOne(id: string) {
    const issue = await this.dataSource.getRepository(QaIssueEntity).findOne({
      where: { id },
    });
    if (!issue) {
      throw new AppError('NOT_FOUND', 'QA issue not found', { id });
    }
    return issue;
  }

  async create(
    operatorUserId: string,
    dto: {
      runId: string;
      stepKey: string;
      title: string;
      description?: string;
      severity?: QaIssueSeverity;
    },
  ) {
    const run = await this.runService.getOne(dto.runId);
    const step = run.steps.find((item) => item.key === dto.stepKey);
    if (!step) {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'stepKey must exist on the run',
        { stepKey: dto.stepKey },
      );
    }

    return this.dataSource.getRepository(QaIssueEntity).save({
      title: dto.title,
      description: dto.description ?? null,
      capabilityKey: step.capabilityKey,
      stepKey: step.key,
      severity: dto.severity ?? QaIssueSeverity.Major,
      status: QaIssueStatus.Open,
      runId: run.id,
      createdByUserId: operatorUserId,
    });
  }

  async patch(
    id: string,
    dto: {
      title?: string;
      description?: string;
      severity?: QaIssueSeverity;
      status?: QaIssueStatus;
      resolutionRunId?: string | null;
    },
  ) {
    const issue = await this.getOne(id);

    if (dto.title !== undefined) {
      issue.title = dto.title;
    }
    if (dto.description !== undefined) {
      issue.description = dto.description;
    }
    if (dto.severity !== undefined) {
      issue.severity = dto.severity;
    }
    if (dto.status !== undefined) {
      issue.status = dto.status;
    }
    if (dto.resolutionRunId !== undefined) {
      if (dto.resolutionRunId) {
        await this.runService.getOne(dto.resolutionRunId);
      }
      issue.resolutionRunId = dto.resolutionRunId;
    }

    return this.dataSource.getRepository(QaIssueEntity).save(issue);
  }
}
