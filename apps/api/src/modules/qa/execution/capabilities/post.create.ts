import { PlatformType } from '@app/db';
import { z } from 'zod';

import { serializePost } from '../../lib/qa-serializers';
import { QaCapabilityDefinition } from '../qa-capability.types';
import {
  compactContext,
  contextItem,
  loadActiveStrategy,
  loadSandboxIdea,
  loadSandboxNotes,
  loadSandboxTheme,
  loadSandboxVoice,
} from '../qa-context.helpers';

const inputSchema = z.object({
  themeId: z.string().uuid().optional(),
  ideaId: z.string().uuid().optional(),
  noteIds: z.array(z.string().uuid()).optional(),
  text: z.string().optional(),
  platform: z.enum(PlatformType).optional(),
  voiceId: z.string().uuid().optional(),
  strategyId: z.string().uuid().optional(),
});

export const postCreateCapability: QaCapabilityDefinition = {
  key: 'post.create',
  label: 'Create post',
  description: 'Create a draft post from an idea, theme or starting text.',
  status: 'support',
  defaultRubric: [],
  allowedNext: ['post.refine'],
  parseInput: (input) => inputSchema.parse(input ?? {}),
  resolveContext: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const notes = await loadSandboxNotes(
      services.dataSource,
      sandboxUserId,
      parsed.noteIds,
    );
    const theme = await loadSandboxTheme(
      services.dataSource,
      sandboxUserId,
      parsed.themeId,
    );
    const idea = await loadSandboxIdea(
      services.dataSource,
      sandboxUserId,
      parsed.ideaId,
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
        ...parsed,
        noteIds: notes.map((note) => note.id),
        themeId: theme?.id ?? idea?.themeId,
        ideaId: idea?.id,
        voiceId: voice?.id,
        strategyId: strategy?.id,
      },
      context: compactContext([
        contextItem({
          key: 'idea',
          source: parsed.ideaId ? 'operator_override' : 'product_default',
          ids: [idea?.id],
          summary: idea ? `Idea ${idea.name}` : 'No idea selected',
        }),
        contextItem({
          key: 'notes',
          source: parsed.noteIds?.length
            ? 'operator_override'
            : 'product_default',
          ids: notes.map((note) => note.id),
          summary: notes.length
            ? `${notes.length} selected note${notes.length === 1 ? '' : 's'}`
            : 'No notes selected',
        }),
        contextItem({
          key: 'theme',
          source: parsed.themeId ? 'operator_override' : 'product_default',
          ids: [theme?.id ?? idea?.themeId],
          summary: theme ? `Theme ${theme.name}` : 'Theme from idea or none',
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
          summary: voice
            ? `Voice ${voice.name} (product uses last post voice on create)`
            : 'No voice; product may leave voice empty',
          details: {
            passedToExecutor: false,
            reason: 'PostService.create copies voiceId from the last post',
          },
        }),
      ]),
      warnings: parsed.platform
        ? [
            {
              code: 'PLATFORM_OVERRIDE_AFTER_CREATE',
              message:
                'Product create uses last post platform; QA applies platform override after create when provided.',
              blocking: false,
            },
          ]
        : [],
    };
  },
  execute: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const post = await services.postService.create(sandboxUserId, {
      themeId: parsed.themeId,
      ideaId: parsed.ideaId,
      noteIds: parsed.noteIds,
      text: parsed.text,
    });

    const updated =
      parsed.platform || parsed.voiceId
        ? await services.postService.updateOne(post.id, sandboxUserId, {
            platform: parsed.platform,
            voiceId: parsed.voiceId,
          })
        : post;

    return {
      output: serializePost(updated),
      artifacts: {
        postId: updated.id,
        postVersionId: updated.currentVersionId ?? updated.currentVersion?.id,
      },
    };
  },
};
