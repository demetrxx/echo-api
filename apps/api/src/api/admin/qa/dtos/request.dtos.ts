import {
  QaIssueSeverity,
  QaIssueStatus,
  QaProfileSegment,
  QaProfileSource,
  QaProfileStatus,
  QaRunStatus,
} from '@app/db';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetQaProfilesQueryParams extends PaginationSortingQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: QaProfileSegment })
  @IsOptional()
  @IsEnum(QaProfileSegment)
  segment?: QaProfileSegment;

  @ApiPropertyOptional({ enum: QaProfileSource })
  @IsOptional()
  @IsEnum(QaProfileSource)
  source?: QaProfileSource;

  @ApiPropertyOptional({ enum: QaProfileStatus })
  @IsOptional()
  @IsEnum(QaProfileStatus)
  status?: QaProfileStatus;
}

export class CreateQaProfileRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: QaProfileSegment })
  @IsOptional()
  @IsEnum(QaProfileSegment)
  segment?: QaProfileSegment;

  @ApiProperty({ enum: QaProfileSource })
  @IsEnum(QaProfileSource)
  source: QaProfileSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fixtureKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brief?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  definition?: Record<string, unknown>;
}

export class QaDefinitionChangeDto {
  @ApiProperty({ enum: ['set', 'append', 'replace', 'remove'] })
  @IsEnum(['set', 'append', 'replace', 'remove'])
  operation: 'set' | 'append' | 'replace' | 'remove';

  @ApiProperty()
  @IsString()
  path: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  value?: unknown;
}

export class PatchQaProfileRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: QaProfileSegment })
  @IsOptional()
  @IsEnum(QaProfileSegment)
  segment?: QaProfileSegment;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  definition?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [QaDefinitionChangeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QaDefinitionChangeDto)
  changes?: QaDefinitionChangeDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  draftRevision?: number;

  @ApiPropertyOptional({ enum: QaProfileStatus })
  @IsOptional()
  @IsEnum(QaProfileStatus)
  status?: QaProfileStatus;
}

export class RematerializeQaProfileRequestDto {
  @ApiProperty({ default: true })
  @IsBoolean()
  confirm: boolean;
}

export class SeedAssistantMessageRequestDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedPaths?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  currentDraftRevision?: number;
}

export class PreviewQaContextRequestDto {
  @ApiProperty()
  @IsUUID()
  profileId: string;

  @ApiProperty()
  @IsString()
  capabilityKey: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  input?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  overrides?: Record<string, unknown>;
}

export class CreateQaRunRequestDto {
  @ApiProperty()
  @IsUUID()
  profileId: string;

  @ApiProperty({ enum: ['atomic', 'guided'] })
  @IsEnum(['atomic', 'guided'])
  kind: 'atomic' | 'guided';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  capabilityKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flowKey?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  input?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  initialInput?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  contextPreview?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  systemVersionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  caseId?: string;
}

export class ExecuteQaStepRequestDto {
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  inputOverrides?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contextHash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientRequestId?: string;
}

export class QaSelectionDto {
  @ApiProperty({ enum: ['idea', 'strategy', 'voice', 'post'] })
  @IsEnum(['idea', 'strategy', 'voice', 'post'])
  type: 'idea' | 'strategy' | 'voice' | 'post';

  @ApiProperty()
  @IsUUID()
  id: string;
}

export class SelectQaStepRequestDto {
  @ApiProperty({ type: QaSelectionDto })
  @ValidateNested()
  @Type(() => QaSelectionDto)
  selection: QaSelectionDto;
}

export class CompleteQaRunRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class GetQaRunsQueryParams extends PaginationSortingQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiPropertyOptional({ enum: QaRunStatus })
  @IsOptional()
  @IsEnum(QaRunStatus)
  status?: QaRunStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  capabilityKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flowKey?: string;
}

export class CreateQaAiReviewRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stepKey?: string;
}

export class QaReviewCriterionDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpsertQaHumanReviewRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stepKey?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(10)
  overallScore: number;

  @ApiProperty({ type: [QaReviewCriterionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QaReviewCriterionDto)
  criteria: QaReviewCriterionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class GetQaIssuesQueryParams extends PaginationSortingQuery {
  @ApiPropertyOptional({ enum: QaIssueStatus })
  @IsOptional()
  @IsEnum(QaIssueStatus)
  status?: QaIssueStatus;

  @ApiPropertyOptional({ enum: QaIssueSeverity })
  @IsOptional()
  @IsEnum(QaIssueSeverity)
  severity?: QaIssueSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  capability?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  runId?: string;

  @ApiPropertyOptional({ enum: QaProfileSegment })
  @IsOptional()
  @IsEnum(QaProfileSegment)
  segment?: QaProfileSegment;
}

export class CreateQaIssueRequestDto {
  @ApiProperty()
  @IsUUID()
  runId: string;

  @ApiProperty()
  @IsString()
  stepKey: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: QaIssueSeverity })
  @IsOptional()
  @IsEnum(QaIssueSeverity)
  severity?: QaIssueSeverity;
}

export class PatchQaIssueRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: QaIssueSeverity })
  @IsOptional()
  @IsEnum(QaIssueSeverity)
  severity?: QaIssueSeverity;

  @ApiPropertyOptional({ enum: QaIssueStatus })
  @IsOptional()
  @IsEnum(QaIssueStatus)
  status?: QaIssueStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  resolutionRunId?: string;
}
