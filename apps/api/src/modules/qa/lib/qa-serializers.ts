import {
  IdeaEntity,
  NoteEntity,
  PlatformType,
  PostEntity,
  StrategyEntity,
  ThemeEntity,
  VoiceCalibrationEntity,
  VoiceEntity,
} from '@app/db';

export function serializeIdea(idea: IdeaEntity) {
  return {
    id: idea.id,
    name: idea.name,
    angle: idea.angle ?? null,
    themeId: idea.themeId ?? null,
    voiceId: idea.voiceId ?? null,
    strategyId: idea.strategyId ?? null,
  };
}

export function serializeNote(note: NoteEntity) {
  return {
    id: note.id,
    name: note.name ?? null,
    text: note.text ?? null,
  };
}

export function serializeTheme(theme: ThemeEntity) {
  return {
    id: theme.id,
    name: theme.name,
    description: theme.description ?? null,
  };
}

export function serializeStrategy(strategy: StrategyEntity) {
  return {
    id: strategy.id,
    name: strategy.name ?? null,
    stage: strategy.stage,
    status: strategy.status,
    snapshot: strategy.snapshot,
    voiceId: strategy.voiceId ?? null,
    themeIds: (strategy.themes ?? [])
      .map((item) => item.themeId ?? item.theme?.id)
      .filter(Boolean),
  };
}

export function serializePost(post: PostEntity) {
  return {
    id: post.id,
    title: post.title ?? null,
    platform: post.platform,
    status: post.status,
    ideaId: post.ideaId ?? null,
    themeId: post.themeId ?? null,
    voiceId: post.voiceId ?? null,
    strategyId: post.strategyId ?? null,
    currentVersionId: post.currentVersionId ?? null,
    currentText: post.currentVersion?.text ?? null,
  };
}

export function serializeVoice(voice: VoiceEntity) {
  return {
    id: voice.id,
    name: voice.name,
    status: voice.status,
    platforms: voice.platforms as PlatformType[],
    data: voice.data,
    exampleCount: voice.examples?.length ?? 0,
  };
}

export function serializeCalibration(calibration: VoiceCalibrationEntity) {
  const lastStep =
    calibration.data?.steps?.[calibration.data.steps.length - 1] ?? null;

  return {
    id: calibration.id,
    voiceId: calibration.voiceId,
    stepCount: calibration.data?.steps?.length ?? 0,
    lastStep: lastStep
      ? {
          type: lastStep.type,
          sampleCount: lastStep.samples?.length ?? 0,
          data: lastStep.data,
        }
      : null,
  };
}

export function lastAssistantMessage(
  history: Array<{ role?: string; content?: unknown }> | undefined,
): string | null {
  const message = [...(history ?? [])]
    .reverse()
    .find((item) => item.role === 'assistant');
  return typeof message?.content === 'string' ? message.content : null;
}
