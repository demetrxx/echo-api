import { z } from 'zod';

import { STRATEGY_RUBRIC } from '../../lib/qa-rubrics';
import {
  lastAssistantMessage,
  serializeStrategy,
  serializeTheme,
  serializeVoice,
} from '../../lib/qa-serializers';
import { QaCapabilityDefinition } from '../qa-capability.types';
import {
  compactContext,
  contextItem,
  loadActiveStrategy,
} from '../qa-context.helpers';

const inputSchema = z.object({
  strategyId: z.string().uuid().optional(),
  content: z.string().min(1),
});

export const strategyMessageCapability: QaCapabilityDefinition = {
  key: 'strategy.message',
  label: 'Strategy message',
  description: 'Send a user turn to the sandbox strategy agent.',
  status: 'ready',
  defaultRubric: STRATEGY_RUBRIC,
  allowedNext: ['strategy.message', 'ideas.suggest'],
  parseInput: (input) => inputSchema.parse(input ?? {}),
  resolveContext: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const { strategy, source } = await loadActiveStrategy(
      services.dataSource,
      sandboxUserId,
      parsed.strategyId,
    );

    return {
      input: {
        ...parsed,
        strategyId: strategy?.id,
      },
      context: compactContext([
        contextItem({
          key: 'strategy',
          source,
          ids: [strategy?.id],
          summary: strategy
            ? `${strategy.name ?? 'Strategy'} · ${strategy.stage}`
            : 'No strategy selected',
          details: strategy
            ? {
                stage: strategy.stage,
                status: strategy.status,
                snapshot: strategy.snapshot,
              }
            : undefined,
        }),
      ]),
      warnings: strategy
        ? []
        : [
            {
              code: 'STRATEGY_REQUIRED',
              message: 'strategy.message needs an active or explicit strategy',
              blocking: true,
            },
          ],
    };
  },
  execute: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const { strategy } = await loadActiveStrategy(
      services.dataSource,
      sandboxUserId,
      parsed.strategyId,
    );

    if (!strategy) {
      throw new Error('Strategy is required');
    }

    const before = {
      snapshot: strategy.snapshot,
      stage: strategy.stage,
      themeIds: (strategy.themes ?? [])
        .map((item) => item.themeId ?? item.theme?.id)
        .filter(Boolean),
      voiceId: strategy.voiceId ?? null,
      historyLength: strategy.conversation?.history?.length ?? 0,
    };

    const updated = await services.strategyService.messageAgent(
      strategy.id,
      sandboxUserId,
      { content: parsed.content },
    );

    const afterThemeIds = (updated.themes ?? [])
      .map((item) => item.themeId ?? item.theme?.id)
      .filter(Boolean);
    const createdThemeIds = afterThemeIds.filter(
      (id) => !before.themeIds.includes(id),
    );

    return {
      output: {
        response: lastAssistantMessage(updated.conversation?.history as never),
        strategy: serializeStrategy(updated),
        before,
        after: {
          snapshot: updated.snapshot,
          stage: updated.stage,
          themeIds: afterThemeIds,
          voiceId: updated.voiceId ?? null,
          historyLength: updated.conversation?.history?.length ?? 0,
        },
        createdThemes: (updated.themes ?? [])
          .map((item) => item.theme)
          .filter((theme): theme is NonNullable<typeof theme> => Boolean(theme))
          .filter((theme) => createdThemeIds.includes(theme.id))
          .map((theme) => serializeTheme(theme)),
        voice: updated.voice ? serializeVoice(updated.voice) : null,
      },
      artifacts: {
        strategyId: updated.id,
        createdThemeIds,
        createdVoiceId:
          before.voiceId || !updated.voiceId ? null : updated.voiceId,
      },
    };
  },
};
