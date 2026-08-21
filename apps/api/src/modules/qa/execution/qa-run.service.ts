import { randomUUID } from 'node:crypto';

import {
  QaContextPolicy,
  QaProfileEntity,
  QaRunEntity,
  QaRunKind,
  QaRunStatus,
  QaRunStepAttempt,
  QaRunStepData,
  QaSystemVersionEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere } from 'typeorm';

import { AppError } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { captureCurrentSystemSnapshot } from '../lib/system-snapshot';
import {
  assertRunTransition,
  assertStepTransition,
  QaRunAction,
  QaRunStatusValue,
  QaStepStatusValue,
} from '../types';
import { QaCapabilityRegistry } from './qa-capability.registry';
import { QaContextService } from './qa-context.service';
import { QaExecutorService } from './qa-executor.service';
import {
  loadActiveStrategy,
  loadSandboxIdea,
  loadSandboxPost,
  loadSandboxVoice,
} from './qa-context.helpers';
import {
  buildFlowMapContext,
  QaFlowRegistry,
} from './qa-flow.registry';
import {
  artifactsForType,
  asIdList,
  latestAttempt,
  QaSelectionType,
  runFlowKey,
  runInitialInput,
} from './qa-flow.types';

interface CreateAtomicRunDto {
  profileId: string;
  capabilityKey: string;
  input?: Record<string, unknown>;
  contextPreview?: Record<string, unknown>;
  systemVersionId?: string | null;
  caseId?: string | null;
}

interface CreateGuidedRunDto {
  profileId: string;
  flowKey: string;
  initialInput?: Record<string, unknown>;
  systemVersionId?: string | null;
  caseId?: string | null;
}

@Injectable()
export class QaRunService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly registry: QaCapabilityRegistry,
    private readonly flowRegistry: QaFlowRegistry,
    private readonly contextService: QaContextService,
    private readonly executor: QaExecutorService,
  ) {}

  async createAtomic(operatorUserId: string, dto: CreateAtomicRunDto) {
    const capability = this.registry.get(dto.capabilityKey);
    const preview = await this.previewOrThrow(dto.profileId, dto.capabilityKey, {
      ...(dto.input ?? {}),
      ...((dto.contextPreview as { input?: Record<string, unknown> } | undefined)
        ?.input ?? {}),
    });

    this.assertContextHash(dto.contextPreview, preview.contextHash);

    const { profile, systemVersion } = await this.loadCreateDeps(dto);
    const stepKey = capability.key.replace('.', '_');
    const step: QaRunStepData = {
      key: stepKey,
      order: 0,
      capabilityKey: capability.key,
      status: 'pending',
      attempts: [],
      selectedAttemptId: null,
      operatorSelection: null,
      nextActions: ['execute', 'cancel'],
    };

    const run = await this.dataSource.getRepository(QaRunEntity).save({
      kind: QaRunKind.Atomic,
      status: QaRunStatus.Ready,
      currentStepKey: stepKey,
      contextPolicy: QaContextPolicy.ProductDefaults,
      profileId: dto.profileId,
      caseId: dto.caseId ?? null,
      systemVersionId: systemVersion?.id ?? null,
      operatorUserId,
      profileSnapshot: this.profileSnapshot(profile),
      systemVersionSnapshot: captureCurrentSystemSnapshot(),
      rubricSnapshot: capability.defaultRubric,
      resolvedContext: preview,
      steps: [step],
    });

    return this.getOne(run.id);
  }

  async createGuided(operatorUserId: string, dto: CreateGuidedRunDto) {
    const flow = this.flowRegistry.get(dto.flowKey);
    const initialInput = dto.initialInput ?? {};
    const { profile, systemVersion } = await this.loadCreateDeps(dto);

    const steps: QaRunStepData[] = flow.steps.map((definition, order) => ({
      key: definition.key,
      order,
      capabilityKey: definition.capabilityKey,
      status: 'pending',
      attempts: [],
      selectedAttemptId: null,
      operatorSelection: null,
      nextActions: [],
    }));

    for (const definition of flow.steps) {
      if (definition.autoSkip?.(initialInput)) {
        const step = steps.find((item) => item.key === definition.key);
        if (step && step.status === 'pending') {
          this.transitionStep(step, 'skipped');
        }
      }
    }

    const current = steps.find((item) => item.status === 'pending');
    if (!current) {
      throw new AppError(
        'QA_RUN_STATE_INVALID',
        'Flow has no executable steps after auto-skip',
      );
    }

    const definition = flow.steps.find((item) => item.key === current.key);
    if (!definition) {
      throw new AppError('QA_STEP_STATE_INVALID', 'Flow step definition missing');
    }
    const mapped = definition.mapInput(
      buildFlowMapContext({
        steps,
        currentKey: current.key,
        initialInput,
      }),
    );
    const preview = await this.previewOrThrow(
      dto.profileId,
      current.capabilityKey,
      mapped,
    );

    const run = await this.dataSource.getRepository(QaRunEntity).save({
      kind: QaRunKind.Guided,
      status: QaRunStatus.Ready,
      currentStepKey: current.key,
      contextPolicy: QaContextPolicy.ProductDefaults,
      profileId: dto.profileId,
      caseId: dto.caseId ?? null,
      systemVersionId: systemVersion?.id ?? null,
      operatorUserId,
      profileSnapshot: this.profileSnapshot(profile),
      systemVersionSnapshot: captureCurrentSystemSnapshot(),
      rubricSnapshot: flow.steps.map((item) => ({
        stepKey: item.key,
        capabilityKey: item.capabilityKey,
        rubric: this.registry.get(item.capabilityKey).defaultRubric,
      })),
      resolvedContext: preview,
      summary: { flowKey: flow.key, initialInput },
      steps,
    });

    return this.getOne(run.id);
  }

  async getMany(
    query: PaginationSortingQuery & {
      profileId?: string;
      status?: QaRunStatus;
      capabilityKey?: string;
      flowKey?: string;
    },
  ) {
    const where: FindOptionsWhere<QaRunEntity> = {};
    if (query.profileId) {
      where.profileId = query.profileId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const qb = this.dataSource
      .getRepository(QaRunEntity)
      .createQueryBuilder('run')
      .where(where)
      .orderBy(`run.${query.orderBy}`, query.order)
      .skip(query.skip)
      .take(query.take);

    if (query.capabilityKey) {
      qb.andWhere(`run.steps @> :step`, {
        step: JSON.stringify([{ capabilityKey: query.capabilityKey }]),
      });
    }

    if (query.flowKey) {
      qb.andWhere(`run.summary ->> 'flowKey' = :flowKey`, {
        flowKey: query.flowKey,
      });
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
    const run = await this.dataSource.getRepository(QaRunEntity).findOne({
      where: { id },
      relations: ['reviews', 'issues'],
    });

    if (!run) {
      throw new AppError('NOT_FOUND', 'QA run not found', { id });
    }

    return this.withNextActions(run);
  }

  async executeCurrent(
    runId: string,
    dto: { inputOverrides?: Record<string, unknown>; contextHash?: string },
  ) {
    const run = await this.getOne(runId);
    const step = this.currentStep(run);

    this.assertRunStatus(run, ['ready', 'paused', 'failed']);
    if (step.status !== 'pending') {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Current step is not pending. Retry to create a new attempt.',
        { status: step.status },
      );
    }

    const baseInput = {
      ...((run.resolvedContext as { input?: Record<string, unknown> })?.input ??
        {}),
      ...(dto.inputOverrides ?? {}),
    };
    const preview = await this.previewOrThrow(
      run.profileId,
      step.capabilityKey,
      baseInput,
    );
    const annotated = this.annotateFromRun(run, preview);

    if (dto.contextHash && dto.contextHash !== annotated.contextHash) {
      throw new AppError(
        'QA_CONTEXT_INVALID',
        'Context hash is stale; preview context again',
        {
          expected: dto.contextHash,
          actual: annotated.contextHash,
        },
      );
    }

    const sandboxUserId = annotated.sandboxUserId;
    if (!run.profileId) {
      throw new AppError(
        'QA_PROFILE_NOT_READY',
        'Run is not attached to a profile',
      );
    }
    await this.contextService.getSandboxUser(sandboxUserId);

    const attempt: QaRunStepAttempt = {
      id: randomUUID(),
      input: annotated.input,
      resolvedContext: annotated,
      output: null,
      artifacts: {},
      error: null,
      durationMs: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    step.attempts.push(attempt);
    step.selectedAttemptId = attempt.id;
    this.transitionRun(run, 'running');
    this.transitionStep(step, 'running');
    run.resolvedContext = annotated;
    run.startedAt = run.startedAt ?? new Date();
    await this.save(run);

    const started = Date.now();
    try {
      const result = await this.executor.execute({
        sandboxUserId,
        capabilityKey: step.capabilityKey,
        input: annotated.input,
      });

      attempt.output = result.output;
      attempt.artifacts = result.artifacts;
      attempt.durationMs = Date.now() - started;
      attempt.completedAt = new Date().toISOString();
      this.transitionStep(step, 'completed');
      this.transitionRun(run, 'paused');
    } catch (error) {
      const appError = this.executor.toExecutionError(error);
      attempt.error = {
        code: appError.code,
        message: appError.message,
        details: appError.details,
      };
      attempt.durationMs = Date.now() - started;
      attempt.completedAt = new Date().toISOString();
      this.transitionStep(step, 'failed');
      this.transitionRun(run, 'failed');
    }

    return this.save(run);
  }

  async retryCurrent(runId: string) {
    const run = await this.getOne(runId);
    const step = this.currentStep(run);

    this.assertRunStatus(run, ['paused', 'failed']);
    if (step.status !== 'completed' && step.status !== 'failed') {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Only completed or failed steps can be retried',
        { status: step.status },
      );
    }

    this.transitionStep(step, 'pending');
    this.transitionRun(run, 'ready');
    return this.save(run);
  }

  async selectCurrent(
    runId: string,
    selection: { type: QaSelectionType; id: string },
  ) {
    const run = await this.getOne(runId);
    const step = this.currentStep(run);
    this.assertRunStatus(run, ['paused']);
    if (step.status !== 'completed') {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Selection is only allowed on a completed step',
      );
    }

    const flow = this.guidedFlow(run);
    const definition = flow?.steps.find((item) => item.key === step.key);
    const expectedType = definition?.requiresSelection;
    if (!expectedType) {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Current step does not accept an output selection',
      );
    }
    if (expectedType !== selection.type) {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        `Expected selection type ${expectedType}`,
        { expectedType, received: selection.type },
      );
    }

    const attempt = latestAttempt(step);
    const allowed = artifactsForType(attempt?.artifacts ?? {}, selection.type);
    if (!allowed.includes(selection.id)) {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Selection must be an artifact of the current step',
        { id: selection.id, allowed },
      );
    }

    const sandboxUserId = (run.profileSnapshot as { sandboxUserId?: string })
      .sandboxUserId;
    if (!sandboxUserId) {
      throw new AppError('QA_SANDBOX_REQUIRED', 'Run has no sandbox user');
    }
    await this.assertSelectionOwned(sandboxUserId, selection);

    step.operatorSelection = selection;
    return this.save(run);
  }

  async continueRun(runId: string) {
    const run = await this.getOne(runId);
    this.assertRunStatus(run, ['paused']);
    const step = this.currentStep(run);
    if (step.status !== 'completed') {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Cannot continue from a step that is not completed',
        { status: step.status },
      );
    }

    const flow = this.requireGuidedFlow(run);
    const definition = flow.steps.find((item) => item.key === step.key);
    if (definition?.requiresSelection && !step.operatorSelection) {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Select an output before continuing',
      );
    }

    const next = this.nextExecutableStep(run, step);
    if (!next) {
      throw new AppError(
        'QA_RUN_STATE_INVALID',
        'There is no next step to continue to',
      );
    }

    await this.prepareStep(run, next);
    run.currentStepKey = next.key;
    this.transitionRun(run, 'ready');
    return this.save(run);
  }

  async skipCurrent(runId: string) {
    const run = await this.getOne(runId);
    const step = this.currentStep(run);
    this.assertRunStatus(run, ['ready', 'paused']);
    if (step.status !== 'pending') {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Only a pending step can be skipped',
      );
    }

    const flow = this.requireGuidedFlow(run);
    const definition = flow.steps.find((item) => item.key === step.key);
    if (!definition?.optional) {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Current step is not optional',
      );
    }

    this.transitionStep(step, 'skipped');
    const next = this.nextExecutableStep(run, step);
    if (next) {
      await this.prepareStep(run, next);
      run.currentStepKey = next.key;
    }
    return this.save(run);
  }

  async complete(runId: string, reason?: string) {
    const run = await this.getOne(runId);
    this.assertRunStatus(run, ['paused', 'failed', 'ready']);
    this.transitionRun(run, 'completed');
    run.completedAt = new Date();
    run.summary = {
      ...(run.summary ?? {}),
      reason: reason ?? 'completed_flow',
    };
    return this.save(run);
  }

  async cancel(runId: string) {
    const run = await this.getOne(runId);
    this.assertRunStatus(run, ['draft', 'ready', 'running', 'paused', 'failed']);
    const step = this.currentStep(run);
    if (step.status === 'pending' || step.status === 'running') {
      if (step.status === 'running') {
        this.transitionStep(step, 'failed');
      } else {
        this.transitionStep(step, 'skipped');
      }
    }
    this.transitionRun(run, 'cancelled');
    run.completedAt = new Date();
    return this.save(run);
  }

  private async prepareStep(run: QaRunEntity, step: QaRunStepData) {
    const flow = this.requireGuidedFlow(run);
    const definition = flow.steps.find((item) => item.key === step.key);
    if (!definition) {
      throw new AppError('QA_STEP_STATE_INVALID', 'Flow step definition missing');
    }
    const mapped = definition.mapInput(
      buildFlowMapContext({
        steps: run.steps,
        currentKey: step.key,
        initialInput: runInitialInput(run),
      }),
    );
    const preview = await this.previewOrThrow(
      run.profileId,
      step.capabilityKey,
      { ...definition.defaultInput, ...mapped },
    );
    run.resolvedContext = this.annotateFromRun(run, preview);
  }

  private annotateFromRun(
    run: QaRunEntity,
    preview: Awaited<ReturnType<QaContextService['preview']>>,
  ) {
    const priorIds = run.steps.flatMap((step) => {
      const artifacts = latestAttempt(step)?.artifacts ?? {};
      const selected = (step.operatorSelection as { id?: string } | null)?.id;
      return [
        ...asIdList(artifacts.ideaIds),
        ...asIdList(artifacts.ideaId),
        ...asIdList(artifacts.postId),
        ...asIdList(artifacts.strategyId),
        ...asIdList(artifacts.voiceId),
        ...asIdList(artifacts.createdVoiceId),
        ...(selected ? [selected] : []),
      ];
    });
    return this.contextService.annotatePriorStep(preview, priorIds);
  }

  private nextExecutableStep(run: QaRunEntity, current: QaRunStepData) {
    return run.steps
      .filter((item) => item.order > current.order)
      .find((item) => item.status === 'pending');
  }

  private guidedFlow(run: QaRunEntity) {
    if (run.kind !== QaRunKind.Guided) {
      return null;
    }
    const key = runFlowKey(run);
    return key ? this.flowRegistry.get(key) : null;
  }

  private requireGuidedFlow(run: QaRunEntity) {
    const flow = this.guidedFlow(run);
    if (!flow) {
      throw new AppError(
        'QA_RUN_STATE_INVALID',
        'This action is only valid for guided runs',
      );
    }
    return flow;
  }

  private async assertSelectionOwned(
    sandboxUserId: string,
    selection: { type: QaSelectionType; id: string },
  ) {
    switch (selection.type) {
      case 'idea':
        await loadSandboxIdea(this.dataSource, sandboxUserId, selection.id);
        return;
      case 'post':
        await loadSandboxPost(this.dataSource, sandboxUserId, selection.id);
        return;
      case 'strategy':
        await loadActiveStrategy(this.dataSource, sandboxUserId, selection.id);
        return;
      case 'voice':
        await loadSandboxVoice(this.dataSource, sandboxUserId, selection.id);
        return;
      default:
        throw new AppError('QA_STEP_STATE_INVALID', 'Unknown selection type');
    }
  }

  private async previewOrThrow(
    profileId: string | null,
    capabilityKey: string,
    input: Record<string, unknown>,
  ) {
    if (!profileId) {
      throw new AppError(
        'QA_PROFILE_NOT_READY',
        'Run is not attached to a profile',
      );
    }
    return this.contextService.preview({ profileId, capabilityKey, input });
  }

  private assertContextHash(
    contextPreview: Record<string, unknown> | undefined,
    actual: string,
  ) {
    if (
      contextPreview &&
      typeof contextPreview.contextHash === 'string' &&
      contextPreview.contextHash !== actual
    ) {
      throw new AppError(
        'QA_CONTEXT_INVALID',
        'Submitted context hash does not match current preview',
        {
          expected: contextPreview.contextHash,
          actual,
        },
      );
    }
  }

  private async loadCreateDeps(dto: {
    profileId: string;
    systemVersionId?: string | null;
    caseId?: string | null;
  }) {
    const profile = await this.dataSource.getRepository(QaProfileEntity).findOne({
      where: { id: dto.profileId },
    });
    const systemVersion = dto.systemVersionId
      ? await this.dataSource.getRepository(QaSystemVersionEntity).findOne({
          where: { id: dto.systemVersionId },
        })
      : null;

    if (dto.systemVersionId && !systemVersion) {
      throw new AppError(
        'QA_SYSTEM_VERSION_UNAVAILABLE',
        'Requested system version was not found',
        { systemVersionId: dto.systemVersionId },
      );
    }

    return { profile, systemVersion };
  }

  private profileSnapshot(profile: QaProfileEntity | null) {
    return {
      id: profile?.id,
      name: profile?.name,
      segment: profile?.segment,
      source: profile?.source,
      status: profile?.status,
      definition: profile?.definition,
      sandboxUserId: profile?.sandboxUserId,
      draftRevision: profile?.draftRevision,
    };
  }

  private currentStep(run: QaRunEntity): QaRunStepData {
    const step =
      run.steps.find((item) => item.key === run.currentStepKey) ?? run.steps[0];
    if (!step) {
      throw new AppError('QA_STEP_STATE_INVALID', 'Run has no current step');
    }
    return step;
  }

  private transitionRun(run: QaRunEntity, to: QaRunStatusValue) {
    try {
      assertRunTransition(run.status, to);
    } catch {
      throw new AppError(
        'QA_RUN_STATE_INVALID',
        `Illegal QA run transition ${run.status} -> ${to}`,
      );
    }
    run.status = to as QaRunStatus;
  }

  private transitionStep(step: QaRunStepData, to: QaStepStatusValue) {
    try {
      assertStepTransition(step.status, to);
    } catch {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        `Illegal QA step transition ${step.status} -> ${to}`,
      );
    }
    step.status = to;
  }

  private assertRunStatus(run: QaRunEntity, allowed: QaRunStatusValue[]) {
    if (!allowed.includes(run.status)) {
      throw new AppError(
        'QA_RUN_STATE_INVALID',
        `Run status ${run.status} does not allow this action`,
        { status: run.status, allowed },
      );
    }
  }

  private withNextActions(run: QaRunEntity) {
    for (const step of run.steps) {
      step.nextActions =
        step.key === run.currentStepKey ? this.nextActions(run, step) : [];
    }
    return run;
  }

  private nextActions(run: QaRunEntity, step: QaRunStepData): QaRunAction[] {
    if (run.status === 'completed' || run.status === 'cancelled') {
      return [];
    }

    const flow = this.guidedFlow(run);
    const definition = flow?.steps.find((item) => item.key === step.key);
    const hasNext = Boolean(this.nextExecutableStep(run, step));

    if (step.status === 'pending' && ['ready', 'paused'].includes(run.status)) {
      const actions: QaRunAction[] = ['execute', 'cancel'];
      if (definition?.optional) {
        actions.splice(1, 0, 'skip');
      }
      return actions;
    }

    if (step.status === 'completed' && run.status === 'paused') {
      const actions: QaRunAction[] = ['review', 'retry'];
      if (definition?.requiresSelection) {
        actions.push('select_output');
      }
      if (
        hasNext &&
        (!definition?.requiresSelection || Boolean(step.operatorSelection))
      ) {
        actions.push('continue');
      }
      actions.push('finish', 'cancel');
      return actions;
    }

    if (step.status === 'failed') {
      return ['retry', 'cancel', 'finish'];
    }

    if (step.status === 'skipped') {
      return hasNext ? ['continue', 'finish', 'cancel'] : ['finish', 'cancel'];
    }

    return ['cancel'];
  }

  private async save(run: QaRunEntity) {
    this.withNextActions(run);
    delete (run as { reviews?: unknown }).reviews;
    delete (run as { issues?: unknown }).issues;
    await this.dataSource.getRepository(QaRunEntity).save(run);
    return this.getOne(run.id);
  }
}
