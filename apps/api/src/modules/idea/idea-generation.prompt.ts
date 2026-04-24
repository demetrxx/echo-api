import { NoteEntity, StrategyEntity, ThemeEntity } from '@app/db';

import { inTag } from '@/common/utils';

import { VoiceInfoDto } from '../voice';

export interface IdeaGenerationPromptInput {
  notes: NoteEntity[];
  theme?: ThemeEntity;
  voice?: VoiceInfoDto;
  strategy?: StrategyEntity;
  count: number;
}

function injectVoice(voice?: VoiceInfoDto) {
  if (!voice) return ``;

  const voiceData = {
    tov: voice.data.tov,
    rules: voice.data.rules,
    avoidRules: voice.data.avoidRules,
  };

  return inTag(
    'voice',
    `Use this as voice/framing context. It should shape phrasing and emphasis, but it must not override the actual subject matter:

${JSON.stringify(voiceData, null, 2)}`,
  );
}

function injectNotes(notes?: NoteEntity[]) {
  if (!notes.length) return ``;

  const notesData = notes.map((i) => ({
    id: i.id,
    name: i.name,
    text: i.text,
  }));

  const content = `Use these notes as the main source material when generating ideas. Stay grounded in them and only reference note IDs that genuinely informed the idea.
${JSON.stringify(notesData, null, 2)}`;

  return inTag('notes', content);
}

function injectTheme(theme?: ThemeEntity) {
  if (!theme) return ``;

  const themeData = {
    name: theme.name,
    description: theme.description,
  };

  return inTag(
    'theme',
    `Every idea must clearly fit this theme. Treat the theme as a boundary and lane, not as a post title.

${JSON.stringify(themeData, null, 2)}
    `,
  );
}

function injectStrategy(strategy?: StrategyEntity) {
  if (!strategy) return '';

  const snapshot = {
    audience: strategy.snapshot.audience,
    problems: strategy.snapshot.problems,
    goals: strategy.snapshot.goals,
    platforms: strategy.snapshot.platforms,
    context: strategy.snapshot.context,
    unresolvedQuestions: strategy.snapshot.unresolvedQuestions,
    voiceAdjustments: strategy.snapshot.voiceAdjustments,
  };

  return inTag(
    'strategy',
    `Use this strategy as directional context. Align ideas with its audience, problems, goals, platforms, and context blocks. Do not treat unresolved questions as facts.

${JSON.stringify(snapshot, null, 2)}`,
  );
}

export const IDEA_GENERATION_PROMPT = (i: IdeaGenerationPromptInput) => `
You are an idea generation assistant inside a creator product.

Your job is to generate strong, distinct content ideas grounded in the provided context.

Generate exactly ${i.count} ideas.

What an idea is:
- "name" is a short, clear title or gist.
- "angle" is one sharp sentence.
- The angle is the core take, tension, reframing, or lens behind the idea.
- The angle is not a paragraph, not an outline, and not a post draft.

Core rules:
- Stay grounded in the provided notes, theme, strategy, and voice when they exist.
- If notes are provided, use them as the primary source material.
- If a theme is provided, every idea must clearly fit that theme.
- If a strategy is provided, align the ideas with the audience, problems, goals, and strategic context.
- If a voice voice is provided, use it only to shape phrasing and framing, not to override the subject matter.
- Generate ideas, not posts.
- Do not generate hooks, outlines, CTAs, or platform-specific execution.
- Each idea must be meaningfully different from the others.
- Prefer sharp, specific, non-generic ideas over broad, safe, or obvious ones.
- Do not invent fake facts, fake stories, or unsupported specifics.
${i.notes.length ? '- If notes are provided, include only the note IDs that genuinely informed the idea.' : ''}

Quality bar:
- Avoid generic advice disguised as insight.
- Avoid repeating the same idea with small wording changes.
- Avoid broad themes disguised as ideas.
- Avoid angles that contain multiple unrelated claims.
- Prefer one strong lens per idea.

Angle rules:
- "angle" must be exactly one sentence.
- Keep it short and sharp.
- It should sound like a clear take, not an explanation.
- Good angle shape: "X is usually really Y", "Most people think X, but Y", "The real issue is Y, not X", "What looks like X is often Y".
- Bad angle shape: long summaries, mini-paragraphs, outlines, or post-like wording.


${injectStrategy(i.strategy)}

${injectVoice(i.voice)}

${injectNotes(i.notes)}

${injectTheme(i.theme)}

<response_requirements>
- Return valid JSON only.
- Return exactly ${i.count} items.
- Do not include markdown.
- Do not include commentary before or after the JSON.
</response_requirements>

<response_format>
{
  name: string;
  angle: string;${i.notes.length ? '\n  noteIds: string[];' : ''}
}[]
</response_format>

Ideas JSON array:
`;
