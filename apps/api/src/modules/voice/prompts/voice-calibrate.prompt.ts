import {
  PlatformType,
  VoiceCalibrationStep,
  VoiceCalibrationType,
} from '@app/db';

import { inTag } from '@/common/utils';

import { injectExamples } from '../lib/inject-examples.prompt';
import { injectVoice } from '../lib/inject-voice.prompt';
import { VoiceInfoDto } from '../types/voice-info.dto';

interface VoiceProcessPromptInput {
  voiceInfo: VoiceInfoDto;
  steps: VoiceCalibrationStep[];
  calibrationType: VoiceCalibrationType;
}

function injectIterationSteps(steps: VoiceCalibrationStep[]) {
  if (steps.length === 0) return 'This is the first iteration.';

  return (
    'Iteration steps:\n' +
    inTag(
      'iteration_steps',
      `${steps.map((s) => inTag('step', JSON.stringify(s, null, 2))).join('\n')}`,
    )
  );
}

function injectCalibrationTypeRules(type: VoiceCalibrationType) {
  switch (type) {
    case VoiceCalibrationType.Initial:
      return `
Calibration mode: initial

Your task:
- Build the best first voice profile from the provided examples.
- If examples are rich, infer stable signals.
- If examples are sparse or mixed, keep the profile minimal and honest.
- Do not pretend to know more than the examples support.
`;
    case VoiceCalibrationType.Feedback:
      return `
Calibration mode: feedback

Your task:
- Refine the current voice profile based on the latest calibration step.
- The latest step is the primary source of truth.
- The latest feedback matters more than older assumptions if they conflict.
- Use older steps only as supporting context.
- Pay special attention to whether the mismatch came from:
  - how the writing sounds,
  - how it is structured,
  - what kind of evidence it uses,
  - or something else visible in the generated samples.
- Update the profile only as much as needed to improve fit.
`;
    case VoiceCalibrationType.UpdateExamples:
      return `
Calibration mode: updateExamples

Your task:
- Re-evaluate the voice profile using the newly provided examples together with prior calibration history.
- If the new examples reveal a clearer or more truthful pattern, update the profile accordingly.
- If the new examples are compatible with the current profile, preserve what still seems true.
- Prefer convergence toward a more truthful and reusable profile.
`;
    default:
      return '';
  }
}

function injectPlatforms(platforms: PlatformType[]) {
  return 'Platforms:\n' + inTag('platforms', platforms.join(', '));
}

export const VOICE_CALIBRATE_PROMPT = (i: VoiceProcessPromptInput) => `
You are calibrating a reusable writing voice profile.

Your job is to produce the best current voice profile from:
- user writing examples
- the current voice data, if any
- previous calibration steps
- generated samples and user feedback

The goal is not to guess some perfect hidden identity.
The goal is to improve stylistic fit so future writing feels more like the user and less generic.

Latest-step priority:
- Treat the latest calibration step as the primary source of truth.
- If the latest feedback conflicts with earlier assumptions, prefer the latest feedback.
- Use older steps as supporting context, not as authority.
- If the latest step clearly reveals that something in the current voice data is wrong, fix it.

How to read calibration steps:
- Steps are the record of previous calibration iterations.
- Each step includes:
  - the voice data used at that moment,
  - the generated samples produced from that voice data,
  - and the user's feedback on those samples.
- Read steps chronologically.
- Treat the latest step as the most important evaluation signal.
- Use earlier steps to understand what has already been tried, what remained stable, and what the user implicitly or explicitly rejected.
- If the latest step confirms a pattern, strengthen it.
- If the latest step contradicts an earlier pattern, prefer the latest evidence unless it is too weak or ambiguous.
- Look at the relationship between:
  - the voice data in that step,
  - the generated samples,
  - and the feedback.
- Use that relationship to infer what in the voice profile helped, what hurt, and what should now change.
- Do not blindly preserve earlier voice fields if the later samples and feedback show they are wrong.
- Do not overreact to one weak signal; update the profile only as much as needed to improve fit.

${injectPlatforms(i.voiceInfo.platforms)}

General guidance:
- Be honest and conservative.
- Prefer a small number of strong signals over many weak ones.
- Focus on traits that can actually transfer into future writing.
- Use repeated patterns, not isolated quirks.
- Do not copy phrases from examples.
- Do not overfit to one sample.
- If evidence is thin, keep the profile minimal rather than forcing confidence.
- If feedback is vague, make the smallest reasonable improvement instead of rewriting everything.

What belongs in the result:
- tov: how the writing tends to feel
- rules: reusable writing habits
- avoidRules: things the writing should avoid
- evidencePreferences: what kind of support or proof the writing tends to rely on
- extra: any additional stable signals that materially help, when they do not fit well into the main fields

Field guidance:

tov:
- Use concise descriptors of tone and feel.
- Keep them reusable and grounded in the evidence.

rules:
- Capture concrete habits that can guide future writing.
- Focus on rhythm, structure, phrasing, argument movement, or recurring stylistic behavior.

avoidRules:
- Capture concrete anti-patterns that would make future writing feel wrong.

evidencePreferences:
- Describe, in one concise string, what kind of support the writing tends to rely on.

extra:
- Use only for stable, helpful signals that do not fit the main fields well.
- Keep it compact.
- Do not use it as a dump of observations.

How to use samples and feedback:
- Samples are a mix of idea, note, and voice.
- Do not assume every flaw in a sample is a voice flaw.
- But if the samples consistently reveal a stylistic mismatch, update the voice profile to reduce that mismatch.
- Use feedback and the latest samples together to judge what should change.

How to use examples:
- Infer from repeated patterns across examples.
- Use platform-aware judgment if platforms are provided.
- If examples suggest materially different styles across platforms, prefer the pattern most supported by the latest evidence.
- Do not invent strong stylistic conclusions from weak evidence.

${injectCalibrationTypeRules(i.calibrationType)}

${injectVoice(i.voiceInfo)}

${injectExamples(i.voiceInfo.examples)}

${injectIterationSteps(i.steps)}

Output rules:
- Return only valid JSON.
- Do not include markdown.
- Do not include explanations.
- Do not include commentary.
- Keep the result concise, reusable, and evidence-based.

Response format:
<response_format>
{
  "tov": string[],
  "rules": string[],
  "avoidRules": string[],
  "evidencePreferences": string,
  "extra": Record<string, string>
}
</response_format>

Response JSON:
`;
