import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { AppError } from '@/common/errors/app-error';
import { LlmService } from '@/modules/llm';

import {
  applyDefinitionChanges,
  classifyChangeScope,
  QaDefinitionChange,
} from '../lib/qa-definition-ops';
import { parseQaProfileDefinition } from '../types';
import { QaProfileService } from './qa-profile.service';

const changeSchema = z.object({
  operation: z.enum(['set', 'append', 'replace', 'remove']),
  path: z.string().min(1),
  value: z.unknown().optional(),
});

const assistantResponseSchema = z.object({
  assistantMessage: z.string().min(1),
  changes: z.array(changeSchema),
  scope: z.enum(['local', 'bulk']).optional(),
  requiresConfirmation: z.boolean().optional(),
});

@Injectable()
export class QaSeedAssistantService {
  constructor(
    private readonly llmService: LlmService,
    private readonly profileService: QaProfileService,
  ) {}

  async propose(params: {
    profileId: string;
    message: string;
    selectedPaths?: string[];
    currentDraftRevision?: number;
  }) {
    const profile = await this.profileService.getOne(params.profileId);

    if (
      params.currentDraftRevision !== undefined &&
      params.currentDraftRevision !== profile.draftRevision
    ) {
      throw new AppError('CONFLICT', 'Stale draft revision', {
        expected: profile.draftRevision,
        received: params.currentDraftRevision,
      });
    }

    const definition = parseQaProfileDefinition(profile.definition);
    const selected =
      params.selectedPaths?.length &&
      Object.fromEntries(
        params.selectedPaths.map((path) => [
          path,
          path
            .split('.')
            .reduce<unknown>(
              (current, key) =>
                current && typeof current === 'object'
                  ? (current as Record<string, unknown>)[key]
                  : undefined,
              definition,
            ),
        ]),
      );

    const prompt = `You are the Echo AI-QA Seed Assistant.
Return ONLY JSON with this shape:
{
  "assistantMessage": "short operator-facing summary",
  "changes": [
    { "operation": "set|append|replace|remove", "path": "notes.noisy", "value": [] }
  ]
}

Rules:
- Operate on a portable QA profile definition.
- Allowed root paths: profile, goals, pillars, toneRules, strategyState, notes, postSamples, expectedTasks, brief.
- notes.raw and notes.noisy are string arrays.
- postSamples is [{ id?: string, text: string }].
- expectedTasks is metadata only, never product seed data.
- Prefer the smallest change that fulfills the request.
- If selected paths are provided, change only those paths.
- Do not invent production user data or credentials.
- Do not materialize anything.

Current definition:
${JSON.stringify(definition)}

Selected paths:
${JSON.stringify(selected ?? null)}

Operator request:
${params.message}`;

    const response = await this.llmService.fastClient.invoke([
      { role: 'user', content: prompt },
    ]);

    const parsed = this.parseModelJson(String(response.content ?? ''));
    const changes = parsed.changes as QaDefinitionChange[];
    const scope =
      parsed.scope ?? classifyChangeScope(changes);
    const requiresConfirmation = parsed.requiresConfirmation ?? scope === 'bulk';

    applyDefinitionChanges(definition, changes);

    return {
      assistantMessage: parsed.assistantMessage,
      changes,
      scope,
      requiresConfirmation,
      draftRevision: profile.draftRevision,
    };
  }

  private parseModelJson(content: string) {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new AppError(
        'QA_PROFILE_INVALID',
        'Seed assistant did not return JSON',
      );
    }

    try {
      return assistantResponseSchema.parse(JSON.parse(match[0]));
    } catch (error) {
      throw new AppError(
        'QA_PROFILE_INVALID',
        'Seed assistant returned an invalid changeset',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
