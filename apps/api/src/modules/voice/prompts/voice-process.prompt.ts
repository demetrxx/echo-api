import { VoiceEntity, VoiceExampleEntity } from '@app/db';

import { inTag } from '@/common/utils';

interface VoiceProcessPromptInput {
  voice: VoiceEntity;
  examples: VoiceExampleEntity[];
}

function injectExamples(examples: VoiceExampleEntity[]) {
  return (
    'Examples:\n' +
    inTag(
      'examples',
      `
  ${JSON.stringify(
    examples.map((e) => ({
      platform: e.platform,
      example: e.text,
    })),
    null,
    2,
  )}
  `,
    )
  );
}

export const VOICE_PROCESS_PROMPT = (i: VoiceProcessPromptInput) => `
You are a voice processing agent.

You are given a voice and a list of examples.

You need to process the voice and the examples to create a new voice.

${injectExamples(i.examples)}

Response format:
<response_format>
{
  tov: string;
  rules: string[];
  avoidRules: string[];
  evidencePreferences: string;
  platformOverrides: Partial<Record<PlatformType, {
    tov?: string[]
    rules?: string[]
    avoidRules?: string[]
    evidencePreferences?: string[]
  }>>

}
</response_format>

Response JSON:
`;
