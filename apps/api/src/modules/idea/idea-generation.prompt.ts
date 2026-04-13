import {
  NoteEntity,
  ProfileEntity,
  StrategyEntity,
  ThemeEntity,
} from '@app/db';

export interface IdeaGenerationPromptInput {
  notes: NoteEntity[];
  theme?: ThemeEntity;
  profile?: ProfileEntity;
  strategy?: StrategyEntity;
  count: number;
}

// utils
function inTag(tag: string, content: string) {
  return `<${tag}>
${content}
</${tag}`;
}

function injectProfile(profile?: ProfileEntity) {
  if (!profile) return ``;

  const profileData = {
    name: profile.name,
    tov: profile.tov,
    rules: profile.rules,
    avoidRules: profile.avoidRules,
    examplesSummary: profile.examplesSummary,
  };

  return inTag(
    'profile',
    `Use this as voice/framing context. It should shape phrasing and emphasis, but it must not override the actual subject matter:

${JSON.stringify(profileData, null, 2)}`,
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
    contextBlocks: strategy.snapshot.contextBlocks,
    context: {
      product: strategy.snapshot.context.product,
      expertise: strategy.snapshot.context.expertise,
      growth: strategy.snapshot.context.growth,
      identity: strategy.snapshot.context.identity,
      community: strategy.snapshot.context.community,
      clarity: strategy.snapshot.context.clarity,
      journey: strategy.snapshot.context.journey,
      destination: strategy.snapshot.context.destination,
      opportunity: strategy.snapshot.context.opportunity,
    },
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

Core rules:
- Stay grounded in the provided notes, theme, and strategy when they exist.
- Do not generate posts, hooks, outlines, or platform-specific execution.
- Generate ideas, not finished content.
- Each idea must be meaningfully different from the others.
- Prefer sharp, specific, non-generic ideas over broad or safe ones.
- Do not invent fake facts, fake examples, or unsupported specifics.
- If notes are provided, use them as the main source material.
- If a theme is provided, every idea must clearly fit that theme.
- If a strategy is provided, ideas should align with the audience, problems, goals, and context in the strategy.
- If a profile is provided, use it to shape the phrasing and framing of the ideas, but not to override the actual subject matter.

What a good idea looks like:
- "name" is a short, clear, compelling title or gist.
- "angle" explains the core take or tension in 1-3 sentences.
- The angle should make clear why this idea is interesting, useful, or worth developing further.
${i.notes.length ? '- "noteIds" must include only the IDs of notes that genuinely informed the idea.' : ''}

Quality bar:
- Avoid generic advice.
- Avoid repeating the same angle with small wording changes.
- Avoid obvious filler ideas that do not clearly connect to the context.
- Avoid turning the idea into a ready-made post.
- Avoid high-level themes disguised as ideas.

${injectStrategy(i.strategy)}

${injectProfile(i.profile)}

${injectNotes(i.notes)}

${injectTheme(i.theme)}

<response_requirements>
- Return valid JSON only.
- Return exactly ${i.count} items.
- Do not include markdown.
- Do not include commentary before or after the JSON.
</response_requirements>

<response_format>
Array<{
  name: string;
  angle: string;${i.notes.length ? '\n  noteIds: string[];' : ''}
}>
</response_format>

Ideas JSON array:
`;
