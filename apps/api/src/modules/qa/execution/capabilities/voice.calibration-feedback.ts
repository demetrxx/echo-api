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
  feedback: z.string().min(1).optional(),
});

export const voiceCalibrationFeedbackCapability: QaCapabilityDefinition = {
  key: 'voice.calibration_feedback',
  label: 'Voice calibration feedback',
  description:
    'Send operator feedback to an in-progress voice calibration. Limited composite.',
  status: 'limited',
  defaultRubric: VOICE_CALIBRATION_RUBRIC,
  allowedNext: ['voice.adapt_text', 'post.create'],
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
            ? `Voice ${voice.name} · calibration feedback`
            : 'No voice selected',
        }),
      ]),
      warnings: voice
        ? []
        : [
            {
              code: 'VOICE_REQUIRED',
              message: 'voice.calibration_feedback needs a sandbox voice',
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

    if (!parsed.feedback) {
      throw new Error('feedback is required to execute calibration feedback');
    }

    const calibration = await services.voiceCalibrationService.addFeedback(
      voice.id,
      sandboxUserId,
      parsed.feedback,
    );

    return {
      output: {
        voice: serializeVoice(calibration.voice ?? voice),
        calibration: serializeCalibration(calibration),
        feedback: parsed.feedback,
      },
      artifacts: {
        voiceId: voice.id,
        calibrationId: calibration.id,
      },
    };
  },
};
