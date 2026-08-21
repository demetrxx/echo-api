import { AppError } from '@/common/errors/app-error';

import {
  CanonicalQaProfileDefinition,
  parseQaProfileDefinition,
} from '../types';

export type QaDefinitionChangeOperation = 'set' | 'append' | 'replace' | 'remove';

export interface QaDefinitionChange {
  operation: QaDefinitionChangeOperation;
  path: string;
  value?: unknown;
}

const ALLOWED_ROOTS = new Set([
  'profile',
  'goals',
  'pillars',
  'toneRules',
  'strategyState',
  'notes',
  'postSamples',
  'expectedTasks',
  'brief',
]);

export function applyDefinitionChanges(
  definition: CanonicalQaProfileDefinition,
  changes: QaDefinitionChange[],
): CanonicalQaProfileDefinition {
  const draft: Record<string, unknown> = structuredClone(definition);

  for (const change of changes) {
    applyChange(draft, change);
  }

  try {
    return parseQaProfileDefinition(draft);
  } catch (error) {
    throw new AppError(
      'QA_PROFILE_INVALID',
      error instanceof Error ? error.message : 'Invalid profile definition',
    );
  }
}

export function classifyChangeScope(
  changes: QaDefinitionChange[],
): 'local' | 'bulk' {
  if (changes.length > 2) {
    return 'bulk';
  }

  return changes.some((change) => isBulkChange(change)) ? 'bulk' : 'local';
}

function isBulkChange(change: QaDefinitionChange): boolean {
  const bulkPaths = ['notes.raw', 'notes.noisy', 'postSamples', 'pillars'];
  if (!bulkPaths.includes(change.path) && !change.path.startsWith('notes.')) {
    return false;
  }

  if (change.operation === 'append' || change.operation === 'replace') {
    return Array.isArray(change.value) && change.value.length > 5;
  }

  return change.operation === 'remove' && change.value === undefined;
}

function applyChange(
  draft: Record<string, unknown>,
  change: QaDefinitionChange,
) {
  const segments = parsePath(change.path);
  const root = segments[0];
  if (!ALLOWED_ROOTS.has(root)) {
    throw new AppError(
      'QA_PROFILE_INVALID',
      `Cannot change path: ${change.path}`,
    );
  }

  switch (change.operation) {
    case 'set':
    case 'replace':
      setPath(draft, segments, change.value);
      return;
    case 'append': {
      const current = getPath(draft, segments);
      const additions = Array.isArray(change.value)
        ? change.value
        : [change.value];
      if (current === undefined || current === null) {
        setPath(draft, segments, additions);
        return;
      }
      if (!Array.isArray(current)) {
        throw new AppError(
          'QA_PROFILE_INVALID',
          `Cannot append to non-array path: ${change.path}`,
        );
      }
      setPath(draft, segments, [...current, ...additions]);
      return;
    }
    case 'remove': {
      if (change.value === undefined) {
        deletePath(draft, segments);
        return;
      }
      const current = getPath(draft, segments);
      if (!Array.isArray(current)) {
        throw new AppError(
          'QA_PROFILE_INVALID',
          `Cannot remove items from non-array path: ${change.path}`,
        );
      }
      const removeValues = Array.isArray(change.value)
        ? change.value
        : [change.value];
      setPath(
        draft,
        segments,
        current.filter(
          (item) =>
            !removeValues.some(
              (candidate) => JSON.stringify(candidate) === JSON.stringify(item),
            ),
        ),
      );
      return;
    }
    default:
      throw new AppError(
        'QA_PROFILE_INVALID',
        `Unknown change operation: ${String((change as QaDefinitionChange).operation)}`,
      );
  }
}

function parsePath(path: string): string[] {
  const segments = path
    .split('.')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (!segments.length) {
    throw new AppError('QA_PROFILE_INVALID', 'Change path is empty');
  }

  return segments;
}

function getPath(value: unknown, segments: string[]): unknown {
  let current: unknown = value;
  for (const segment of segments) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function setPath(
  target: Record<string, unknown>,
  segments: string[],
  value: unknown,
) {
  let current: Record<string, unknown> = target;
  for (const segment of segments.slice(0, -1)) {
    const next = current[segment];
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }
  current[segments[segments.length - 1]] = value;
}

function deletePath(target: Record<string, unknown>, segments: string[]) {
  let current: Record<string, unknown> = target;
  for (const segment of segments.slice(0, -1)) {
    const next = current[segment];
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      return;
    }
    current = next as Record<string, unknown>;
  }
  delete current[segments[segments.length - 1]];
}
