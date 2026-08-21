import { PlatformType } from '@app/db';
import { z } from 'zod';

import { VOICE_ADAPT_RUBRIC } from '../../lib/qa-rubrics';
import { serializeVoice } from '../../lib/qa-serializers';
import { QaCapabilityDefinition } from '../qa-capability.types';
import {
  compactContext,
  contextItem,
  defaultPlatform,
  loadSandboxVoice,
} from '../qa-context.helpers';

const inputSchema = z.object({
  voiceId: z.string().uuid().optional(),
  text: z.string().min(1),
  platform: z.enum(PlatformType).optional(),
});

export const voiceAdaptTextCapability: QaCapabilityDefinition = {
  key: 'voice.adapt_text',
  label: 'Adapt text to voice',
  description: 'Rewrite text using sandbox voice examples and rules.',
  status: 'limited',
  defaultRubric: VOICE_ADAPT_RUBRIC,
  allowedNext: [],
  parseInput: (input) => inputSchema.parse(input ?? {}),
  resolveContext: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const { voice, source } = await loadSandboxVoice(
      services.dataSource,
      sandboxUserId,
      parsed.voiceId,
    );
    const platform = parsed.platform ?? defaultPlatform(voice?.platforms);

    return {
      input: {
        ...parsed,
        voiceId: voice?.id,
        platform,
      },
      context: compactContext([
        contextItem({
          key: 'voice',
          source,
          ids: [voice?.id],
          summary: voice
            ? `Voice ${voice.name} · ${voice.examples?.length ?? 0} examples`
            : 'No voice selected',
          details: voice ? serializeVoice(voice) : undefined,
        }),
      ]),
      warnings: voice
        ? voice.examples?.length
          ? []
          : [
              {
                code: 'VOICE_EXAMPLES_MISSING',
                message: 'Voice adapt needs embeddings/examples to work well.',
                blocking: false,
              },
            ]
        : [
            {
              code: 'VOICE_REQUIRED',
              message: 'voice.adapt_text needs a sandbox voice',
              blocking: true,
            },
          ],
    };
  },
  execute: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const { voice } = await loadSandboxVoice(
      services.dataSource,
      sandboxUserId,
      parsed.voiceId,
    );

    if (!voice) {
      throw new Error('Voice is required');
    }

    const platform = parsed.platform ?? defaultPlatform(voice.platforms);
    const adapted = await services.voiceService.adaptText(
      voice.id,
      sandboxUserId,
      {
        text: parsed.text,
        platform,
      },
    );

    return {
      output: {
        text: adapted,
        platform,
        voice: serializeVoice(voice),
      },
      artifacts: {
        voiceId: voice.id,
      },
    };
  },
};
