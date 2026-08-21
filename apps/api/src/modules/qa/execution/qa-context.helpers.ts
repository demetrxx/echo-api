import {
  IdeaEntity,
  NoteEntity,
  PlatformType,
  PostEntity,
  StrategyEntity,
  StrategyStatus,
  ThemeEntity,
  VoiceEntity,
} from '@app/db';
import { DataSource } from 'typeorm';

import { AppError } from '@/common/errors/app-error';

import { QaContextItem, QaContextSource } from '../types';

export async function loadSandboxNotes(
  ds: DataSource,
  sandboxUserId: string,
  ids?: string[],
): Promise<NoteEntity[]> {
  const uniqueIds = [...new Set(ids ?? [])];
  if (!uniqueIds.length) {
    return [];
  }

  const notes = await ds.getRepository(NoteEntity).find({
    where: uniqueIds.map((id) => ({ id, userId: sandboxUserId })),
  });

  if (notes.length !== uniqueIds.length) {
    throw new AppError(
      'QA_SANDBOX_MISMATCH',
      'Notes must belong to the sandbox user',
      { ids: uniqueIds },
    );
  }

  return notes;
}

export async function loadSandboxTheme(
  ds: DataSource,
  sandboxUserId: string,
  themeId?: string,
): Promise<ThemeEntity | null> {
  if (!themeId) {
    return null;
  }

  const theme = await ds.getRepository(ThemeEntity).findOne({
    where: { id: themeId, userId: sandboxUserId },
  });

  if (!theme) {
    throw new AppError(
      'QA_SANDBOX_MISMATCH',
      'Theme must belong to the sandbox user',
      { themeId },
    );
  }

  return theme;
}

export async function loadSandboxVoice(
  ds: DataSource,
  sandboxUserId: string,
  voiceId?: string,
): Promise<{ voice: VoiceEntity | null; source: QaContextSource }> {
  if (voiceId) {
    const voice = await ds.getRepository(VoiceEntity).findOne({
      where: { id: voiceId, userId: sandboxUserId },
      relations: ['examples'],
    });
    if (!voice) {
      throw new AppError(
        'QA_SANDBOX_MISMATCH',
        'Voice must belong to the sandbox user',
        { voiceId },
      );
    }
    return { voice, source: 'operator_override' };
  }

  const voice = await ds.getRepository(VoiceEntity).findOne({
    where: { userId: sandboxUserId },
    relations: ['examples'],
    order: { createdAt: 'ASC' },
  });

  return { voice, source: 'product_default' };
}

export async function loadActiveStrategy(
  ds: DataSource,
  sandboxUserId: string,
  strategyId?: string,
): Promise<{ strategy: StrategyEntity | null; source: QaContextSource }> {
  if (strategyId) {
    const strategy = await ds.getRepository(StrategyEntity).findOne({
      where: { id: strategyId, userId: sandboxUserId },
      relations: ['themes', 'themes.theme', 'voice', 'conversation'],
    });
    if (!strategy) {
      throw new AppError(
        'QA_SANDBOX_MISMATCH',
        'Strategy must belong to the sandbox user',
        { strategyId },
      );
    }
    return { strategy, source: 'operator_override' };
  }

  const strategies = await ds.getRepository(StrategyEntity).find({
    where: { userId: sandboxUserId, status: StrategyStatus.Active },
    relations: ['themes', 'themes.theme', 'voice', 'conversation'],
    order: { createdAt: 'ASC' },
  });

  if (strategies.length > 1) {
    throw new AppError(
      'QA_CONTEXT_AMBIGUOUS',
      'More than one active strategy is available',
      { strategyIds: strategies.map((item) => item.id) },
    );
  }

  return {
    strategy: strategies[0] ?? null,
    source: 'product_default',
  };
}

export async function loadSandboxIdea(
  ds: DataSource,
  sandboxUserId: string,
  ideaId?: string,
): Promise<IdeaEntity | null> {
  if (!ideaId) {
    return null;
  }

  const idea = await ds.getRepository(IdeaEntity).findOne({
    where: { id: ideaId, userId: sandboxUserId },
  });

  if (!idea) {
    throw new AppError(
      'QA_SANDBOX_MISMATCH',
      'Idea must belong to the sandbox user',
      { ideaId },
    );
  }

  return idea;
}

export async function loadSandboxPost(
  ds: DataSource,
  sandboxUserId: string,
  postId?: string,
): Promise<PostEntity | null> {
  if (!postId) {
    return null;
  }

  const post = await ds.getRepository(PostEntity).findOne({
    where: { id: postId, userId: sandboxUserId },
    relations: [
      'theme',
      'voice',
      'idea',
      'currentVersion',
      'notes',
      'notes.note',
      'versions',
    ],
  });

  if (!post) {
    throw new AppError(
      'QA_SANDBOX_MISMATCH',
      'Post must belong to the sandbox user',
      { postId },
    );
  }

  return post;
}

export function contextItem(params: {
  key: string;
  source: QaContextSource;
  ids: Array<string | null | undefined>;
  summary: string;
  details?: unknown;
}): QaContextItem | null {
  const ids = params.ids.filter((id): id is string => Boolean(id));
  if (!ids.length && params.details === undefined) {
    return null;
  }

  return {
    key: params.key,
    source: params.source,
    ids,
    summary: params.summary,
    details: params.details,
  };
}

export function compactContext(
  items: Array<QaContextItem | null>,
): QaContextItem[] {
  return items.filter((item): item is QaContextItem => Boolean(item));
}

export function defaultPlatform(platforms?: PlatformType[]): PlatformType {
  return platforms?.[0] ?? PlatformType.LinkedIn;
}
