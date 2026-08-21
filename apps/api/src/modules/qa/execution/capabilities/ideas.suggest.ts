import { z } from 'zod';

import { IDEAS_RUBRIC } from '../../lib/qa-rubrics';
import { serializeIdea } from '../../lib/qa-serializers';
import { QaCapabilityDefinition } from '../qa-capability.types';
import {
  compactContext,
  contextItem,
  loadActiveStrategy,
  loadSandboxNotes,
  loadSandboxTheme,
  loadSandboxVoice,
} from '../qa-context.helpers';

const inputSchema = z.object({
  amount: z.number().int().min(1).max(20).optional().default(5),
  themeId: z.string().uuid().optional(),
  voiceId: z.string().uuid().optional(),
  strategyId: z.string().uuid().optional(),
  noteIds: z.array(z.string().uuid()).optional(),
  forNoteIds: z.array(z.string().uuid()).optional(),
  notesBased: z.boolean().optional(),
});

export const ideasSuggestCapability: QaCapabilityDefinition = {
  key: 'ideas.suggest',
  label: 'Generate ideas',
  description: 'Generate ideas from sandbox notes, theme, strategy and voice.',
  status: 'ready',
  defaultRubric: IDEAS_RUBRIC,
  allowedNext: ['post.create'],
  parseInput: (input) => inputSchema.parse(input ?? {}),
  resolveContext: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const noteIds = parsed.noteIds ?? parsed.forNoteIds ?? [];
    const notes = await loadSandboxNotes(
      services.dataSource,
      sandboxUserId,
      noteIds,
    );
    const theme = await loadSandboxTheme(
      services.dataSource,
      sandboxUserId,
      parsed.themeId,
    );
    const { voice, source: voiceSource } = await loadSandboxVoice(
      services.dataSource,
      sandboxUserId,
      parsed.voiceId,
    );
    const { strategy, source: strategySource } = await loadActiveStrategy(
      services.dataSource,
      sandboxUserId,
      parsed.strategyId,
    );

    return {
      input: {
        amount: parsed.amount,
        themeId: theme?.id,
        voiceId: voice?.id,
        strategyId: strategy?.id,
        noteIds: notes.map((note) => note.id),
        notesBased: parsed.notesBased ?? Boolean(notes.length),
      },
      context: compactContext([
        contextItem({
          key: 'notes',
          source: noteIds.length ? 'operator_override' : 'product_default',
          ids: notes.map((note) => note.id),
          summary: notes.length
            ? `${notes.length} selected note${notes.length === 1 ? '' : 's'}`
            : 'No notes selected',
        }),
        contextItem({
          key: 'theme',
          source: parsed.themeId ? 'operator_override' : 'product_default',
          ids: [theme?.id],
          summary: theme ? `Theme ${theme.name}` : 'No theme selected',
        }),
        contextItem({
          key: 'strategy',
          source: strategySource,
          ids: [strategy?.id],
          summary: strategy
            ? `Active strategy ${strategy.name ?? strategy.id}`
            : 'No active strategy',
        }),
        contextItem({
          key: 'voice',
          source: voiceSource,
          ids: [voice?.id],
          summary: voice ? `Voice ${voice.name}` : 'No voice',
        }),
      ]),
      warnings:
        !notes.length && !theme && !voice && !strategy
          ? [
              {
                code: 'NO_CONTEXT',
                message: 'Idea generation needs notes, theme, voice or strategy',
                blocking: true,
              },
            ]
          : [],
    };
  },
  execute: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const noteIds = parsed.noteIds ?? parsed.forNoteIds ?? [];
    const ideas = await services.ideaService.suggest(
      sandboxUserId,
      {
        themeId: parsed.themeId,
        voiceId: parsed.voiceId,
        notesBased: parsed.notesBased ?? Boolean(noteIds.length),
        forNoteIds: noteIds,
      },
      parsed.amount,
    );

    return {
      output: ideas.map(serializeIdea),
      artifacts: {
        ideaIds: ideas.map((idea) => idea.id),
      },
    };
  },
};
