import {
  QaReviewEntity,
  QaReviewerType,
  QaRunEntity,
  QaRunStepData,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { z, ZodError } from 'zod';

import { AppError } from '@/common/errors/app-error';
import { LlmService } from '@/modules/llm';

import {
  isStepRubricSnapshot,
  latestAttempt,
} from '../execution/qa-flow.types';
import { QaCapabilityRegistry } from '../execution/qa-capability.registry';
import { QaRunService } from '../execution/qa-run.service';
import { QaRubricCriterion } from '../types';
import {
  mapReviewView,
  summarizeReviews,
} from './qa-review.helpers';
import { buildQaReviewPrompt, QA_REVIEW_PROMPT_ID } from './qa-review.prompt';

const llmReviewSchema = z.object({
  overallScore: z.number().int().min(1).max(10),
  criteria: z.array(
    z.object({
      key: z.string().min(1),
      score: z.number().int().min(1).max(10),
      comment: z.string().optional(),
    }),
  ),
  comment: z.string().min(1),
  suggestedIssue: z.string().nullable().optional(),
});

@Injectable()
export class QaReviewService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly runService: QaRunService,
    private readonly registry: QaCapabilityRegistry,
    private readonly llm: LlmService,
  ) {}

  async createAiReview(runId: string, stepKey?: string) {
    const run = await this.runService.getOne(runId);
    const step = this.resolveReviewStep(run, stepKey);
    if (step.status !== 'completed') {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'AI review requires a completed step',
        { status: step.status },
      );
    }

    const rubric = this.rubricForStep(run, step);
    if (!rubric.length) {
      throw new AppError(
        'VALIDATION',
        'This step has no rubric and cannot be AI-reviewed',
        { stepKey: step.key, capabilityKey: step.capabilityKey },
      );
    }

    const attempt = latestAttempt(step);
    if (!attempt?.output) {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'Completed step has no output to review',
      );
    }

    const capability = this.registry.get(step.capabilityKey);
    const prompt = buildQaReviewPrompt({
      capabilityKey: capability.key,
      capabilityLabel: capability.label,
      capabilityDescription: capability.description,
      profileExcerpt: this.profileExcerpt(run),
      rubric,
      input: attempt.input,
      context: attempt.resolvedContext,
      output: attempt.output,
    });

    const parsed = await this.invokeReviewer(prompt, rubric);

    const review = await this.dataSource.getRepository(QaReviewEntity).save({
      reviewerType: QaReviewerType.Ai,
      stepKey: step.key,
      overallScore: parsed.overallScore,
      criteria: parsed.criteria,
      comment: parsed.comment,
      runId: run.id,
      reviewerUserId: null,
    });

    return {
      ...(await this.stepSummary(run.id, step.key)),
      suggestedIssue: parsed.suggestedIssue ?? null,
      promptId: QA_REVIEW_PROMPT_ID,
      review: mapReviewView(review),
    };
  }

  async upsertHumanReview(
    runId: string,
    operatorUserId: string,
    dto: {
      stepKey?: string;
      overallScore: number;
      criteria: Array<{ key: string; score: number; comment?: string }>;
      comment?: string;
    },
  ) {
    const run = await this.runService.getOne(runId);
    const step = this.resolveReviewStep(run, dto.stepKey);
    const rubric = this.rubricForStep(run, step);
    if (!rubric.length) {
      throw new AppError(
        'VALIDATION',
        'This step has no rubric and cannot be reviewed',
        { stepKey: step.key },
      );
    }

    this.assertCriteria(dto.criteria, rubric);

    const repo = this.dataSource.getRepository(QaReviewEntity);
    const existing = await repo.findOne({
      where: {
        runId: run.id,
        stepKey: step.key,
        reviewerType: QaReviewerType.Human,
      },
    });

    const saved = await repo.save({
      ...(existing ?? {}),
      reviewerType: QaReviewerType.Human,
      stepKey: step.key,
      overallScore: dto.overallScore,
      criteria: dto.criteria,
      comment: dto.comment ?? null,
      runId: run.id,
      reviewerUserId: operatorUserId,
    });

    return {
      ...(await this.stepSummary(run.id, step.key)),
      review: mapReviewView(saved),
    };
  }

  async listForRun(runId: string) {
    const reviews = await this.dataSource.getRepository(QaReviewEntity).find({
      where: { runId },
      order: { createdAt: 'ASC' },
    });
    return summarizeReviews(reviews);
  }

  private async stepSummary(runId: string, stepKey: string) {
    const summaries = await this.listForRun(runId);
    return (
      summaries.find((item) => item.stepKey === stepKey) ?? {
        stepKey,
        ai: null,
        human: null,
        effectiveScore: null,
      }
    );
  }

  private resolveReviewStep(run: QaRunEntity, stepKey?: string): QaRunStepData {
    if (stepKey) {
      const step = run.steps.find((item) => item.key === stepKey);
      if (!step) {
        throw new AppError('QA_STEP_STATE_INVALID', 'Unknown stepKey', {
          stepKey,
        });
      }
      return step;
    }

    const current =
      run.steps.find((item) => item.key === run.currentStepKey) ?? null;
    if (current?.status === 'completed') {
      return current;
    }

    const lastCompleted = [...run.steps]
      .reverse()
      .find((item) => item.status === 'completed');
    if (!lastCompleted) {
      throw new AppError(
        'QA_STEP_STATE_INVALID',
        'No completed step is available to review',
      );
    }
    return lastCompleted;
  }

  private rubricForStep(
    run: QaRunEntity,
    step: QaRunStepData,
  ): QaRubricCriterion[] {
    const snapshot = run.rubricSnapshot;
    if (Array.isArray(snapshot) && snapshot.some(isStepRubricSnapshot)) {
      const match = snapshot.find(
        (item) => isStepRubricSnapshot(item) && item.stepKey === step.key,
      );
      return isStepRubricSnapshot(match) ? match.rubric : [];
    }

    return (snapshot as QaRubricCriterion[]) ?? [];
  }

  private assertCriteria(
    criteria: Array<{ key: string; score: number }>,
    rubric: QaRubricCriterion[],
  ) {
    const allowed = new Set(rubric.map((item) => item.key));
    for (const item of criteria) {
      if (!allowed.has(item.key)) {
        throw new AppError(
          'VALIDATION',
          `Unknown rubric criterion: ${item.key}`,
          { key: item.key },
        );
      }
      if (!Number.isInteger(item.score) || item.score < 1 || item.score > 10) {
        throw new AppError('VALIDATION', 'Criterion scores must be 1-10');
      }
    }
  }

  private profileExcerpt(run: QaRunEntity): Record<string, unknown> {
    const snapshot = run.profileSnapshot ?? {};
    const definition = (snapshot.definition ?? {}) as Record<string, unknown>;
    return {
      name: snapshot.name,
      segment: snapshot.segment,
      profile: definition.profile,
      goals: definition.goals,
      pillars: definition.pillars,
      toneRules: definition.toneRules,
    };
  }

  private async invokeReviewer(
    prompt: string,
    rubric: QaRubricCriterion[],
  ): Promise<z.infer<typeof llmReviewSchema>> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await this.llm.fastClient.invoke([
          { role: 'user', content: prompt },
        ]);
        const parsed = llmReviewSchema.parse(
          parseJsonContent(llmText(response.content)),
        );
        this.assertCriteria(parsed.criteria, rubric);
        return parsed;
      } catch (error) {
        lastError = error;
      }
    }

    throw new AppError(
      'QA_REVIEW_FAILED',
      'AI review failed to return a valid 1-10 rubric score',
      lastError instanceof ZodError ? lastError.issues : undefined,
      lastError,
    );
  }
}

function llmText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text?: unknown }).text ?? '');
        }
        return '';
      })
      .join('');
  }
  return String(content ?? '');
}

function parseJsonContent(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(trimmed);
}
