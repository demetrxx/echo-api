import { z } from 'zod';

import { VOICE_CALIBRATION_RUBRIC } from '../../lib/qa-rubrics';
import {
  serializeCalibration,
  serializeVoice,
} from '../../lib/qa-serializers';
import { QaCapabilityDefinition } from '../qa-capability.types';
import {
  compactContext,
  contextItem,
  loadSandboxVoice,
} from '../qa-context.helpers';

const inputSchema = z.object({
  voiceId: z.string().uuid().optional(),
});

export const voiceCalibrationStartCapability: QaCapabilityDefinition = {
  key: 'voice.calibration_start',
  label: 'Start voice calibration',
  description:
    'Start voice calibration. This is a limited composite that itself generates ideas and post samples.',
  status: 'limited',
  defaultRubric: VOICE_CALIBRATION_RUBRIC,
  allowedNext: ['voice.adapt_text'],
  parseInput: (input) => inputSchema.parse(input ?? {}),
  resolveContext: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const { voice, source } = await loadSandboxVoice(
      services.dataSource,
      sandboxUserId,
      parsed.voiceId,
    );

    return {
      input: {
        ...parsed,
        voiceId: voice?.id,
      },
      context: compactContext([
        contextItem({
          key: 'voice',
          source,
          ids: [voice?.id],
          summary: voice
            ? `Voice ${voice.name} · ${voice.examples?.length ?? 0} examples`
            : 'No voice selected',
        }),
      ]),
      warnings: [
        {
          code: 'CALIBRATION_COMPOSITE',
          message:
            'Calibration start is expensive and itself calls idea generation and post refine.',
          blocking: false,
        },
        ...(!voice
          ? [
              {
                code: 'VOICE_REQUIRED',
                message: 'voice.calibration_start needs a sandbox voice',
                blocking: true,
              },
            ]
          : []),
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

    const calibration = await services.voiceCalibrationService.start(
      voice.id,
      sandboxUserId,
    );

    return {
      output: {
        voice: serializeVoice(calibration.voice ?? voice),
        calibration: serializeCalibration(calibration),
      },
      artifacts: {
        voiceId: voice.id,
        calibrationId: calibration.id,
      },
    };
  },
};
