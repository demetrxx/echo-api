import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@/common/utils';

import { QaIssueDto, QaProfileDto, QaProfileListItemDto, QaRunDto } from './dtos';

export const ListQaProfilesOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'List QA profiles' }),
    ApiPaginatedResponse(QaProfileListItemDto),
  );

export const CreateQaProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a QA profile or import a fixture' }),
    ApiOkResponse({ type: QaProfileDto }),
  );

export const GetQaProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a QA profile' }),
    ApiOkResponse({ type: QaProfileDto }),
  );

export const PatchQaProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Patch a QA profile draft',
      description: 'Does not rematerialize the sandbox.',
    }),
    ApiOkResponse({ type: QaProfileDto }),
  );

export const MaterializeQaProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Materialize a QA profile into a sandbox user' }),
    ApiOkResponse({ type: QaProfileDto }),
  );

export const GetQaMaterializationOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get QA profile materialization status' }),
  );

export const RematerializeQaProfileOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Replace the current sandbox from the current definition',
    }),
    ApiOkResponse({ type: QaProfileDto }),
  );

export const SeedAssistantOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Propose Seed Assistant changes',
      description: 'Does not write the profile. Apply via PATCH with draftRevision.',
    }),
  );

export const ListQaCapabilitiesOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'List QA capabilities and deferred flows' }),
  );

export const PreviewQaContextOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Preview capability context',
      description: 'Resolves smart defaults without writing to the database.',
    }),
  );

export const ListQaRunsOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'List QA runs' }),
    ApiPaginatedResponse(QaRunDto),
  );

export const CreateQaRunOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create an atomic or guided QA run' }),
    ApiOkResponse({ type: QaRunDto }),
  );

export const GetQaRunOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a QA run' }),
    ApiOkResponse({ type: QaRunDto }),
  );

export const ExecuteQaStepOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Execute the current pending QA step' }),
    ApiOkResponse({ type: QaRunDto }),
  );

export const RetryQaStepOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new attempt for the current QA step' }),
    ApiOkResponse({ type: QaRunDto }),
  );

export const SelectQaStepOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Select an output artifact from the current step' }),
    ApiOkResponse({ type: QaRunDto }),
  );

export const ContinueQaRunOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Prepare the next guided step without executing it',
    }),
    ApiOkResponse({ type: QaRunDto }),
  );

export const SkipQaStepOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Skip the current optional guided step' }),
    ApiOkResponse({ type: QaRunDto }),
  );

export const CreateQaAiReviewOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create an AI review for a completed QA step' }),
  );

export const UpsertQaHumanReviewOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create or update the human review for a step' }),
  );

export const ListQaIssuesOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'List QA issues' }),
    ApiPaginatedResponse(QaIssueDto),
  );

export const CreateQaIssueOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a QA issue from a run step' }),
    ApiOkResponse({ type: QaIssueDto }),
  );

export const PatchQaIssueOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a QA issue' }),
    ApiOkResponse({ type: QaIssueDto }),
  );

export const CompleteQaRunOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Complete a QA run' }),
    ApiOkResponse({ type: QaRunDto }),
  );

export const CancelQaRunOpenApi = () =>
  applyDecorators(
    ApiOperation({ summary: 'Cancel a QA run' }),
    ApiOkResponse({ type: QaRunDto }),
  );
