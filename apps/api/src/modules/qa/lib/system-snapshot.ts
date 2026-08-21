import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PROMPT_FILES: Record<string, string> = {
  'idea-generation': 'apps/api/src/modules/idea/idea-generation.prompt.ts',
  'post-refine': 'apps/api/src/modules/post/prompts/refine.prompt.ts',
  'strategy-system':
    'apps/api/src/modules/strategy/prompts/strategy-system.prompt.ts',
  'voice-adapt': 'apps/api/src/modules/voice/prompts/adapt-text.prompt.ts',
    'qa-review': 'apps/api/src/modules/qa/reviews/qa-review.prompt.ts',
  };

export function captureCurrentSystemSnapshot() {
  return {
    gitCommit: safeGit('git rev-parse HEAD'),
    gitDirty: Boolean(safeGit('git status --porcelain')),
    models: {
      main: 'gpt-5.5',
      fast: 'gpt-5-mini',
      embedding: process.env.EMBED_MODEL ?? 'text-embedding-3-small',
      transcribe: 'gpt-4o-mini-transcribe',
    },
    prompts: Object.fromEntries(
      Object.entries(PROMPT_FILES).map(([key, relative]) => [
        key,
        hashFile(relative),
      ]),
    ),
    runtime: {
      capturedAt: new Date().toISOString(),
    },
  };
}

function hashFile(relativePath: string): string {
  const absolute = join(process.cwd(), relativePath);
  if (!existsSync(absolute)) {
    return 'missing';
  }

  return createHash('sha256').update(readFileSync(absolute)).digest('hex');
}

function safeGit(command: string): string {
  try {
    return execSync(command, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return '';
  }
}
