import { randomUUID } from 'node:crypto';

import {
  NoteEntity,
  PlatformType,
  QaProfileEntity,
  QaProfileSource,
  QaProfileStatus,
  StrategyConversationEntity,
  StrategyEntity,
  StrategySnapshot,
  StrategyStage,
  StrategyStatus,
  StrategyThemeEntity,
  ThemeEntity,
  UserEntity,
  UserStatus,
  VoiceEntity,
  VoiceStatus,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { AppError } from '@/common/errors/app-error';
import { slugify } from '@/common/utils';
import { FIRST_AI_MESSAGE } from '@/modules/strategy/consts';
import { STRATEGY_SNAPSHOT_DEFAULT } from '@/modules/strategy/lib';
import { VoiceService } from '@/modules/voice';

import { mapPlatforms } from '../lib/map-platforms';
import { CanonicalQaProfileDefinition } from '../types';

@Injectable()
export class QaMaterializerService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly voiceService: VoiceService,
  ) {}

  async materialize(profile: QaProfileEntity, confirm = false) {
    if (
      profile.sandboxUserId &&
      profile.status === QaProfileStatus.Ready &&
      !confirm
    ) {
      throw new AppError(
        'CONFLICT',
        'Profile already has a sandbox. Rematerialize with confirm: true.',
        { sandboxUserId: profile.sandboxUserId },
      );
    }

    if (profile.source === QaProfileSource.RealClone) {
      throw new AppError(
        'QA_CLONE_CONFIRMATION_REQUIRED',
        'Real clone materialization is not available in this slice',
      );
    }

    await this.dataSource.getRepository(QaProfileEntity).update(profile.id, {
      status: QaProfileStatus.Materializing,
      materializationError: null,
    });

    let createdUserId: string | null = null;

    try {
      if (confirm && profile.sandboxUserId) {
        await this.archiveSandbox(profile.sandboxUserId);
      }

      const sandbox = await this.createSandboxWorld(profile);
      createdUserId = sandbox.userId;
      await this.addVoiceExamples(sandbox.userId, sandbox.examples);

      await this.dataSource.getRepository(QaProfileEntity).update(profile.id, {
        sandboxUserId: sandbox.userId,
        status: QaProfileStatus.Ready,
        materializedAt: new Date(),
        materializationError: null,
      });

      return this.dataSource.getRepository(QaProfileEntity).findOneByOrFail({
        id: profile.id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Materialization failed';

      if (createdUserId) {
        await this.archiveSandbox(createdUserId);
      }

      await this.dataSource.getRepository(QaProfileEntity).update(profile.id, {
        status: QaProfileStatus.Failed,
        materializationError: message,
        sandboxUserId: confirm ? null : profile.sandboxUserId,
      });

      throw error instanceof AppError
        ? error
        : new AppError('QA_PROFILE_INVALID', message, undefined, error);
    }
  }

  private async archiveSandbox(userId: string) {
    await this.dataSource.getRepository(UserEntity).update(userId, {
      status: UserStatus.Inactive,
    });
  }

  private async createSandboxWorld(profile: QaProfileEntity) {
    const definition = profile.definition as CanonicalQaProfileDefinition;
    const identity = definition.profile ?? {};
    const displayName =
      (typeof identity.name === 'string' && identity.name) || profile.name;
    const platforms = mapPlatforms(identity.platforms);
    const slug = slugify(profile.fixtureKey || profile.name || 'profile') || 'profile';

    const userId = await this.dataSource.transaction(async (manager) => {
      const user = await manager.getRepository(UserEntity).save({
        email: `qa+${slug}-${randomUUID()}@echo.internal`,
        firstName: displayName,
        lastName: 'QA',
        status: UserStatus.Active,
        emailConfirmed: true,
        emailConfirmedAt: new Date(),
        isQaSandbox: true,
      });

      const themes = await this.createThemes(
        manager,
        user.id,
        definition.pillars ?? [],
      );
      await this.createNotes(manager, user.id, definition.notes);
      const voice = await this.createVoice(
        manager,
        user.id,
        displayName,
        platforms,
        definition.toneRules ?? [],
      );
      await this.createStrategy(
        manager,
        user.id,
        displayName,
        definition,
        platforms,
        themes,
        voice.id,
      );

      return user.id;
    });

    return {
      userId,
      examples: (definition.postSamples ?? [])
        .map((sample) => sample.text)
        .filter(Boolean),
    };
  }

  private async addVoiceExamples(userId: string, examples: string[]) {
    if (!examples.length) {
      return;
    }

    const voice = await this.dataSource.getRepository(VoiceEntity).findOne({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    if (voice) {
      await this.voiceService.addExamples(voice.id, userId, { examples });
    }
  }

  private async createThemes(
    manager: EntityManager,
    userId: string,
    pillars: string[],
  ) {
    const seen = new Set<string>();
    const themes: ThemeEntity[] = [];

    for (const [index, pillar] of pillars.entries()) {
      const name = pillar.trim() || `Pillar ${index + 1}`;
      const uniqueName = seen.has(name) ? `${name} (${index + 1})` : name;
      seen.add(uniqueName);

      const theme = await manager.getRepository(ThemeEntity).save({
        userId,
        name: uniqueName,
        description: pillar,
        cleanName: slugify(uniqueName) || `pillar-${index + 1}`,
      });
      themes.push(theme);
    }

    return themes;
  }

  private async createNotes(
    manager: EntityManager,
    userId: string,
    notes: CanonicalQaProfileDefinition['notes'] | undefined,
  ) {
    const raw = notes?.raw ?? [];
    const noisy = notes?.noisy ?? [];

    const rows = [
      ...raw.map((text, index) => ({
        userId,
        name: `raw-${String(index + 1).padStart(2, '0')}`,
        text,
        generatingTitle: false,
      })),
      ...noisy.map((text, index) => ({
        userId,
        name: `noisy-${String(index + 1).padStart(2, '0')}`,
        text,
        generatingTitle: false,
      })),
    ];

    if (rows.length) {
      await manager.getRepository(NoteEntity).save(rows);
    }
  }

  private async createVoice(
    manager: EntityManager,
    userId: string,
    name: string,
    platforms: PlatformType[],
    toneRules: string[],
  ) {
    return manager.getRepository(VoiceEntity).save({
      userId,
      name: `${name} voice`,
      platforms,
      status: VoiceStatus.Created,
      data: {
        tov: toneRules.slice(0, 3),
        rules: toneRules,
        avoidRules: [],
        evidencePreferences: '',
        extra: {},
      },
    });
  }

  private async createStrategy(
    manager: EntityManager,
    userId: string,
    name: string,
    definition: CanonicalQaProfileDefinition,
    platforms: PlatformType[],
    themes: ThemeEntity[],
    voiceId: string,
  ) {
    const snapshot: StrategySnapshot = {
      ...STRATEGY_SNAPSHOT_DEFAULT,
      audience:
        typeof definition.profile?.audience === 'string'
          ? definition.profile.audience
          : '',
      goals: definition.goals ?? [],
      notes: Array.isArray(definition.strategyState)
        ? definition.strategyState
        : [],
      platforms,
    };

    const strategy = await manager.getRepository(StrategyEntity).save({
      userId,
      name: `${name} strategy`,
      snapshot,
      status: StrategyStatus.Active,
      stage: StrategyStage.Sharpen,
      voiceId,
    });

    await manager.getRepository(StrategyConversationEntity).save({
      strategyId: strategy.id,
      history: [
        {
          role: 'assistant',
          content: FIRST_AI_MESSAGE,
        },
      ],
    });

    if (themes.length) {
      await manager.getRepository(StrategyThemeEntity).save(
        themes.map((theme) => ({
          strategyId: strategy.id,
          themeId: theme.id,
        })),
      );
    }

    return strategy;
  }
}
