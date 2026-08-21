import { QaRunEntity, QaRunStepData } from '@app/db';

import { QaCapabilityStatus, QaRubricCriterion } from '../types';

export type QaSelectionType = 'idea' | 'strategy' | 'voice' | 'post';

export interface QaFlowMapContext {
  initialInput: Record<string, unknown>;
  steps: QaRunStepData[];
  priorSteps: QaRunStepData[];
  current: QaRunStepData;
}

export interface QaFlowStepDefinition {
  key: string;
  capabilityKey: string;
  optional?: boolean;
  requiresSelection?: QaSelectionType;
  defaultInput?: Record<string, unknown>;
  autoSkip?: (initialInput: Record<string, unknown>) => boolean;
  mapInput: (ctx: QaFlowMapContext) => Record<string, unknown>;
}

export interface QaFlowDefinition {
  key: string;
  label: string;
  description: string;
  status: QaCapabilityStatus;
  steps: QaFlowStepDefinition[];
}

export interface QaFlowCatalogItem {
  key: string;
  label: string;
  description: string;
  status: QaCapabilityStatus;
  steps: string[];
}

export interface QaStepRubricSnapshot {
  stepKey: string;
  capabilityKey: string;
  rubric: QaRubricCriterion[];
}

export function isStepRubricSnapshot(
  value: unknown,
): value is QaStepRubricSnapshot {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'stepKey' in (value as object) &&
    'rubric' in (value as object)
  );
}

export function latestAttempt(step: QaRunStepData) {
  if (step.selectedAttemptId) {
    return (
      step.attempts.find((item) => item.id === step.selectedAttemptId) ??
      step.attempts[step.attempts.length - 1] ??
      null
    );
  }
  return step.attempts[step.attempts.length - 1] ?? null;
}

export function latestArtifacts(
  step: QaRunStepData | undefined,
): Record<string, unknown> {
  if (!step) {
    return {};
  }
  return latestAttempt(step)?.artifacts ?? {};
}

export function selectionId(step: QaRunStepData | undefined): string | undefined {
  const selection = step?.operatorSelection as { id?: string } | null;
  return typeof selection?.id === 'string' ? selection.id : undefined;
}

export function asIdList(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

export function artifactsForType(
  artifacts: Record<string, unknown>,
  type: QaSelectionType,
): string[] {
  switch (type) {
    case 'idea':
      return asIdList(artifacts.ideaIds).concat(asIdList(artifacts.ideaId));
    case 'post':
      return asIdList(artifacts.postId);
    case 'strategy':
      return asIdList(artifacts.strategyId);
    case 'voice':
      return asIdList(artifacts.voiceId).concat(
        asIdList(artifacts.createdVoiceId),
      );
    default:
      return [];
  }
}

export function findPriorArtifact(
  steps: QaRunStepData[],
  type: QaSelectionType,
): string | undefined {
  for (const step of [...steps].reverse()) {
    const selected =
      (step.operatorSelection as { type?: string; id?: string } | null)?.type ===
      type
        ? selectionId(step)
        : undefined;
    if (selected) {
      return selected;
    }
    const fromArtifacts = artifactsForType(latestArtifacts(step), type)[0];
    if (fromArtifacts) {
      return fromArtifacts;
    }
  }
  return undefined;
}

export function runInitialInput(
  run: QaRunEntity,
): Record<string, unknown> {
  const summary = run.summary as { initialInput?: Record<string, unknown> } | null;
  return summary?.initialInput ?? {};
}

export function runFlowKey(run: QaRunEntity): string | null {
  const summary = run.summary as { flowKey?: string } | null;
  return summary?.flowKey ?? null;
}
