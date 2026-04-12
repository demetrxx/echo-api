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
}

// utils
function inTag(tag: string, content: string) {
  return `<${tag}>
${content}
</${tag}`;
}

function optional(condition: boolean, content: string) {
  return condition ? content : '';
}

function injectProfile(profile?: ProfileEntity) {
  if (!profile) return ``;

  return `Mind this about user:
Tone of voice: ${profile.tov}
Rules: ${profile.rules}
Avoid rules: ${profile.avoidRules}
Description: ${profile.examplesSummary}`;
}

function injectNotes(notes?: NoteEntity[]) {
  if (!notes.length) return ``;

  const formattedNotes = notes
    .map((note) =>
      inTag(
        'note',
        `ID: ${note.id}
Name: ${note.name}
Text:
${note.text}`,
      ),
    )
    .join('\n');

  const content = `Use these user notes as source of inspiration:
${formattedNotes}`;

  return inTag('notes', content);
}

function injectTheme(theme?: ThemeEntity) {
  if (!theme) return ``;

  let content = `The ideas must be related to this theme:
Name: ${theme.name}`;

  if (theme.description) {
    content += `\nDescription: ${theme.description}`;
  }

  return inTag('theme', content);
}

function injectStrategy(strategy?: StrategyEntity) {
  if (!strategy) return ``;

  const content = `The ideas must be related to this strategy:
Audience: ${strategy.snapshot.audience}`;

  return inTag('strategy', content);
}

export const IDEA_GENERATION_PROMPT = (i: IdeaGenerationPromptInput) => `
You are an idea generation assistant.

INSTRUCTIONS HERE

${injectStrategy(i.strategy)}

${injectProfile(i.profile)}

${injectNotes(i.notes)}

${injectTheme(i.theme)}

<response_format>
Array{ name: string, angle: string; ${optional(!!i.notes.length, 'noteIds: string[]')} }
</response_format>

Ideas JSON array:
`;
