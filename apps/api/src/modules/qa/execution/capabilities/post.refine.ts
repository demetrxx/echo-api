import { z } from 'zod';

import { POST_REFINE_RUBRIC } from '../../lib/qa-rubrics';
import { serializePost } from '../../lib/qa-serializers';
import { QaCapabilityDefinition } from '../qa-capability.types';
import {
  compactContext,
  contextItem,
  loadSandboxPost,
} from '../qa-context.helpers';

const inputSchema = z.object({
  postId: z.string().uuid(),
  request: z.string().min(1),
});

export const postRefineCapability: QaCapabilityDefinition = {
  key: 'post.refine',
  label: 'Refine post',
  description: 'Refine an existing sandbox post through PostService.',
  status: 'ready',
  defaultRubric: POST_REFINE_RUBRIC,
  allowedNext: [],
  parseInput: (input) => inputSchema.parse(input ?? {}),
  resolveContext: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const post = await loadSandboxPost(
      services.dataSource,
      sandboxUserId,
      parsed.postId,
    );

    if (!post) {
      return {
        input: parsed,
        context: [],
        warnings: [
          {
            code: 'POST_REQUIRED',
            message: 'post.refine requires a sandbox postId',
            blocking: true,
          },
        ],
      };
    }

    const noteIds = (post.notes ?? [])
      .map((item) => item.noteId ?? item.note?.id)
      .filter(Boolean);

    return {
      input: parsed,
      context: compactContext([
        contextItem({
          key: 'post',
          source: 'operator_override',
          ids: [post.id],
          summary: post.title ?? 'Untitled post',
        }),
        contextItem({
          key: 'notes',
          source: 'product_default',
          ids: noteIds,
          summary: noteIds.length
            ? `${noteIds.length} linked note${noteIds.length === 1 ? '' : 's'}`
            : 'No linked notes',
        }),
        contextItem({
          key: 'theme',
          source: 'product_default',
          ids: [post.themeId],
          summary: post.theme?.name ?? 'No theme',
        }),
        contextItem({
          key: 'idea',
          source: 'product_default',
          ids: [post.ideaId],
          summary: post.idea?.name ?? 'No idea',
        }),
        contextItem({
          key: 'strategy',
          source: 'product_default',
          ids: [post.strategyId],
          summary: post.strategyId
            ? 'Post strategy'
            : 'No strategy on this post',
        }),
        contextItem({
          key: 'voice',
          source: 'product_default',
          ids: [post.voiceId],
          summary: post.voice
            ? `Voice ${post.voice.name} is on the post but not passed to refine`
            : 'No voice on post',
          details: {
            passedToExecutor: false,
            reason: 'PostService.refine does not pass voice into PostRefineService',
          },
        }),
      ]),
      warnings: post.voiceId
        ? [
            {
              code: 'VOICE_NOT_PASSED',
              message:
                'Production refine path does not pass voice even if post.voiceId is set.',
              blocking: false,
            },
          ]
        : [],
    };
  },
  execute: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const before = await loadSandboxPost(
      services.dataSource,
      sandboxUserId,
      parsed.postId,
    );
    const post = await services.postService.refine(
      parsed.postId,
      sandboxUserId,
      { request: parsed.request },
    );

    return {
      output: {
        post: serializePost(post),
        previousText: before?.currentVersion?.text ?? null,
        currentText: post.currentVersion?.text ?? null,
      },
      artifacts: {
        postId: post.id,
        postVersionId: post.currentVersionId ?? post.currentVersion?.id,
      },
    };
  },
};
