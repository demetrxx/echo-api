import { PlatformType, VoiceEntity, VoiceExampleEntity } from '@app/db';

import { inTag } from '@/common/utils';

interface AdaptTextPromptInput {
  voice: VoiceEntity;
  examples: VoiceExampleEntity[];
  text: string;
  platform: PlatformType;
}

function injectExamples(examples: VoiceExampleEntity[]) {
  return (
    'Examples:\n' +
    inTag(
      'examples',
      `
  ${JSON.stringify(
    examples.map((e) => e.text),
    null,
    2,
  )}
  `,
    )
  );
}

function injectVoice(voice: VoiceEntity) {
  return (
    'Voice:\n' +
    inTag(
      'voice',
      `
  ${JSON.stringify(voice, null, 2)}
  `,
    )
  );
}
function injectText(text: string) {
  return (
    'Text:\n' +
    inTag(
      'text',
      `
  ${text}
  `,
    )
  );
}

export const ADAPT_TEXT_PROMPT = (i: AdaptTextPromptInput) => `
You are a text adaptation agent.

You are given a voice and a list of examples.

You need to adapt the text to the voice.

${injectVoice(i.voice)}

${injectExamples(i.examples)}

${injectText(i.text)}

Return the adapted text.
`;
