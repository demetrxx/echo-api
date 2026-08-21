import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { AppError } from '@/common/errors/app-error';

import {
  CanonicalQaProfileDefinition,
  parseQaProfileDefinition,
} from '../types';

export const QA_FIXTURE_KEYS = [
  'creator_founder_operator',
  'creator_expert_educator',
  'creator_reflective_writer',
] as const;

export type QaFixtureKey = (typeof QA_FIXTURE_KEYS)[number];

export function isQaFixtureKey(value: string): value is QaFixtureKey {
  return (QA_FIXTURE_KEYS as readonly string[]).includes(value);
}

interface RawFixture {
  profile?: Record<string, unknown>;
  goals?: string[];
  pillars?: string[];
  tone_rules?: string[];
  strategy_state?: string[] | Record<string, unknown>;
  notes?: { raw?: string[]; noisy?: string[] };
  post_samples?: Array<{ id?: string; text: string }>;
  expected_tasks?: unknown[];
}

export function loadQaFixture(
  fixtureKey: string,
): CanonicalQaProfileDefinition {
  if (!isQaFixtureKey(fixtureKey)) {
    throw new AppError(
      'QA_PROFILE_INVALID',
      `Unknown fixture key: ${fixtureKey}`,
    );
  }

  const path = join(process.cwd(), 'fixtures', `${fixtureKey}.json`);
  if (!existsSync(path)) {
    throw new AppError(
      'QA_PROFILE_INVALID',
      `Fixture file is missing: ${fixtureKey}`,
    );
  }

  const raw = JSON.parse(readFileSync(path, 'utf8')) as RawFixture;
  return normalizeFixture(raw);
}

export function normalizeFixture(
  raw: RawFixture,
): CanonicalQaProfileDefinition {
  try {
    return parseQaProfileDefinition({
      profile: raw.profile ?? {},
      goals: raw.goals ?? [],
      pillars: raw.pillars ?? [],
      toneRules: raw.tone_rules ?? [],
      strategyState: raw.strategy_state ?? [],
      notes: {
        raw: raw.notes?.raw ?? [],
        noisy: raw.notes?.noisy ?? [],
      },
      postSamples: raw.post_samples ?? [],
      expectedTasks: raw.expected_tasks ?? [],
    });
  } catch (error) {
    throw new AppError(
      'QA_PROFILE_INVALID',
      error instanceof Error ? error.message : 'Invalid profile definition',
    );
  }
}

export function hashStable(value: unknown): string {
  return createHash('sha256')
    .update(stableStringify(value))
    .digest('hex')
    .slice(0, 32);
}

export function stableStringify(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  );
  return `{${entries
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(',')}}`;
}
