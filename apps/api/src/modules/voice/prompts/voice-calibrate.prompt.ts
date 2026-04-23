import { VoiceEntity } from '@app/db';

import { inTag } from '@/common/utils';

interface VoiceProcessPromptInput {
  voice: VoiceEntity;
  examples: string[];
}

function injectExamples(examples: string[]) {
  return (
    'Examples:\n' +
    inTag('examples', `${examples.map((e) => inTag('example', e)).join('\n')}`)
  );
}

export const VOICE_CALIBRATE_PROMPT = (i: VoiceProcessPromptInput) => `
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
