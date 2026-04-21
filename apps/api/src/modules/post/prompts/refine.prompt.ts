import {
  IdeaEntity,
  NoteEntity,
  StrategyEntity,
  ThemeEntity,
  VoiceEntity,
} from '@app/db';

import { inTag } from '@/common/utils';
export interface RefinePromptInput {
  post: string;
  request: string;
  voice?: VoiceEntity;
  notes?: NoteEntity[];
  theme?: ThemeEntity;
  idea?: IdeaEntity;
  strategy?: StrategyEntity;
}

function injectVoice(voice?: VoiceEntity) {
  if (!voice) return ``;
  return inTag('voice', ``);
}

function injectNotes(notes?: NoteEntity[]) {
  if (!notes?.length) return ``;
  return ``;
}

function injectTheme(theme?: ThemeEntity) {
  if (!theme) return ``;
  return ``;
}

function injectIdea(idea?: IdeaEntity) {
  if (!idea) return ``;
  return ``;
}

function injectStrategy(strategy?: StrategyEntity) {
  if (!strategy) return ``;
  return ``;
}

export const REFINE_PROMPT = (i: RefinePromptInput) => `
You are a XXX.

Context:
<context>
${injectVoice(i.voice)}
${injectNotes(i.notes)}
${injectTheme(i.theme)}
${injectIdea(i.idea)}
${injectStrategy(i.strategy)}
</context>

Rules:
- A
- B

User request:
${i.request}

Post:
${i.post}

Return refined post string only. Do not include any other text.

Refined post:
`;
