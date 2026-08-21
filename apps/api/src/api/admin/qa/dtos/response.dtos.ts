import {
  QaIssueEntity,
  QaIssueSeverity,
  QaIssueStatus,
  QaProfileEntity,
  QaProfileSegment,
  QaProfileSource,
  QaProfileStatus,
  QaRunEntity,
} from '@app/db';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { summarizeReviews } from '@/modules/qa/reviews/qa-review.helpers';

export class QaProfileCountsDto {
  @ApiProperty()
  notes: number;

  @ApiProperty()
  themes: number;

  @ApiProperty()
  postSamples: number;
}

export class QaProfileListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: QaProfileSegment })
  segment: QaProfileSegment;

  @ApiProperty({ enum: QaProfileSource })
  source: QaProfileSource;

  @ApiProperty({ enum: QaProfileStatus })
  status: QaProfileStatus;

  @ApiPropertyOptional({ nullable: true })
  sandboxUserId: string | null;

  @ApiProperty({ type: QaProfileCountsDto })
  counts: QaProfileCountsDto;

  @ApiProperty()
  updatedAt: Date;

  static mapFromEntity(
    entity: QaProfileEntity,
    counts: QaProfileCountsDto,
  ): QaProfileListItemDto {
    return {
      id: entity.id,
      name: entity.name,
      segment: entity.segment,
      source: entity.source,
      status: entity.status,
      sandboxUserId: entity.sandboxUserId,
      counts,
      updatedAt: entity.updatedAt,
    };
  }
}

export class QaProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: QaProfileSegment })
  segment: QaProfileSegment;

  @ApiProperty({ enum: QaProfileSource })
  source: QaProfileSource;

  @ApiPropertyOptional({ nullable: true })
  fixtureKey: string | null;

  @ApiProperty({ type: 'object', additionalProperties: true })
  definition: Record<string, unknown>;

  @ApiProperty()
  draftRevision: number;

  @ApiProperty({ enum: QaProfileStatus })
  status: QaProfileStatus;

  @ApiPropertyOptional({ nullable: true })
  sandboxUserId: string | null;

  @ApiPropertyOptional({ nullable: true })
  sourceUserId: string | null;

  @ApiPropertyOptional({ nullable: true })
  materializationError: string | null;

  @ApiPropertyOptional({ nullable: true })
  materializedAt: Date | null;

  @ApiProperty({ type: QaProfileCountsDto })
  counts: QaProfileCountsDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static mapFromEntity(
    entity: QaProfileEntity,
    counts: QaProfileCountsDto,
  ): QaProfileDto {
    return {
      id: entity.id,
      name: entity.name,
      segment: entity.segment,
      source: entity.source,
      fixtureKey: entity.fixtureKey,
      definition: entity.definition as Record<string, unknown>,
      draftRevision: entity.draftRevision,
      status: entity.status,
      sandboxUserId: entity.sandboxUserId,
      sourceUserId: entity.sourceUserId,
      materializationError: entity.materializationError,
      materializedAt: entity.materializedAt,
      counts,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class QaMaterializationDto {
  @ApiProperty({ enum: QaProfileStatus })
  status: QaProfileStatus;

  @ApiPropertyOptional({ nullable: true })
  sandboxUserId: string | null;

  @ApiProperty()
  counts: {
    notes: number;
    themes: number;
    strategies: number;
    voices: number;
    posts: number;
  };

  @ApiPropertyOptional({ nullable: true })
  error: string | null;

  @ApiPropertyOptional({ nullable: true })
  materializedAt: Date | null;
}

export class QaIssueDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty()
  capabilityKey: string;

  @ApiPropertyOptional({ nullable: true })
  stepKey: string | null;

  @ApiProperty({ enum: QaIssueSeverity })
  severity: QaIssueSeverity;

  @ApiProperty({ enum: QaIssueStatus })
  status: QaIssueStatus;

  @ApiPropertyOptional({ nullable: true })
  runId: string | null;

  @ApiPropertyOptional({ nullable: true })
  resolutionRunId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static mapFromEntity(entity: QaIssueEntity): QaIssueDto {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      capabilityKey: entity.capabilityKey,
      stepKey: entity.stepKey,
      severity: entity.severity,
      status: entity.status,
      runId: entity.runId,
      resolutionRunId: entity.resolutionRunId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class QaRunDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  kind: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ nullable: true })
  currentStepKey: string | null;

  @ApiPropertyOptional({ nullable: true })
  profileId: string | null;

  @ApiProperty({ type: 'object', additionalProperties: true })
  resolvedContext: Record<string, unknown>;

  @ApiProperty({ type: 'array' })
  steps: unknown[];

  @ApiProperty({ type: 'array' })
  rubricSnapshot: unknown[];

  @ApiProperty({ type: 'object', additionalProperties: true })
  systemVersionSnapshot: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: true })
  profileSnapshot: Record<string, unknown>;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  summary: Record<string, unknown> | null;

  @ApiProperty({ type: 'array' })
  reviews: unknown[];

  @ApiProperty({ type: [QaIssueDto] })
  issues: QaIssueDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static mapFromEntity(entity: QaRunEntity): QaRunDto {
    return {
      id: entity.id,
      kind: entity.kind,
      status: entity.status,
      currentStepKey: entity.currentStepKey,
      profileId: entity.profileId,
      resolvedContext: entity.resolvedContext,
      steps: entity.steps,
      rubricSnapshot: entity.rubricSnapshot,
      systemVersionSnapshot: entity.systemVersionSnapshot,
      profileSnapshot: entity.profileSnapshot,
      summary: entity.summary,
      reviews: summarizeReviews(entity.reviews),
      issues: (entity.issues ?? []).map(QaIssueDto.mapFromEntity),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
